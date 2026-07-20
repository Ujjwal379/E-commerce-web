import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => (
  <div className="container-x py-24 text-center">
    <SEO title="Page Not Found" />
    <h1 className="text-5xl font-extrabold text-brand-600">404</h1>
    <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary mt-6 inline-flex">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
