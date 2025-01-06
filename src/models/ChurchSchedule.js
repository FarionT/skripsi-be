const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ChurchSchedule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ChurchSchedule.belongsTo(models.church, {
                foreignKey: 'church_id',
                hooks: true,
            });
        }
    }

    ChurchSchedule.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            church_id: DataTypes.INTEGER,
            day: DataTypes.ENUM('Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
            time: DataTypes.TIME,
            quota: DataTypes.INTEGER,
            min_mass_coordination_type: DataTypes.ENUM('K1', 'K2', 'K3')
        },
        {
            sequelize,
            modelName: 'church_schedule',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
            
        },
    );
    return ChurchSchedule;
};
