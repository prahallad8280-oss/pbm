import { useEffect, useRef, useState } from "react";

const useTimer = (initialSeconds, onExpire) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const expireRef = useRef(onExpire);

  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!initialSeconds) {
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
  }, [initialSeconds, secondsLeft]);

  return {
    secondsLeft,
    setSecondsLeft,
    progress: initialSeconds ? (secondsLeft / initialSeconds) * 100 : 0,
  };
};

export default useTimer;

