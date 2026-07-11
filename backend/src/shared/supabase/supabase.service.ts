import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly client: SupabaseClient;

    constructor(private readonly configService: ConfigService) {
        const url = this.configService.get<string>('SUPABASE_URL');
        const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
        }

        const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
            const timeout = 8000;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            
            return fetch(url, {
                ...options,
                signal: controller.signal as any
            }).then(response => {
                clearTimeout(id);
                return response;
            }).catch(error => {
                clearTimeout(id);
                throw error;
            });
        };

        this.client = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                fetch: customFetch,
            }
        });
    }

    get db(): SupabaseClient {
        return this.client;
    }
}
