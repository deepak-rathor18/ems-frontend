import { useCallback, useEffect, useRef, useState } from 'react';
import { errMsg } from '../utils';

/** Runs `fn` on mount/deps change; returns { data, loading, error, reload }. */
export default function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const alive = useRef(true);
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (alive.current) setState({ data, loading: false, error: null });
    } catch (e) {
      if (alive.current) setState({ data: null, loading: false, error: errMsg(e) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { alive.current = true; run(); return () => { alive.current = false; }; }, [run]);
  return { ...state, reload: run };
}
/** Accepts either a bare array or an envelope like { data: [...] }. */
export const unwrap = (d) => (Array.isArray(d) ? d : d?.data ?? d?.items ?? []);
