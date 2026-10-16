import { useEffect, useState } from 'react';

/** 현재 시각(ms)을 intervalMs 마다 새로 알려줘요. 카운트다운에 써요. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
