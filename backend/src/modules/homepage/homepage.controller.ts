import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';

@ApiTags('Homepage')
@Controller('homepage')
export class HomepageController {
    constructor(private readonly homepageService: HomepageService) {}

    @Get('featured')
    @ApiOperation({ summary: 'Get featured games for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered featured games.' })
    async getFeaturedGames() {
        console.log('[HomepageController] getFeaturedGames started');
        const res = await this.homepageService.getFeaturedGames();
        console.log('[HomepageController] getFeaturedGames completed');
        return res;
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular games for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered popular games.' })
    async getPopularGames() {
        console.log('[HomepageController] getPopularGames started');
        const res = await this.homepageService.getPopularGames();
        console.log('[HomepageController] getPopularGames completed');
        return res;
    }

    @Get('live-casino')
    @ApiOperation({ summary: 'Get live casino games for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered live casino games.' })
    async getLiveCasinoGames() {
        return this.homepageService.getLiveCasinoGames();
    }

    @Get('slots')
    @ApiOperation({ summary: 'Get slots games for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered slot games.' })
    async getSlotsGames() {
        return this.homepageService.getSlotsGames();
    }

    @Get('providers')
    @ApiOperation({ summary: 'Get providers for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered providers.' })
    async getProviders() {
        return this.homepageService.getProviders();
    }
}
