import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import token from '@/utils/token';
import HttpException from '@/utils/exceptions/http.exception';
import HTTPCodes from '@/utils/helpers/HttpCodeResponse';
import UserModel from '@/resources/user/user.model';
import Token from '@/resources/token/token.interface';

function verifyRoles(allowedRoles: string[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const bearer = req.headers.authorization;

        if (!bearer || !bearer.startsWith('Bearer ')) {
            return next(new HttpException(HTTPCodes.NOT_AUTHORIZED, 'Unauthorised'));
        }

        const accessToken = bearer.split('Bearer ')[1].trim();

        try {
            const payload: Token | jwt.JsonWebTokenError = await token.verifyToken(accessToken);

            if (payload instanceof jwt.JsonWebTokenError) {
                return next(new HttpException(HTTPCodes.NOT_AUTHORIZED, 'Unauthorised'));
            }

            const user = await UserModel.findById(payload.id).select('-password').exec();

            if (!user) {
                return next(new HttpException(HTTPCodes.NOT_AUTHORIZED, 'Unauthorised'));
            }

            // Check if at least one role is validate
            const result = allowedRoles.some((role) => user.roles.includes(role));

            if (!result) return next(new HttpException(HTTPCodes.NOT_AUTHORIZED, 'You have not the correct role'));

            return next();
        } catch (error: any) {
            return next(new HttpException(HTTPCodes.NOT_AUTHORIZED, 'Unauthorised'));
        }
    };
}

export default verifyRoles;
