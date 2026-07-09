import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { ProviderListResponse, GameListResponse } from '../../shared/interfaces/provider.interface';

@Injectable()
export class ProviderGateway {
    private readonly logger = new Logger(ProviderGateway.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    private get baseUrl() {
        const url = (
            this.configService.get<string>('PROVIDER_API_URL') ||
            this.configService.get<string>('PROVIDER_GATEWAY_URL')
        );
        if (!url) {
            throw new Error('PROVIDER_GATEWAY_URL is not configured');
        }
        return url;
    }

    private get agentCode() {
        return this.configService.get<string>('PROVIDER_AGENT_CODE');
    }

    private get agentToken() {
        return this.configService.get<string>('PROVIDER_AGENT_TOKEN');
    }

    async getProviders(): Promise<ProviderListResponse> {
        try {
            const payload = {
                method: 'provider_list',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
            };

            const response = await lastValueFrom(
                this.httpService.post<ProviderListResponse>(this.baseUrl!, payload),
            );

            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to fetch providers: ${providerMsg}`, error.stack);
            throw new Error(providerMsg);
        }
    }

    async getProviderGames(providerCode: string): Promise<GameListResponse> {
        try {
            const payload = {
                method: 'game_list',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
                provider_code: providerCode,
            };

            const response = await lastValueFrom(
                this.httpService.post<GameListResponse>(this.baseUrl!, payload),
            );

            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to fetch games for provider ${providerCode}: ${providerMsg}`, error.stack);
            throw new Error(providerMsg);
        }
    }

    async getAgentInfo() {
        try {
            const payload = {
                method: 'money_info',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
            };

            const response = await lastValueFrom(
                this.httpService.post(this.baseUrl!, payload)
            );

            if (response.data?.status !== 1) {
                throw new Error(response.data?.msg || 'Agent validation failed');
            }

            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to validate agent info: ${providerMsg}`);
            throw new Error(providerMsg);
        }
    }

    async getUserInfo(userCode: string) {
        try {
            const payload = {
                method: 'money_info',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
                user_code: userCode,
            };

            const response = await lastValueFrom(
                this.httpService.post(this.baseUrl!, payload)
            );

            if (response.data?.status !== 1) {
                throw new Error(response.data?.msg || 'User validation failed');
            }

            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to fetch provider balance for ${userCode}: ${providerMsg}`);
            throw new Error(providerMsg);
        }
    }

    async launchGame(payload: Record<string, any>) {
        try {
            const response = await lastValueFrom(
                this.httpService.post(this.baseUrl!, payload)
            );

            if (response.data?.status !== 1 || (!response.data?.launch_url && !response.data?.launchUrl)) {
                throw new Error(response.data?.msg || 'Provider launch failed');
            }

            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Provider launch failed: ${providerMsg}`);
            throw new Error(providerMsg);
        }
    }

    async getGameLog(userCode: string, gameType: string | undefined, start: string, end: string, page: number) {
        try {
            const payload = {
                method: 'get_game_log',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
                user_code: userCode,
                ...(gameType ? { game_type: gameType } : {}),
                start,
                end,
                page,
                perPage: 1000,
            };
            const response = await lastValueFrom(
                this.httpService.post(this.baseUrl!, payload)
            );
            const body = response.data;
            if (body?.status !== 1) {
                throw new Error(body?.msg || 'Provider game log request failed');
            }
            const transactions = body.transactions ?? body.game_logs ?? body.logs ?? body.data ?? [];
            return {
                transactions,
                hasMore: transactions.length === 1000 || page < Number(body.total_pages ?? 0)
            };
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to get game log: ${providerMsg}`);
            throw new Error(providerMsg);
        }
    }

    async getGameHistory(userCode: string, gameCode: string) {
        try {
            const payload = {
                method: 'get_game_history',
                agent_code: this.agentCode,
                agent_token: this.agentToken,
                user_code: userCode,
                game_code: gameCode,
            };
            const response = await lastValueFrom(
                this.httpService.post(this.baseUrl!, payload)
            );
            if (response.data?.status !== 1) {
                throw new Error(response.data?.msg || 'Failed to fetch game history URL');
            }
            return response.data;
        } catch (error: any) {
            const providerMsg = error.response?.data?.message || error.response?.data?.msg || error.response?.data?.code || error.message;
            this.logger.error(`Failed to get game history URL: ${providerMsg}`);
            throw new Error(providerMsg);
        }
    }
}
