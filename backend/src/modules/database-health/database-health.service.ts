import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.db;
  }

  async checkHealth() {
    this.logger.log('Checking database health...');
    try {
      // Check connection by querying each expected table
      const expectedTables = ['Provider', 'Game', 'SyncLog', 'AuditLog'];
      const tablesFound: string[] = [];
      const missingTables: string[] = [];

      for (const table of expectedTables) {
        const { error } = await this.db
          .from(table)
          .select('id')
          .limit(1);
        
        if (!error) {
          tablesFound.push(table);
        } else {
          missingTables.push(table);
        }
      }

      // Get counts for overview
      const [
        { count: providersCount },
        { count: gamesCount },
      ] = await Promise.all([
        this.db.from('Provider').select('id', { count: 'exact', head: true }),
        this.db.from('Game').select('id', { count: 'exact', head: true }),
      ]);

      return {
        connected: true,
        tablesFound,
        missingTables,
        overview: {
          providers: providersCount ?? 0,
          games: gamesCount ?? 0,
        },
      };
    } catch (error) {
      this.logger.error('Database connection failed', error);
      return {
        connected: false,
        tablesFound: [],
        missingTables: ['Provider', 'Game', 'SyncLog', 'AuditLog'],
        error: error.message,
      };
    }
  }

  async getPublicIp() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return { outboundIp: data.ip };
    } catch (error) {
      return { error: 'Failed to retrieve outbound IP: ' + error.message };
    }
  }
}
