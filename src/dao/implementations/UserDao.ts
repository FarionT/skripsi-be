import { Op, Sequelize } from 'sequelize';
import models from '../../models';
import IUserDao from '../contracts/IUserDao';
import SuperDao from './SuperDao';

const { user: User, role: Role, church_schedule: ChurchSchedule, church: Church, schedule: Schedule, prodeacon_schedule: ProdeaconSchedule } = models;

export default class UserDao extends SuperDao implements IUserDao {
    constructor() {
        super(User);
    }

    async listAllUser({
        pagination = true,
        page = 1,
        row = 10,
        search,
        sort_by = 'user_registration_number',
        sort_type = 'ASC',
        statuses,
        churches
    }: {   
        pagination?: boolean,
        page?: number,
        row?: number,
        search?: string,
        sort_by?: string,
        sort_type?: string,
        statuses?: string,
        churches?: string
    }) {
        let options = { 
            where: { 
                user_registration_number: { [Op.gt]: 0 } 
            },
            attributes:{
                exclude: ['role_id', 'email_verified', 'password', 'deleted_at']
            },
            include: [ 
                {
                    model: Role,
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    }
                }
            ],
            order: [
                ['user_registration_number', 'ASC']
            ]
        };

        if (pagination) {
            Object.assign(options, {
                limit: row,
                offset: row * (page - 1)
            })
        }

        const optionSearch : { [key: string]: any } = {}
        if (isNaN(Number(search))) { // Check if search is not a number
            optionSearch.full_name = { [Op.iLike]: `%${search}%` };
        } else {
            optionSearch.user_registration_number = search
        }

        if (search && search !== '') {
            Object.assign(options.where, {
                [Op.or]: optionSearch
            });
        }

        if (sort_by && sort_by !== '' && sort_type && sort_type !== '') {
            options.order = [[sort_by, sort_type]]
        }

        if (statuses && statuses !== '') {
            const status = statuses.split(',')
            Object.assign(options.where, {
                status: {
                    [Op.in]: status
                }
            })
        }

        
        
        let churchScheduleData = await ChurchSchedule.findAll({
            include: [
                {
                    model: Church
                }
            ]
        })
        
        if (churches && churches !== '') {
            const church = churches.split(',')
            const churchPreferenceId = churchScheduleData.filter(schedule => church.includes(String(schedule.church_id)))
                                                        .map(schedule => schedule.id)
                                                        
            Object.assign(options.where, {
                preferential_schedules: {
                    [Op.overlap]: churchPreferenceId
                }
            })
        }

        const startDate = new Date()

        let allSchedules = await Schedule.findAll({
            where: { 
                date: {
                    [Op.gte]: startDate,
                }, 
            },
            include: [
                {
                    model: ProdeaconSchedule,
                    include: [
                        {
                            model: User,
                            as: 'prodeacons',
                            attributes: {
                                exclude: ['email', 'password', 'email_verified', 'address', 'active', 
                                        'phone_number', 'role_id', 'dob', 'birthplace', 'province', 'city', 'district', 'preferential_schedules',
                                        'sub_district', 'zipcode', 'is_pwd_resetted', 'created_at', 
                                        'updated_at', 'deleted_at'],
                            }
                        }
                    ]
                },
                {
                    model: Church
                }
            ]
        })

        let formatted_schedules = allSchedules.map(item => ({
            ...item.toJSON(),
            church_name: item.church.name,
            prodeacons: item.prodeacon_schedules.map(prodeacon => ({
                ...prodeacon.prodeacons.toJSON(),
                mass_coordinator: prodeacon.mass_coordinator
            }))
        }))

        let scheduledProdeacons: any = []
        for(let i = 0; i < formatted_schedules.length; i++) {
            formatted_schedules[i].prodeacons.map(user => scheduledProdeacons.push(user.id))
            delete formatted_schedules[i].prodeacon_schedules
            delete formatted_schedules[i].church
        }

        let allData = await User.findAndCountAll(options)

        allData.rows = allData.rows.map(item => {
            let formatted_status = '';
            let preferential_church
            let has_schedule = scheduledProdeacons.includes(item.id)
            
            switch (item.status) {
                case 'aman':
                    formatted_status = 'Aman';
                    break;
                case 'tangga':
                    formatted_status = 'Tangga';
                    break;
                case 'usia':
                    formatted_status = 'Usia';
                    break;
                case 'cuti':
                    formatted_status = 'Cuti Panjang';
                    break;
                case 'almarhum':
                    formatted_status = 'Almarhum';
                    break;
                case 'pindah':
                    formatted_status = 'Pindah';
                    break;
                case 'mundur':
                    formatted_status = 'Mengundurkan Diri';
                    break;
                default:
                    formatted_status = item.status;
            }
            
            // Getting church name based on preferential schedules
            preferential_church = (item.preferential_schedules) ?  item.preferential_schedules.reduce((acc, id) => {
                const churchSchedule = churchScheduleData.find(obj => obj.id === id);
                if (churchSchedule && !acc.includes(churchSchedule.church.name)) {
                    acc.push(churchSchedule.church.name);
                }
                return acc
            }, []).join(', ') : ''

            return {
                ...item.toJSON(),
                formatted_status,
                preferential_church,
                has_schedule
            };
        });
        

        return allData
    }

    async findByEmail(email: string) {
        return User.findOne({ 
            where: { email },
            include: [
                {
                    model: Role,
                    attributes: {
                        exclude: ['created_at', 'updated_at', 'deleted_at']
                    }
                }
            ],
            attributes: {
                exclude: ['role_id', 'created_at', 'updated_at', 'deleted_at']
            }
        });
    }

    async isEmailExists(email: string) {
        return User.count({ where: { email } }).then((count) => {
            if (count != 0) {
                return true;
            }
            return false;
        });
    }

    async isNumberExists(user_registration_number: number) {
        return User.count({ where: { user_registration_number } }).then((count) => {
            if (count != 0) {
                return true
            }
            return false
        })
    }

    async createWithTransaction(user: object, transaction: object) {
        return User.create(user, { transaction });
    }
}
