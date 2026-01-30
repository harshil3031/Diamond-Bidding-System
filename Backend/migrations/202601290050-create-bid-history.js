'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bid_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      user_bid_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_bids',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      old_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      new_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      edited_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bid_history');
  },
};
