import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
} from '@mui/material';
import {
  AccessTime,
  Gavel,
  Person,
  Timeline,
} from '@mui/icons-material';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [auction, setAuction] = useState(null);

  // Helper functions
  const getCurrentPrice = () => {
    if (!auction) return 0;
    return auction.current_bid || auction.starting_price;
  };

  const getMinimumBid = () => {
    if (!auction) return 0;
    return auction.current_bid
      ? auction.current_bid + auction.minimum_increment
      : auction.starting_price;
  };

  const isBidValid = () => {
    if (!auction || !token) return false;
    const minBid = getMinimumBid();
    return Number(bidAmount) >= minBid;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuction();
    const interval = setInterval(fetchAuction, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchAuction = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auctions/${id}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        }
      );
      setAuction(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load auction details');
      console.error('Error fetching auction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/auctions/${id}/bid`,
        { amount: Number(bidAmount) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setBidAmount('');
      await fetchAuction(); // Refresh auction data after bid
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place bid');
    }
  };

  const formatTimeLeft = (endTime) => {
    try {
      const end = new Date(endTime);
      const now = new Date();
      const diff = end - now;

      // If auction has ended
      if (diff < 0) {
        return "Auction Ended";
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format the time remaining
      if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
      } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
      } else {
        return "Ending in less than a minute";
      }
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography>Loading auction details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={fetchAuction}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (!auction) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <Typography>Auction not found</Typography>
      </Container>
    );
  }

  // Calculate minimum bid
  const minimumBid = auction.current_bid
    ? auction.current_bid + auction.minimum_increment
    : auction.starting_price;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Breadcrumb and Title Area */}
      <Box
        sx={{
          mb: 6,
          px: 3,
          py: 4,
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(45deg, #1e88e5 30%, #7c4dff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {auction.title}
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            maxWidth: 800,
            lineHeight: 1.6,
          }}
        >
          {auction.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Image and Details */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 0,
              mb: 4,
              overflow: 'hidden',
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <img
                src={auction.image_url || 'https://via.placeholder.com/800x600'}
                alt={auction.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 3,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Chip
                  icon={<AccessTime sx={{ color: 'white' }} />}
                  label={formatTimeLeft(auction.end_time)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
                <Chip
                  icon={<Gavel sx={{ color: 'white' }} />}
                  label={`${auction.bids.length} bids`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    backdropFilter: 'blur(4px)',
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Bid History */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                mb: 3,
              }}
            >
              <Timeline sx={{ mr: 1, color: 'primary.main' }} />
              Bid History
            </Typography>
            <Box>
              {auction.bids.map((bid) => (
                <React.Fragment key={bid.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 2,
                      px: 2,
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          bgcolor: 'primary.main',
                        }}
                      >
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {bid.bidder}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(bid.time).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="subtitle2"
                        color="primary.main"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        ${bid.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Bid Section and Seller Info */}
        <Grid item xs={12} md={4}>
          {/* Bid Section */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, #1e88e5 0%, #7c4dff 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    Current Bid
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    ${getCurrentPrice().toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  label="Active"
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography sx={{ opacity: 0.8, mb: 3 }}>
                Starting price: ${auction.starting_price.toLocaleString()}
              </Typography>
              <Box component="form" onSubmit={handleBid}>
                <TextField
                  fullWidth
                  placeholder="Enter your bid amount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  helperText={`Minimum bid: $${getMinimumBid().toLocaleString()}`}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'white',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255,255,255,0.8)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>$</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={!isBidValid()}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    py: 2,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Place Bid
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Seller Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {/* Show seller email until we implement proper seller profiles */}
                    Seller ID: {auction.seller_id}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Contact through the platform
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Contact Seller
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;