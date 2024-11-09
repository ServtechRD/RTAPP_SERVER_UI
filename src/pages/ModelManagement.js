// src/pages/ModelManagement.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Alert, Chip, Tooltip } from '@mui/material';
import { DataGrid, zhTW } from '@mui/x-data-grid';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import ModelUploadDialog from '../components/ModelUploadDialog';
import api from '../utils/api';

const ModelManagement = () => {
  const [versions, setVersions] = useState([]);
  const [mobileUsers, setMobileUsers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 獲取行動使用者和版本數據
  const fetchData = async () => {
    try {
      setLoading(true);

      // 獲取行動使用者
      const mobileUsersResponse = await api.get('/users/mobile/');
      const mobileUsersList = mobileUsersResponse.data;
      setMobileUsers(mobileUsersList);

      // 獲取所有版本
      const versionsResponse = await api.get('/versions/');

      // 獲取所有使用者的版本映射 - 修改為 for...of 循環
      const mappingResponses = [];
      for (const user of mobileUsersList) {
        try {
          const response = await api.get(`/versions/mapping/${user.username}`);
          mappingResponses.push(response);
        } catch {
          mappingResponses.push({ data: [] });
        }
      }

      const allMappings = [];
      for (const response of mappingResponses) {
        if (response.data) {
          allMappings.push(...response.data);
        }
      }

      // 處理版本數據
      const versionData = [];
      for (const version of versionsResponse.data) {
        // 找到此版本相關的所有映射
        const versionMappings = allMappings.filter(
          (mapping) => mapping.version_name === version.version_name
        );

        // 找出哪些行動使用者被分配到此版本
        const assignedMobileUsers = [];
        for (const mapping of versionMappings) {
          const user = mobileUsersList.find((user) => user.username === mapping.user_name);
          if (user) {
            assignedMobileUsers.push(user);
          }
        }

        if (assignedMobileUsers.length > 0) {
          versionData.push({
            ...version,
            id: version.id,
            assignedUsers: assignedMobileUsers,
            mappingDates: versionMappings.map((m) => ({
              username: m.user_name,
              date: new Date(m.update_date).toLocaleString('zh-TW'),
            })),
          });
        }
      }
    } catch (err) {
      setError('獲取資料失敗: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: 'version_name',
      headerName: '版本名稱',
      width: 150,
      flex: 1,
    },
    {
      field: 'upload_date',
      headerName: '上傳時間',
      width: 180,
      valueGetter: (params) => {
        return new Date(params.value).toLocaleString('zh-TW');
      },
    },
    {
      field: 'uploaded_by',
      headerName: '上傳者',
      width: 120,
    },
    {
      field: 'file_path',
      headerName: '檔案路徑',
      width: 200,
      flex: 1,
    },
    {
      field: 'assignedUsers',
      headerName: '已分配使用者',
      width: 300,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map((user, index) => (
            <Tooltip
              key={user.username}
              title={`分配時間: ${
                params.row.mappingDates.find((m) => m.username === user.username)?.date
              }`}
            >
              <Chip label={user.username} size="small" color="primary" variant="outlined" />
            </Tooltip>
          ))}
        </Box>
      ),
    },
  ];

  const handleUploadSuccess = async () => {
    await fetchData();
    setOpenUploadDialog(false);
  };

  return (
    <Paper sx={{ height: '100%', p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          模型版本管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenUploadDialog(true)}
        >
          上傳新版本
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={versions}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        disableSelectionOnClick
        loading={loading}
        autoHeight
        localeText={zhTW.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />

      <ModelUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={handleUploadSuccess}
        mobileUsers={mobileUsers}
      />
    </Paper>
  );
};

export default ModelManagement;
