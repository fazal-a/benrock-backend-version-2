import {createConnection} from 'typeorm';
import User from "../entities/User";
import Post from "../entities/Post";
import * as process from "process";

export default createConnection({
    host: process.env.HOST,
    type: "postgres",
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined, // Convert to number
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    entities: [User, Post],
    synchronize: true,
    logging: false,
}).then(connection => {
    console.log("Connected to PostgreSQL database");
    return connection;
}).catch(error => {
    console.error("Error connecting to PostgreSQL database:", error);
    throw error;
});
