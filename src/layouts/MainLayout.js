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
  Group as GroupIcon, // 新增這行
  Person as PersonIcon, // 新增這行
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext'; // 確保這行已經加入

const drawerWidth = 240;
const miniDrawerWidth = 65; // 收起時的寬度

const MainLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  // 從 AuthContext 獲取當前用戶信息
  const { user, mode } = useAuth();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    {
      text: '客戶管理',
      icon: <PeopleIcon />,
      path: '/customers',
      allowedModes: ['SUPERADMIN', 'WEB', 'VIEW'],
    },
    {
      text: '模型管理',
      icon: <CloudUploadIcon />,
      path: '/modelmgrs',
      allowedModes: ['SUPERADMIN', 'WEB'],
    },
    {
      text: '報表查詢',
      icon: <AssessmentIcon />,
      path: '/reports',
      allowedModes: ['SUPERADMIN', 'WEB', 'VIEW'],
    },
    {
      text: '使用者管理',
      icon: <PersonIcon />,
      path: '/users',
      allowedModes: ['SUPERADMIN', 'WEB'],
    },
    /*
    { text: '客戶管理', icon: <PeopleIcon />, path: '/customers' },
    { text: '模型上傳', icon: <CloudUploadIcon />, path: '/modelmgrs' },
    { text: '報表查詢', icon: <AssessmentIcon />, path: '/reports' },
    { text: '使用者管理', icon: <PersonIcon />, path: '/users' }, // 新增這行*/
    // 如果還有群組管理，可以這樣加
    // { text: '群組管理', icon: <GroupIcon />, path: '/groups' },
  ];

  // 過濾選單項目
  const filteredMenuItems = menuItems.filter((item) => {
    console.log(item);

    let result = item.allowedModes.includes(user?.mode);
    console.log(result);
    return result;
  });

  // 檢查當前路徑是否有權限訪問
  const canAccessCurrentPath = () => {
    const currentMenuItem = menuItems.find((item) => item.path === location.pathname);
    if (!currentMenuItem) return true; // 如果不在菜單中的路徑，允許訪問
    return currentMenuItem.allowedModes.includes(mode);
  };

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
            {filteredMenuItems.map((item) => (
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
