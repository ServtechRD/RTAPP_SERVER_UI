// src/components/ModelUploadDialog.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

const ModelUploadDialog = ({ open, onClose, onSuccess }) => {
  const [versionName, setVersionName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModel, setShowModel] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [threshold, setThreshold] = useState(0.5);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 加載所有可用的用戶
  React.useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/');
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const resetForm = () => {
    setVersionName('');
    setSelectedFile(null);
    setShowModel(true);
    setShowScore(true);
    setThreshold(0.5);
    setSelectedUsers([]);
    setError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/zip') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please upload a ZIP file');
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    if (!selectedFile || !versionName) {
      setError('Please fill in all required fields');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('versionName', versionName);
      formData.append('zipFile', selectedFile);
      formData.append('showModel', showModel);
      formData.append('showScore', showScore);
      formData.append('threshold', threshold);
      formData.append('usernameList', selectedUsers.join('|'));

      await axios.post('/upload_version/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload model');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload New Model Version</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="dense"
            label="Version Name"
            fullWidth
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="model-file-upload"
            />
            <label htmlFor="model-file-upload">
              <Button
                variant="contained"
                component="span"
              >
                Choose ZIP File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showModel}
                  onChange={(e) => setShowModel(e.target.checked)}
                />
              }
              label="Show Model"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showScore}
                  onChange={(e) => setShowScore(e.target.checked)}
                />
              }
              label="Show Score"
            />
          </Box>

          <TextField
            type="number"
            label="Model Threshold"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            inputProps={{ min: 0, max: 1, step: 0.1 }}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Autocomplete
            multiple
            value={selectedUsers}
            onChange={(event, newValue) => {
              setSelectedUsers(newValue);
            }}
            options={availableUsers.map(user => user.username)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign Users"
                placeholder="Select users"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            onClose();
            resetForm();
          }}>
            Cancel
          </Button>
          <LoadingButton
            loading={uploading}
            type="submit"
            variant="contained"
            disabled={!selectedFile || !versionName}
          >
            Upload
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModelUploadDialog;
