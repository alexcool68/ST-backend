import UserModel from '@/resources/user/user.model';
import TokenModel from '@/resources/token/token.model';
import token from '@/utils/token';
import getGenerateRandomPassword from '@/utils/password';

class AuthService {
    private user = UserModel;
    private token = TokenModel;

    /**
     * Attempt to login
     */
    public async login(email: string, password: string): Promise<any | Error> {
        try {
            const user = await this.user.findOne({ email }).select('+password').select('-__v');

            if (!user) return { error: `Unable to find ${email}` };

            if (!user.isActivated) return { error: 'Your account is not activated' };

            if (!(await user.isValidPassword(password))) return { error: 'Wrong credentials supplied' };

            user.set('password', undefined);

            return { status: 'success', user, token: token.createToken(user) };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to login');
        }
    }

    /**
     * Attempt to register a user
     */
    public async register(email: string, password: string, passwordConfirm: string): Promise<any> {
        try {
            const userExists = await this.user.findOne({ email });

            if (userExists) return { error: 'This email is already taken' };

            const user = await this.user.create({
                email,
                password,
                passwordConfirm,
                roles: ['user'],
            });

            if (!user) return { error: 'User not created' };

            const activationToken = user.createAccountActivationToken();

            const createToken = await this.token.create({
                _userId: user._id,
                token: activationToken,
                type: 'confirm-email',
            });

            if (!createToken) return { error: 'Activation token not created' };

            return { status: 'success', user, activationToken: activationToken };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to register');
        }
    }

    /**
     * Attempt to confirm a user via mail
     */
    public async confirmEmail(token: string): Promise<any> {
        try {
            const currentToken = await this.token.findOne({
                token: token,
                type: 'confirm-email',
            });

            if (!currentToken) return { error: `Unable to find ${token}` };

            const user = await this.user.findById(currentToken._userId);

            if (!user) return { error: `Unable to find user with token ${currentToken}` };

            if (user.isActivated) return { error: 'Your account is already activated' };

            user.isActivated = true;

            await user.save().then(async () => {
                const deleteToken = await this.token.deleteOne(currentToken._id);
                if (!deleteToken) return { error: 'Confirm token is not deleted' };
            });

            return { status: 'success' };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to confirm email');
        }
    }

    /**
     * Attempt to update a userpassword for a user
     */
    public async updatePassword(email: string, password: string, passwordConfirm: string): Promise<any> {
        try {
            const user = await this.user.findOne({ email });

            if (!user) return { error: `Unable to find ${email}` };

            user.password = password;
            user.passwordConfirm = passwordConfirm;

            // See user.model.ts -> pre(save) for confirm password
            const saveUser = await user.save();

            if (!saveUser) return { error: 'User not updated' };

            return { status: 'success' };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to update a password');
        }
    }

    /**
     * Attempt to send a new password
     */
    public async forgotPassword(email: string): Promise<any> {
        try {
            const user = await this.user.findOne({ email });

            if (!user) return { error: `Unable to find ${email}` };

            const resetPasswordToken = user.createPasswordResetToken();

            const insertToken = await this.token.create({
                _userId: user._id,
                token: resetPasswordToken,
                type: 'forgot-password',
                expireAfter: Date.now() + 1000 * Number(process.env.EXPIRE_FORGOT_TOKEN),
            });

            if (!insertToken) return { error: 'Password token not created' };

            return { status: 'success', user, resetPasswordToken };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to forgot a password');
        }
    }

    /**
     * Attempt to reset a password for a user TTL:15min
     */
    public async resetPassword(token: string): Promise<any> {
        try {
            const currentToken = await this.token.findOne({
                token: token,
                type: 'forgot-password',
            });

            if (!currentToken) return { error: `Unable to find ${token}` };

            const user = await this.user.findById(currentToken._userId);

            if (!user) return { error: `Unable to find user with token ${currentToken}` };

            const newPassword = getGenerateRandomPassword();

            user.password = newPassword;
            user.passwordConfirm = newPassword;

            await user.save().then(async () => {
                const deleteToken = await this.token.deleteOne(currentToken._id);
                if (!deleteToken) return { error: 'Password token is not deleted' };
            });

            return { status: 'success', user, newPassword };
        } catch (error: any) {
            throw new Error(error.message || 'Unable to reset a password');
        }
    }
}

export default AuthService;
