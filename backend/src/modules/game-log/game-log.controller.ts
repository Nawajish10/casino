import { BadRequestException, Controller, Get, Headers, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GameLogService } from './game-log.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class GameLogController {
  constructor(private readonly service: GameLogService, private readonly config: ConfigService) {}

  private filters(query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const start = query.start ? new Date(query.start) : undefined;
    const end = query.end ? new Date(query.end) : undefined;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime())) || (start && end && start > end)) throw new BadRequestException('Invalid date range');
    return { page, limit, start, end };
  }

  @Get('me')
  getMine(@Req() req: any, @Query() query: Record<string, string>) { return this.service.findMine(req.user.id, this.filters(query)); }

  @Get('user/:userId')
  getUser(@Param('userId') userId: string, @Query() query: Record<string, string>, @Headers('x-admin-api-key') key?: string) {
    const expected = this.config.get<string>('ADMIN_API_KEY');
    if (!expected || key !== expected) throw new UnauthorizedException('Admin authorization required');
    return this.service.findUser(userId, this.filters(query));
  }

  @Post('sync')
  sync(@Req() req: any, @Query() query: Record<string, string>) {
    const filters = this.filters(query);
    return this.service.syncUser(req.user.id, { gameType: query.gameType, start: filters.start, end: filters.end });
  }
}
