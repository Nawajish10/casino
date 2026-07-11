import { Controller, Get } from '@nestjs/common';
import { SportsbookService } from './sportsbook.service';

@Controller('sportsbook')
export class SportsbookController {
    constructor(private readonly sportsbookService: SportsbookService) {}

    @Get('homepage')
    async getHomepageFeed() {
        return this.sportsbookService.getHomepageFeed();
    }

    @Get()
    async getFullSportsbookFeed() {
        return this.sportsbookService.getFullSportsbookFeed();
    }
}
