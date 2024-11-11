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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route
            path="/"
            render={() => (
              <MainLayout>
                <Switch>
                  <PrivateRoute
                    exact
                    path="/customers"
                    component={CustomerManagement}
                    requiredMode={['SUPERADMIN', 'WEB', 'VIEW']}
                  />
                  <PrivateRoute
                    exact
                    path="/modelmgrs"
                    component={ModelManagement}
                    requiredMode={['SUPERADMIN', 'WEB']}
                  />
                  <PrivateRoute
                    exact
                    path="/reports"
                    component={ReportQuery}
                    requiredMode={['SUPERADMIN', 'WEB', 'VIEW']}
                  />
                  <PrivateRoute
                    exact
                    path="/users"
                    component={UserManagement}
                    requiredMode={['SUPERADMIN', 'WEB']}
                  />
                  <Redirect exact from="/" to="/customers" />
                </Switch>
              </MainLayout>
            )}
          />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
