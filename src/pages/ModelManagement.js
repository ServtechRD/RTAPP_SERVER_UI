// src/pages/ModelManagement.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Alert } from '@mui/material';
import { DataGrid, zhTW } from '@mui/x-data-grid';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import ModelUploadDialog from '../components/ModelUploadDialog';
import api from '../utils/api';

const ModelManagement = () => {
  const [versions, setVersions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 獲取版本數據和映射數據
  const fetchData = async () => {
    try {
      setLoading(true);
      // 獲取版本列表
      const versionsResponse = await api.get('/versions/');

      // 假設當前用戶名從 localStorage 獲取
      const currentUser = localStorage.getItem('user');

      // 獲取當前用戶的版本映射
      const mappingsResponse = await api.get(`/versions/mapping/${currentUser}`);

      // 合併版本數據與映射數據
      const versionData = versionsResponse.data.map((version) => {
        // 找到對應的映射
        const mapping = mappingsResponse.data.find((m) => m.version_name === version.version_name);

        return {
          ...version,
          id: version.id,
          mappingInfo: mapping
            ? `分配於 ${new Date(mapping.update_date).toLocaleString('zh-TW')}`
            : '未分配',
        };
      });

      setVersions(versionData);
      setMappings(mappingsResponse.data);
      setError('');
    } catch (err) {
      setError('獲取版本資料失敗: ' + (err.response?.data?.detail || err.message));
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
      field: 'mappingInfo',
      headerName: '分配狀態',
      width: 200,
      valueGetter: (params) => params.row.mappingInfo,
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
        getRowClassName={(params) => {
          const mapping = mappings.find((m) => m.version_name === params.row.version_name);
          return mapping ? 'assigned-version' : '';
        }}
      />

      <ModelUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={handleUploadSuccess}
      />

      <style>
        {`
          .assigned-version {
            background-color: rgba(25, 118, 210, 0.08);
          }
          .assigned-version:hover {
            background-color: rgba(25, 118, 210, 0.12) !important;
          }
        `}
      </style>
    </Paper>
  );
};

export default ModelManagement;
