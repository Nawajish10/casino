import { Controller, Get, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('api/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get()
  async getPlayers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.playerService.getPlayers(search, status, agentId);
  }

  @Get(':id')
  async getPlayerById(@Param('id') id: string) {
    return this.playerService.getPlayerById(id);
  }

  @Patch(':id')
  async updatePlayer(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      agentId?: string | null;
      status?: string;
    },
  ) {
    return this.playerService.updatePlayer(id, body);
  }

  @Patch(':id/toggle-status')
  async togglePlayerStatus(@Param('id') id: string) {
    return this.playerService.togglePlayerStatus(id);
  }

  @Delete(':id')
  async deletePlayer(@Param('id') id: string) {
    return this.playerService.deletePlayer(id);
  }

  @Get(':id/deposits')
  async getPlayerDepositHistory(@Param('id') id: string) {
    return this.playerService.getPlayerDepositHistory(id);
  }

  @Get(':id/withdrawals')
  async getPlayerWithdrawalHistory(@Param('id') id: string) {
    return this.playerService.getPlayerWithdrawalHistory(id);
  }
}
