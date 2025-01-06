'use strict';

const { type } = require("os");

module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable('churches', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
            },
            province: {
                type: Sequelize.STRING,
            },
            city: {
                type: Sequelize.STRING,
            },
            district: {
                type: Sequelize.STRING,
            },
            sub_district: {
                type: Sequelize.STRING,
            },
            parish: {
                type: Sequelize.STRING
            },
            zipcode: {
                type: Sequelize.STRING,
            },
            address: {
                type: Sequelize.STRING,
            },
            phone_number: {
                type: Sequelize.STRING,
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
   await queryInterface.dropTable('churches');
  }
};
