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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh', // 確保最小高度為視窗高度
        overflow: 'hidden', // 防止內容溢出
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: drawerOpen ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
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

      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            ...(!drawerOpen && {
              width: (theme) => theme.spacing(7),
              overflowX: 'hidden',
            }),
          },
        }}
        open={drawerOpen}
      >
        <Toolbar /> {/* 為 AppBar 預留空間 */}
        <Box
          sx={{
            overflow: 'auto',
            height: '100%',
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
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
                {drawerOpen && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: 1,
                      color: 'text.primary',
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          marginLeft: drawerOpen ? 0 : (theme) => theme.spacing(-7),
          p: { xs: 1, sm: 2 },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          '& > *': {
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            marginLeft: drawerOpen ? `${drawerWidth}px` : (theme) => theme.spacing(7),
          },
        }}
      >
        <Toolbar /> {/* 為 AppBar 預留空間 */}
        <Box
          sx={{
            p: { xs: 1, sm: 2 },
            backgroundColor: 'background.default',
            minHeight: `calc(100vh - ${64}px)`, // 減去 AppBar 高度
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
