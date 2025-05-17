import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Box, ThemeProvider, Typography } from '@mui/material'

import './assets/main.css'
import { MainHeader } from './components/Header.jsx'
import theme from './components/Theme.jsx'

function App() {
    return (
        <>
            <MainHeader />
            <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={'80vh'}>
                <Typography variant='h5'>Subject Scheduling System Using Genetic Algorithm</Typography>
            </Box>
        </>
    )
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </StrictMode>,
)
