module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('churches', 'slug', Sequelize.STRING)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('churches', 'slug')
  }
};