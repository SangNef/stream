module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Configs', [
        {
          key: "donate-percent",
          value: "50"
        }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Configs',
        { key: "donate-percent" }, {}
    );
  },
};