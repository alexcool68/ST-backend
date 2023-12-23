import mongoose, { Schema, model } from 'mongoose';
import Token from '@/resources/token/token.interface';

const TokenSchema: Schema = new Schema(
    {
        _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        token: { type: String, required: true },
        type: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expireAfter: { type: Date, expires: 0 },
    },

    { versionKey: false },
);

export default model<Token>('Token', TokenSchema);
