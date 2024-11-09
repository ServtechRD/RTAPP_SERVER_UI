import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import axios from 'axios';

const CustomerDialog = ({ open, onClose, customer, onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
    } else {
      setName('');
    }
    setError('');
  }, [customer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (customer) {
        // Edit existing customer
        await axios.put(`/clients/${customer.id}`, { name });
      } else {
        // Create new customer
        await axios.post('/clients/', { name });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Customer Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {customer ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerDialog;
