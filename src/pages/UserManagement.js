// src/pages/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Alert,
  Tooltip,
} from '@mui/material';
import { DataGrid, zhTW } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import api from '../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // 表單欄位
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    mode: '',
    enable: true,
  });

  // 獲取使用者類型
  const fetchUserTypes = async () => {
    try {
      const response = await api.get('/users_mode/');
      setAvailableTypes(response.data);
    } catch (err) {
      console.error('獲取使用者類型失敗:', err);
    }
  };

  // 獲取使用者列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/all/');
      setUsers(response.data.users);
    } catch (err) {
      setError('獲取使用者資料失敗');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserTypes();
  }, []);

  const columns = [
    {
      field: 'username',
      headerName: '帳號',
      width: 150,
      flex: 1,
    },
    {
      field: 'name',
      headerName: '名稱',
      width: 150,
      flex: 1,
    },
    {
      field: 'mode',
      headerName: '類型',
      width: 130,
      valueGetter: (params) => {
        const modeMap = {
          SUPERADMIN: '超級管理員',
          WEB: '平台',
          TEST: '測試用',
          MOBILE: '手機用',
        };
        return modeMap[params.value] || params.value;
      },
    },
    {
      field: 'enable',
      headerName: '啟用狀態',
      width: 100,
      renderCell: (params) => (
        <Switch
          checked={params.row.enable}
          onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
          disabled={params.row.mode == 'SUPERADMIN'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="編輯">
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/users/${userId}`, {
        enable: newStatus,
      });
      await fetchUsers();
    } catch (err) {
      setError('更新狀態失敗');
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      ...formData,
      username: user.username,
      name: user.name,
      mode: user.mode,
      enable: user.enable,
      password: '', // 清空密碼欄位
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      mode: '',
      enable: true,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // 更新使用者
        const updateData = {
          name: formData.name,
          enable: formData.enable,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
      } else {
        // 新增使用者
        await api.post('/users/', formData);
      }

      await fetchUsers();
      setOpenDialog(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || '操作失敗');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">使用者管理</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            新增使用者
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
          loading={loading}
          disableSelectionOnClick
          localeText={zhTW.components.MuiDataGrid.defaultProps.localeText}
        />

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{editingUser ? '編輯使用者' : '新增使用者'}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="帳號"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!!editingUser}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label={editingUser ? '新密碼 (不修改請留空)' : '密碼'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required={!editingUser}
              />

              <TextField
                fullWidth
                label="名稱"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />

              {!editingUser && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>類型</InputLabel>
                  <Select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    label="類型"
                  >
                    {availableTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === 'WEB'
                          ? '平台'
                          : type === 'TEST'
                          ? '測試用'
                          : type === 'MOBILE'
                          ? '手機用'
                          : type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {editingUser && (
                <FormControl fullWidth margin="normal">
                  <Typography variant="body2" color="textSecondary">
                    啟用狀態
                  </Typography>
                  <Switch
                    checked={formData.enable}
                    onChange={(e) => setFormData({ ...formData, enable: e.target.checked })}
                  />
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>取消</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !formData.username ||
                (!editingUser && !formData.password) ||
                !formData.name ||
                (!editingUser && !formData.mode)
              }
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UserManagement;
