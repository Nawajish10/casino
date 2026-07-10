import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
// Catches uncaught rendering errors anywhere in the React tree and prevents
// the entire app from going white.  Displays a user-friendly fallback instead.

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#0a0e17',
                        p: 3,
                    }}
                >
                    <Stack
                        alignItems="center"
                        spacing={3}
                        sx={{
                            maxWidth: 480,
                            textAlign: 'center',
                            p: 4,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    >
                        {/* Emoji icon */}
                        <Typography sx={{ fontSize: '3rem' }}>⚠️</Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                color: '#fff',
                                letterSpacing: '0.02em',
                            }}
                        >
                            Something went wrong
                        </Typography>

                        <Typography
                            sx={{
                                color: 'rgba(255,255,255,0.55)',
                                fontSize: '0.875rem',
                                lineHeight: 1.6,
                            }}
                        >
                            An unexpected error occurred. Please try refreshing the page.
                            If the problem persists, contact support.
                        </Typography>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box
                                sx={{
                                    width: '100%',
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: 'rgba(255, 86, 48, 0.1)',
                                    border: '1px solid rgba(255, 86, 48, 0.2)',
                                    textAlign: 'left',
                                    overflow: 'auto',
                                    maxHeight: 200,
                                }}
                            >
                                <Typography
                                    component="pre"
                                    sx={{
                                        color: '#FF5630',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        m: 0,
                                    }}
                                >
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            onClick={this.handleReload}
                            sx={{
                                mt: 1,
                                px: 4,
                                py: 1.2,
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 2,
                                backgroundImage: 'linear-gradient(90deg, #00BAE6, #58D6FF)',
                                color: '#fff',
                                boxShadow: '0 4px 16px rgba(0, 186, 230, 0.3)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(90deg, #006C9C, #00BAE6)',
                                },
                            }}
                        >
                            Refresh Page
                        </Button>
                    </Stack>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
