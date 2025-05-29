import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(StoreContext);
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // Nếu có token, hiển thị nội dung của route
  return children;
};

export default ProtectedRoute;