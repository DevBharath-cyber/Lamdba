import express from "express";
import UserController from "../Controller/userController.js";
import { Authorization } from "../Middleware/authorization.js";
import {
  documentsUpload,
  resumeUpload,
  profilephotoUpload,
} from "../Utils/multer.js";
const userRoute = express.Router();

userRoute.post('/api/register', profilephotoUpload, UserController.register);
userRoute.get('/api/verifyEmail/:email', UserController.verifyEmail);
userRoute.post('/api/login', UserController.login);
userRoute.post('/api/update', Authorization, resumeUpload, UserController.update);
userRoute.post('/api/forgotpassword', Authorization, UserController.forgotpassword);
userRoute.post('/api/logout', Authorization, UserController.logout);


export default userRoute;