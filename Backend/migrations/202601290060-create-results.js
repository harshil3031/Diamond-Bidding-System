'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('results', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      bid_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true, // 🔒 one result per bid
        references: {
          model: 'bids',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      winner_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },

      winning_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      declared_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('results');
  },
};
