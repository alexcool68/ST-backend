import { Document } from 'mongoose';

/**
 * Complete User interface
 */
export default interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    roles: string[];
    isActivated: boolean;

    isValidPassword(password: string): Promise<Error | boolean>;
    createAccountActivationToken(): string;
    createPasswordResetToken(): string;
}
