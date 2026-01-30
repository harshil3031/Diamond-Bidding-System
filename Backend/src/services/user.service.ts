import User, { UserRole } from '../../models/user.model.js';
import { hashPassword } from '../utils/password.js';

export class UserService {
  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }) {
    const existingUser = await User.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.USER,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    };
  }

  static async getAllUsers() {
    return User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
    });
  }

  static async updateUserStatus(userId: string, isActive: boolean) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = isActive;
    await user.save();

    return {
      id: user.id,
      is_active: user.is_active,
    };
  }
}
