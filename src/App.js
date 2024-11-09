// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './layouts/MainLayout';
import CustomerManagement from './pages/CustomerManagement';
import ModelUpload from './pages/ModelUpload';
import ReportQuery from './pages/ReportQuery';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route
            path="/"
            render={({ location }) => {
              // 如果未登入，重定向到登入頁面
              const token = localStorage.getItem('token');
              if (!token && location.pathname !== '/login') {
                return <Redirect to="/login" />;
              }

              return (
                <MainLayout>
                  <Switch>
                    <Route exact path="/customers" component={CustomerManagement} />
                    <Route exact path="/models" component={ModelUpload} />
                    <Route exact path="/reports" component={ReportQuery} />
                    <Redirect exact from="/" to="/customers" />
                  </Switch>
                </MainLayout>
              );
            }}
          />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
