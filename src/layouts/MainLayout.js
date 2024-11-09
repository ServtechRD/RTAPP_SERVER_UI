// src/layouts/MainLayout.js
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    { text: '客戶管理', icon: <PeopleIcon />, path: '/customers' },
    { text: '模型上傳', icon: <CloudUploadIcon />, path: '/modelmgrs' },
    { text: '報表查詢', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            管理系統
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* 為 AppBar 預留空間 */}
      {/* 下方的容器包含 Drawer 和主內容 */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Drawer 在 AppBar 下方 */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : miniDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : miniDrawerWidth,
              boxSizing: 'border-box',
              top: '64px', // AppBar 的高度
              height: 'calc(100% - 64px)', // 減去 AppBar 的高度
            },
          }}
          open={drawerOpen}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => history.push(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {drawerOpen && <ListItemText primary={item.text} />}
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* 主內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            width: `calc(100% - ${drawerOpen ? drawerWidth : miniDrawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
