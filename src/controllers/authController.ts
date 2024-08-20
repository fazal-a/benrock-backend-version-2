import { Request, Response } from 'express';
import User from "../entries/User";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
};
