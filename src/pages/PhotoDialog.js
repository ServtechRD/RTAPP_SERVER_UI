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
} from '@mui/material';
import api, { BASE_URL } from '../utils/api';

const PhotoDialog = ({ open, onClose, photo }) => {
  if (!photo) return null;

  const labels = photo.detectLabels?.split(',') || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Photo Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <img
                src={`${BASE_URL}/photos/show/${photo.id}`}
                alt="Photo"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '500px',
                  objectFit: 'contain',
                }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                資訊
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  日期
                </Typography>
                <Typography variant="body1">{new Date(photo.saveTime).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  負責人員
                </Typography>
                <Typography variant="body1">{photo.ownerName}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  辨識物件
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
              </Box>
              {photo.file_result_path && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Detection Result
                  </Typography>
                  <img
                    src={photo.file_result_path}
                    alt="Detection Result"
                    style={{
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoDialog;
