import { Controller, Patch, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AdminGameService } from './admin-game.service';
import { UpdateGameDto, UpdateProviderDto } from './admin-game.dto';

@ApiTags('Admin CMS')
@Controller('admin')
export class AdminGameController {
    constructor(private readonly adminGameService: AdminGameService) {}

    private getContext(adminUserHeader: string = 'system') {
        return { adminUser: adminUserHeader };
    }

    // Games

    @Patch('games/:id')
    @ApiOperation({ summary: 'Update multiple fields of a game' })
    @ApiHeader({ name: 'x-admin-user', description: 'Admin identifier for audit log', required: false })
    @ApiResponse({ status: 200, description: 'Game updated.' })
    async updateGame(
        @Param('id') id: string,
        @Body() data: UpdateGameDto,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.updateGame(id, data, this.getContext(adminUserHeader));
    }

    @Patch('games/:id/feature')
    @ApiOperation({ summary: 'Toggle game featured status' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async featureGame(
        @Param('id') id: string,
        @Body('isFeatured') isFeatured: boolean,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.featureGame(id, isFeatured, this.getContext(adminUserHeader));
    }

    @Patch('games/:id/popular')
    @ApiOperation({ summary: 'Toggle game popular status' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async popularGame(
        @Param('id') id: string,
        @Body('isPopular') isPopular: boolean,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.popularGame(id, isPopular, this.getContext(adminUserHeader));
    }

    @Patch('games/:id/maintenance')
    @ApiOperation({ summary: 'Toggle game maintenance mode' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async maintenanceGame(
        @Param('id') id: string,
        @Body('maintenanceMode') maintenanceMode: boolean,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.maintenanceGame(id, maintenanceMode, this.getContext(adminUserHeader));
    }

    @Patch('games/:id/visibility')
    @ApiOperation({ summary: 'Toggle game homepage visibility' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async visibilityGame(
        @Param('id') id: string,
        @Body('homepageVisible') homepageVisible: boolean,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.visibilityGame(id, homepageVisible, this.getContext(adminUserHeader));
    }

    // Providers

    @Patch('providers/:id/visibility')
    @ApiOperation({ summary: 'Toggle provider visibility' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async visibilityProvider(
        @Param('id') id: string,
        @Body('isVisible') isVisible: boolean,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.updateProviderVisibility(id, isVisible, this.getContext(adminUserHeader));
    }

    @Patch('providers/:id/sort')
    @ApiOperation({ summary: 'Update provider sort order' })
    @ApiHeader({ name: 'x-admin-user', required: false })
    async sortProvider(
        @Param('id') id: string,
        @Body('sortOrder') sortOrder: number,
        @Headers('x-admin-user') adminUserHeader?: string,
    ) {
        return this.adminGameService.updateProviderSort(id, sortOrder, this.getContext(adminUserHeader));
    }
}
