const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProdeaconSchedule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProdeaconSchedule.belongsTo(models.user, {
                foreignKey: 'user_id',
                as: 'prodeacons',
                hooks: true,
            });
            ProdeaconSchedule.belongsTo(models.schedule, {
                foreignKey: 'schedule_id',
                as: 'schedules',
                hooks: true,
            });
        }
    }

    ProdeaconSchedule.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: DataTypes.UUID,
            schedule_id: DataTypes.INTEGER,
            mass_coordinator: DataTypes.BOOLEAN,
        },
        {
            sequelize,
            modelName: 'prodeacon_schedule',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    );
    return ProdeaconSchedule;
};
