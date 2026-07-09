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
        return this.homepageService.getFeaturedGames();
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular games for homepage' })
    @ApiResponse({ status: 200, description: 'Return strictly filtered popular games.' })
    async getPopularGames() {
        return this.homepageService.getPopularGames();
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
