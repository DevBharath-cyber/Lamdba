import express from 'express';
import dotenv from 'dotenv'
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import helmet from 'helmet';
import connectDB from './Config/db.js';
//logger
import logger from './Utils/logger.js';
//roters
import userRoute from './Router/userRoute.js';

const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus : 200
}));
app.use(cookieparser());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('API is running...');
    logger.info(`api is hitting`)
})
app.use(userRoute);

app.listen(port,() => {
    console.log(`servering is running this http://localhost:${port}`)
    connectDB();
})

