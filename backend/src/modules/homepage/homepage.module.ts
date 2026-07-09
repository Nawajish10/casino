import { Module } from '@nestjs/common';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { HomepageRepository } from './homepage.repository';

@Module({
    controllers: [HomepageController],
    providers: [HomepageService, HomepageRepository],
    exports: [HomepageService],
})
export class HomepageModule {}
