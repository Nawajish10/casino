import { IsBoolean, IsInt, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameDto {
    @ApiPropertyOptional({ description: 'Is the game featured on the homepage?' })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({ description: 'Is the game marked as popular?' })
    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @ApiPropertyOptional({ description: 'Is the game in maintenance mode?' })
    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;

    @ApiPropertyOptional({ description: 'Is the game visible on the homepage?' })
    @IsOptional()
    @IsBoolean()
    homepageVisible?: boolean;

    @ApiPropertyOptional({ description: 'Sort order for display' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class UpdateProviderDto {
    @ApiPropertyOptional({ description: 'Is the provider visible on the homepage?' })
    @IsOptional()
    @IsBoolean()
    isVisible?: boolean;

    @ApiPropertyOptional({ description: 'Sort order for provider display' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class AuditLogContextDto {
    @ApiProperty({ description: 'The identifier of the admin performing the action' })
    @IsString()
    adminUser: string;
}
