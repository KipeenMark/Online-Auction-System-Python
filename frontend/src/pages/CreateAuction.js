import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  InputAdornment,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CreateAuction = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    minimumIncrement: '',
    duration: '',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true);
    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData(prev => ({ ...prev, imageUrl: base64String }));
      setImagePreview(base64String);
      setError(''); // Clear any previous errors
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      const requiredFields = ['title', 'description', 'startingPrice', 'minimumIncrement', 'duration'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          throw new Error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
      }

      // Validate numeric fields
      const startingPrice = parseFloat(formData.startingPrice);
      const minimumIncrement = parseFloat(formData.minimumIncrement);
      
      if (isNaN(startingPrice) || startingPrice <= 0) {
        throw new Error('Starting price must be a valid number greater than 0');
      }
      
      if (isNaN(minimumIncrement) || minimumIncrement <= 0) {
        throw new Error('Minimum increment must be a valid number greater than 0');
      }

      // Calculate end time in UTC
      const durationInDays = parseInt(formData.duration);
      if (isNaN(durationInDays) || durationInDays <= 0) {
        throw new Error('Duration must be a valid number greater than 0');
      }
      
      const now = new Date();
      const endTimeUTC = new Date(now.getTime() + (durationInDays * 24 * 60 * 60 * 1000));

      // Prepare auction data with image if provided
      const auctionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startingPrice: Number(startingPrice),
        minimumIncrement: Number(minimumIncrement),
        endTime: endTimeUTC.toISOString(),
        imageUrl: formData.imageUrl || null
      };

      // Log data for debugging (safely handle all image cases)
      const dataToPrint = { ...auctionData };
      if ('imageUrl' in dataToPrint) {
        dataToPrint.imageUrl = '[Image data present]';
      } else {
        dataToPrint.imageUrl = '[No image]';
      }
      console.log('Sending auction data:', dataToPrint);


      const response = await axios.post(
        'http://localhost:5000/api/auctions',
        auctionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data) {
        throw new Error('No response from server');
      }

      // Navigate to the my auctions page on success
      navigate('/my-auctions');
    } catch (err) {
      if (err.response?.status === 422) {
        // Handle validation errors from backend
        const errorMessage = err.response.data.error || 'Invalid auction data';
        setError(`Validation error: ${errorMessage}`);
      } else if (err.message && err.message.includes('Image size')) {
        // Handle image size errors
        setError('Image size error: Please select an image smaller than 2MB');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error: Please check your connection and try again');
      } else if (err.response?.data?.error) {
        // Handle other backend errors
        setError(`Server error: ${err.response.data.error}`);
      } else if (err.message) {
        // Handle other client-side errors
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to create auction. Please try again.');
      }

      // Log error details for debugging
      console.error('Auction creation error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Create New Auction
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Item Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GavelIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Item Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Price Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Starting Price"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Minimum Bid Increment"
                name="minimumIncrement"
                value={formData.minimumIncrement}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={imagePreview ? <ImageIcon /> : <CloudUploadIcon />}
                  sx={{
                    py: 2,
                    mb: imagePreview ? 2 : 0,
                    borderStyle: 'dashed',
                    '&:hover': {
                      borderStyle: 'dashed'
                    }
                  }}
                >
                  {imagePreview ? 'Change Image' : 'Upload Image (Optional)'}
                </Button>
              </label>
              {imagePreview && (
                <Box sx={{ mt: 2, mb: 2, position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      display: 'block',
                      margin: '0 auto',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={removeImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      minWidth: 'auto',
                      width: 32,
                      height: 32,
                      borderRadius: '50%'
                    }}
                  >
                    ×
                  </Button>
                </Box>
              )}
            </Grid>

            {/* Duration */}
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                type="number"
                label="Auction Duration (days)"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Auction'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAuction;
