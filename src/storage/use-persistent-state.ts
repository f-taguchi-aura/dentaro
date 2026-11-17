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
): [value: T, setValue: (next: T) => void, loaded: boolean] {
  const [value, setStateValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; json: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((json) => {
        if (cancelled || json === null) return;
        try {
          setStateValue(JSON.parse(json) as T);
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
    (next: T) => {
      setStateValue(next);
      if (pending.current) clearTimeout(pending.current.timer);
      const json = JSON.stringify(next);
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
