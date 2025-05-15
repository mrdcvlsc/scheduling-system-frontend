import { StrictMode, useEffect, useState } from 'react'

import { AppBar, Box, Container, Link, Toolbar, Typography } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import { fetchWho } from '../js/departments.js'

import Identicon from 'identicon.js';
import { DEV } from '../js/basics.js';

const pages = ['schedule', 'instructors', 'rooms', 'subjects', 'curriculums', 'departments'];

export function MainHeader({ pageName }) {

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    useEffect(() => {
        const useEffectAsync = async () => {
            const who = await fetchWho();

            if (who == 'no one is logged in') {
                window.location.href = '/login';
            } else {
                const msg_buffer = new TextEncoder().encode(message);
                const hash_buffer = await window.crypto.subtle.digest('SHA-256', msg_buffer);

                const hash_array = Array.from(new Uint8Array(hash_buffer));
                const has_hex = hash_array.map(b => b.toString(16).padStart(2, '0')).join('');
                console.log('has_hex = ', has_hex)
            }

        }

        if (!DEV) {
            useEffectAsync();
        }

    }, []);

    return (<>
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <CalendarMonthIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.2rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Home
                    </Typography>

                    <CalendarMonthIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={() => { }}
                                sx={{ my: 1, color: 'white', display: 'block', backgroundColor: pageName === page ? '#00000032' : '' }}
                                href={`/${page}/`}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={() => { }} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
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
                            onClose={() => { }}
                        >
                            <MenuItem
                                key={'Login'}
                                onClick={() => {
                                    console.log('login')
                                }}
                            >
                                <Typography sx={{ textAlign: 'center' }}>{'Login'}</Typography>
                            </MenuItem>

                            <MenuItem
                                key={'Logout'}
                                onClick={() => {
                                    console.log('logout')
                                }}
                            >
                                <Typography sx={{ textAlign: 'center' }}>{'Logout'}</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
        <Box minHeight={'0.25em'}></Box>
    </>);
}