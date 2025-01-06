'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('users', 'users_user_registration_number_key')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('users', {
      fields: ['user_registration_number'],
      type: 'unique',
      name: 'users_user_registration_number_key'
    })
  }
};
