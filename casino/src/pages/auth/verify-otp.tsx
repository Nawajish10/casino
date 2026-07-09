import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, Typography, TextField, Button, CircularProgress, Stack, alpha } from '@mui/material';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import { useSnackbar } from 'notistack';
import { useAuth } from 'hooks/use-auth-context';
import { sendOtp } from 'api/auth.api';

const AuthVerifyOtpPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();

    const mobile = searchParams.get('mobile') || '';
    const [otp, setOtp] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    
    // Cooldown state for resending
    const [cooldown, setCooldown] = useState<number>(0);

    useEffect(() => {
        if (!mobile) {
            enqueueSnackbar('Invalid access path, redirecting to login.', { variant: 'error' });
            navigate('/auth');
        }
    }, [mobile, navigate, enqueueSnackbar]);

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.trim().length !== 6) {
            enqueueSnackbar('Please enter a valid 6-digit code.', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            await login(mobile, otp.trim());
            enqueueSnackbar('Signed in successfully! Welcome! 🎉', { variant: 'success' });
            navigate('/');
        } catch (error: any) {
            enqueueSnackbar(error?.message || 'Invalid or expired OTP code.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;

        try {
            await sendOtp(mobile);
            enqueueSnackbar('Verification OTP resent successfully!', { variant: 'success' });
            setCooldown(60); // 60s resend cooldown
        } catch (error: any) {
            enqueueSnackbar(error?.message || 'Failed to resend OTP.', { variant: 'error' });
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
                            bgcolor: alpha('#22C55E', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'success.main',
                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)'
                        }}
                    >
                        <LockOpenOutlinedIcon sx={{ fontSize: 28 }} />
                    </Box>

                    <Stack spacing={1} textAlign="center" sx={{ width: '100%' }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.02em' }}>
                            Verify OTP
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
                            We sent a 6-digit verification code to <span style={{ color: '#fff', fontWeight: 700 }}>{mobile}</span>.
                        </Typography>
                    </Stack>

                    <TextField
                        fullWidth
                        label="6-Digit Verification Code"
                        placeholder="123456"
                        variant="outlined"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={loading}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                        sx={{
                            '& label.Mui-focused': { color: 'primary.main' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'background.border' },
                                '&:hover fieldset': { borderColor: 'background.layer4' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                '& input': { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: 800 }
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
                            backgroundImage: 'linear-gradient(90deg, #22C55E 0%, #77ED8B 100%)',
                            boxShadow: '0px 4px 15px rgba(34, 197, 94, 0.3)',
                            color: '#fff',
                            '&:hover': {
                                backgroundImage: 'linear-gradient(90deg, #118D57 0%, #22C55E 100%)'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Verify & Continue'}
                    </Button>

                    <Button
                        variant="text"
                        onClick={handleResend}
                        disabled={cooldown > 0}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            color: cooldown > 0 ? 'text.disabled' : 'primary.main' 
                        }}
                    >
                        {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
                    </Button>
                </Stack>
            </Card>
        </Box>
    );
};

export default AuthVerifyOtpPage;
