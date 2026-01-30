import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export const createUser = async (req: Request, res: Response) => {
    console.log(req.body)
  try {
    const { name, email, password, role } = req.body;
    console.log(req.body)
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const user = await UserService.createUser({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      message: 'User created successfully',
      data: user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();

  return res.status(200).json({
    data: users,
  });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        message: 'is_active must be boolean',
      });
    }

    const result = await UserService.updateUserStatus(id, is_active);

    return res.status(200).json({
      message: 'User status updated',
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
