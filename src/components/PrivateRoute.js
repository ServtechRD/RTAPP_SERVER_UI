// src/components/PrivateRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ component: Component, requiredMode, ...rest }) => {
  const { user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        // 如果沒有用戶信息，重定向到登入頁面
        if (!user) {
          return <Redirect to="/login" />;
        }

        // 如果有 requiredMode 且用戶不在允許的模式中，重定向到首頁
        if (requiredMode && !requiredMode.includes(user.mode)) {
          return <Redirect to="/" />;
        }

        // 否則渲染組件
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
