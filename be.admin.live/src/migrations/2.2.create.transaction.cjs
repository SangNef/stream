'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    implementer: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    receiver: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    type: {
        type: Sequelize.ENUM('recharge', 'donate', 'withdraw'),
        allowNull: false
    },
    is_success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_cancel: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: true
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};