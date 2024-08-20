import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes";
import connection from "./helpers/connection";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});

app.use('/api/auth', authRoutes);

connection.then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to PostgreSQL database:', error);
});
