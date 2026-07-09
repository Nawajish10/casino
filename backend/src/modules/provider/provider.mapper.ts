import { Injectable } from '@nestjs/common';
import { NormalizedProvider, NormalizedGame } from '../../shared/interfaces/provider.interface';

@Injectable()
export class ProviderMapper {
    normalizeProvider(rawData: any): NormalizedProvider {
        return {
            providerCode: rawData.code,
            providerName: rawData.name,
            status: rawData.status === 1,
            // providerLogo: rawData.logo || null,
        };
    }

    normalizeGame(rawData: any): NormalizedGame {
        return {
            providerGameId: rawData.game_code,
            gameCode: rawData.game_code,
            gameName: rawData.game_name,
            banner: rawData.banner,
            // category: rawData.category || null,
        };
    }
}
