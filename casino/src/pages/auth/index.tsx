import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, TextField, Button, CircularProgress, Stack, alpha } from '@mui/material';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import { useSnackbar } from 'notistack';
import { sendOtp } from 'api/auth.api';

const AuthMobilePage = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [mobile, setMobile] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic phone format check
        if (!mobile || mobile.trim() === '') {
            enqueueSnackbar('Please enter your mobile number', { variant: 'warning' });
            return;
        }

        const cleanedMobile = mobile.trim();
        if (!cleanedMobile.startsWith('+')) {
            enqueueSnackbar('Mobile number must start with country code (e.g. +91...)', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            await sendOtp(cleanedMobile);
            enqueueSnackbar('Verification OTP sent successfully! 🎉', { variant: 'success' });
            navigate(`/auth/verify-otp?mobile=${encodeURIComponent(cleanedMobile)}`);
        } catch (error: any) {
            enqueueSnackbar(error?.message || 'Failed to send OTP. Please try again.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                    maxWidth: 420,
                    bgcolor: 'background.layer2',
                    border: '1px solid',
                    borderColor: 'background.border',
                    borderRadius: 2,
                    p: 4,
                    boxShadow: '0px 12px 40px rgba(0,0,0,0.6)',
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.01), rgba(255,255,255,0.01))'
                }}
            >
                <Stack spacing={3} alignItems="center" component="form" onSubmit={handleSubmit}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: alpha('#00BAE6', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                            boxShadow: '0 0 20px rgba(0, 186, 230, 0.15)'
                        }}
                    >
                        <PhoneAndroidOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>

                    <Stack spacing={1} textAlign="center" sx={{ width: '100%' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.02em' }}>
                            Sign In / Sign Up
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
                            Enter your phone number with country code to receive a 6-digit verification code.
                        </Typography>
                    </Stack>

                    <TextField
                        fullWidth
                        label="Phone Number"
                        placeholder="+919876543210"
                        variant="outlined"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        disabled={loading}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                        sx={{
                            '& label.Mui-focused': { color: 'primary.main' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'background.border' },
                                '&:hover fieldset': { borderColor: 'background.layer4' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                            }
                        }}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                            boxShadow: '0px 4px 15px rgba(0, 186, 230, 0.3)',
                            color: '#fff',
                            '&:hover': {
                                backgroundImage: 'linear-gradient(90deg, #006C9C 0%, #00BAE6 100%)'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Verification OTP'}
                    </Button>
                </Stack>
            </Card>
        </Box>
    );
};

export default AuthMobilePage;
