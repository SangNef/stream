"use strict";

const { hash } = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("admins", [
            {
                name: "Super Admin",
                email: "admin@livestream.com",
                password: await hash("123456", 10),
                role: "super_admin",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("admins", null, {});
    },
};
