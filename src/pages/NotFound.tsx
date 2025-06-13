import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h1 className="display-4 fw-bold mb-3">404</h1>
          <p className="fs-4 text-secondary mb-4">Oops! Page not found</p>
          <a href="/" className="btn btn-primary">
            Return to Home
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
