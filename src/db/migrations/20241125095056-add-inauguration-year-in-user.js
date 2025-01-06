'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'inauguration_year', Sequelize.STRING),
      queryInterface.removeColumn('users', 'email_verified'),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.removeColumn('users', 'inauguration_year'),
      await queryInterface.addColumn('users', 'email_verified', Sequelize.BOOLEAN),
    ])
  }
};
