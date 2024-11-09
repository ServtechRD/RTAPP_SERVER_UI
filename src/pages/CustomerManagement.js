// src/pages/CustomerManagement.js
import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Typography, Switch, Paper, Tooltip, Alert } from '@mui/material';
import { DataGrid, zhTW } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import CustomerDialog from '../components/CustomerDialog';
import LocationDialog from '../components/LocationDialog';
import api from '../utils/api';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients_with_locations/');
      const customersData = response.data.map((customer) => ({
        ...customer,
        locationCount: customer.locations?.length || 0,
        enabled: customer.enabled ?? true, // 確保有 enabled 欄位
      }));
      setCustomers(customersData);
      setError('');
    } catch (err) {
      setError('獲取客戶資料失敗: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns = [
    {
      field: 'id',
      headerName: '編號',
      width: 90,
      sortable: true,
    },
    {
      field: 'name',
      headerName: '客戶名稱',
      width: 200,
      sortable: true,
      flex: 1,
    },
    {
      field: 'locationCount',
      headerName: '地點數量',
      width: 120,
      sortable: true,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'enabled',
      headerName: '啟用狀態',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Switch
          checked={params.row.enabled}
          onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
          color="primary"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '操作',
      width: 150,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box>
          <Tooltip title="編輯客戶">
            <IconButton onClick={() => handleEditCustomer(params.row)} size="small" color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="管理地點">
            <IconButton
              onClick={() => handleOpenLocations(params.row)}
              size="small"
              color="secondary"
            >
              <LocationIcon />
            </IconButton>
          </Tooltip>
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

  const handleStatusChange = async (clientId, enabled) => {
    try {
      await api.put(`/clients/${clientId}`, {
        enabled: enabled,
      });

      setCustomers(
        customers.map((customer) =>
          customer.id === clientId ? { ...customer, enabled: enabled } : customer
        )
      );
    } catch (err) {
      setError('更新狀態失敗: ' + (err.response?.data?.detail || err.message));
      // 恢復原始狀態
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === clientId ? { ...customer, enabled: !enabled } : customer
        )
      );
    }
  };

  return (
    <Paper sx={{ height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          客戶管理
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCustomer}>
          新增客戶
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={customers}
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
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      />

      <CustomerDialog
        open={openCustomerDialog}
        onClose={() => setOpenCustomerDialog(false)}
        customer={selectedCustomer}
        onSuccess={() => {
          fetchCustomers();
          setOpenCustomerDialog(false);
        }}
      />

      <LocationDialog
        open={openLocationDialog}
        onClose={() => setOpenLocationDialog(false)}
        customer={selectedCustomer}
        onSuccess={() => {
          fetchCustomers();
          setOpenLocationDialog(false);
        }}
      />
    </Paper>
  );
};

export default CustomerManagement;
