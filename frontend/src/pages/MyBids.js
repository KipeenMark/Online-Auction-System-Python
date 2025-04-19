import React, { useState } from 'react';
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
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  AccessTime,
  Gavel,
  EmojiEvents,
  Block,
} from '@mui/icons-material';

const MyBids = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  // Mock data - will be replaced with API calls
  const bids = {
    active: [
      {
        id: 1,
        auctionTitle: "Vintage Watch Collection",
        myBid: 1500,
        currentBid: 1600,
        isHighestBid: false,
        totalBids: 12,
        endTime: "2024-04-20T18:00:00",
        imageUrl: "https://placeholder.com/400x300",
      },
      {
        id: 2,
        auctionTitle: "Gaming Console Bundle",
        myBid: 800,
        currentBid: 800,
        isHighestBid: true,
        totalBids: 5,
        endTime: "2024-04-21T15:00:00",
        imageUrl: "https://placeholder.com/400x300",
      }
    ],
    won: [
      {
        id: 3,
        auctionTitle: "Antique Camera",
        finalBid: 350,
        totalBids: 8,
        endTime: "2024-04-10T12:00:00",
        imageUrl: "https://placeholder.com/400x300",
      }
    ],
    lost: [
      {
        id: 4,
        auctionTitle: "Rare Comic Book",
        myBid: 180,
        finalBid: 200,
        totalBids: 15,
        endTime: "2024-04-15T10:00:00",
        imageUrl: "https://placeholder.com/400x300",
      }
    ]
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m left`;
  };

  const getBidsByStatus = () => {
    switch (currentTab) {
      case 0:
        return bids.active;
      case 1:
        return bids.won;
      case 2:
        return bids.lost;
      default:
        return [];
    }
  };

  const renderBidCard = (bid) => (
    <Grid item xs={12} sm={6} md={4} key={bid.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
        onClick={() => navigate(`/product/${bid.id}`)}
      >
        <CardMedia
          component="img"
          height="200"
          image={bid.imageUrl}
          alt={bid.auctionTitle}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {bid.auctionTitle}
          </Typography>
          
          {currentTab === 0 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Your Bid: ${bid.myBid}
                </Typography>
                <Typography variant="body2" color={bid.isHighestBid ? "success.main" : "error.main"}>
                  Current Highest: ${bid.currentBid}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  icon={<Gavel />}
                  label={`${bid.totalBids} bids`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<AccessTime />}
                  label={formatTimeLeft(bid.endTime)}
                  size="small"
                  color={bid.isHighestBid ? "success" : "default"}
                />
              </Box>

              {!bid.isHighestBid && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="error" gutterBottom>
                    You've been outbid!
                  </Typography>
                  <LinearProgress 
                    color="error"
                    variant="determinate"
                    value={(bid.myBid / bid.currentBid) * 100}
                  />
                </Box>
              )}
            </>
          )}

          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color="success.main">
                Won for ${bid.finalBid}
              </Typography>
              <Chip
                icon={<EmojiEvents />}
                label="Won"
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>
          )}

          {currentTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Your Bid: ${bid.myBid}
              </Typography>
              <Typography variant="body2" color="error">
                Sold for: ${bid.finalBid}
              </Typography>
              <Chip
                icon={<Block />}
                label="Lost"
                color="error"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bids
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Active (${bids.active.length})`} />
          <Tab label={`Won (${bids.won.length})`} />
          <Tab label={`Lost (${bids.lost.length})`} />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {getBidsByStatus().map(renderBidCard)}
      </Grid>
    </Container>
  );
};

export default MyBids;