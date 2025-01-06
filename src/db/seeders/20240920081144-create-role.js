'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', [
        {
            id: 1,
            name: 'Superadmin',
            level: 0,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 2,
            name: 'Admin',
            level: 1,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 3,
            name: 'Viewer',
            level: 2,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ]);
},

  down: async (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('roles', null, {});
  },
};
