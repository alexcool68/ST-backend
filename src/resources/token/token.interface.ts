import mongoose, { Document } from 'mongoose';

/**
 * Complete Token interface
 */
export default interface Token extends Document {
    _userId: mongoose.Schema.Types.ObjectId;
    token: string;
    type: string;
    expireAfter: Date;
}
