'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AdminHistories', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Admins',
            key: 'id'
        },
        onUpdate: 'CASCADE'
    },
    action: {
        type: Sequelize.ENUM('get', 'post', 'put', 'delete', 'restore'),
        allowNull: false
    },
    model: {
        type: Sequelize.STRING,
        allowNull: false
    },
    data_input: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    init_value: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    change_value: {
        type: Sequelize.TEXT,
        allowNull: false
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
    await queryInterface.dropTable('AdminHistories');
  }
};