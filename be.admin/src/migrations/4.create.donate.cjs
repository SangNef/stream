'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Donates', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onUpdate: 'CASCADE'
        },
        item_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'DonateItems',
                key: 'id'
            },
            onUpdate: 'CASCADE'
        },
        stream_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Streams',
                key: 'id'
            },
            onUpdate: 'CASCADE'
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('Donates');
  }
};