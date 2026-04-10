import { useLocation } from "react-router-dom";

const PageTransition = ({ children, scope = "page" }) => {
  const location = useLocation();

  return (
    <div key={`${scope}-${location.pathname}-${location.search}-${location.hash}`} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
