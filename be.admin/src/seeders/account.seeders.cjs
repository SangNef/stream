const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Admins', [
        {
          name: "admin1",
          email: "admin@livestream.com",
          password: await bcrypt.hash("123456", 10),
          is_root: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "admin2",
          email: "admin2@gmail.com",
          password: await bcrypt.hash("admin2", 10),
          is_root: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins',
        { email: "admin@example.com" }, {}
    );
  },
};