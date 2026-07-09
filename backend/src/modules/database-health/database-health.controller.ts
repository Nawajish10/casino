import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Database Health')
@Controller('admin/database')
export class DatabaseHealthController {
  constructor(private readonly healthService: DatabaseHealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verify database connection and schema structure' })
  async checkHealth() {
    return this.healthService.checkHealth();
  }
}
