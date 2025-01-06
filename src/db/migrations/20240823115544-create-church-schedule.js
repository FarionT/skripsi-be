'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable('church_schedules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            church_id:{
              type: Sequelize.INTEGER,
            },
            day: {
                type: Sequelize.STRING,
            },
            time: {
                type: Sequelize.TIME,
            },
            quota: {
                type: Sequelize.INTEGER,
            },
            min_mass_coordination_type: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deleted_at: {
                type: Sequelize.DATE,
            },
        });
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('church_schedules');
  }
};
