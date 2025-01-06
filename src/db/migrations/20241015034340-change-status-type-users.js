'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'mass_coordination_type', {
      type: Sequelize.ENUM('K1', 'K2', 'K3')
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users', 'mass_coordination_type', {
      type: Sequelize.STRING
    })
  }
};
