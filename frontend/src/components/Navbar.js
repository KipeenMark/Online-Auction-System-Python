import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  // Different navigation items based on authentication status
  const guestPages = [
    { title: 'Home', path: '/' },
  ];

  const authPages = [
    { title: 'Home', path: '/' },
    { title: 'My Auctions', path: '/my-auctions' },
    { title: 'My Bids', path: '/my-bids' },
  ];

  const pages = isAuthenticated ? authPages : guestPages;
  
  const authSettings = [
    { title: 'Profile', path: '/profile' },
    { title: 'Create Auction', path: '/create-auction' },
    { title: 'Logout', path: '/login' },
  ];

  const guestSettings = [
    { title: 'Login', path: '/login' },
    { title: 'Register', path: '/register' },
  ];

  const settings = isAuthenticated ? authSettings : guestSettings;

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (item) => {
    if (item.title === 'Logout') {
      logout();
      navigate('/login');
    } else {
      navigate(item.path);
    }
    handleCloseNavMenu();
    handleCloseUserMenu();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
          {/* Desktop Logo */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <GavelIcon
              sx={{
                mr: 1.5,
                color: 'primary.main',
                fontSize: 28,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'rotate(-10deg)' },
              }}
            />
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                mr: 3,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1e88e5 30%, #7c4dff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
              }}
            >
              BidMaster
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="primary"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1,
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  mt: 1.5,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                },
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                  mt: 1.5,
                },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={() => handleMenuClick(page)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'primary.lighter',
                    },
                  }}
                >
                  <Typography textAlign="center" sx={{ fontWeight: 500 }}>{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
            <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              BidMaster
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => handleMenuClick(page)}
                sx={{
                  mx: 1,
                  px: 2,
                  py: 1,
                  color: 'text.primary',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                    '&::after': {
                      width: '100%',
                    },
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '0%',
                    height: '2px',
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease-in-out',
                  },
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0.5,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                  }}
                >
                  {isAuthenticated && user ? (
                    user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()
                  ) : (
                    'G'
                  )}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{
                mt: '45px',
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                },
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                  mt: 1.5,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.title}
                  onClick={() => handleMenuClick(setting)}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: 'primary.lighter',
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>{setting.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
