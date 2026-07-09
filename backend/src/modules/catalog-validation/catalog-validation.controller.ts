import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CatalogValidationService } from './catalog-validation.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Catalog Validation')
@Controller('admin/catalog')
export class CatalogValidationController {
  constructor(private readonly catalogValidationService: CatalogValidationService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run validation across the entire game catalog' })
  @ApiResponse({ status: 200, description: 'Validation complete', type: Object })
  async validateCatalog() {
    return this.catalogValidationService.validateCatalog();
  }

  @Get('invalid')
  @ApiOperation({ summary: 'Get all games that failed validation' })
  async getInvalidGames() {
    return this.catalogValidationService.getInvalidGames();
  }

  @Get('launch-ready')
  @ApiOperation({ summary: 'Get all games that passed validation and are ready to launch' })
  async getLaunchReadyGames() {
    return this.catalogValidationService.getLaunchReadyGames();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get catalog validation statistics' })
  async getStatistics() {
    return this.catalogValidationService.getStatistics();
  }

  @Get('final-summary')
  @ApiOperation({ summary: 'Get the final execution summary of the schema and validation process' })
  async getFinalSummary() {
    return this.catalogValidationService.getFinalSummary();
  }
}
