module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('prodeacon_leaves', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.UUID,
            },
            start_date: {
                type: Sequelize.DATE,
            },
            end_date: {
                type: Sequelize.DATE,
            },
            description: {
                type: Sequelize.STRING,
            },
            leave_type: {
                type: Sequelize.ENUM(
                  'cuti','viaticum'
                ),
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
        await queryInterface.dropTable('prodeacon_leaves');
    },
};
