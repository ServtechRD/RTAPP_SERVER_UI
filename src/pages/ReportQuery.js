// src/pages/ReportQuery.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import PhotoDialog from '../components/PhotoDialog';
import { format } from 'date-fns';

const ReportQuery = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [customers, setCustomers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalCustomers: 0,
    averageLabelsPerPhoto: 0
  });

  useEffect(() => {
    fetchCustomers();
    fetchOwners();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/clients/');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await axios.get('/users/');
      setOwners(response.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        start_time: format(startDate, 'yyyy-MM-dd'),
        end_time: format(endDate, 'yyyy-MM-dd'),
        ...(selectedCustomer && { customerId: selectedCustomer }),
        ...(selectedOwner && { ownerName: selectedOwner })
      };

      const response = await axios.get('/photos/query/', { params });
      setQueryResults(response.data);
      
      // Calculate statistics
      calculateStats(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalPhotos = data.length;
    const uniqueCustomers = new Set(data.map(item => item.customerId)).size;
    const totalLabels = data.reduce((acc, item) => {
      return acc + (item.detectLabels?.split(',').length || 0);
    }, 0);
    const averageLabels = totalPhotos > 0 ? (totalLabels / totalPhotos).toFixed(2) : 0;

    setStats({
      totalPhotos,
      totalCustomers: uniqueCustomers,
      averageLabelsPerPhoto: averageLabels
    });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedCustomer('');
    setSelectedOwner('');
    setQueryResults([]);
    setError('');
    setStats({
      totalPhotos: 0,
      totalCustomers: 0,
      averageLabelsPerPhoto: 0
    });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'customerId', headerName: 'Customer', width: 130,
      valueGetter: (params) => {
        const customer = customers.find(c => c.id === params.value);
        return customer ? customer.name : params.value;
      }
    },
    { field: 'locationId', headerName: 'Location', width: 130 },
    { field: 'ownerName', headerName: 'Owner', width: 130 },
    { field: 'saveTime', headerName: 'Date', width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString()
    },
    { field: 'detectLabels', headerName: 'Labels', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>
            {params.value?.split(',').slice(0, 3).join(', ')}
            {params.value?.split(',').length > 3 ? '...' : ''}
          </span>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Photo">
            <IconButton onClick={() => handleViewPhoto(params.row)}>
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={() => handleDownload(params.row)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenPhotoDialog(true);
  };

  const handleDownload = async (photo) => {
    try {
      const response = await axios.get(`/photos/download/${photo.id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photo_${photo.id}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Photo Report Query
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  label="Customer"
                >
                  <MenuItem value="">All</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Owner</InputLabel>
                <Select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  label="Owner"
                >
                  <MenuItem value="">All</MenuItem>
                  {owners.map((owner) => (
                    <MenuItem key={owner.id} value={owner.username}>
                      {owner.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Photos
                </Typography>
                <Typography variant="h4">{stats.totalPhotos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h4">{stats.totalCustomers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Labels per Photo
                </Typography>
                <Typography variant="h4">{stats.averageLabelsPerPhoto}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <DataGrid
          rows={queryResults}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          loading={loading}
          autoHeight
          sx={{ backgroundColor: 'white' }}
        />

        <PhotoDialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          photo={selectedPhoto}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ReportQuery;
