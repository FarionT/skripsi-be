'use strict';

const data = require('../data/generated_users_data.json')
const db = require('../../models')
const { user: User, church_schedule: ChurchSchedule } = db
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const datas = []
    let statusData = User.rawAttributes.status.values;

    statusData = statusData.slice(0, 3).concat(['cadangan'], statusData.slice(3, statusData.length))
    const churchScheduleData = await ChurchSchedule.findAll()
    const churchScheduleDataIds = churchScheduleData.map(schedule => schedule.id)
    for(let i = 0; i < data.length; i++) {
      data[i].id = uuidv4()
      data[i].status = data[i].status === '3' ? 'cuti' : statusData[Number(data[i].status) - 1]
      data[i].active = data[i].active === 'TRUE' ? true : false
      data[i].dob = data[i].dob ? new Date(data[i].dob) : null
      data[i].mass_coordination_flag = data[i].mass_coordination_flag === 'TRUE' ? true : false
      data[i].mass_coordination_type = data[i].mass_coordination_type !== '' ? data[i].mass_coordination_type : null
      data[i].password = bcrypt.hashSync('Passw0rd', 8)
      data[i].preferential_schedules = churchScheduleDataIds
      if(data[i].nick_name === 'Albert Kurniadi') {
        data[i].role_id = 1
      } else if (data[i].nick_name === 'Handoko Setiawan') {
        data[i].role_id = 2
      } else {
        data[i].role_id = 3
      }
      datas.push(data[i])
    }
    await User.bulkCreate(datas)
    
    return 1
  },

  async down (queryInterface, Sequelize) {
    return 1
  }
};
