'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('users', 'preferential_schedules', {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
      }),
      queryInterface.changeColumn('users', 'is_pwd_resetted', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    return 1
  }
};
