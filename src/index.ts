import dotenv from 'dotenv';

dotenv.config();
import 'reflect-metadata';
import express, {Request, Response, Express} from 'express';
import database from "./database/database";
import router from "./routes/Router";
import * as process from "node:process";


const app: Express = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use('/', router);

app.use((req: Request, res: Response, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

app.use((req: Request, res: Response, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

const PORT = process.env.PORT || 4000;

database.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to PostgreSQL database:', error);
});
