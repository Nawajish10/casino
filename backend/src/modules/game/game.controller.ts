import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { GameService } from './game.service';
import { PaginationQueryDto, GameSearchQueryDto } from './game.dto';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('active')
    @ApiOperation({ summary: 'Get all active games' })
    @ApiResponse({ status: 200, description: 'Return paginated active games.' })
    async getActiveGames(@Query() query: PaginationQueryDto) {
        return this.gameService.getActiveGames(query);
    }

    @Get('featured')
    @ApiOperation({ summary: 'Get all featured games' })
    @ApiResponse({ status: 200, description: 'Return paginated featured games.' })
    async getFeaturedGames(@Query() query: PaginationQueryDto) {
        return this.gameService.getFeaturedGames(query);
    }

    @Get('trending')
    @ApiOperation({ summary: 'Get all trending games' })
    @ApiResponse({ status: 200, description: 'Return paginated trending games based on playCount.' })
    async getTrendingGames(@Query() query: PaginationQueryDto) {
        return this.gameService.getTrendingGames(query);
    }

    @Get('recent')
    @ApiOperation({ summary: 'Get all recently added games' })
    @ApiResponse({ status: 200, description: 'Return paginated recent games.' })
    async getRecentGames(@Query() query: PaginationQueryDto) {
        return this.gameService.getRecentGames(query);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search for active games' })
    @ApiResponse({ status: 200, description: 'Return paginated games matching search criteria.' })
    async searchGames(@Query() query: GameSearchQueryDto) {
        return this.gameService.searchGames(query);
    }

    @Get('provider/:providerCode')
    @ApiOperation({ summary: 'Get games by provider' })
    @ApiParam({ name: 'providerCode', description: 'The unique code of the provider' })
    @ApiResponse({ status: 200, description: 'Return paginated games for a specific provider.' })
    async getGamesByProvider(
        @Param('providerCode') providerCode: string,
        @Query() query: PaginationQueryDto,
    ) {
        return this.gameService.getGamesByProvider(providerCode, query);
    }

    @Get('category/:category')
    @ApiOperation({ summary: 'Get games by category' })
    @ApiParam({ name: 'category', description: 'The category name' })
    @ApiResponse({ status: 200, description: 'Return paginated games for a specific category.' })
    async getGamesByCategory(
        @Param('category') category: string,
        @Query() query: PaginationQueryDto,
    ) {
        return this.gameService.getGamesByCategory(category, query);
    }

    @Get('detail/:gameCode')
    @ApiOperation({ summary: 'Get game details by code' })
    @ApiParam({ name: 'gameCode', description: 'The unique game code' })
    @ApiResponse({ status: 200, description: 'Return details for a single game.' })
    async getGameByCode(@Param('gameCode') gameCode: string) {
        return this.gameService.getGameByCode(gameCode);
    }
}
