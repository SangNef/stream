'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Configs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    key: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.TEXT,
        allowNull: false
    }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Configs');
  }
};