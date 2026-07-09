import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: (req: Request) => {
                let token: string | null = null;
                if (req.body && req.body.refreshToken) {
                    token = req.body.refreshToken;
                } else if (req.headers && req.headers['x-refresh-token']) {
                    token = req.headers['x-refresh-token'] as string;
                }
                return token;
            },
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: any) {
        const refreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
        return {
            ...payload,
            refreshToken
        };
    }
}
