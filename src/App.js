// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import CustomerManagement from './pages/CustomerManagement';
import ModelManagement from './pages/ModelManagement';
import ReportQuery from './pages/ReportQuery';
import UserManagement from './pages/UserManagement'; // 新增這行
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function PrivateApp() {
  const { user } = useAuth();

  // 如果沒有用戶信息，重定向到登入頁面
  if (!user) {
    return <Redirect to="/login" />;
  }

  return <MainLayout />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route path="/" component={PrivateApp} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
