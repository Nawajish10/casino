import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, TextField, Button, CircularProgress, Stack, Grid, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from 'hooks/use-auth-context';
import { useSnackbar } from 'notistack';
import { sendEmailVerification } from 'api/auth.api';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isLogined, logout } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState<string>('');
    const [sendingEmail, setSendingEmail] = useState<boolean>(false);

    useEffect(() => {
        if (!isLogined) {
            navigate('/auth');
        } else if (user?.email) {
            setEmail(user.email);
        }
    }, [isLogined, user, navigate]);

    const handleSendVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            enqueueSnackbar('Please enter a valid email address.', { variant: 'warning' });
            return;
        }

        setSendingEmail(true);
        try {
            await sendEmailVerification(email.trim());
            enqueueSnackbar('Verification email sent successfully! Please check your inbox. 📧', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(error?.message || 'Failed to send verification email.', { variant: 'error' });
        } finally {
            setSendingEmail(false);
        }
    };

    if (!isLogined || !user) {
        return (
            <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 4 }}>
            {/* Header section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Account Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your mobile authentication and verify your email address.
                    </Typography>
                </Stack>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                    Log Out
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {/* Account Details Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            p: 3,
                            bgcolor: 'background.layer2',
                            border: '1px solid',
                            borderColor: 'background.border',
                            borderRadius: 2,
                            height: '100%'
                        }}
                    >
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 1,
                                        bgcolor: alpha('#00BAE6', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'primary.main'
                                    }}
                                >
                                    <PersonOutlineIcon />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Security Credentials
                                </Typography>
                            </Stack>

                            {/* Mobile Info */}
                            <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                    Mobile Number
                                </Typography>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <PhoneIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                            {user.mobile}
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        icon={<VerifiedUserIcon sx={{ fontSize: '0.85rem !important' }} />}
                                        label="Verified"
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 800, height: 22 }}
                                    />
                                </Stack>
                            </Stack>

                            {/* Email Status Info */}
                            <Stack spacing={1}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                    Email Verification Status
                                </Typography>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <MailOutlineIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: user.email ? 'text.primary' : 'text.secondary' }}>
                                            {user.email || 'No email registered'}
                                        </Typography>
                                    </Stack>
                                    {user.emailVerified ? (
                                        <Chip
                                            icon={<VerifiedUserIcon sx={{ fontSize: '0.85rem !important' }} />}
                                            label="Verified"
                                            color="success"
                                            size="small"
                                            sx={{ fontWeight: 800, height: 22 }}
                                        />
                                    ) : (
                                        <Chip
                                            label={user.email ? 'Pending Verification' : 'Unverified'}
                                            color={user.email ? 'warning' : 'default'}
                                            size="small"
                                            sx={{ fontWeight: 800, height: 22 }}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                </Grid>

                {/* Email Verification Form Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            p: 3,
                            bgcolor: 'background.layer2',
                            border: '1px solid',
                            borderColor: 'background.border',
                            borderRadius: 2,
                            height: '100%'
                        }}
                    >
                        <Stack spacing={3} component="form" onSubmit={handleSendVerification}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 1,
                                        bgcolor: alpha('#22C55E', 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'success.main'
                                    }}
                                >
                                    <MailOutlineIcon />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {user.emailVerified ? 'Update Email' : 'Verify Email Address'}
                                </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                                {user.emailVerified 
                                    ? 'Your email address has been verified. You can update it by entering a new email below (which will require verification).'
                                    : 'Please provide your email address to receive a secure link to complete email verification.'
                                }
                            </Typography>

                            <TextField
                                fullWidth
                                label="Email Address"
                                placeholder="name@example.com"
                                variant="outlined"
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={sendingEmail}
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
                                type="submit"
                                variant="contained"
                                disabled={sendingEmail || (user.email === email && user.emailVerified)}
                                sx={{
                                    py: 1,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    backgroundImage: 'linear-gradient(90deg, #00BAE6 0%, #58D6FF 100%)',
                                    color: '#fff',
                                    alignSelf: 'flex-start'
                                }}
                            >
                                {sendingEmail ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Send Verification Link'}
                            </Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;
