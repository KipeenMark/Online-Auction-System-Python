import React, { useState, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';

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
    duration: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl('');
    fileInputRef.current.value = '';
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

      if (!image) {
        throw new Error('Please upload an image');
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

      // Convert image to base64
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Send request with JSON data
      await axios.post(
        'http://localhost:5000/api/auctions',
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          startingPrice: startingPrice.toString(),
          minimumIncrement: minimumIncrement.toString(),
          endTime: endTimeUTC.toISOString(),
          imageUrl: imageBase64
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Navigate to the my auctions page on success
      navigate('/my-auctions');
    } catch (err) {
      console.error('Error creating auction:', err);
      
      // Handle different types of errors
      if (err.code === 'ERR_NETWORK') {
        setError('Network error: Please check your connection and try again. If the image is too large, try using a smaller image.');
      } else if (err.response?.data?.error) {
        // Display specific error from backend
        console.log('Backend error details:', err.response.data);
        setError(`Server error: ${err.response.data.error}`);
      } else if (err.message) {
        // Display validation errors from frontend
        setError(`Validation error: ${err.message}`);
      } else {
        setError('Failed to create auction. Please try again.');
      }
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

            {/* Image Upload */}
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => fileInputRef.current.click()}
                >
                  {image ? 'Change Image' : 'Upload Image'}
                </Button>
                {image && (
                  <IconButton onClick={handleRemoveImage} color="error">
                    <ClearIcon />
                  </IconButton>
                )}
              </Box>
              {previewUrl && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              )}
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
