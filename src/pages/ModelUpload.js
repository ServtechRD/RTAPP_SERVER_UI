// src/pages/ModelUpload.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  TextField,
  Chip,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import ModelUploadDialog from '../components/ModelUploadDialog';

const ModelUpload = () => {
  const [versions, setVersions] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      // 假設這個API會返回所有版本信息
      const response = await axios.get('/version_management/');
      const versionsWithDetails = await Promise.all(
        response.data.map(async (version) => {
          const actionResponse = await axios.get(`/models/action?version=${version.version_name}`);
          return {
            ...version,
            ...actionResponse.data,
            id: version.id
          };
        })
      );
      setVersions(versionsWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const columns = [
    { field: 'version_name', headerName: 'Version', width: 150 },
    { 
      field: 'showModel', 
      headerName: 'Show Model', 
      width: 130,
      renderCell: (params) => (
        <Switch checked={params.value} disabled />
      )
    },
    { 
      field: 'showScore', 
      headerName: 'Show Score', 
      width: 130,
      renderCell: (params) => (
        <Switch checked={params.value} disabled />
      )
    },
    {
      field: 'modelThreshold',
      headerName: 'Threshold',
      width: 130,
      renderCell: (params) => (
        <Typography>{params.value.toFixed(2)}</Typography>
      )
    },
    {
      field: 'users',
      headerName: 'Assigned Users',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.row.users?.map((user) => (
            <Chip
              key={user}
              label={user}
              size="small"
            />
          ))}
        </Box>
      )
    },
    {
      field: 'uploaded_at',
      headerName: 'Upload Date',
      width: 180,
      valueGetter: (params) => new Date(params.row.uploaded_at).toLocaleString()
    }
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Model Version Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenUploadDialog(true)}
        >
          Upload New Model
        </Button>
      </Box>

      <DataGrid
        rows={versions}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        loading={loading}
      />

      <ModelUploadDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={fetchVersions}
      />
    </Box>
  );
};

export default ModelUpload;
