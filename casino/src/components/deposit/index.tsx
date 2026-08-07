import { useSnackbar } from 'notistack';
import { useTranslate } from 'locales';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import React, { useState, ChangeEvent, useEffect, useMemo } from 'react';
// @mui
import {
    Tab,
    Box,
    Tabs,
    Menu,
    Stack,
    Button,
    Select,
    Dialog,
    MenuItem,
    useTheme,
    InputBase,
    TextField,
    InputLabel,
    Typography,
    IconButton,
    FormControl,
    ListItemText,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    Avatar,
    ButtonBase,
    InputAdornment,
    Alert,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// api
import { nowpayDeposit } from 'api';
import { paymentApi } from 'api/payment.api';
import { adminService } from 'pages/admin/admin.service';
import type { PaymentSettingsData } from 'pages/admin/types';

// types
import { IDeposit } from 'types/deposit';
import { ICryptoCurrency } from 'types/user';
// components
import { useSettingsContext } from 'components/settings';
// store
import { useSelector } from 'store/store';
//
import PendingDeposit from './pending';

interface ICurrency {
    id: number;
    code: string;
    name: string;
    logo_url: string;
}

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 6;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP
        }
    }
};

export const DepositDialog = () => {
    const theme = useTheme();
    const { t } = useTranslate();
    const balance = useSelector((state) => state.balance);
    const user = useSelector((state: any) => state.auth?.user || state.auth);
    const { cryptoCurrencies = {} } = useSelector((state) => state.setting || {});
    const { enqueueSnackbar } = useSnackbar();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { modal, onToggleModal } = useSettingsContext();

    const networks = useMemo(() => {
        const cc = cryptoCurrencies || {};
        return Object.keys(cc);
    }, [cryptoCurrencies]);

    const [error, setError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0); // 0: Instant UPI QR, 1: Crypto, 2: Visa/MC
    const [amount, setAmount] = useState<number | ''>('');
    const [utrNumber, setUtrNumber] = useState<string>('');
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [depositSuccess, setDepositSuccess] = useState<boolean>(false);

    // Payment Settings QR data from Admin
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
        upiId: 'playverse@upi',
        upiName: 'PLAYVERSE GAMING',
        qrCodeUrl: null,
        minDeposit: 100,
        maxDeposit: 100000,
        isEnabled: true
    });

    const [currencies, setCurrencies] = useState<ICurrency[]>([]);
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [providerSearch, setProviderSearch] = useState<string>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<string>(networks[0] || '');
    const [pendingDeposit, setPendingDeposit] = useState<IDeposit | null>(null);

    const commonCurrencies = useMemo(() => {
        const cc = cryptoCurrencies || {};
        const values: any[] = Object.values(cc);
        const merged: ICryptoCurrency[] = ([] as ICryptoCurrency[]).concat(...values);
        return merged.filter((item: ICryptoCurrency) => item.common);
    }, [cryptoCurrencies]);

    const filteredCurrencies = useMemo(() => {
        return currencies.filter((item: any) => item?.name?.toLowerCase().includes(providerSearch.toLowerCase()));
    }, [currencies, providerSearch]);

    const selectedItem = useMemo(() => {
        return currencies.find((item: any) => item.code === selectedValue) || currencies[0];
    }, [currencies, selectedValue]);

    const resetAll = () => {
        setDepositSuccess(false);
        setUtrNumber('');
        setScreenshotFile(null);
        setScreenshotPreview(null);
        onToggleModal('');
    };

    const selectToken = (crypto: ICryptoCurrency) => {
        setSelectedNetwork(crypto.network);
        setSelectedValue(crypto.code);
    };

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numberValue = Number(value);

        if (value === '' || isNaN(numberValue) || numberValue <= 0) {
            setError(true);
            setAmount(value === '' ? '' : numberValue);
        } else {
            setError(false);
            setAmount(numberValue);
        }
    };

    const handleScreenshotChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                enqueueSnackbar('Screenshot file size exceeds 5MB limit', { variant: 'error' });
                return;
            }
            setScreenshotFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        enqueueSnackbar(`${label} copied to clipboard!`, { variant: 'success' });
    };

    const getPendingDeposit = async () => {
        try {
            const response = await paymentApi.getPendingDeposit();
            setPendingDeposit(response);
        } catch {}
    };

    const fetchPaymentSettings = async () => {
        try {
            const settings = await adminService.getPaymentSettings();
            setPaymentSettings(settings);
        } catch {}
    };

    const cancelDeposit = async (depositId: string) => {
        try {
            await paymentApi.cancelDeposit({ depositId });
            setPendingDeposit(null);
            enqueueSnackbar('Your request canceled successfully!');
        } catch (error: any) {
            enqueueSnackbar(typeof error === 'string' ? error : error.message, { variant: 'error' });
        }
    };

    const handleUpiSubmit = async () => {
        if (!amount || amount < paymentSettings.minDeposit) {
            enqueueSnackbar(`Minimum deposit amount is ₹${paymentSettings.minDeposit}`, { variant: 'warning' });
            return;
        }
        if (!utrNumber || utrNumber.trim().length < 6) {
            enqueueSnackbar('Please enter a valid UTR / Transaction ID', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            let screenshotUrl: string | null = null;
            if (screenshotFile) {
                screenshotUrl = await adminService.uploadDepositScreenshot(screenshotFile);
            }

            const ok = await adminService.submitDepositRequest({
                userId: user?.id || 'usr-player-1',
                username: user?.name || user?.mobile || 'Player',
                amount: Number(amount),
                utr: utrNumber.trim(),
                screenshotUrl
            });

            if (ok) {
                setDepositSuccess(true);
                enqueueSnackbar('Deposit request submitted! Admin will verify and credit your wallet.', { variant: 'success' });
            } else {
                enqueueSnackbar('Failed to submit deposit request. Please try again.', { variant: 'error' });
            }
        } catch (err: any) {
            enqueueSnackbar(err?.message || 'Error submitting deposit', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (tabValue === 0) {
            await handleUpiSubmit();
            return;
        }

        if (!error && typeof amount === 'number' && amount > 0) {
            try {
                setLoading(true);
                if (tabValue === 1) {
                    if (!selectedItem) return;
                    const response = await nowpayDeposit(amount, selectedItem.code);
                    if (response.status) {
                        setPendingDeposit(response.pendingDeposit);
                    } else {
                        enqueueSnackbar(response.message, { variant: 'error' });
                    }
                } else if (tabValue === 2) {
                    const response = await paymentApi.gspaymentDeposit({ amount });
                    if (response.status) {
                        setPendingDeposit(response.pendingDeposit);
                        window.open(response.pendingDeposit.data.payurl);
                    } else {
                        enqueueSnackbar(response.message, { variant: 'error' });
                    }
                }
            } catch (error: any) {
                enqueueSnackbar(error.message, { variant: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setIsOpen((prev) => !prev);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setIsOpen((prev) => !prev);
        setProviderSearch('');
    };

    const handleSelect = (code: string) => {
        setSelectedValue(code);
        handleClose();
    };

    useEffect(() => {
        if (modal === 'DEPOSIT') {
            getPendingDeposit();
            fetchPaymentSettings();
        }
    }, [modal]);

    useEffect(() => {
        const cc = cryptoCurrencies || {};
        if (selectedNetwork !== '' && Object.keys(cc).length > 0) {
            setCurrencies(cc[selectedNetwork] || []);
        } else {
            setCurrencies([]);
        }
    }, [selectedNetwork, cryptoCurrencies]);

    const Row = ({ index, style }: ListChildComponentProps) => {
        const item = filteredCurrencies[index];
        return (
            <MenuItem
                key={item.id}
                selected={item.code === selectedValue}
                onClick={() => handleSelect(item.code)}
                style={style}
            >
                <Stack flexDirection="row" alignItems="center" gap={1}>
                    <Box
                        component="img"
                        src={`http://nowpayments.io${item.logo_url}`}
                        alt={item.code}
                        sx={{ width: 20, height: 20 }}
                    />
                    <ListItemText primary={item.name} />
                </Stack>
            </MenuItem>
        );
    };

    // Render UPI QR Tab Content
    const renderUpiQrPayment = (
        <DialogContent dividers sx={{ mt: 1, p: 3 }}>
            {depositSuccess ? (
                <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981' }} />
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                        Deposit Submitted Successfully!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your deposit of ₹{amount} (UTR: {utrNumber}) has been submitted to Admin for verification. Your wallet will be credited automatically upon approval.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={resetAll} sx={{ mt: 2, borderRadius: 2 }}>
                        Done
                    </Button>
                </Stack>
            ) : (
                <Stack spacing={2.5}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.neutral', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase" letterSpacing={1}>
                            SCAN QR TO PAY
                        </Typography>
                        <Box sx={{ width: 190, height: 190, mx: 'auto', my: 1.5, p: 1, bgcolor: '#fff', borderRadius: 2, boxShadow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {paymentSettings.qrCodeUrl ? (
                                <Box component="img" src={paymentSettings.qrCodeUrl} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    No Active Payment QR Code Set
                                </Typography>
                            )}
                        </Box>

                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight={700}>
                                UPI ID: {paymentSettings.upiId}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(paymentSettings.upiId, 'UPI ID')}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Payee Name: {paymentSettings.upiName}
                        </Typography>
                    </Box>

                    <Stack spacing={2}>
                        <TextField
                            label="Deposit Amount (₹) *"
                            size="small"
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            fullWidth
                            placeholder={`Min ₹${paymentSettings.minDeposit}`}
                        />

                        <TextField
                            label="UTR / Transaction ID *"
                            size="small"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            fullWidth
                            placeholder="Enter 12-digit UTR / Ref Number"
                        />

                        <Box>
                            <InputLabel sx={{ mb: 1, fontSize: '0.85rem' }}>Upload Payment Screenshot Proof (Optional)</InputLabel>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                                sx={{ borderStyle: 'dashed', py: 1 }}
                            >
                                {screenshotFile ? screenshotFile.name : 'Choose Screenshot Image'}
                                <input type="file" accept="image/*" onChange={handleScreenshotChange} hidden />
                            </Button>
                            {screenshotPreview && (
                                <Box component="img" src={screenshotPreview} sx={{ width: '100%', maxHeight: 120, objectFit: 'contain', mt: 1, borderRadius: 1 }} />
                            )}
                        </Box>
                    </Stack>
                </Stack>
            )}
        </DialogContent>
    );

    const renderNowpayment = !pendingDeposit && (
        <DialogContent dividers sx={{ mt: 2 }}>
            <Box sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 1, mb: 1 }}>
                <Stack direction="row" spacing={1}>
                    {commonCurrencies.map((token, index) => (
                        <ButtonBase
                            onClick={() => selectToken(token)}
                            key={index}
                            sx={{ borderRadius: 1, px: 1, py: 0.5 }}
                        >
                            <Stack spacing={1} direction="row" alignItems="center">
                                <Avatar
                                    src={`http://nowpayments.io${token.logo_url}`}
                                    alt={token.name}
                                    sx={{ width: 30, height: 30 }}
                                />
                                <Typography variant="body2">{token.name}</Typography>
                            </Stack>
                        </ButtonBase>
                    ))}
                </Stack>
            </Box>
            <Stack direction={{ md: 'row', sx: 'column' }} alignItems="center" gap={1}>
                <Stack width={1}>
                    <InputLabel>{t('payment.selectNetwork')}</InputLabel>
                    <Select
                        size="small"
                        sx={{ textTransform: 'uppercase' }}
                        MenuProps={MenuProps}
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                    >
                        {networks.map((item, i) => (
                            <MenuItem key={i} value={item} sx={{ textTransform: 'uppercase' }}>
                                {item === 'null' ? 'No network' : item}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
                <Stack width={1}>
                    <InputLabel>{t('payment.selectCurrency')}</InputLabel>
                    <FormControl sx={{ width: 1 }}>
                        <Box
                            onClick={handleOpen}
                            sx={{
                                border: '1px solid',
                                borderColor: 'background.border',
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                bgcolor: 'background.default',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                outline: 'none',
                                '&:hover': {
                                    borderColor: 'text.primary'
                                },
                                ...(isOpen && {
                                    border: '2px solid',
                                    borderColor: 'primary.main'
                                })
                            }}
                        >
                            {selectedItem ? (
                                <Stack direction="row" alignItems="center" gap={1} maxWidth={0.9}>
                                    <Box
                                        component="img"
                                        src={`http://nowpayments.io${selectedItem.logo_url}`}
                                        alt={selectedItem.code}
                                        sx={{ width: 20, height: 20 }}
                                    />
                                    <Typography noWrap fontWeight={800} variant="caption">
                                        {selectedItem.name}
                                    </Typography>
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">{t('common.currency')}</Typography>
                            )}

                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </Box>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    maxHeight: ITEM_HEIGHT * (VISIBLE_COUNT + 2) + ITEM_PADDING_TOP,
                                    width: anchorEl ? anchorEl.clientWidth : 200
                                }
                            }}
                        >
                            <Box sx={{ px: 1, pt: 1, pb: 1 }}>
                                <InputBase
                                    placeholder={t('payment.searchToken')}
                                    fullWidth
                                    value={providerSearch}
                                    onChange={(e) => setProviderSearch(e.target.value)}
                                    sx={{
                                        bgcolor: 'background.layer4',
                                        borderRadius: 1,
                                        px: 1,
                                        fontSize: 14,
                                        height: 36,
                                        mb: 1
                                    }}
                                />
                            </Box>
                            {filteredCurrencies.length > 0 ? (
                                <FixedSizeList
                                    height={Math.min(VISIBLE_COUNT, filteredCurrencies.length) * ITEM_HEIGHT}
                                    width="100%"
                                    style={{ overflowX: 'hidden' }}
                                    itemSize={ITEM_HEIGHT}
                                    itemCount={filteredCurrencies.length}
                                    overscanCount={6}
                                >
                                    {Row}
                                </FixedSizeList>
                            ) : (
                                <MenuItem disabled>{t('no_results_found')}</MenuItem>
                            )}
                        </Menu>
                    </FormControl>
                </Stack>
            </Stack>

            <Stack sx={{ pt: 1, mt: 1 }}>
                <InputLabel>{t('common.amount')}</InputLabel>
                <TextField
                    size="small"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    error={error}
                    helperText={error ? t('payment.enterValidNumber') : ''}
                    fullWidth
                    autoFocus
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{
                        '& .MuiInputBase-input': {
                            color: 'text.secondary'
                        }
                    }}
                />
            </Stack>
        </DialogContent>
    );

    const renderGspayment = !pendingDeposit && (
        <DialogContent dividers sx={{ mt: 2 }}>
            <Stack sx={{ pt: 1 }}>
                <InputLabel>{t('common.amount')}</InputLabel>
                <TextField
                    size="small"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    error={error}
                    fullWidth
                    autoFocus
                    inputProps={{ min: 50, step: 5 }}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">USD</InputAdornment>
                        }
                    }}
                />
            </Stack>
        </DialogContent>
    );

    return (
        <Dialog open={modal === 'DEPOSIT'} onClose={resetAll} maxWidth="xs" fullScreen={isMobile} fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
                <Typography variant="h6" component="div" textAlign="center">
                    {t('payment.deposit')}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={resetAll}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500]
                    }}
                    size="large"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            {!pendingDeposit && !depositSuccess && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        variant="fullWidth"
                        value={tabValue}
                        sx={{ button: { margin: '0px !important' } }}
                        onChange={(_, v) => setTabValue(v)}
                    >
                        <Tab value={0} label="Instant UPI QR" />
                        <Tab value={1} label={t('crypto')} />
                        <Tab value={2} label="Visa / MasterCard" />
                    </Tabs>
                </Box>
            )}

            {pendingDeposit && <PendingDeposit pendingDeposit={pendingDeposit} cancelDeposit={cancelDeposit} />}

            {tabValue === 0 && renderUpiQrPayment}
            {tabValue === 1 && !pendingDeposit && renderNowpayment}
            {tabValue === 2 && !pendingDeposit && renderGspayment}

            {!pendingDeposit && !depositSuccess && (
                <DialogActions sx={{ px: 3, pb: { md: 2, xs: 10 } }}>
                    <Button onClick={resetAll} color="error" variant="outlined">
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || (tabValue === 0 && (!amount || !utrNumber))}
                        color="primary"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : t('common.submit')}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};
