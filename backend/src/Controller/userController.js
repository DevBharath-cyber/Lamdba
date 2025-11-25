import User from '../Model/userModel.js';
import logger from '../Utils/logger.js';
import bcrypt from 'bcryptjs';
import nodemailer from '../Config/nodemailer.js';
import cloudinary from '../Config/cloudnary.js';
import getdatauri from '../Utils/datauri.js';
import { genSalt } from 'bcryptjs';
import {StatusCodes} from 'http-status-codes';
import generateOtp from '../Utils/generateOtp.js'
import { AccessToken, RefreshToken } from '../Middleware/authorization.js';
import transporter from '../Config/nodemailer.js';

const UserController =  {
    register : async (req, res) => {
        try {
            const {fname, lname, email, role, password} = req.body;
            if(!fname || !lname || !email || !role || !password){
                logger.warn("please all feilds are required");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"please all feilds are required",
                    success:false
                })
            }
            let exitingUser = await User.findOne({email});
            if(exitingUser){
                logger.warn("user already exist");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"user already exist",
                    success: false
                })
            }
            let profilephotourl = null;
            const file = req.file;
            if(file){
                const parser = getdatauri(file);
                const cloudResponse = await cloudinary.uploader.upload(parser.content,{
                    folder:"userprofile"
                })
                profilephotourl = cloudResponse.secure_url
            }
            const saltrounds = await genSalt(10);
            const hashedpassword = await bcrypt.hash(password, saltrounds);
            const newUser = await User.create({
                fname,
                lname,
                email,
                password : hashedpassword,
                role,
                profile:{
                    profilephoto : profilephotourl
                }
            })
            const mailOptions = {
                from : process.env.NODEMAILER_USER,
                to : newUser.email,
                subject : "welcome to jobportal kindly verify your email",
                text: `Welcome to JobPortal, ${newUser.fname} and ${newUser.lname} \n
                ! Please verify your email by clicking the link below
                ${process.env.CLIENT_URL}/api/verifyEmail/${encodeURIComponent(newUser.email)}
                `
            }
            await nodemailer.sendMail(mailOptions);

            logger.info("user Register successfully");
            return res.status(StatusCodes.CREATED).json({
                message:"User successfully resgister",
                success: true,
                data:{
                    newUser
                }
            })
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server error",
                success:false
            })
        }
    },
    verifyEmail : async (req, res) => {
        try {
            const {email} = req.params;
            if(!email){
                logger.warn("invalid url parameters");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"invalid url parameters",
                    success: false
                })
            }
            let user = await User.findOne({email});
            if(!user){
                logger.warn("user not found email verification failed");
                return res.status(StatusCodes.NOT_FOUND).json({
                    message:"user not found email verification failed",
                    success: false
                })
            }
            if(user.verifyEmail){
                logger.warn("email already verified");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"email already verified",
                    success: false
                })
            }
            user.verifyEmail = true;
            await user.save();
            logger.info("email verified successfully");
            return res.status(StatusCodes.OK).json({
                message:"email verified successfully",
                success: true
            })
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server erorr",
                success: false
            })
        }
    },
    login : async (req, res) => {
        try {
            const {email, password, role} = req.body;
            if(!email || !password || !role) {
                logger.warn("please all feilds are required");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "please all feilds are required",
                    success : false
                })
            }  
            let user = await User.findOne({email});
            if(!user){
                logger.warn("user not found please register");
                return res.status(StatusCodes.NOT_FOUND).json({
                    message:"user not found please register",
                    success:false
                })
            }
            if(user.role !== role){
                logger.warn("unauthorized access");
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    message:"unauthorized access",
                    success: false
                })
            }
            if(!user.verifyEmail){
                logger.warn("please verify your email to login");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"please verfiy your email to login",
                    success:false
                })
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                logger.warn("invalid credentials");
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message:"invalid credentials",
                    success:false
                })
            }
            const accesstoken = await AccessToken(user._id);
            const refreshtoken = await RefreshToken(user._id);
            await User.updateOne({id : user._id},{
                $set:{
                    LastLogin : Date.now()
                }
            })

            const cookieOptions = {
                httpOnly : true,
                sameSite : "lax",
                secure: process.env.NODE_ENV === "production",
            }
            res.cookie("accessToken", accesstoken, cookieOptions);
            res.cookie("refreshtoken", refreshtoken, cookieOptions);
            user.password = undefined;

            logger.info(`welcome back ${user.fname} & ${User.lname}`);
            return res.status(StatusCodes.OK).json({
                message: `welcome back ${user.fname} & ${user.lname}`,
                success: true,
                data: user
            })
        } catch (error) {
            logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server erorr",
                success: false
            })
        }
    },
    update : async (req, res) => {
        try {
            const {fname, lname, skills, phone, education, experience, bio } = req.body;

            const userId = req.user;
            let user = await User.findById(userId);
            if(!user){
                logger.warn("user not found");
                return res.status(StatusCodes.NOT_FOUND).json({
                    message:"user not found",
                    success: false
                })
            }

            let resumeurl = null;
            const file = req.file;
            if(file){
                const parser = getdatauri(file);
                const cloudResponse = await cloudinary.uploader.upload(parser.content,{
                    folder:"userresumes"
                })
                resumeurl = cloudResponse.secure_url
            }
            let skillsArray = skills ? skills.split(",") : [];
            let educationArray = education ? education.split(",") : [];
            let experienceArray = experience ? experience.split(",") : [];


        if(fname) user.fname = fname;
        if(lname) user.lname = lname;
        if(phone) user.phone = phone;
        if(bio) user.profile.bio = bio;
        if(skillsArray) user.profile.skills = skillsArray;
        if(educationArray)user.profile.education = educationArray;
        if(experienceArray)user.profile.experience = experienceArray;

        if(resumeurl) user.profile.resume = resumeurl;

        await user.save();

            // user.password = undefined;
            logger.info("profile updated successfully");
            return res.status(StatusCodes.OK).json({
                message:"profile updated successfully",
                success : true,
                data : user
            })
            
            
        } catch (error) {
            logger.error(error);
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                
                message:"internal server erorr",
                success: false
            })
        }
    },
    forgotpassword : async (req, res) => {
        try {
            const {email} = req.body;
        if(!email){
            logger.warn(`All fields must required !`);
        }
        let user = await User.findOne({email});

        if(!user){
            logger.warn("E-mail is not found kinldy check this email Id properly")
        }
        const rawotp = await generateOtp();
        user.forgotpassword = rawotp;
        user.forgotpasswordExpiry = new Date(new Date().getTime() + 3600000)
        await user.save();

        const mailOptions = {
            from : process.env.NODEMAILER_USER,
            to : user.email,
            subject : "forgot-password send to your mail",
            text : `kindly check this ${rawotp}`
        }
        transporter.sendMail(mailOptions);

        logger.info("Otp send successfully");
        return res.status(StatusCodes.OK).json({
            message:"Otp send Successfully otp has been sended",
            data : user.forgotpassword,
            success: true
        })
        
        } catch (error) {
            logger.error(error);
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server erorr",
                success: false
            })
        }
    },
    verifypassword : async (req, res) => {
        try {
        
        } catch (error) {
            logger.error(error);
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server erorr",
                success: false
            })
        }
    },
    logout : async (req, res) => {
        try {
            const userId = req.user;
            let user = await User.findById(userId);
            if(!user){
                logger.warn("user not found");
            }
            const AccessToken = null;
            const RefreshToken = null;
            const cookieOptions = {
                maxAge: 0,
                httpOnly : true,
                sameSite :"lax",
                secure : process.env.NODE_ENV === "production"
            }
            
            res.cookie("accesstoken", AccessToken, cookieOptions);
            res.cookie("refreshtoken", RefreshToken, cookieOptions);

            logger.info("logout successfully");
            return res.status(StatusCodes.OK).json({
                message: `successfully logout ${user.fname} & ${user.lname}`,
                success: true

            })
        } catch (error) {
            logger.error(error);
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message:"internal server erorr",
                success: false
            })
        }
    }
}

export default UserController