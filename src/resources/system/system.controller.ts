import { Router, Request, Response, NextFunction } from 'express';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import HTTPCodes from '@/utils/helpers/HttpCodeResponse';

class SystemController implements Controller {
    public path = '/system';
    public router = Router();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}/ping/`, this.ping);
    }

    /**
     * Ping FOR TESTING ONLY
     */
    private ping = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const randomNumber = crypto.randomUUID();

            const message = `pong : ${randomNumber}`;

            res.status(HTTPCodes.OK).json({ status: 'success', message: message });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };
}
export default SystemController;
