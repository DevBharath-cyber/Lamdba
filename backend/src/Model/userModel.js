import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    verifyEmail:{
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    refresh_token: {
        type: String,
    },
    LastLogin: {
        type: Date,
        default: Date.now  // <-- FIXED
    },
    isstatus: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    forgotpassword:{
        type: String
    },
    forgotpasswordExpiry:{
        type: Date,
        default : new Date()
    },
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        education: [{ type: String }],
        experience: [{ type: String }],
        resume: {
            type: String,
            default: null
        },
        profilephoto: {
            type: String
        },
        originalname:{
            type: String
        },
        documents: [{ type: String }]
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
