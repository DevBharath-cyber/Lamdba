import jwt from 'jsonwebtoken';
import logger from '../Utils/logger.js';
import User from '../Model/userModel.js';
// import dotenv from 'dotenv';
// dotenv.config();
import {StatusCodes} from 'http-status-codes'

const AccessToken = async (userId) => {
    try {
        const token = jwt.sign({id: userId},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: "1d"}
        )
        return token;
    } catch (error) {
        logger.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message:"internal server error",
            success:false
        })
    }
}

const RefreshToken = async (userId) => {
    try {
        const token = await jwt.sign({id: userId},
            process.env.RefreshToken_SECRET,
            {expiresIn: "1d"}
        )
        const updatetoken = await User.updateOne({id: userId},{ $set: {refresh_token : token}})
        return token;
    } catch (error) {
        logger.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message:"internal server error",
            success:false
        })
    }
}

const Authorization = async (req, res,next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(",");
        if(!token){
            logger.warn('no token provided');
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message : "no token provided",
                success: false
            })
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decoded){
            logger.warn('invalid token');
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message:"Invalid token",
                success: false
            })
        }
        req.user = decoded.id;
        next();
    } catch (error) {
        logger.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message:"internal server error",
            success: false
        })
    }
}

export {AccessToken, RefreshToken, Authorization};