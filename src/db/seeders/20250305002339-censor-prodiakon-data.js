'use strict';

const { Op } = require('sequelize');
const db = require('../../models');

const { user: User } = db

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await User.findAll({
      where: { user_registration_number: { [Op.gt]: 0 } },
      sort: [['user_registration_number', 'ASC']]
    });

    for (let i = 0; i < users.length; i++) {
      let name = `Prodiakon ${users[i].user_registration_number}`
      let email = `email${users[i].user_registration_number}@gmail.com`
      await User.update({
        full_name: name,
        email: email,
        phone_number: '',
        nick_name: name
      }, { where: { id: users[i].id } })
    }
  },

  async down (queryInterface, Sequelize) {
    return 1
  }
};
