const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { random } = require('lodash');

const dataEmail = [
  'andreas.martinus@concise.co.id',
  'yosef.maria@concise.co.id',
  'fransiskus.xaverius@concise.co.id',
  'thomas.aquinas@concise.co.id',
  'ignatius.dedi@concise.co.id',
  'petrus.suharto@concise.co.id',
  'paulus.setiawan@concise.co.id',
  'maria.theresia@concise.co.id',
  'yohanes.baptista@concise.co.id',
  'agnes.susanti@concise.co.id'
]

const dataStatus = [
  {
    is_active: true,
    name: 'aman'
  },
  {
    is_active: true,
    name: 'tangga'
  },
  {
    is_active: true,
    name: 'usia'
  },
  {
    is_active: false,
    name: 'cuti'
  },
  {
    is_active: false,
    name: 'almarhum'
  },
  {
    is_active: false,
    name: 'pindah'
  },
  {
    is_active: false,
    name: 'mundur'
  },
]

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const dataUser = [];
        // dataEmail.forEach((element, i) => {
        //   const randomStatus = random(0,6);
        //   const status = dataStatus[randomStatus].name;
        //   const active = dataStatus[randomStatus].is_active;
        //   dataUser.push({
        //       id: uuidv4(),
        //       full_name: element.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
        //       email: element,
        //       role_id:3,
        //       active,
        //       status,
        //       email_verified: false,
        //       user_registration_number: (i+4),
        //       password: bcrypt.hashSync('Passw0rd', 8),
        //       is_pwd_resetted: false,
        //       created_at: new Date(),
        //       updated_at: new Date(),
        //   })
        // });
        // return queryInterface.bulkInsert('users', dataUser);
    },

    down: async (queryInterface, Sequelize) => {
        // const Op = Sequelize.Op
        // return queryInterface.bulkDelete('users', {
        //   email : {
        //     [Op.in] : dataEmail
        //   }
        // }, {});
    },
};


