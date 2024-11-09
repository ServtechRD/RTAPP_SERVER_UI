// src/components/ModelUploadDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Typography,
  Autocomplete,
  Chip,
  Tooltip,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../utils/api';

const ModelUploadDialog = ({ open, onClose, onSuccess, mobileUsers }) => {
  const [versionName, setVersionName] = useState('');
  const [file, setFile] = useState(null);
  const [showModel, setShowModel] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [threshold, setThreshold] = useState(0.5);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      // 重置表單
      setVersionName('');
      setFile(null);
      setShowModel(true);
      setShowScore(true);
      setThreshold(0.5);
      setSelectedUsers([]);
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!file || !versionName || selectedUsers.length === 0) {
      setError('請填寫所有必要欄位');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('versionName', versionName);
      formData.append('zipFile', file);
      formData.append('showModel', showModel);
      formData.append('showScore', showScore);
      formData.append('threshold', threshold);
      // 將選中的使用者的 username 組合成字串
      formData.append('usernameList', selectedUsers.map((user) => user.username).join('|'));

      const response = await api.post('/upload_version/', formData);

      if (response.data.status === 'success') {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError(response.data.message || '上傳失敗');
      }
    } catch (err) {
      setError(err.response?.data?.detail || '上傳失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>上傳新模型版本</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="版本名稱"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            required
            margin="normal"
          />

          <Box sx={{ my: 2 }}>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="model-upload"
            />
            <label htmlFor="model-upload">
              <Button variant="contained" component="span">
                選擇檔案
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                已選擇: {file.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ my: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={showModel} onChange={(e) => setShowModel(e.target.checked)} />
              }
              label="顯示模型"
            />
            <FormControlLabel
              control={
                <Switch checked={showScore} onChange={(e) => setShowScore(e.target.checked)} />
              }
              label="顯示分數"
            />
          </Box>

          <TextField
            fullWidth
            label="閾值"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            inputProps={{ step: 0.1, min: 0, max: 1 }}
            margin="normal"
          />

          <Autocomplete
            multiple
            value={selectedUsers}
            onChange={(event, newValue) => {
              setSelectedUsers(newValue);
            }}
            options={mobileOnlyUsers}
            getOptionLabel={(option) => `${option.username} (${option.name})`}
            renderInput={(params) => (
              <TextField {...params} label="選擇行動使用者" margin="normal" required />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={index}
                  label={option.username}
                  {...getTagProps({ index })}
                  color="primary"
                  variant="outlined"
                />
              ))
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!file || !versionName || selectedUsers.length === 0}
          >
            上傳
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModelUploadDialog;
