import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
CircularProgress,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const EditAuction = () => {
const { id } = useParams();
const navigate = useNavigate();
const { token } = useAuth();
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [formData, setFormData] = useState({
title: '',
description: '',
minimumIncrement: '',
imageUrl: ''
});
const [imagePreview, setImagePreview] = useState('');

useEffect(() => {
fetchAuction();
}, [id]);

const fetchAuction = async () => {
try {
const response = await axios.get(
  `http://localhost:5000/api/auctions/${id}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

  const auction = response.data;
  setFormData({
    title: auction.title,
    description: auction.description,
    minimumIncrement: auction.minimum_increment,
    imageUrl: auction.image_url || ''
  });
  setImagePreview(auction.image_url || '');
  setError('');
} catch (err) {
  setError('Failed to load auction details');
  console.error('Error fetching auction:', err);
} finally {
  setLoading(false);
}
};

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
  setError('');
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
  // Validate minimum increment
  const minimumIncrement = parseFloat(formData.minimumIncrement);
  if (isNaN(minimumIncrement) || minimumIncrement <= 0) {
    throw new Error('Minimum increment must be a valid number greater than 0');
  }

  const auctionData = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    minimumIncrement: Number(minimumIncrement),
    imageUrl: formData.imageUrl || null
  };

  const response = await axios.put(
    `http://localhost:5000/api/auctions/${id}`,
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

  // Navigate back to the my auctions page on success
  navigate('/my-auctions');
} catch (err) {
  if (err.response?.status === 403) {
    setError('You are not authorized to edit this auction');
  } else if (err.response?.status === 422) {
    setError(err.response.data.error || 'Invalid auction data');
  } else if (err.message) {
    setError(`Error: ${err.message}`);
  } else {
    setError('Failed to update auction. Please try again.');
  }
} finally {
  setLoading(false);
}
};

if (loading) {
  return (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  );
}

return (
<Container maxWidth="md" sx={{ py: 4 }}>
<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
<Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
  Edit Auction
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

        {/* Minimum Increment */}
        <Grid item xs={12}>
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

        {/* Error and Submit */}
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
              {loading ? 'Updating...' : 'Update Auction'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Paper>
</Container>
);
};

export default EditAuction;
