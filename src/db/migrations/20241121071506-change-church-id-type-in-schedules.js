'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE schedules ALTER COLUMN church_id TYPE INTEGER USING church_id::INTEGER;'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE schedules ALTER COLUMN church_id TYPE VARCHAR USING church_id::TEXT;'
    );
  }
};
