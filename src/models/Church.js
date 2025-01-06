const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Church extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Church.hasMany(models.church_schedule, {
                foreignKey: 'church_id',
                hooks: true,
                as: "mass_schedule"
            });
        }
    }

    Church.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            slug: DataTypes.STRING,
            province: DataTypes.STRING,
            city: DataTypes.STRING,
            district: DataTypes.STRING,
            sub_district: DataTypes.STRING,
            parish: DataTypes.STRING,
            zipcode: DataTypes.STRING,
            address: DataTypes.STRING,
            phone_number: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: 'church',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    );
    return Church;
};
