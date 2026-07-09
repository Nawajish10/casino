import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress, Stack, alpha } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { verifyEmail } from 'api/auth.api';
import { useSnackbar } from 'notistack';

const AuthVerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();

    const token = searchParams.get('token') || '';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('Invalid verification token.');
            return;
        }

        const executeVerification = async () => {
            try {
                await verifyEmail(token);
                setStatus('success');
                enqueueSnackbar('Email verified successfully! 📧', { variant: 'success' });
            } catch (error: any) {
                setStatus('error');
                setErrorMessage(error?.message || 'Verification failed. Token may have expired.');
            }
        };

        executeVerification();
    }, [token, enqueueSnackbar]);

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 4
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 440,
                    bgcolor: 'background.layer2',
                    border: '1px solid',
                    borderColor: 'background.border',
                    borderRadius: 2,
                    p: 4,
                    boxShadow: '0px 12px 40px rgba(0,0,0,0.6)',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01))'
                }}
            >
                <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center' }}>
                    {status === 'loading' && (
                        <>
                            <CircularProgress size={56} sx={{ color: 'primary.main' }} />
                            <Stack spacing={1}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                    Verifying Your Email...
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Please wait while we validate your email verification token.
                                </Typography>
                            </Stack>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    bgcolor: alpha('#22C55E', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'success.main',
                                    boxShadow: '0 0 24px rgba(34, 197, 94, 0.2)'
                                }}
                            >
                                <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Stack spacing={1}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                                    Email Verified!
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Your email address has been successfully verified. You can now access all profile features.
                                </Typography>
                            </Stack>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate('/profile')}
                                sx={{
                                    py: 1.2,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    backgroundImage: 'linear-gradient(90deg, #22C55E 0%, #77ED8B 100%)',
                                    color: '#fff'
                                }}
                            >
                                Go to Profile
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    bgcolor: alpha('#FF5630', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'error.main',
                                    boxShadow: '0 0 24px rgba(255, 86, 48, 0.2)'
                                }}
                            >
                                <ErrorOutlineIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Stack spacing={1}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>
                                    Verification Failed
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {errorMessage}
                                </Typography>
                            </Stack>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate('/')}
                                sx={{
                                    py: 1.2,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    bgcolor: 'primary.main',
                                    color: '#fff'
                                }}
                            >
                                Go to Homepage
                            </Button>
                        </>
                    )}
                </Stack>
            </Card>
        </Box>
    );
};

export default AuthVerifyEmailPage;
