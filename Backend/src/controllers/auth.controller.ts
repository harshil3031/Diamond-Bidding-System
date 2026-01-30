import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const result = await AuthService.login(email, password);

    return res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || 'Authentication failed',
    });
  }
};
