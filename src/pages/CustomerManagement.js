// src/pages/CustomerManagement.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Typography,
  Switch
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import axios from 'axios';
import CustomerDialog from '../components/CustomerDialog';
import LocationDialog from '../components/LocationDialog';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/clients_with_locations/');
      setCustomers(response.data.map(customer => ({
        ...customer,
        locationCount: customer.locations?.length || 0,
        isActive: true // 假設後端API還沒有這個字段
      })));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Customer Name', width: 200 },
    { field: 'locationCount', headerName: 'Locations', width: 130 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditCustomer(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleOpenLocations(params.row)}>
            <LocationIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setOpenCustomerDialog(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenCustomerDialog(true);
  };

  const handleOpenLocations = (customer) => {
    setSelectedCustomer(customer);
    setOpenLocationDialog(true);
  };

  const handleStatusChange = async (customerId, newStatus) => {
    // 實現狀態更新邏輯
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, isActive: newStatus }
        : customer
    ));
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Customer Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </Box>
      
      <DataGrid
        rows={customers}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        loading={loading}
      />

      <CustomerDialog
        open={openCustomerDialog}
        onClose={() => setOpenCustomerDialog(false)}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />

      <LocationDialog
        open={openLocationDialog}
        onClose={() => setOpenLocationDialog(false)}
        customer={selectedCustomer}
        onSuccess={fetchCustomers}
      />
    </Box>
  );
};

export default CustomerManagement;
