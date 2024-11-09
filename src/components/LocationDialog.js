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
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const LocationDialog = ({ open, onClose, customer, onSuccess }) => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

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
      const response = await axios.post('/locations/', {
        address: newLocation,
        client_id: customer.id
      });

      setLocations([...locations, response.data]);
      setNewLocation('');
      setError('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '新增地點失敗');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await axios.delete(`/locations/${locationId}`);
      setLocations(locations.filter(loc => loc.id !== locationId));
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '刪除地點失敗');
    }
  };

  const handleStartEdit = (location) => {
    setEditingLocation(location.id);
    setEditValue(location.address);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) return;

    try {
      await axios.put(`/locations/${editingLocation}`, {
        address: editValue,
        client_id: customer.id
      });

      setLocations(locations.map(loc =>
        loc.id === editingLocation
          ? { ...loc, address: editValue }
          : loc
      ));
      setEditingLocation(null);
      setEditValue('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || '更新地點失敗');
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
    setEditValue('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        管理地點 - {customer?.name}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="新地點地址"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddLocation}
            disabled={!newLocation.trim()}
          >
            新增地點
          </Button>
        </Box>

        <List>
          {locations.map((location) => (
            <ListItem key={location.id}>
              {editingLocation === location.id ? (
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <TextField
                    fullWidth
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    size="small"
                  />
                  <IconButton onClick={handleSaveEdit} color="primary">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} color="error">
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <ListItemText primary={location.address} />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleStartEdit(location)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;
