import { useEffect, useRef, useState } from "react";

const normalizeSeconds = (value) => {
  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 0;
  }

  return Math.floor(seconds);
};

const useTimer = (initialSeconds, onExpire) => {
  const normalizedInitialSeconds = normalizeSeconds(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    normalizedInitialSeconds ? normalizedInitialSeconds : null,
  );
  const expireRef = useRef(onExpire);
  const syncedInitialRef = useRef(normalizedInitialSeconds);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (normalizedInitialSeconds !== syncedInitialRef.current) {
      syncedInitialRef.current = normalizedInitialSeconds;
      setSecondsLeft(normalizedInitialSeconds ? normalizedInitialSeconds : null);
    }
  }, [normalizedInitialSeconds]);

  useEffect(() => {
    if (secondsLeft === null) {
      return undefined;
    }

    if (secondsLeft <= 0) {
      expireRef.current?.();
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [secondsLeft]);

  const safeSecondsLeft = secondsLeft ?? normalizedInitialSeconds;

  return {
    isReady: secondsLeft !== null,
    secondsLeft: safeSecondsLeft,
    setSecondsLeft,
    progress: normalizedInitialSeconds ? (safeSecondsLeft / normalizedInitialSeconds) * 100 : 0,
  };
};

export default useTimer;
