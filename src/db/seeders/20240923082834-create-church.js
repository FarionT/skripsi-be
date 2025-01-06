'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('churches', [
        {
            name: 'Gereja Santo Laurensius',
            slug: 'gereja-santo-laurensius',
            province: 'Banten',
            city: 'Tangerang Selatan',
            district: 'Serpong Utara',
            sub_district: 'Pakulonan',
            parish: 'Paroki Alam Sutera',
            zipcode:  '15326',
            address: 'Jl. Sutera Utama No.2',
            phone_number: '2153120587',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            name: 'Gereja Santa Perawan Maria Benteng Gading',
            slug: 'gereja-santa-perawan-maria-benteng-gading',
            province: 'Banten',
            city: 'Tangerang Regency',
            district: 'Pagedangan',
            sub_district: 'Medang',
            parish: 'Paroki Alam Sutera',
            zipcode:  '15334',
            address: 'Jl. Boulevard Raya Gading Serpong No.15334',
            phone_number: null,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('churches', null, {});
  },
};
