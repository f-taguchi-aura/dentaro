import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePersistentState } from '../use-persistent-state';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factory must be synchronous
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test('restores a saved value', async () => {
  await AsyncStorage.setItem('k', JSON.stringify({ n: 5 }));
  const { result } = await renderHook(() => usePersistentState('k', { n: 0 }));
  await waitFor(() => expect(result.current[2]).toBe(true));
  expect(result.current[0]).toEqual({ n: 5 });
});

test('falls back to the initial value for broken JSON', async () => {
  await AsyncStorage.setItem('k', '{broken');
  const { result } = await renderHook(() => usePersistentState('k', { n: 0 }));
  await waitFor(() => expect(result.current[2]).toBe(true));
  expect(result.current[0]).toEqual({ n: 0 });
});

test('uses the initial value when nothing is saved', async () => {
  const { result } = await renderHook(() => usePersistentState('k', 'init'));
  await waitFor(() => expect(result.current[2]).toBe(true));
  expect(result.current[0]).toBe('init');
});

test('saves after a 300ms debounce', async () => {
  const { result } = await renderHook(() => usePersistentState('k', 0));
  await waitFor(() => expect(result.current[2]).toBe(true));
  jest.useFakeTimers();
  try {
    await act(async () => result.current[1](1));
    await act(async () => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('k', '2');
  } finally {
    jest.useRealTimers();
  }
});
