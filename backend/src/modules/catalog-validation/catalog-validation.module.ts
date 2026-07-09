import { Module } from '@nestjs/common';
import { CatalogValidationService } from './catalog-validation.service';
import { CatalogValidationController } from './catalog-validation.controller';

@Module({
  controllers: [CatalogValidationController],
  providers: [CatalogValidationService],
  exports: [CatalogValidationService]
})
export class CatalogValidationModule {}

