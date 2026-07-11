import { Socket, io } from 'socket.io-client';
import React, { useCallback, useState, useEffect } from 'react';
// config
import { HOST_API_KEY } from 'config';
// store
import { useDispatch } from 'store/store';
import { logoutAction } from 'store/slices/auth';
import { updateBalance } from 'store/slices/balance';
// hooks
import { useAuth } from 'hooks/use-auth-context';
//
import { SocketContext } from './socket-context';

type SocketProviderProps = {
    children: React.ReactNode;
};

const SocketProvider = ({ children }: SocketProviderProps) => {
    const { isLogined, accessToken, logout } = useAuth();
    const dispatch = useDispatch();
    const [socket, setSocket] = useState<Socket | null>(null);

    const registerCallbacks = useCallback((socketInstance: Socket) => {
        if (socketInstance) {
            socketInstance.on('destory', (data) => {
                dispatch(logoutAction());
                localStorage.removeItem('betthrob-accessToken');
            });
            socketInstance.on('logout', (data) => {
                logout();
            });
            socketInstance.on('multi-login', (data) => {
                if (data.token === accessToken) {
                    dispatch(logoutAction());
                    localStorage.removeItem('betthrob-accessToken');
                }
            });
            socketInstance.on('balance', (data) => {
                dispatch(updateBalance(data));
            });
            socketInstance.on('notification', (data) => {
                console.log('--notification---', data);
            });
        }
    }, []);

    const cleanUp = () => {
        setSocket(null);
    };

    const connect = (token: string) => {
        try {
            const socketInit: Socket = io(String(HOST_API_KEY), {
                // Start with polling then upgrade to websocket.
                // This is required for Railway which can't always handle
                // a cold WebSocket upgrade without an initial HTTP handshake.
                transports: ['polling', 'websocket'],
                query: { auth: token },
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                timeout: 10000,
            });

            socketInit.on('connect_error', (err) => {
                console.warn('[Socket] Connection error:', err.message);
            });

            socketInit.on('error', (err) => {
                console.warn('[Socket] Socket error:', err);
            });

            registerCallbacks(socketInit);
            setSocket(socketInit);
            return socketInit;
        } catch (err) {
            console.error('[Socket] Failed to initialize:', err);
            return null;
        }
    };

    useEffect(() => {
        // Only connect if user is actually logged in with a valid token
        if (!isLogined) {
            cleanUp();
            return;
        }
        try {
            const token = localStorage.getItem('betthrob-accessToken');
            if (!token) return;
            connect(token);
        } catch (err) {
            console.error('[Socket] Initialization error:', err);
        }
        return () => cleanUp();
        // eslint-disable-next-line
    }, [isLogined]);

    return <SocketContext.Provider value={{ socket }}> {children}</SocketContext.Provider>;
};

export default SocketProvider;
