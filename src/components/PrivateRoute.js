import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // 로그인 상태를 서버에서 확인 (예: 토큰이나 세션 검사)
    fetch('/api/check-auth', { credentials: 'include' })
      .then((response) => response.ok ? setIsAuthenticated(true) : setIsAuthenticated(false))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // 인증 여부 확인 중
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
