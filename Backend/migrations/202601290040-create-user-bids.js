'use strict';

/** @type {import('sequelize-cli').Migration} */
export default{
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_bids', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      bid_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bids',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Enforce ONE bid per user per auction
    await queryInterface.addConstraint('user_bids', {
      fields: ['user_id', 'bid_id'],
      type: 'unique',
      name: 'unique_user_bid_per_auction',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_bids');
  },
};
