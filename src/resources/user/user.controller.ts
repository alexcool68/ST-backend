import { Router, Request, Response, NextFunction } from 'express';
import { Segments, celebrate } from 'celebrate';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import HTTPCodes from '@/utils/helpers/HttpCodeResponse';
import authenticated from '@/middlewares/authenticated.middleware';
import verifyRoles from '@/middlewares/verifyRoles.middleware';
import validate from '@/resources/user/user.validation';
import UserService from '@/resources/user/user.service';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}`, authenticated, verifyRoles(['admin']), this.getUsers);
        this.router.get(`${this.path}/me`, authenticated, verifyRoles(['admin']), this.getCurrentUser);
        this.router.get(`${this.path}/:id`, authenticated, verifyRoles(['admin']), celebrate({ [Segments.PARAMS]: validate.getUser }), this.getUser);
        this.router.patch(`${this.path}/:id`, authenticated, verifyRoles(['admin']), celebrate({ [Segments.PARAMS]: validate.updateUser }), this.updateUser);
        this.router.delete(`${this.path}/:id`, authenticated, verifyRoles(['admin']), celebrate({ [Segments.PARAMS]: validate.deleteUser }), this.deleteUser);
    }

    /**
     * Get an array of users
     */
    private getUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const users = await this.UserService.getUsers();

        res.status(HTTPCodes.OK).json({ status: 'success', results: users.length, users });
    };

    /**
     * Get user data when auth
     */
    private getCurrentUser = (req: Request, res: Response, next: NextFunction): Response | void => {
        res.status(HTTPCodes.OK).json({ status: 'success', user: req.user });
    };

    /**
     * Get a User by Id
     */
    private getUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;

            const user = await this.UserService.getUserById(id);

            if (!user) {
                throw new Error(`Cant find any user with id ${id}`);
            }

            res.status(HTTPCodes.OK).json({ status: 'success', user });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * Update a User by Id
     */
    private updateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;

            const user = await this.UserService.updateUserById(id, req.body);

            if (!user) {
                throw new Error(`Cant find any user with id ${id}`);
            }

            res.status(HTTPCodes.OK).json({ status: 'success', user });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * Delete a User by Id
     */
    private deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;

            const user = await this.UserService.deleteUserById(id);

            if (!user) {
                throw new Error(`Cant find any user with id ${id}`);
            }

            res.status(HTTPCodes.OK).json({ status: 'success' });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };
}

export default UserController;
