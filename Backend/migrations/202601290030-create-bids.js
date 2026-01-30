'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      diamond_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'diamonds',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      base_bid_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('DRAFT', 'ACTIVE', 'CLOSED'),
        allowNull: false,
        defaultValue: 'DRAFT',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bids');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_bids_status";'
    );
  },
};
