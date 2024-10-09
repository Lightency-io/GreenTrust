import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[]; // List of roles that are allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // If user does not have the correct role, redirect to a "not authorized" page or dashboard
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} />;
  }

  // If authenticated and authorized, render the route's content
  return <>{children}</>;
};

export default ProtectedRoute;
