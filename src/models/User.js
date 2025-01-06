const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasOne(models.role, {
                foreignKey: 'id',
                sourceKey: 'role_id',
                hooks: true,
                // as: 'role'
            });
            User.hasMany(models.prodeacon_leave, {
                foreignKey: 'user_id',
                hooks: true,
            });
            User.hasMany(models.church_schedule, {
                foreignKey: 'id',
                sourceKey: 'preferential_schedules',
                hooks: true,
            });
            User.belongsToMany(models.schedule, {
                through: models.prodeacon_schedule,
                foreignKey: 'user_id',
                hooks: true,
                as: 'schedules'
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
            },
            full_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone_number: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            dob: {
                type: DataTypes.DATE,
                allowNull: false
            },
            birthplace: {
                type: DataTypes.STRING,
                allowNull: false
            },
            province: {
                type: DataTypes.STRING,
                allowNull: false
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            district: {
                type: DataTypes.STRING,
                allowNull: false
            },
            sub_district: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            zipcode: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            status: DataTypes.ENUM(
                'aman',
                'tangga',
                'usia',
                'cuti',
                'almarhum',
                'pindah',
                'mundur'
            ),
            mass_coordination_flag: DataTypes.BOOLEAN,
            mass_coordination_type: DataTypes.ENUM(
                'K1', 'K2', 'K3'
            ),
            preferential_schedules: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
                defaultValue: [1]
            }, 
            user_registration_number: DataTypes.INTEGER,
            is_pwd_resetted: DataTypes.BOOLEAN,
            nick_name: DataTypes.STRING,
            inauguration_year: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'user',
            underscored: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        },
    );
    return User;
};
