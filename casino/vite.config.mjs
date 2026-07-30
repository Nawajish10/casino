import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        build: {
            outDir: env.VITE_BUILD_OUT_DIR || 'dist',
            chunkSizeWarningLimit: 1600,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('@mui') || id.includes('@emotion')) {
                                return 'vendor-mui';
                            }
                            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                                return 'vendor-react';
                            }
                            if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns') || id.includes('numeral')) {
                                return 'vendor-utils';
                            }
                            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) {
                                return 'vendor-redux';
                            }
                            return 'vendor';
                        }
                    }
                }
            }
        },
        plugins: [react({ fastRefresh: false }), tsconfigPaths(), svgr()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        server: {
            host: true,
            proxy: {
                '/api': {
                    target: 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false
                }
            }
        }
    };
});
