import { Injectable } from '@nestjs/common';
import { AdminGameRepository } from './admin-game.repository';
import { UpdateGameDto, UpdateProviderDto, AuditLogContextDto } from './admin-game.dto';

@Injectable()
export class AdminGameService {
    constructor(private readonly adminGameRepo: AdminGameRepository) {}

    async updateGame(id: string, data: UpdateGameDto, context: AuditLogContextDto) {
        return this.adminGameRepo.updateGame(id, data, context.adminUser, 'UPDATE_GAME');
    }

    async featureGame(id: string, isFeatured: boolean, context: AuditLogContextDto) {
        return this.adminGameRepo.updateGame(id, { isFeatured }, context.adminUser, 'FEATURE_GAME');
    }

    async popularGame(id: string, isPopular: boolean, context: AuditLogContextDto) {
        return this.adminGameRepo.updateGame(id, { isPopular }, context.adminUser, 'POPULAR_GAME');
    }

    async maintenanceGame(id: string, maintenanceMode: boolean, context: AuditLogContextDto) {
        return this.adminGameRepo.updateGame(id, { maintenanceMode }, context.adminUser, 'MAINTENANCE_GAME');
    }

    async visibilityGame(id: string, homepageVisible: boolean, context: AuditLogContextDto) {
        return this.adminGameRepo.updateGame(id, { homepageVisible }, context.adminUser, 'VISIBILITY_GAME');
    }

    async updateProviderVisibility(id: string, isVisible: boolean, context: AuditLogContextDto) {
        return this.adminGameRepo.updateProvider(id, { isVisible }, context.adminUser, 'VISIBILITY_PROVIDER');
    }

    async updateProviderSort(id: string, sortOrder: number, context: AuditLogContextDto) {
        return this.adminGameRepo.updateProvider(id, { sortOrder }, context.adminUser, 'SORT_PROVIDER');
    }
}
