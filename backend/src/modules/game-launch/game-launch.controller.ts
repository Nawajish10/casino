import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.controller';
import { GameLaunchService } from './game-launch.service';

@Controller('games')
export class GameLaunchController {
  constructor(private readonly gameLaunchService: GameLaunchService) {}

  @UseGuards(JwtAuthGuard)
  @Post('launch')
  async launchLobby(
    @Req() req: any,
    @Body() body: { providerCode?: string; productCode?: string | number; gameType?: string; lang?: string; device?: string },
  ) {
    return this.gameLaunchService.launchLobby(req.user.id, {
      providerCode: body?.providerCode,
      productCode: body?.productCode,
      gameType: body?.gameType,
      lang: body?.lang || 'en',
      device: body?.device || 'desktop',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameCode/launch')
  async launchGame(
    @Req() req: any,
    @Param('gameCode') gameCode: string,
    @Body() body: { lang?: string; device?: string },
  ) {
    return this.gameLaunchService.launchGame(req.user.id, gameCode, {
      lang: body?.lang || 'en',
      device: body?.device || 'desktop',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':gameCode/history')
  async getGameHistory(
    @Req() req: any,
    @Param('gameCode') gameCode: string,
  ) {
    return this.gameLaunchService.getGameHistory(req.user.id, gameCode);
  }
}
