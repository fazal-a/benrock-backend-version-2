// src/types/custom.d.ts

import { Request } from 'express';

declare module 'express' {
    export interface Request {
        user?: {
            id: number;
            email: string;
            name: string;
        };
    }
}
