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
        if (requiredMode && !requiredMode.includes(user?.mode)) {
          return <Redirect to="/" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
