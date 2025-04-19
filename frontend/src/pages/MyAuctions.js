import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Gavel,
  Check,
  AccessTime,
} from '@mui/icons-material';

const MyAuctions = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auctions, setAuctions] = useState({
    active: [],
    completed: [],
    pending: []
  });

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      // If user is not available, don't make the request
      if (!user || !user._id) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/users/${user._id}/auctions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Categorize auctions
      const now = new Date();
      const categorizedAuctions = response.data.reduce((acc, auction) => {
        const endTime = new Date(auction.end_time);
        if (endTime < now) {
          acc.completed.push(auction);
        } else if (auction.bids && auction.bids.length > 0) {
          acc.active.push(auction);
        } else {
          acc.pending.push(auction);
        }
        return acc;
      }, { active: [], completed: [], pending: [] });

      setAuctions(categorizedAuctions);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuClick = (event, auction) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAuction(auction);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAuction(null);
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/auctions/${selectedAuction._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      await fetchAuctions(); // Refresh the list
      setDeleteConfirmOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete auction');
      setDeleteConfirmOpen(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/edit-auction/${selectedAuction?.id}`);
    handleMenuClose();
  };

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h left`;
  };

  const getAuctionsByStatus = () => {
    switch (currentTab) {
      case 0:
        return auctions.active;
      case 1:
        return auctions.completed;
      case 2:
        return auctions.pending;
      default:
        return [];
    }
  };

  const renderAuctionCard = (auction) => {
    const bidsCount = auction.bids?.length || 0;
    const currentBid = auction.current_bid || auction.starting_price;
    const imageUrl = auction.image_url || 'https://via.placeholder.com/400x300';

    return (
      <Grid item xs={12} sm={6} md={4} key={auction._id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={auction.title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography gutterBottom variant="h6" component="h2" sx={{ flex: 1 }}>
                {auction.title}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => handleMenuClick(e, auction)}
              >
                <MoreVert />
              </IconButton>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {auction.bids && auction.bids.length > 0 && (
                <>
                  <Typography variant="h6" color="primary">
                    ${currentBid}
                  </Typography>
                  <Chip
                    icon={<Gavel />}
                    label={`${bidsCount} bid${bidsCount !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{ mr: 1, mt: 1 }}
                  />
                </>
              )}
              
              {new Date(auction.end_time) < new Date() && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Final price: ${currentBid}
                  </Typography>
                  {auction.winner_id && (
                    <Typography variant="body2" color="text.secondary">
                      Winner ID: {auction.winner_id}
                    </Typography>
                  )}
                  <Chip
                    icon={<Check />}
                    label="Completed"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </>
              )}
              
              {!auction.bids?.length && new Date(auction.end_time) > new Date() && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Starting price: ${auction.starting_price}
                  </Typography>
                  <Chip
                    icon={<AccessTime />}
                    label="Pending"
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {formatTimeLeft(auction.end_time)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Auctions
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create-auction')}
          sx={{ mb: 3 }}
        >
          Create New Auction
        </Button>
        
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`Active (${auctions.active.length})`} />
            <Tab label={`Completed (${auctions.completed.length})`} />
            <Tab label={`Pending (${auctions.pending.length})`} />
          </Tabs>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {getAuctionsByStatus().map(renderAuctionCard)}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this auction?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this auction?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyAuctions;