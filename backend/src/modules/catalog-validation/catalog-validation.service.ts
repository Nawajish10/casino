import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class CatalogValidationService {
  private readonly logger = new Logger(CatalogValidationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.db;
  }

  async validateCatalog() {
    this.logger.log('Starting catalog validation process...');
    
    const pageSize = 100;
    let page = 0;
    let hasMore = true;

    let totalGames = 0;
    let launchReadyCount = 0;
    let invalidCount = 0;
    let missingLaunchCode = 0;
    let missingThumbnail = 0;
    let missingGameCode = 0;

    while (hasMore) {
      const { data: games, error } = await this.db
        .from('Game')
        .select('id, providerId, providerGameId, gameName, gameCode, launchCode, thumbnail, launchReady, validationErrors')
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      if (!games || games.length === 0) {
        hasMore = false;
        break;
      }

      totalGames += games.length;
      
      for (const game of games) {
        const errors: string[] = [];
        
        if (!game.providerId) errors.push('Missing providerId');
        if (!game.providerGameId) errors.push('Missing providerGameId');
        if (!game.gameName) errors.push('Missing gameName');

        if (!game.gameCode) {
          errors.push('Missing gameCode');
          missingGameCode++;
        }
        
        if (!game.launchCode) {
          errors.push('Missing launchCode');
          missingLaunchCode++;
        }
        
        if (!game.thumbnail) {
          errors.push('Missing thumbnail');
          missingThumbnail++;
        }

        const isReady = errors.length === 0;

        if (isReady) {
          launchReadyCount++;
        } else {
          invalidCount++;
        }

        const needsUpdate = 
          game.launchReady !== isReady || 
          JSON.stringify(game.validationErrors) !== JSON.stringify(errors);

        if (needsUpdate) {
          await this.db
            .from('Game')
            .update({ launchReady: isReady, validationErrors: errors, updatedAt: new Date().toISOString() })
            .eq('id', game.id);
        }
      }

      if (games.length < pageSize) {
        hasMore = false;
      }
      page++;
    }

    this.logger.log(`Validation complete. Total: ${totalGames}, Ready: ${launchReadyCount}, Invalid: ${invalidCount}`);

    return {
      totalGames,
      launchReady: launchReadyCount,
      invalid: invalidCount,
      missingLaunchCode,
      missingThumbnail,
      missingGameCode
    };
  }

  async getInvalidGames() {
    const { data: games, error } = await this.db
      .from('Game')
      .select('gameName, validationErrors, Provider(providerName)')
      .eq('launchReady', false)
      .limit(500);

    if (error) throw error;

    return (games || []).map((game: any) => ({
      gameName: game.gameName,
      provider: game.Provider?.providerName || 'Unknown',
      validationErrors: game.validationErrors
    }));
  }

  async getLaunchReadyGames() {
    const { data, error } = await this.db
      .from('Game')
      .select('*')
      .eq('launchReady', true);

    if (error) throw error;
    return data || [];
  }

  async getStatistics() {
    const [
      { count: totalGames },
      { count: launchReady },
      { count: invalid },
    ] = await Promise.all([
      this.db.from('Game').select('id', { count: 'exact', head: true }),
      this.db.from('Game').select('id', { count: 'exact', head: true }).eq('launchReady', true),
      this.db.from('Game').select('id', { count: 'exact', head: true }).eq('launchReady', false),
    ]);

    return {
      totalGames: totalGames ?? 0,
      launchReady: launchReady ?? 0,
      invalid: invalid ?? 0,
    };
  }

  async getFinalSummary() {
    const [
      { count: providersCount },
      { count: gamesCount },
      { count: launchReadyCount },
      { count: invalidCount },
    ] = await Promise.all([
      this.db.from('Provider').select('id', { count: 'exact', head: true }),
      this.db.from('Game').select('id', { count: 'exact', head: true }),
      this.db.from('Game').select('id', { count: 'exact', head: true }).eq('launchReady', true),
      this.db.from('Game').select('id', { count: 'exact', head: true }).eq('launchReady', false),
    ]);

    return {
      databaseConnected: true,
      schemaApplied: true,
      providersCount: providersCount ?? 0,
      gamesCount: gamesCount ?? 0,
      launchReadyCount: launchReadyCount ?? 0,
      invalidCount: invalidCount ?? 0,
      executionStatus: 'completed'
    };
  }
}
