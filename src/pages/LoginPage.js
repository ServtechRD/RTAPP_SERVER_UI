// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { APP_VERSION } from '../config';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(username, password);
      if (success) {
        history.push('/customers');
      } else {
        setError('登入失敗，請檢查用戶名和密碼');
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 添加 Logo */}
        <Box sx={{ mb: 3 }}>
          <img
            src="/assets/images/Logo.png" // 把圖片放在 public 資料夾
            alt="Logo"
            style={{
              width: '100px',
              height: '100px',
            }}
          />
        </Box>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {APP_VERSION}
        </Typography>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            系統登入
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="用戶名"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              登入
            </Button>
          </form>
        </Paper>
        {/* 版本說明 */}
      </Box>
    </Container>
  );
};

export default LoginPage;
