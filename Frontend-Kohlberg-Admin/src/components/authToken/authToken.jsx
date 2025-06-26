import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  // Verifica si hay token (puedes mejorar esto validando expiración)
  return !!localStorage.getItem('token');
}

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;