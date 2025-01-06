'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('schedules', 'last_update_by', Sequelize.UUID),
      queryInterface.addColumn('schedules', 'mass_name', Sequelize.STRING)
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      await queryInterface.removeColumn('schedules', 'last_update_by'),
      await queryInterface.removeColumn('schedules', 'mass_name')
    ])
  }
};
