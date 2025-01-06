module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV1,
                primaryKey: true,
            },
            full_name: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            email_verified: {
                type: Sequelize.BOOLEAN,
            },
            address: {
                type: Sequelize.STRING,
            },
            phone_number: {
                type: Sequelize.STRING,
            },
            role_id:{
                type: Sequelize.INTEGER,
            },
            dob:{
                type: Sequelize.DATE,
            },
            birthplace: {
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
            zipcode: {
                type: Sequelize.STRING,
            },
            status: {
                type: Sequelize.ENUM(
                    'aman',
                    'tangga',
                    'usia',
                    'cuti',
                    'almarhum',
                    'pindah',
                    'mundur'),
            },
            mass_coordination_flag: {
                type: Sequelize.BOOLEAN,
            },
            mass_coordination_type: {
                type: Sequelize.STRING,
            },
            preferential_schedules: {
                type: Sequelize.ARRAY(Sequelize.INTEGER),
            },
            user_registration_number: {
                type: Sequelize.INTEGER,
                unique: true,
                allowNull: false
            },
            is_pwd_resetted: {
                type: Sequelize.BOOLEAN
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

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    },
};
