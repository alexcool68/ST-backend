import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '@/resources/user/user.interface';
import crypto from 'crypto';

const UserSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: false,
            trim: true,
        },
        lastName: {
            type: String,
            required: false,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'PasswordConfirm is required'],
            select: false,
        },
        roles: {
            type: Array<String>,
            required: true,
        },
        isActivated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    },
);

UserSchema.virtual('fullName').get(function () {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
});

UserSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    if (!(this.password === this.passwordConfirm)) {
        //throw Error('Password and Confirm password did not match');
        // return 'Password and Confirm password did not match';
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    this.passwordConfirm = '';

    next();
});

UserSchema.methods.createAccountActivationToken = function (): string {
    const activationToken = crypto.randomBytes(32).toString('hex');
    this.activationToken = crypto.createHash('sha256').update(activationToken).digest('hex');
    return activationToken;
};

UserSchema.methods.isValidPassword = async function (password: string): Promise<Error | boolean> {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createPasswordResetToken = function (): string {
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
    return passwordResetToken;
};

export default model<User>('User', UserSchema);
