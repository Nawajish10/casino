import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            await Promise.race([
                this.$connect(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Database connection timed out after 8000ms')), 8000),
                ),
            ]);
            console.log('Prisma successfully connected to the database.');
        } catch (error) {
            console.error('Failed to connect to the database on startup. NestJS will continue, but queries may fail until connection is restored.');
            console.error(error.message);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
