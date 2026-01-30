import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

export default {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: randomUUID(),
        name: 'Super Admin',
        email: 'admin@diamond.com',
        password: hashedPassword,
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@diamond.com' });
  },
};
