import { Module } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service';
import { DatabaseHealthController } from './database-health.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DatabaseHealthController],
  providers: [DatabaseHealthService],
})
export class DatabaseHealthModule {}
