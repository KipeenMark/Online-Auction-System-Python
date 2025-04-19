import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Paper,
  Tabs,
  Tab,
  Fade,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { label: 'All', value: 0 },
    { label: 'Electronics', value: 1 },
    { label: 'Collectibles', value: 2 },
    { label: 'Fashion', value: 3 },
    { label: 'Home & Garden', value: 4 },
  ];

  const auctions = [
    {
      id: 1,
      title: "Vintage Watch Collection",
      currentBid: 1500,
      endTime: "2024-04-20T18:00:00",
      imageUrl: "https://placeholder.com/400x300",
      description: "Rare collection of vintage watches from the 1960s"
    },
    {
      id: 2,
      title: "Gaming Console Bundle",
      currentBid: 800,
      endTime: "2024-04-21T15:00:00",
      imageUrl: "https://placeholder.com/400x300",
      description: "Latest gaming console with 5 popular games included"
    },
    {
      id: 3,
      title: "Antique Furniture Set",
      currentBid: 2500,
      endTime: "2024-04-22T12:00:00",
      imageUrl: "https://placeholder.com/400x300",
      description: "Beautiful Victorian-era furniture set in excellent condition"
    }
  ];

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h left`;
  };

  const filteredAuctions = auctions.filter(auction =>
    auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Discover Unique Auctions
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                }}
              >
                Bid on exclusive items and win amazing deals
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                  onClick={() => navigate('/create-auction')}
                >
                  Start Selling
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'grey.100',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  onClick={() => navigate('/my-bids')}
                >
                  View Auctions
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '80%',
                    height: '80%',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                  },
                }}
              >
                <GavelIcon sx={{ fontSize: 200, opacity: 0.8 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Search and Filters */}
        <Box sx={{ mb: 6 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          
          <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
            <Tabs
              value={selectedCategory}
              onChange={(e, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  px: 3,
                  py: 2,
                },
              }}
            >
              {categories.map((category) => (
                <Tab
                  key={category.value}
                  label={category.label}
                  sx={{
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Paper>
        </Box>

        {/* Featured Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Featured Auctions
          </Typography>
        </Box>

        {/* Auctions Grid */}
      <Grid container spacing={3}>
        {filteredAuctions.map((auction) => (
          <Grid item xs={12} sm={6} md={4} key={auction.id}>
            <Fade in={!loading} timeout={500}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    '& .auction-image': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={auction.imageUrl}
                    alt={auction.title}
                    className="auction-image"
                    sx={{
                      transition: 'transform 0.3s ease-in-out',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Chip
                      icon={<TrendingUpIcon />}
                      label="Hot"
                      size="small"
                      sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      mb: 1,
                    }}
                  >
                    {auction.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 40,
                    }}
                  >
                    {auction.description}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current Bid
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        ${auction.currentBid.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={formatTimeLeft(auction.endTime)}
                      size="small"
                      sx={{
                        bgcolor: 'primary.lighter',
                        color: 'primary.dark',
                        '& .MuiChip-icon': {
                          color: 'primary.dark',
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={() => navigate(`/product/${auction.id}`)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      Place Bid
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <FavoriteIcon />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Loading Skeletons */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <Skeleton variant="rectangular" height={240} />
                <CardContent>
                  <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="30%" height={32} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
    </>
  );
};

export default Home;