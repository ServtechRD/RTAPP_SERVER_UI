// src/components/PhotoDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Paper,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import api, { BASE_URL } from '../utils/api';

const PhotoDialog = ({ open, onClose, photo, customer, location }) => {
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [showOriginal, setShowOriginal] = React.useState(true);

  if (!photo) return null;

  const labels = photo.detectLabels?.split(',') || [];

  const handleDownload = async (photo, show_result) => {
    try {
      let api_url = `/photos/download/${photo.id}`;
      if (show_result) {
        api_url = api_url + '?result=true';
      }

      const response = await api.get(api_url, {
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
      //setError('下載照片失敗');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const toggleImage = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">照片詳情</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* 左側：圖片顯示區 */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <IconButton onClick={handleZoomIn} size="small">
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton onClick={handleZoomOut} size="small">
                    <ZoomOutIcon />
                  </IconButton>
                </Box>
                {photo.file_result_path && (
                  <Button size="small" onClick={toggleImage}>
                    {showOriginal ? '顯示結果圖' : '顯示原圖'}
                  </Button>
                )}
                <IconButton onClick={() => handleDownload(photo, showOriginal)} size="small">
                  <DownloadIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={
                    showOriginal
                      ? `${BASE_URL}/photos/show/${photo.id}`
                      : `${BASE_URL}/photos/show/${photo.id}?result=true`
                  }
                  alt="Photo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    transform: `scale(${zoomLevel})`,
                    transition: 'transform 0.2s',
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* 右側：信息顯示區 */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ width: '40%' }}>
                        日期
                      </TableCell>
                      <TableCell>
                        {format(new Date(photo.saveTime), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        負責人
                      </TableCell>
                      <TableCell>{photo.ownerName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        客戶
                      </TableCell>
                      <TableCell> {customer?.name || photo.customerName || '未知'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        地點
                      </TableCell>
                      <TableCell> {location?.address || photo.locationName || '未知'} </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                辨識物件
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {labels
                  .filter((label) => label && label.trim()) // 過濾掉空值
                  .map((label, index) => {
                    const parts = label.trim().split('@');
                    const displayLabel = parts.length > 1 ? parts[1] : parts[0];

                    // 只有當有有效的標籤時才顯示
                    return displayLabel ? (
                      <Chip
                        key={index}
                        label={displayLabel}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : null;
                  })}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoDialog;
