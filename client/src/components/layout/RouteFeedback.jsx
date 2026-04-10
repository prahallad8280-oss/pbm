import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const RouteFeedback = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);

    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0 });
    }

    const timeoutId = window.setTimeout(() => {
      setActive(false);
    }, 480);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.search, location.hash]);

  return <div className={`route-progress ${active ? "is-active" : ""}`} aria-hidden="true" />;
};

export default RouteFeedback;
