// src/components/LocationDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Alert,
  Switch,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const LocationDialog = ({ open, onClose, customer, onSuccess }) => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && open) {
      setLocations(customer.locations || []);
      setNewLocation('');
      setError('');
      setEditingLocation(null);
    }
  }, [customer, open]);

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;

    try {
      setLoading(true);
      const response = await api.post('/locations/', {
        address: newLocation,
        client_id: customer.id,
        enabled: true,
      });

      setLocations([...locations, response.data]);
      setNewLocation('');
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '新增地點失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (location) => {
    setEditingLocation(location.id);
    setEditValue(location.address);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) return;

    try {
      setLoading(true);
      await api.put(`/locations/${editingLocation}`, {
        address: editValue,
        client_id: customer.id,
      });

      setLocations(
        locations.map((loc) => (loc.id === editingLocation ? { ...loc, address: editValue } : loc))
      );
      setEditingLocation(null);
      setEditValue('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '更新地點失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (location) => {
    try {
      setLoading(true);
      await api.put(`/locations/${location.id}`, {
        enabled: !location.enabled,
      });

      setLocations(
        locations.map((loc) => (loc.id === location.id ? { ...loc, enabled: !loc.enabled } : loc))
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '更新狀態失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '50vh' },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">管理地點 - {customer?.name}</Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="新增地點"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            disabled={loading}
            placeholder="請輸入地址"
          />
          <Button
            variant="contained"
            onClick={handleAddLocation}
            disabled={!newLocation.trim() || loading}
            startIcon={<AddIcon />}
          >
            新增
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List>
          {locations.map((location) => (
            <ListItem
              key={location.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {editingLocation === location.id ? (
                <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    size="small"
                    disabled={loading}
                  />
                  <IconButton onClick={handleSaveEdit} color="primary" disabled={loading}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setEditingLocation(null)}
                    color="error"
                    disabled={loading}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <ListItemText
                    primary={
                      <Typography
                        component="span"
                        sx={{
                          color: location.enabled ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {location.address}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={location.enabled ? '停用地點' : '啟用地點'}>
                      <Switch
                        checked={location.enabled}
                        onChange={() => handleToggleEnabled(location)}
                        disabled={loading}
                      />
                    </Tooltip>
                    <Tooltip title="編輯地址">
                      <IconButton
                        onClick={() => handleStartEdit(location)}
                        disabled={loading}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
          ))}
          {locations.length === 0 && (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
              尚無地點資料
            </Typography>
          )}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          關閉
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;
