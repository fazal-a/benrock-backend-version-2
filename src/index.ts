import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import express, { Request, Response, Express } from 'express';
import database from './database/database';
import router from './routes/Router';
import * as process from 'node:process';

const app: Express = express();

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS setup (Move this above the router setup)
app.use((req: Request, res: Response, next) => {
    // Set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // Set the CORS headers
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // Set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use('/', router);

// Handle not found routes
app.use((req: Request, res: Response, next) => {
    const error = new Error('Not found');
    return res.status(404).json({
        message: error.message
    });
});

// Connect to database and start the server
const PORT = process.env.PORT || 4000;

database.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to PostgreSQL database:', error);
});
