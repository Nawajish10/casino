import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('api/agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  async getAgents(@Query('search') search?: string, @Query('status') status?: string) {
    return this.agentService.getAgents(search, status);
  }

  @Get(':id')
  async getAgentById(@Param('id') id: string) {
    return this.agentService.getAgentById(id);
  }

  @Post()
  async createAgent(
    @Body()
    body: {
      name: string;
      username: string;
      email: string;
      mobile?: string;
      initialBalance?: number;
    },
  ) {
    return this.agentService.createAgent(body);
  }

  @Patch(':id')
  async updateAgent(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      mobile?: string;
      walletBalance?: number;
      status?: string;
    },
  ) {
    return this.agentService.updateAgent(id, body);
  }

  @Patch(':id/toggle-status')
  async toggleAgentStatus(@Param('id') id: string) {
    return this.agentService.toggleAgentStatus(id);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }

  @Get(':id/players')
  async getAssignedPlayers(@Param('id') id: string) {
    return this.agentService.getAssignedPlayers(id);
  }
}
