import {Request} from 'express';

declare module 'express' {
    export interface Request {
        user?: {
            email: string;
            id: number;
            userName: string;
        };
    }
}
