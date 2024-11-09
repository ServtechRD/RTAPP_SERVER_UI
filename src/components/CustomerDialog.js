// src/components/CustomerDialog.js
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import api from '../utils/api';

const CustomerDialog = ({ open, onClose, customer, onSuccess }) => {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEnabled(customer.enabled ?? true);
    } else {
      setName('');
      setEnabled(true);
    }
    setError('');
  }, [customer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (customer) {
        // 更新客戶
        await api.put(`/clients/${customer.id}`, {
          name,
          enabled,
        });
      } else {
        // 創建新客戶
        await api.post('/clients/', {
          name,
          enabled,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || '操作失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{customer ? '編輯客戶' : '新增客戶'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="客戶名稱"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                disabled={loading}
              />
            }
            label="啟用狀態"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !name.trim()}>
            {customer ? '更新' : '創建'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
