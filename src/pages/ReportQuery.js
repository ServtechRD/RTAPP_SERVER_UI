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
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid, zhTW } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import PhotoDialog from '../components/PhotoDialog';
import { format } from 'date-fns';

const ReportQuery = () => {
  // 在 state 初始化時設置預設日期
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // 7天前
    return date;
  });

  const [selectedSerial, setSelectedSerial] = useState(''); // 改為作番號碼
  const [serials, setSerials] = useState([]); // 改為作番號碼列表

  const [endDate, setEndDate] = useState(new Date()); // 今天
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [owners, setOwners] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalCustomers: 0,
    averageLabelsPerPhoto: 0,
  });

  useEffect(() => {
    // fetchSerials(); // 改為獲取作番號碼 - 隐藏作番号获取
    //fetchCustomers();
    fetchOwners();
    //fetchLocations();
  }, []);

  // 新增獲取作番號碼的函數
  const fetchSerials = async () => {
    try {
      const response = await api.get('/unique_serials/');
      setSerials(response.data);
    } catch (error) {
      console.error('獲取作番號碼失敗:', error);
      setError('獲取作番號碼失敗');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/clients/');
      const activeCustomers = response.data;
      setCustomers(activeCustomers);
    } catch (error) {
      console.error('獲取客戶資料失敗:', error);
      setError('獲取客戶資料失敗');
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await api.get('/unique_owners/');
      // 因為回傳的是字串陣列，直接使用即可
      setOwners(response.data);
    } catch (error) {
      console.error('獲取人員資料失敗:', error);
      setError('獲取人員資料失敗');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations/');
      const activeLocations = response.data;
      setLocations(activeLocations);
    } catch (error) {
      console.error('獲取地點資料失敗:', error);
      setError('獲取地點資料失敗');
    }
  };

  // 添加批次下載函數
  const handleBatchDownload = async () => {
    if (queryResults.length === 0) {
      setError('無可下載的照片');
      return;
    }

    try {
      setLoading(true);
      // 使用當前查詢條件下載
      const params = {
        start_time: format(startDate, 'yyyy-MM-dd') + ' 00:00:00',
        end_time: format(endDate, 'yyyy-MM-dd') + ' 23:59:59',
        serialNumber: selectedSerial || undefined,
        ownerName: selectedOwner || undefined,
      };

      const response = await api.get('/photos/download_zip/', {
        params,
        responseType: 'blob',
      });

      // 創建下載連結
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // 使用當前日期作為檔名
      const currentDate = format(new Date(), 'yyyyMMdd');
      link.setAttribute('download', `photos_${currentDate}.zip`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('批次下載失敗:', error);
      setError('批次下載失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('請選擇開始和結束日期');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        start_time: format(startDate, 'yyyy-MM-dd') + ' 00:00:00',
        end_time: format(endDate, 'yyyy-MM-dd') + ' 23:59:59',
        // serialNumber: selectedSerial || undefined, // 隐藏作番号参数
        ownerName: selectedOwner || undefined,
      };

      const response = await api.get('/photos/query/', { params });

      let results = response.data;

      setQueryResults(results);
      calculateStats(results);
    } catch (error) {
      console.error('查詢失敗:', error);
      //setError(error.response?.data?.detail || '查詢資料時發生錯誤');
      setError('無資料');
      setQueryResults([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalPhotos = data.length;
    //const uniqueCustomers = new Set(data.map((item) => item.customerId)).size;
    const uniqueSerials = new Set(data.map((item) => item.serialNumber)).size;
    const totalLabels = data.reduce((acc, item) => {
      return acc + (item.detectLabels?.split(',').length || 0);
    }, 0);
    const averageLabels = totalPhotos > 0 ? (totalLabels / totalPhotos).toFixed(2) : 0;

    setStats({
      totalPhotos,
      totalCustomers: uniqueSerials, //uniqueCustomers,
      averageLabelsPerPhoto: averageLabels,
    });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    // setSelectedSerial(''); // 改為清除作番號碼 - 隐藏作番号清除
    setSelectedCustomer('');
    setSelectedOwner('');
    setQueryResults([]);
    setError('');
    setStats({
      totalPhotos: 0,
      totalCustomers: 0,
      averageLabelsPerPhoto: 0,
    });
  };

  const columns = [
    {
      field: 'id',
      headerName: '項次',
      width: 70,
      type: 'number',
    },
    {
      field: 'saveTime',
      headerName: '時間',
      width: 160,
      valueFormatter: (params) => {
        const utcDate = new Date(params.value);
        return utcDate.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      },
    },
    // 隐藏作番号列
    // {
    //   field: 'serialNumber',
    //   headerName: '作番號碼',
    //   width: 130,
    // },
    {
      field: 'ownerName',
      headerName: '人員',
      width: 100,
    },
    {
      field: 'taskId',
      headerName: '作業內容',
      width: 200,
      valueGetter: (params) => {
        const taskName =
          params.value == 0
            ? '現場作業 (勾掛安全帶)'
            : params.value == 1
            ? '現場作業 (不需要勾掛安全帶)'
            : '現場作業(電扶梯專用)';
        return taskName;
      },
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal', // 允許換行
            wordWrap: 'break-word', // 長單字換行
            lineHeight: '1.5', // 行高
            padding: '2px 0', // 上下padding
            width: '100%', // 使用全寬
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'detectLabels',
      headerName: '辨識物件',
      width: 160,
      valueGetter: (params) => {
        // 如果沒有標籤資料，返回空字串
        if (!params.value) return '';

        // 用 | 分隔標籤
        const labels = params.value.split('|');

        // 從每個標籤中取出 Name
        const names = labels.map((label) => {
          const match = label.match(/@(.+)$/);
          return match ? match[1] : label;
        });

        return names.join(', ');
      },
      renderCell: (params) => {
        if (!params.value) return '';

        // 用 | 分隔標籤
        const labels = params.row.detectLabels.split('|');

        // 從每個標籤中取出 Name
        const names = labels.map((label) => {
          const match = label.match(/@(.+)$/);
          return match ? match[1] : label;
        });

        // 顯示前三個，如果有更多則顯示...
        const displayNames = names.slice(0, 3).join(', ');
        const hasMore = names.length > 3;

        return (
          <Tooltip title={names.join(', ')}>
            <span>
              {displayNames}
              {hasMore ? '...' : ''}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: '辨識結果及照片',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="查看照片">
            <IconButton onClick={() => handleViewPhoto(params.row)}>
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="下載">
            <IconButton onClick={() => handleDownload(params.row)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleViewPhoto = (photo) => {
    const customer = customers.find((c) => c.id === Number(photo.customerId));
    const location = locations.find((c) => c.id === Number(photo.locationId));

    // 傳遞更多資訊給 PhotoDialog
    setSelectedPhoto({
      ...photo,
      customerName: customer?.name || '',
      locationName: location?.address || '',
    });
    setOpenPhotoDialog(true);
  };

  const handleDownload = async (photo) => {
    try {
      const response = await api.get(`/photos/download_result/${photo.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photo_${photo.id}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載失敗:', error);
      setError('下載照片失敗');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          照片查詢報表
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="開始日期"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="結束日期"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            {/* 隐藏作番号选择框 */}
            {/* <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>作番號碼</InputLabel>
                <Select
                  value={selectedSerial}
                  onChange={(e) => setSelectedSerial(e.target.value)}
                  label="作番號碼"
                >
                  <MenuItem value="">全部</MenuItem>
                  {serials.map((serial) => (
                    <MenuItem key={serial} value={serial}>
                      {serial}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>人員</InputLabel>
                <Select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  label="人員"
                >
                  <MenuItem value="">全部</MenuItem>
                  {owners.map((ownerName) => (
                    <MenuItem key={ownerName} value={ownerName}>
                      {ownerName}
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
                查詢
              </Button>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear} fullWidth>
                清除
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  照片總數
                </Typography>
                <Typography variant="h4">{stats.totalPhotos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  人員總數
                </Typography>
                <Typography variant="h4">{stats.totalCustomers}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 在 DataGrid 之前添加下載按鈕 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleBatchDownload}
            disabled={loading || queryResults.length === 0}
          >
            下載所有照片
          </Button>
        </Box>

        <DataGrid
          rows={queryResults}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          disableRowSelectionOnClick
          loading={loading}
          autoHeight
          getRowHeight={() => 'auto'} // 自動行高
          sx={{
            '& .MuiDataGrid-cell': {
              padding: '8px', // cell padding
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-row': {
              minHeight: '48px !important', // 最小行高
              // 確保即使內容很少時也有合適的高度
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal', // 允許換行
                wordWrap: 'break-word', // 長單字換行
                lineHeight: '1.2', // 行高
                display: 'flex',
                alignItems: 'center',
                maxHeight: 'none !important', // 移除最大高度限制
                overflow: 'visible', // 允許內容超出
              },
            },
            '& .MuiDataGrid-virtualScroller': {
              minHeight: '400px', // 設定最小高度
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              minHeight: '400px', // 設定最小高度
            },
          }}
          componentsProps={{
            row: {
              style: {
                maxHeight: 'none',
              },
            },
          }}
          localeText={zhTW.components.MuiDataGrid.defaultProps.localeText}
        />

        <PhotoDialog
          open={openPhotoDialog}
          onClose={() => setOpenPhotoDialog(false)}
          photo={selectedPhoto}
          customer={customers.find((c) => c.id === Number(selectedPhoto?.customerId))}
          location={locations.find((c) => c.id === Number(selectedPhoto?.locationId))}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default ReportQuery;
