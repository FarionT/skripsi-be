'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
        {
            id: uuidv4(),
            full_name: 'Vincentius Kurniawan',
            email: 'vincentius@concise.co.id',
            role_id: 1,
            active: true,
            user_registration_number: -3,
            password: bcrypt.hashSync('Passw0rd', 8),
            is_pwd_resetted: false,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: uuidv4(),
            full_name: 'Ardisa Lestari',
            email: 'ardisa@concise.co.id',
            role_id:1,
            active: true,
            user_registration_number: -4,
            password: bcrypt.hashSync('Passw0rd', 8),
            is_pwd_resetted: false,
            created_at: new Date(),
            updated_at: new Date(),
        }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('users', null, {});
  },
};
