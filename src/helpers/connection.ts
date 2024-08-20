import { createConnection } from 'typeorm';
import User from "../entries/User";
import Post from "../entries/Post";
import Friend from "../entries/Friend";
import Chat from "../entries/Chat";

export default createConnection({
    type: 'postgres',
    host: 'localhost',
    port:  5432,
    username: 'postgres',
    password: '1234',
    database: 'benrockSocialAppVersion2',
    entities: [User, Post, Friend, Chat], // Add all your entities here
    synchronize: true, // This will automatically create database schema on every application launch (use only in development)
    logging: true,
}).then(connection => {
    console.log("Connected to PostgreSQL database");
    return connection;
}).catch(error => {
    console.error("Error connecting to PostgreSQL database:", error);
    throw error;
});
