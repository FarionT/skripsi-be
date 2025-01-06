const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Schedule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Schedule.belongsTo(models.church, {
                foreignKey: 'church_id',
                hooks: true,
            });
            Schedule.hasMany(models.prodeacon_schedule, {
                foreignKey: 'schedule_id',
                hooks: true,
            });
            Schedule.belongsToMany(models.user, {
                through: models.prodeacon_schedule,
                foreignKey: 'schedule_id',
                hooks: true,
                as: 'prodeacons'
            });
        }
    }

    Schedule.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            date: DataTypes.STRING,
            church_id: DataTypes.INTEGER,
            mass_name: DataTypes.STRING,
            time: DataTypes.TIME,
            quota: DataTypes.INTEGER,
            min_mass_coordination_type: DataTypes.STRING,
            auto_generated: DataTypes.DATE,     
            last_update_by: DataTypes.STRING,
            church_schedule_id: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'schedule',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        }
    );
    return Schedule;
};
