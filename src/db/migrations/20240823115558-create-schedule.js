module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('schedules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            date: {
                type: Sequelize.DATE,
            },
            church_id: {
                type: Sequelize.STRING
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
            auto_generated: {
                type: Sequelize.DATE
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
        await queryInterface.dropTable('schedules');
    },
};
