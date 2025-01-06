const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProdeaconLeave extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProdeaconLeave.belongsTo(models.user, {
                foreignKey: 'user_id',
                hooks: true,
            });
        }
    }

    ProdeaconLeave.init(
        {
            id: {
                type: DataTypes.INTEGER,
                defaultValue: DataTypes.INTEGER,
                primaryKey: true,
            },
            user_id: DataTypes.UUID,
            start_date: DataTypes.DATE,
            end_date: DataTypes.DATE,
            description: DataTypes.STRING,
            leave_type: DataTypes.ENUM('cuti','viaticum'),
        },
        {
            sequelize,
            modelName: 'prodeacon_leave',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    );
    return ProdeaconLeave;
};
