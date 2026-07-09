import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

@Injectable()
export class AdminGameRepository {
    constructor(private readonly supabaseService: SupabaseService) {}

    private get db() {
        return this.supabaseService.db;
    }

    async updateGame(gameId: string, data: any, adminUser: string, action: string) {
        // Fetch current game
        const { data: oldGame, error: fetchErr } = await this.db
            .from('Game')
            .select('*')
            .eq('id', gameId)
            .single();

        if (fetchErr || !oldGame) {
            throw new NotFoundException(`Game with ID ${gameId} not found`);
        }

        // Update game
        const { data: newGame, error: updateErr } = await this.db
            .from('Game')
            .update({ ...data, updatedAt: new Date().toISOString() })
            .eq('id', gameId)
            .select('*')
            .single();

        if (updateErr) throw updateErr;

        // Write audit log
        await this.db.from('AuditLog').insert({
            id: crypto.randomUUID(),
            adminUser,
            action,
            entityId: gameId,
            previousValue: oldGame,
            newValue: newGame,
            createdAt: new Date().toISOString(),
        });

        return newGame;
    }

    async updateProvider(providerId: string, data: any, adminUser: string, action: string) {
        // Fetch current provider
        const { data: oldProvider, error: fetchErr } = await this.db
            .from('Provider')
            .select('*')
            .eq('id', providerId)
            .single();

        if (fetchErr || !oldProvider) {
            throw new NotFoundException(`Provider with ID ${providerId} not found`);
        }

        // Update provider
        const { data: newProvider, error: updateErr } = await this.db
            .from('Provider')
            .update({ ...data, updatedAt: new Date().toISOString() })
            .eq('id', providerId)
            .select('*')
            .single();

        if (updateErr) throw updateErr;

        // Write audit log
        await this.db.from('AuditLog').insert({
            id: crypto.randomUUID(),
            adminUser,
            action,
            entityId: providerId,
            previousValue: oldProvider,
            newValue: newProvider,
            createdAt: new Date().toISOString(),
        });

        return newProvider;
    }
}
