import { Router, Request, Response, NextFunction } from 'express';
import { Segments, celebrate } from 'celebrate';
import Controller from '@/utils/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import authenticated from '@/middlewares/authenticated.middleware';
import validate from '@/resources/auth/auth.validation';
import HTTPCodes from '@/utils/helpers/HttpCodeResponse';
import AuthService from './auth.service';
import MailService from '@/services/mailtrap/mailtrap.service';

class AuthController implements Controller {
    public path = '/auth';
    public router = Router();
    private readonly AuthService = new AuthService();
    private readonly MailService = new MailService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.post(`${this.path}/login`, celebrate({ [Segments.BODY]: validate.login }), this.login);
        this.router.post(`${this.path}/register`, celebrate({ [Segments.BODY]: validate.register }), this.register);
        this.router.post(`${this.path}/forgot-password`, celebrate({ [Segments.BODY]: validate.forgotPassword }), this.forgotPassword);
        this.router.get(`${this.path}/confirm-email/:token`, celebrate({ [Segments.PARAMS]: validate.confirmEmail }), this.confirmEmail);
        this.router.get(`${this.path}/reset-password/:token`, celebrate({ [Segments.PARAMS]: validate.resetPassword }), this.resetPassword);
        this.router.patch(`${this.path}/update-password`, celebrate({ [Segments.BODY]: validate.update }), authenticated, this.updatePassword);
    }

    /**
     * Login a user
     */
    private login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;

            const { status, user, token, error } = await this.AuthService.login(email, password);

            res.status(HTTPCodes.OK).json({ status, error, user, token });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.OK, error.message));
        }
    };

    /**
     * Register a user
     */
    private register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password, passwordConfirm } = req.body;
            const { status, user, activationToken, error } = await this.AuthService.register(email, password, passwordConfirm);

            if (!error) {
                if (process.env.SENDMAIL == 'yes') {
                    await this.MailService.sendEmail({
                        to: user.email,
                        from: process.env.EMAIL_FROM ?? 'default@localhost.com',
                        subject: 'Confirm your email !',
                        // html: `
                        // <p>GO to this link to activate your App Account : <a href='http://${req.headers.host}/api/auth/confirm-email/${activationToken}'>here</a> .</p>
                        // <br/>
                        // <p>Your token : ${activationToken}</p>
                        // `,
                        html: `
                <p>GO to this link to activate your App Account : <a href='http://localhost:8080/confirm-email/${activationToken}'>here</a> .</p>
                <br/>
                <p>Your token : ${activationToken}</p>
                `,
                    }).then(() => console.log('email sent'));
                }
            }
            res.status(HTTPCodes.CREATED).json({ status, error, activationToken });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * User confirm his mail
     */
    private confirmEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { token } = req.params;

            const { status, error } = await this.AuthService.confirmEmail(token);

            res.status(HTTPCodes.OK).json({ status, error });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * User update his password
     */
    private updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { password, passwordConfirm } = req.body;

            const { status, error } = await this.AuthService.updatePassword(req.user.email, password, passwordConfirm);

            res.status(HTTPCodes.OK).json({ status, error });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * User forgot his password
     */
    private forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email } = req.body;

            const { status, user, resetPasswordToken, error } = await this.AuthService.forgotPassword(email);

            if (!error) {
                if (process.env.SENDMAIL == 'yes') {
                    await this.MailService.sendEmail({
                        to: user.email,
                        from: process.env.EMAIL_FROM ?? 'default@localhost.com',
                        subject: 'Reset your password !',
                        html: `
                        <p>GO to this link to reset your password : <a href='http://localhost:8080/reset-password/${resetPasswordToken}'>here</a> .</p>
                        <br/>
                        <p>Your token : ${resetPasswordToken}</p>
                        <br/>
                        <p>This token is available only for 15 minutes</p>
                        `,
                    }).then(() => console.log('email sent'));
                }
            }

            res.status(HTTPCodes.OK).json({ status, error });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };

    /**
     * User reset his password
     */
    private resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { token } = req.params;

            const { status, user, newPassword, error } = await this.AuthService.resetPassword(token);

            if (!error) {
                if (process.env.SENDMAIL == 'yes') {
                    await this.MailService.sendEmail({
                        to: user.email,
                        from: process.env.EMAIL_FROM ?? 'default@localhost.com',
                        subject: 'Your new password !',
                        html: `
                    <p>Your new password : ${newPassword}</p>
                    `,
                    }).then(() => console.log('email sent'));
                }
            }

            res.status(HTTPCodes.OK).json({ status, error });
        } catch (error: any) {
            next(new HttpException(HTTPCodes.BAD_REQUEST, error.message));
        }
    };
}

export default AuthController;
