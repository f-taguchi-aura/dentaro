import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const SAVE_DELAY_MS = 300;

/**
 * 端末に保存される state。起動時に復元し（壊れていれば initial）、変更は 300ms まとめて保存する。
 * 戻り値の3つ目は復元が終わったかどうか。
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [value: T, setValue: (next: T | ((prev: T) => T)) => void, loaded: boolean] {
  const [value, setStateValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  // 連続した更新が同じ古い値から計算されないよう、最新値を ref でも持つ
  const latest = useRef<T>(initial);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; json: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((json) => {
        if (cancelled || json === null) return;
        try {
          const restored = JSON.parse(json) as T;
          latest.current = restored;
          setStateValue(restored);
        } catch {
          // 壊れたデータは無視して初期値を使う
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  // 画面を離れるときは保存待ちの内容をすぐ書き込む
  useEffect(
    () => () => {
      if (pending.current) {
        clearTimeout(pending.current.timer);
        AsyncStorage.setItem(key, pending.current.json).catch(() => {});
        pending.current = null;
      }
    },
    [key],
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const value = typeof next === 'function' ? (next as (prev: T) => T)(latest.current) : next;
      latest.current = value;
      setStateValue(value);
      if (pending.current) clearTimeout(pending.current.timer);
      const json = JSON.stringify(value);
      const timer = setTimeout(() => {
        pending.current = null;
        AsyncStorage.setItem(key, json).catch(() => {});
      }, SAVE_DELAY_MS);
      pending.current = { timer, json };
    },
    [key],
  );

  return [value, setValue, loaded];
}
