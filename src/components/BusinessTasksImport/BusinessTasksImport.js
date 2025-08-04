import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useBulkImportBusinessTasksMutation, useBulkExportBusinessTasksMutation } from '@react-query/mutations/businessTasks/businessTaskMutations';
import useAlert from '@hooks/useAlert';

const BusinessTasksImport = ({ open, onClose, productUuid }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { displayAlert } = useAlert();

  const { mutate: importTasks, isLoading: isImporting } = useBulkImportBusinessTasksMutation(displayAlert);
  const { mutate: exportTasks, isLoading: isExporting } = useBulkExportBusinessTasksMutation(displayAlert);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      displayAlert('error', 'Please select a valid CSV file');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      displayAlert('error', 'Please select a valid CSV file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleImport = () => {
    if (selectedFile && productUuid) {
      importTasks({
        productUuid,
        csvData: selectedFile,
      });
      setSelectedFile(null);
      onClose();
    }
  };

  const handleExportTemplate = () => {
    // Create a sample CSV template
    const csvContent = `title,description,category,priority,status,assigned_to_email,due_date,estimated_hours
"Sample Task 1","This is a sample task description","product_management","high","not_started","user@example.com","2024-12-31","8"
"Sample Task 2","Another sample task","development","medium","in_progress","developer@example.com","2024-11-30","16"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'business-tasks-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    displayAlert('success', 'CSV template downloaded successfully');
  };

  const handleExportExisting = () => {
    if (productUuid) {
      exportTasks({ productUuid });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Import Business Tasks</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Import business tasks from a CSV file. Download the template to see the required format.
        </Alert>

        {/* Export Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Download Templates & Export
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportTemplate}
              disabled={isExporting}
            >
              Download CSV Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportExisting}
              disabled={isExporting || !productUuid}
            >
              Export Existing Tasks
            </Button>
          </Box>
        </Box>

        {/* File Upload Area */}
        <Typography variant="h6" gutterBottom>
          Upload CSV File
        </Typography>
        <Paper
          sx={{
            p: 4,
            border: `2px dashed ${dragOver ? '#1976d2' : '#ccc'}`,
            borderRadius: 2,
            backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          
          {selectedFile ? (
            <Box>
              <Chip
                icon={<FileIcon />}
                label={selectedFile.name}
                color="primary"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                File size: {Math.round(selectedFile.size / 1024)} KB
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Drag & drop your CSV file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse files
              </Typography>
            </Box>
          )}
        </Paper>

        {/* CSV Format Information */}
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required CSV Format:
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>title</strong> (required): Task title<br/>
            • <strong>description</strong>: Task description<br/>
            • <strong>category</strong>: One of: product_management, development, design_ui_ux, testing, etc.<br/>
            • <strong>priority</strong>: low, medium, high, critical<br/>
            • <strong>status</strong>: not_started, in_progress, completed, blocked<br/>
            • <strong>assigned_to_email</strong>: Email of assigned user<br/>
            • <strong>due_date</strong>: YYYY-MM-DD format<br/>
            • <strong>estimated_hours</strong>: Number of estimated hours
          </Typography>
        </Alert>

        {(isImporting || isExporting) && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isImporting ? 'Importing tasks...' : 'Exporting tasks...'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || isImporting || !productUuid}
          startIcon={<UploadIcon />}
        >
          Import Tasks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BusinessTasksImport;
