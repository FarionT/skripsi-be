import { Workbook } from './../../../node_modules/exceljs/index.d';
import { convertTimezone } from './../../helper/timeHelper';
import { IUser } from './../../models/interfaces/IUser';
import { Request, response } from "express";
import httpStatus from "http-status";
import { uuid } from "uuidv4";
import responseHandler from "../../helper/responseHandler";
import IChurch from "../../models/interfaces/IChurch"; 
import IChurchService from "../contracts/IChurchService";
import { responseMessageConstant } from "../../config/constant";
import db, { sequelize } from '../../models';
import ChurchDao from "../../dao/implementations/ChurchDao";
import { Op } from "sequelize";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { ApiServiceResponse } from "../../@types/apiServiceResponse";
import { group } from "console";
import IScheduleService from "../contracts/IScheduleService";
import { ISchedule } from "../../models/interfaces/ISchedule";
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { assign } from 'lodash';

const { user: User, schedule: Schedule,  prodeacon_schedule: ProdeaconSchedule, church: Church, role: Role, church_schedule: ChurchSchedule } = db;


export default class ScheduleService implements IScheduleService {
    private churchDao: ChurchDao;
    private population;
    private pdf;
    private fitness;
    private totalFitness;
    private weekendSchedule;
    private scheduleMaxBit;
    private userMaxBit;
    private individualBit;
    private activeUser;
    private bestPopulation;
    private bestFitness;
    private beforeMutation;
    private bestFitnessGen;
    private week;
    private thisMonthSchedules;
    private firstChruch
    private populationCount
    private preferenceCount
    private coordinatorCount
    private consecutiveCount
    private distributeCount
    private plot

    constructor(){
        this.churchDao = new ChurchDao()
        this.population = []
        this.fitness = []
        this.pdf = []
        this.beforeMutation = []
        this.thisMonthSchedules = []
        this.bestPopulation = []
        this.bestFitness = 0
        this.populationCount = 50
        this.preferenceCount = 0
        this.coordinatorCount = 0
        this.consecutiveCount = 0
        this.distributeCount = 0
        this.plot = []
    }

    private prodeaconsValidation = (schedule: ISchedule): { message: string, flag: boolean } => {
        let message = ''
        let flag = false

        // If the schedule doesn't have a prodeacon
        if (schedule.prodeacons.length === 0) {
            message = 'Petugas Prodiakon harus dipilih minimal 1'
            flag = true
        }

        // If the schedule has more prodeacons than the quota
        // const totalProdeaconOnDuty = schedule.prodeacons.filter((item) => item.mass_coordinator === false).length
        // if (totalProdeaconOnDuty > schedule.quota) {
        //     message = 'Petugas Prodiakon melebihi Jumlah Prodiakon yang bertugas'
        //     flag = true
        // }
        
        const coordinatorNumber = schedule.prodeacons.filter((item) => item.mass_coordinator === true).length
        
        // If there's more than 1 coordinator
        if (coordinatorNumber > 1) {
            message = 'Hanya boleh 1 Petugas Prodiakon yang menjadi koordinator'
            flag = true
        } 
        
        // If there's no coordinator
        if (coordinatorNumber === 0) {
            message = 'Koordinator Prodiakon harus diisi'
            flag = true
        }

        return { message, flag }
    }

    private printCurrentPopulation = (population) => {
        let count = 0
        let pop
        for (let i = 0; i < this.weekendSchedule.length; i++) {
            let currentSchedule = this.weekendSchedule[i].date
            let printOut = ''
            printOut += String(currentSchedule.getDate()).padStart(2, '0') + '/' + String(currentSchedule.getMonth() + 1).padStart(2, '0')  + ' - ' + this.weekendSchedule[i].time + ' '
            for (let j = 0; j < this.weekendSchedule[i].quota; j++) {
                let currentBit = population.substring(
                    (count * this.individualBit),
                    ((count + 1) * this.individualBit)
                );
                printOut += currentBit + ' '
                count++
            }
            console.log(printOut)
        }
        console.log('')

        count = 0
        for (let i = 0; i < this.weekendSchedule.length; i++) {
            let currentSchedule = this.weekendSchedule[i].date
            let printOut = ''
            printOut += String(currentSchedule.getDate()).padStart(2, '0') + '/' + String(currentSchedule.getMonth() + 1).padStart(2, '0')  + ' - ' + this.weekendSchedule[i].time + ' '
            for (let j = 0; j < this.weekendSchedule[i].quota; j++) {
                let currentBit = population.substring(
                    (count * this.individualBit),
                    ((count + 1) * this.individualBit)
                );
                let currUser = this.activeUser[parseInt(currentBit, 2)]
                let userRegistNumber = String(currUser.user_registration_number).padStart(3, '0')
                printOut +=  `user${userRegistNumber} `
                count++
            }
            console.log(printOut)
        }
        console.log('')
    }

    private initializePopulation = () => {
        console.log('Initialize Population')
        for(let i = 0; i < this.populationCount; i++) {
            let population: any = []
            // let currentWeek = this.weekendSchedule[0].week
            let assignedUser: any = []
            for (let j = 0; j < this.weekendSchedule.length; j++) {
                let scheduleUser: any = []
                if (j !== 0 && this.weekendSchedule[j].week !== this.weekendSchedule[j-1].week) {
                    assignedUser = []
                }
                // let tempUser: any = []
                for (let k = 0; k < this.weekendSchedule[j].quota; k++) {
                    let randomIndex, user, selected
                    if (k === 0) {
                        let coordinators = this.activeUser.filter((user, index) => user.mass_coordination_flag)
                        randomIndex = Math.floor(Math.random() * coordinators.length)
                        selected = coordinators[randomIndex]
                    } else {
                        // user = this.activeUser.filter((user, index) => !assignedUser.includes(index))
                        user = this.activeUser
                        randomIndex = Math.floor(Math.random() * user.length)
                        selected = user[randomIndex]
                    }
                    randomIndex = this.activeUser.findIndex(user => user.id === selected.id)
                    user = this.activeUser[randomIndex]
                    // let individu = this.activeUser[randomIndex]
                    // assignedUser.push(randomIndex)
                    scheduleUser.push(user)
                    // population += individu
                }
                // scheduleUser.map(user => console.log(user.user_registration_number))
                population.push(scheduleUser)
            }
            this.population.push(population)
            // console.log('Population ' + (i + 1))
            // console.log(population)
            // this.printCurrentPopulation(population)
        }
    }

    private calculateFitness = () => {
        // console.log('Calculate Fitness')
        this.fitness = []
        this.bestFitnessGen = 0
        
        let currBest = 0
        let coordinatorPenalty = 10
        let distributedPenalty = 8
        let prefrencedSchedulePenalty = 12
        let consecutivePenalty = 7
        let totalProdeacons = this.weekendSchedule.reduce((total, item) => {
            return total + item.quota
        }, 0)
        let maxPenalty = (coordinatorPenalty * this.weekendSchedule.length) + (distributedPenalty * this.weekendSchedule.length) + 
        (prefrencedSchedulePenalty * totalProdeacons) + (2 * consecutivePenalty * totalProdeacons)
        // + (consecutivePenalty * this.activeUser.length)
        for(let i = 0; i < this.populationCount; i++) {
            let count = 0
            let penalty = 0
            this.activeUser = this.activeUser.map(user => {
                return { ...user, count: 0 }
            })

            let currPopulation = this.population[i]
            let preferenceCount = 0
            let coordinatorCount = 0
            let consecutiveCount = 0
            let distributeCount = 0
            let assignedUser: any = []
            for(let j = 0; j < this.weekendSchedule.length; j++) {
                const currWeek = this.thisMonthSchedules.filter(schedule => schedule.week === this.weekendSchedule[j].week)
                const currWeekFirstChurch = currWeek.filter(schedule => schedule.church_id === this.weekendSchedule[j].church_id)
                const currWeekFirstChurchId = currWeekFirstChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)
                const currWeekSecondChurch = currWeek.filter(schedule => schedule.church_id !== this.weekendSchedule[j].church_id)
                const currWeekSecondChurchSat = currWeek.filter(schedule => schedule.day === 0)
                const currWeekSecondChurchSatId = currWeekSecondChurchSat.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                const currWeekSecondChurchSun = currWeek.filter(schedule => schedule.day === 1)
                const currWeekSecondChurchSunId = currWeekSecondChurchSun.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                
                const currWeekSecondChurchId = currWeekSecondChurch.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                let currSchedule = currPopulation[j]
                let amanCount = 0
                if (j !== 0 && this.weekendSchedule[j].week !== this.weekendSchedule[j-1].week) {
                    assignedUser = []
                }
                for(let k = 0; k < this.weekendSchedule[j].quota; k++) {
                    let currUser = currSchedule[k]
                    // If it is not the user preferenced schedule
                    if (!currUser.preferential_schedules.includes(this.weekendSchedule[j].church_schedule_id)) {
                        // console.log(currUser.preferential_schedules + ' ' + currSchedule.church_schedule_id)
                        penalty += prefrencedSchedulePenalty
                        preferenceCount++
                    }

                    // If the user doen't want to be a coordinator and its type doesn't match the requirement
                    if (k === 0) {
                        if (!(this.weekendSchedule[j].min_mass_coordination_type >= currUser.mass_coordination_type)) {
                            penalty += coordinatorPenalty
                            coordinatorCount++
                        }
                    }

                    if (currUser.status === 'aman') {
                        amanCount++
                    }

                    if (currSchedule.day === 0) {
                        if (currWeekSecondChurchSatId.includes(currUser.id)) {
                            penalty += consecutivePenalty
                            consecutiveCount++
                        }
                    } else {
                        if (currWeekSecondChurchSunId.includes(currUser.id)) {
                            penalty += consecutivePenalty
                            consecutiveCount++
                        }
                    }

                    // if (currWeekSecondChurchId.includes(currUser.id)) {
                    //     penalty += consecutivePenalty
                    //     consecutiveCount++
                    // }

                    if (assignedUser.includes(currUser.id)) {
                        penalty += consecutivePenalty
                        consecutiveCount++
                    }
                    assignedUser.push(currUser.id)
                    count++
                }
                
                // If the schedule status doesn't evenly distributed
                if (amanCount < Math.ceil(this.weekendSchedule[j].quota * 0.7)) {
                    penalty += distributedPenalty
                    distributeCount++
                }
            }
            count = 0
            // for (let j = 0; j < this.activeUser.length; j++) {
            //     if (this.activeUser[j].count > 2) {
            //         penalty += consecutivePenalty
            //     }
            // }

            let currFitness = (100 - ((penalty / maxPenalty) * 100))
            // console.log("Population " + i + " " + currFitness)
            this.fitness.push(currFitness)
            if (this.fitness[i] > currBest) {
                this.bestFitnessGen = this.fitness[i]
                currBest = this.fitness[i]
            }

            if (this.fitness[i] > this.bestFitness) {
                this.bestFitness = this.fitness[i]
                this.bestPopulation = this.population[i]
                this.distributeCount = distributeCount
                this.preferenceCount = preferenceCount
                this.coordinatorCount = coordinatorCount
                this.consecutiveCount = consecutiveCount
            }

            // console.log(`Population ${i + 1} Fitness: ` + this.fitness[i])
            // console.log('Population ' + (i+1) + ' ' + preferenceCount + ' '+ coordinatorCount + ' ')
        }
    }

    private calculatePDF = () => {
        let totalFitness = this.fitness.reduce((total, item) => {
            return total + item
        }, 0)

        this.pdf = []

        this.fitness.map((item, i) => {
            if (i === 0) {
                this.pdf.push({
                    down: 0,
                    up: item / totalFitness
                })
            } else {
                this.pdf.push({
                    down: this.pdf[i - 1].up,
                    up: this.pdf[i - 1].up + (item / totalFitness)
                })
            }
            // console.log('PDF Populasi ' + (i+1) + ': ' + this.fitness[i] + ' yaitu ' + this.pdf[i].down + ' hingga ' + this.pdf[i].up)
        })
    }

    private selection = () => {
        // console.log('Selection')
        // const eliteCount = 2;
        // const newPop: any[] = [];

        // const sortedPop = this.population
        //     .map((individual, i) => ({ individual, fitness: this.fitness[i] }))
        //     .sort((a, b) => b.fitness - a.fitness);
        // newPop.push(...sortedPop.slice(0, eliteCount).map(item => item.individual));

        // while (newPop.length < this.populationCount) {
        //     const rand = Math.random();
        //     for (let i = 0; i < this.populationCount; i++) {
        //         if (rand >= this.pdf[i].down && rand <= this.pdf[i].up) {
        //             if (!newPop.includes(this.population[i])) {
        //                 newPop.push(this.population[i]);
        //                 break;
        //             }
        //         }
        //     }
        // }

        const newPop: any = []

        let fitnessPop = this.population.map((item, index) => {
            return { pop: item, fitness: this.fitness[index] }
        }).sort((a, b) => b.fitness - a.fitness)

        let tempPop = this.population.map((item, index) => {
            return { pop: item, fitness: this.fitness[index] }
        }).sort((a, b) => b.fitness - a.fitness).map(item => item.pop)

        newPop.push(tempPop[0])
        newPop.push(tempPop[1])
        newPop.push(tempPop[2])

        // console.log('0 ' + fitnessPop[0].fitness)
        // console.log('1 ' + fitnessPop[1].fitness)
        // console.log('2 ' + fitnessPop[2].fitness)
        // console.log('3 ' + fitnessPop[3].fitness)
        // console.log('4 ' + fitnessPop[4].fitness)

        for(let i = 3; i < this.populationCount; i++) {
            const random = Math.random()
            // console.log('Angka roulette ' + (i+1) + ' ' + random)
            let j = 0
            for (j = 0; j < this.populationCount; j++) {
                if (random >= this.pdf[j].down && random <= this.pdf[j].up) {
                    // console.log('Population '+ (i+1))
                    // this.printCurrentPopulation(this.population[j])
                    newPop.push(this.population[j])
                    break
                }
            }
            // console.log(i + ' ' + random + ' ' + this.fitness[j] + ' ' +  j)
        }

        this.population = newPop;
    }

    private tournamentSelection = () => {
        let fitnessPop = this.population.map((item, index) => {
            return { pop: item, fitness: this.fitness[index] }
        }).sort((a, b) => b.fitness - a.fitness)

        let tempPop = this.population.map((item, index) => {
            return { pop: item, fitness: this.fitness[index] }
        }).sort((a, b) => b.fitness - a.fitness).map(item => item.pop)

        let selectedPop: any = []
        for (let i = 0; i < 5; i++){
            let rand = Math.floor(Math.random() *  fitnessPop.length)
            selectedPop.push(fitnessPop[rand])
        }

        selectedPop = selectedPop.sort((a, b) => b.fitness - a.fitness).map(item => item.pop)
        return selectedPop[0]
    }

    private crossover = () => {
        // console.log('Crossover')
        let prob = 0.25
        for(let i = 0; i < this.populationCount; i++) {
            // let parent1 = this.population[i * 2]
            // let parent2 = this.population[i * 2 + 1]
            let parent1 = this.tournamentSelection()
            let parent2 = this.tournamentSelection()
            let newPop1: any = []
            let newPop2: any = []
            let count = 0
            let numberCrossed = ''
            for(let j = 0; j < this.weekendSchedule.length; j++) {
                let child1: any = []
                let child2: any = []
                let parent1Schedule = parent1[j]
                let parent2Schedule = parent2[j]
                for (let k = 0; k < this.weekendSchedule[j].quota; k++) {
                    let rand = Math.random()
                    if (rand < prob) {
                        numberCrossed += String(count) + ' '
                        if (child1.includes(parent2Schedule[k]) || child2.includes(parent1Schedule[k])) {
                            child1.push(parent1Schedule[k])
                            child2.push(parent2Schedule[k])
                        } else {
                            child1.push(parent2Schedule[k])
                            child2.push(parent1Schedule[k])
                        }
                    } else {
                        child1.push(parent1Schedule[k])
                        child2.push(parent2Schedule[k])
                    }
                    count++
                }
                newPop1.push(child1)
                newPop2.push(child1)
            }
            this.population[i * 2] = newPop1
            this.population[i * 2 + 1] = newPop2
            // console.log('User Crossover: ' + numberCrossed)
            // console.log(`Population ${(i * 2) + 1}`)
            // this.printCurrentPopulation(child1)
            // console.log(`Population ${(i * 2 + 1) + 1}`)
            // this.printCurrentPopulation(child2)
        }
    }

    private mutation = () => {
        // console.log('Mutation')
        let mutationRate = 0.0125
        this.beforeMutation = this.population
        for(let i = 0; i < this.populationCount; i++) {
            let count = 0
            let numberMutated = ''
            let assignedUser: any = []
            for (let j = 0; j < this.weekendSchedule.length; j++) {
                let currSchedule = this.population[i][j]
                let newSchedule: any = []
                let currScheduleUserId = currSchedule.map(user => user.id)
                if (j !== 0 && this.weekendSchedule[j].week !== this.weekendSchedule[j-1].week) {
                    assignedUser = []
                }
                for (let k = 0; k < this.weekendSchedule[j].quota; k++) {                    
                    let rand = Math.random()
                    if (rand < mutationRate) {
                        let userList
                        const currWeek = this.thisMonthSchedules.filter(schedule => schedule.week === this.weekendSchedule[j].week)
                        const currWeekFirstChurch = currWeek.filter(schedule => schedule.church_id === this.weekendSchedule[j].church_id)
                        const currWeekFirstChurchId = currWeekFirstChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)
                        const currWeekSecondChurch = currWeek.filter(schedule => schedule.church_id !== this.weekendSchedule[j].church_id)
                        const currWeekSecondChurchId = currWeekSecondChurch.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                        const currWeekSecondChurchSat = currWeek.filter(schedule => schedule.day === 0)
                        const currWeekSecondChurchSatId = currWeekSecondChurchSat.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                        const currWeekSecondChurchSun = currWeek.filter(schedule => schedule.day === 1)
                        const currWeekSecondChurchSunId = currWeekSecondChurchSun.flatMap(schedule => schedule.prodeacons).map(user => user.id) 
                        numberMutated += String(count) + ' '
                        if (k === 0) {
                            if (currSchedule.day === 0) {
                                userList = this.activeUser.filter(user => !currScheduleUserId.includes(user.id) && !currWeekSecondChurchSatId.includes(user.id)).filter(user => user.mass_coordination_flag === true)
                            } else {
                                userList = this.activeUser.filter(user => !currScheduleUserId.includes(user.id) && !currWeekSecondChurchSunId.includes(user.id)).filter(user => user.mass_coordination_flag === true)
                            }
                        } else {
                            if (currSchedule.day === 0) {
                                userList = this.activeUser.filter(user => !currScheduleUserId.includes(user.id) && !currWeekSecondChurchSatId.includes(user.id))
                            } else {
                                userList = this.activeUser.filter(user => !currScheduleUserId.includes(user.id) && !currWeekSecondChurchSunId.includes(user.id))

                            }
                        }
                        let newIndividual = Math.floor(Math.random() * userList.length)
                        newIndividual = userList[newIndividual]
                        this.population[i][j][k] = newIndividual
                        assignedUser.push(newIndividual)
                    }

                    count++
                }
            }
            // this.population[i] = this.checkValidation(newPopulation)
            // this.population[i] = newPopulation
            // console.log(`Population ${i + 1}`)
            // console.log(`Mutated User Index: ${numberMutated ? numberMutated : 'null'}`)
            // this.printCurrentPopulation(this.population[i])
        }   
    }

    private checkValidation = (individual: string) => {
        let repaired = '';
        let assignmentCount = this.activeUser.map(user => {
            return { ...user, count: 0 }
        })
        let count = 0;
        for (let j = 0; j < this.weekendSchedule.length; j++) {
            const currentSchedule = this.weekendSchedule[j];
            for (let k = 0; k < currentSchedule.quota; k++) {
                const currUserIndex = parseInt(
                    individual.substring(count * this.individualBit, (count + 1) * this.individualBit),
                    2
                );
                assignmentCount[currUserIndex].count = assignmentCount[currUserIndex].count + 1
                count++
            }
        }

        count = 0
        for (let j = 0; j < this.weekendSchedule.length; j++) {
            const currentSchedule = this.weekendSchedule[j];

            for (let k = 0; k < currentSchedule.quota; k++) {
                const currIndex = parseInt(
                    individual.substring(count * this.individualBit, (count + 1) * this.individualBit),
                    2
                );

                if (assignmentCount[currIndex].count > 2) {
                    
                    let tempUserList = assignmentCount.filter(user => user.count < 2)
                    let tempUserIndex = Math.floor(Math.random() * tempUserList.length)
                    let tempUser = tempUserList[tempUserIndex] 
                    let newUser = assignmentCount.findIndex(user => user.id === tempUser.id)
                    repaired += newUser.toString(2).padStart(this.userMaxBit, '0')
                    assignmentCount[currIndex].count -= 1
                    assignmentCount[newUser].count += 1

                } else {
                    repaired += individual.substring(count * this.individualBit, (count + 1) * this.individualBit)
                }

                count++;
            }
        }

        return repaired;
    }

    private decode = () => {
        // let count = 0
        // let solution: any = []
        // for(let i = 0; i < this.weekendSchedule.length; i++) {
        //     for(let j = 0; j < this.weekendSchedule[i].quota; j++) {
        //         let currUserIndex = this.bestPopulation.substring(
        //             (count * this.individualBit),
        //             ((count + 1) * this.individualBit)
        //         );

        //         currUserIndex = parseInt(currUserIndex, 2)
        //         let currUser = this.activeUser[currUserIndex]
        //         if (j === 0) {
        //             solution.push({
        //                 schedule_id: this.weekendSchedule[i].id,
        //                 user_id: currUser.id,
        //                 mass_coordinator: true
        //             })
        //         }
        //         solution.push({
        //             schedule_id: this.weekendSchedule[i].id,
        //             user_id: currUser.id,
        //             mass_coordinator: false
        //         })
        //         count++
        //     }
        // }
        let solution: any = []
        for(let i = 0; i < this.weekendSchedule.length; i++) {
            for (let j = 0; j < this.weekendSchedule[i].quota; j++) {
                if (j === 0) {
                    solution.push({
                        schedule_id: this.weekendSchedule[i].id,
                        user_id: this.bestPopulation[i][j].id,
                        mass_coordinator: true
                    })
                }
                solution.push({
                    schedule_id: this.weekendSchedule[i].id,
                    user_id: this.bestPopulation[i][j].id,
                    mass_coordinator: false
                })
            }
        }
        return solution
    }

    private geneticSchedule = () => {
        const generation = 1000
        this.initializePopulation()
        this.calculateFitness()
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        let i = 0
        console.log(this.activeUser.length)
        console.log(`Generation 1 best fitness is ${this.bestFitnessGen}`)
        for(let i = 1; i < generation; i++) {
        // while (this.bestFitness < 100) {
            // console.log(`Generation ${i + 1}`)

            // let topFitness = this.fitness
            //     .map((fit, idx) => ({ fit, idx }))
            //     .sort((a, b) => b.fit - a.fit)
            //     .slice(0, 2)
            //     .map((item) => item.idx);
            
            // let elites = topFitness.map((item) => this.population[item])

            // this.calculatePDF()
            // this.selection()
            this.crossover()
            this.mutation()
            // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')

            // for (let j = 0; j < elites.length; j++) {
            //     this.population[j] = ''
            //     this.population[j] = elites[j];
            // }
            // this.checkValidation()
            this.calculateFitness()
            console.log(`Generation ${i + 1} best fitness is ${this.bestFitnessGen}`)
            this.plot.push({
                x: i + 1,
                y: this.bestFitnessGen
            })
            // console.log('(' + (i+1) + ',' + this.bestFitnessGen + ')')
            // i++
        }
        console.log(`Best Fitness is ${this.bestFitness} with Preference Count ${this.preferenceCount}, Coordinator Count ${this.coordinatorCount}, Distribution Count ${this.distributeCount}, Consecutive Count ${this.consecutiveCount}`)
        // let bestPopulation = this.fitness.findIndex()
        // console.log(this.plot)
    }

    listAllSchedules = async () => {
        try {
            let options = { 
                order: [
                    ['created_at', 'DESC']
                ],
            };

            const allData = await Schedule.findAll({
                where: {
                    mass_name: {
                        [Op.in]: ['Misa Sabtu', 'Misa Minggu']
                    }
                }
            })

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_FETCHED_ALL, allData)
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    listMonthlySchedule = async (month: string, year: string, church_id: string, user_id: string) => {
        try {
            if (!church_id) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'ID Gereja harus diisi');
            }
            if (!month) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Bulan harus diisi');
            }
            if (!year) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Tahun harus diisi');
            }
            const startDate = new Date(Number(year), Number(month) - 1, 1)
            const endDate = new Date(Number(year), Number(month), 1)

            let schedules = await Schedule.findAll({
                where: {
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    },
                    church_id: church_id
                },
                include: [
                    {
                        model: ProdeaconSchedule,
                        include: [
                            {
                                model: User,
                                as: 'prodeacons',
                                attributes: {
                                    include: []
                                }
                            }
                        ],
                    },
                ],
                order: [['date', 'ASC']]
            })

            let formatted_schedules = schedules.map(item => ({
                ...item.toJSON(),
                prodeacons_count: item.prodeacon_schedules.map(prodeacon => ({
                    ...prodeacon.prodeacons.toJSON(),
                    mass_coordinator: prodeacon.mass_coordinator
                })).filter(prodeacon => prodeacon.mass_coordinator !== true).length
            }))

            for(let i = 0; i < formatted_schedules.length; i++) {
                delete formatted_schedules[i].prodeacon_schedules
            }

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_FETCHED_ALL, formatted_schedules)

        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getScheduleById = async (id: string) => {
        try {
            // const schedule = await Schedule.findOne({
            //     where: {
            //         id: id,
            //     },
            //     include: [
            //         {
            //             model: User,
            //             as: 'prodeacons' ,
            //             attributes: {
            //                 exclude: ['email', 'password', 'email_verified', 'address', 
            //                     'phone_number', 'role_id', 'dob', 'birthplace', 'province', 'city', 'district', 
            //                     'sub_district', 'zipcode', 'is_pwd_resetted', 'created_at', 
            //                     'updated_at', 'deleted_at'],
            //                 include:[[sequelize.literal('"prodeacons->prodeacon_schedule"."mass_coordinator"'), 'mass_coordinator']]
            //             },
            //             through: {
            //                 attributes: []
            //             }
            //         }
            //     ],
            // })

            const schedule = await Schedule.findOne({
                where: { id: id },
                include: [
                    {
                        model: ProdeaconSchedule,
                        include: [
                            {
                                model: User,
                                as: 'prodeacons',
                                attributes: {
                                    exclude: ['email', 'password', 'email_verified', 'address', 
                                            'phone_number', 'role_id', 'dob', 'birthplace', 'province', 'city', 'district', 
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
            let formatted_schedule = {
                ...schedule.toJSON(),
                church_name: schedule.church.name,
                prodeacons:  schedule.prodeacon_schedules.map(item => ({
                    ...item.prodeacons.toJSON(),
                    mass_coordinator: item.mass_coordinator
                })) 
            }

            delete formatted_schedule.prodeacon_schedules
            delete formatted_schedule.church

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_FETCHED_SINGLE, formatted_schedule)

        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    getScheduleByUserId = async (id: string, month: string, year: string) => {
        try {
            if (!month) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Bulan harus diisi');
            }
            if (!year) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Tahun harus diisi');
            }

            const startDate = new Date(Number(year), Number(month) - 1, 1)
            const endDate = new Date(Number(year), Number(month), 1)

            const user = await User.findOne({
                where: { id: id }
            })

            if (!user) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, responseMessageConstant.USER_404_NOT_FOUND)
            }

            let schedules = await Schedule.findAll({
                where: { 
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
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

            let formatted_schedules = schedules.map(item => ({
                ...item.toJSON(),
                church_name: item.church.name,
                prodeacons: item.prodeacon_schedules.map(prodeacon => ({
                    ...prodeacon.prodeacons.toJSON(),
                    mass_coordinator: prodeacon.mass_coordinator
                })),
                prodeacons_count: item.prodeacon_schedules.map(prodeacon => ({
                    ...prodeacon.prodeacons.toJSON(),
                    mass_coordinator: prodeacon.mass_coordinator
                })).filter(prodeacon => prodeacon.mass_coordinator !== true).length
            }))

            for(let i = 0; i < formatted_schedules.length; i++) {
                if (formatted_schedules[i].prodeacons.some(item => item.id === id)) {
                    formatted_schedules[i].flag = true
                } else {
                    formatted_schedules[i].flag = false
                }
                delete formatted_schedules[i].prodeacon_schedules
                delete formatted_schedules[i].church
            }

            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_FETCHED_ALL, formatted_schedules)

        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    createSchedule = async (user: IUser, scheduleBody: ISchedule) => {
        try {
            let schedule
            const prodeaconSchedules: any = []

            scheduleBody.auto_generated = null
            scheduleBody.last_update_by = user.id

            const { message, flag } = this.prodeaconsValidation(scheduleBody)

            if (flag) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            await sequelize.transaction(async (t) =>{
                try {
                    schedule = await Schedule.create(scheduleBody, {
                        transaction: t,
                    })

                    for (let i = 0; i <  scheduleBody.prodeacons.length; i++) {
                        const temp = {
                            schedule_id: schedule.id,
                            user_id: scheduleBody.prodeacons[i].id,
                            mass_coordinator: scheduleBody.prodeacons[i].mass_coordinator
                        }
                        prodeaconSchedules.push(temp)
                    }
                    await ProdeaconSchedule.bulkCreate(prodeaconSchedules, { transaction: t })
                    
                } catch (e) {
                    throw e
                }
            }) 

            schedule = schedule.toJSON();

            return responseHandler.returnSuccess(httpStatus.CREATED, responseMessageConstant.SCHEDULE_201_CREATED, schedule);
        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    createMonthlySchedule = async (userType: IUser, scheduleBody: any) => {
        let t = await sequelize.transaction()
        try {
            const today = new Date(scheduleBody.year, scheduleBody.month - 1);
            const startOfMonthDate = startOfMonth(today);
            const endOfMonthDate = endOfMonth(today);
            const tempDate = new Date(startOfMonthDate)
            const sevenDaysBefore = new Date(tempDate.getTime() - 7 * 24 * 60 * 60 * 1000)
            let generatedSchedules, regenerateSchedule = false

            let role = await Role.findOne({
                where: { id: userType.role_id }
            })
            
            // To check whether this month schedule has been generated
            // To get this month schedules in both churches
            let allSchedules =  await Schedule.findAll({
                where: {
                    date: { 
                        [Op.between]: [sevenDaysBefore, endOfMonthDate] 
                    },
                },
                include: [
                    {
                        model: User,
                        as: 'prodeacons' ,
                        attributes: {
                            exclude: ['email', 'password', 'active', 'email_verified', 'address', 
                                'phone_number', 'role_id', 'dob', 'birthplace', 'province', 'city', 'district', 
                                'sub_district', 'zipcode', 'preferential_schedules', 'is_pwd_resetted', 'created_at', 
                                'updated_at', 'deleted_at'],
                            include:[[sequelize.literal('"prodeacons->prodeacon_schedule"."mass_coordinator"'), 'mass_coordinator']]
                        },
                        through: {
                            attributes: []
                        }
                    }
                ],
                order: [['date', 'ASC']]
            })            

            // To filter out this month schedule on the requested schedule
            // let thisMonthSchedules = allSchedules.filter(schedule => (schedule.church_id === scheduleBody.church_id) &&
            //                                                             (new Date(schedule.date).getMonth() === scheduleBody.month))

            let firstChurchSchedules = allSchedules.filter(schedule => (schedule.church_id === scheduleBody.church_id) &&
                                                                        (new Date(schedule.date).getMonth() === scheduleBody.month - 1))
            
            let secondChurchSchedules = allSchedules.filter(schedule => (schedule.church_id !== scheduleBody.church_id && schedule.auto_generated !== null) &&
                                                                        (new Date(schedule.date).getMonth() === scheduleBody.month - 1))
            // To filter out weekend schedules
            const firstChurchAutoSchedules = firstChurchSchedules.filter(schedule => schedule.auto_generated !== null)
            const firstChurchAutoSchedulesIds = firstChurchAutoSchedules.map(schedule => schedule.id)
            // const thisMonthAutoSchedules = thisMonthSchedules.filter(item => item.auto_generated !== null)
            // const thisMonthAutoSchedulesIds = thisMonthAutoSchedules.map((item) => item.id)

            
            // If the generator is admin and he/she wants to re generate, then it won't be allowed
            if (role.level === 1 && firstChurchAutoSchedules.length !== 0) {
                if (firstChurchAutoSchedules[0].date.getMonth() === today.getMonth()) {
                    return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Jadwal bulan ini sudah dibuat');
                }
            }

            // If the generator is superadmin and the current month schedule has been generated
            if (role.level === 0 && firstChurchSchedules.length !== 0) {
                regenerateSchedule = true
            }
            
            // If the user want to regenerate schedule
            // and the schedules have been generated before
            if (regenerateSchedule) {
                await ProdeaconSchedule.destroy({
                    where: {
                        schedule_id: { [Op.in]: firstChurchAutoSchedulesIds }
                    },
                    transaction: t
                })
                await Schedule.destroy({
                    where:{
                        id: { [Op.in]: firstChurchAutoSchedulesIds }
                    },
                    transaction: t
                })
            }

            // To get the current month dates
            const daysInCurrentMonth = eachDayOfInterval({
                start: startOfMonthDate,
                end: endOfMonthDate
            });

            let firstChurchMonthlySchedule: any = []
            const daysData = ChurchSchedule.rawAttributes.day.values;
            const schedules = await ChurchSchedule.findAll({
                where: { church_id: scheduleBody.church_id }
            })

            // Looping each day in a month
            for(let i = 0; i <  daysInCurrentMonth.length; i++) {
                const currentDayIndex = daysInCurrentMonth[i].getDay() // Getting the current day (0 is Sunday, 1 is Monday, etc)
                const currentDay = daysData[currentDayIndex]

                const schedule = schedules.filter((item) => item.day === currentDay)

                schedule.map((item) => {
                    const { mass_name, auto_generated } = (item.day === 'Sabtu' &&  item.time > '12:00:00') ? 
                                                            { mass_name: 'Misa Sabtu', auto_generated: today} : 
                                                            item.day === 'Minggu' ? { mass_name:'Misa Minggu', auto_generated: today} : 
                                                            { mass_name: 'Misa Harian', auto_generated: null }
                    
                    const temp = {
                        church_id: scheduleBody.church_id,
                        date: convertTimezone(daysInCurrentMonth[i], '', 'UTC'),
                        day: currentDay,
                        time: item.time,
                        mass_name: mass_name,
                        quota: item.quota,
                        min_mass_coordination_type: item.min_mass_coordination_type,
                        last_update_by: userType.id,
                        auto_generated: auto_generated,
                        church_schedule_id: item.id
                    }
                    
                    firstChurchMonthlySchedule.push(temp)
                })
            }

            if (regenerateSchedule) {
                firstChurchMonthlySchedule = firstChurchMonthlySchedule.filter((item) => item.auto_generated !== null)
            }

            let weekendSchedule

            // Creating schedules in database
            generatedSchedules = await Schedule.bulkCreate(firstChurchMonthlySchedule, {
                transaction: t,
            })

            weekendSchedule = generatedSchedules.filter((item) => item.auto_generated !== null).map(item => {
                return { ...item.toJSON(), prodeacons: [] }
            })
            // if (regenerateSchedule) {
            //     thisMonthSchedules = thisMonthSchedules.filter(item => item.auto_generated === null).concat(weekendSchedule)
            // } 

            // Getting All User
            let allUser = await User.findAll({
                where: {
                    active: true,
                    user_registration_number: { [Op.gt]: 0 }
                },
                order: [['user_registration_number', 'ASC']]
            })

            allUser = allUser.map(user => {
                return { ...user.toJSON(), count: 0 }
            })

            let prevWeekendSchedule = allSchedules.filter(schedule => (schedule.church_id === scheduleBody.church_id) &&
                                                                (new Date(schedule.date).getMonth() !== scheduleBody.month - 1))
                                                    .filter(schedule => schedule.auto_generated !== null).map(item => item.toJSON())

            firstChurchSchedules = [ ...prevWeekendSchedule, ...weekendSchedule ]
            let week = 0

            weekendSchedule = weekendSchedule.map((item, idx) => {
                if (idx !== 0 && weekendSchedule[idx].mass_name === 'Misa Sabtu' && weekendSchedule[idx-1].mass_name === 'Misa Minggu') {
                    week++
                }

                if (idx === 0  && new Date(weekendSchedule[idx].date).getMonth() === scheduleBody.month - 1) {
                    week = 1
                }
                
                return {
                    ...item,
                    week: week,
                    day: item.mass_name === 'Misa Sabtu' ? 0 : 1
                }
            })

            week = 0
            firstChurchSchedules = firstChurchSchedules.map((item, idx) => {
                if (idx !== 0 && firstChurchSchedules[idx].mass_name === 'Misa Sabtu' && firstChurchSchedules[idx-1].mass_name === 'Misa Minggu') {
                    week++
                }
                
                if (idx === 0  && new Date(firstChurchSchedules[idx].date).getMonth() === scheduleBody.month - 1) {
                    week = 1
                }
                
                return {
                    ...item,
                    week: week,
                    day: item.mass_name === 'Misa Sabtu' ? 0 : 1
                }
            }).filter(item => item.auto_generated !== null)

            week = 0
            secondChurchSchedules = secondChurchSchedules.map((item, idx) => {
                if (idx !== 0 && secondChurchSchedules[idx].mass_name === 'Misa Sabtu' && secondChurchSchedules[idx-1].mass_name === 'Misa Minggu') {
                    week++
                }
                
                if (idx === 0  && new Date(secondChurchSchedules[idx].date).getMonth() === scheduleBody.month - 1) {
                    week = 1
                }
                
                return {
                    ...item.toJSON(),
                    week: week,
                    day: item.mass_name === 'Misa Sabtu' ? 0 : 1
                }
            }).filter(item => item.auto_generated !== null)

            let thisMonthSchedules = [ ...firstChurchSchedules, ...secondChurchSchedules ]    
            // thisMonthSchedules.map(schedule => schedule.prodeacons.map(user => {
            //     let userIndex = allUser.findIndex(item => item.id === user.id)
            //     allUser[userIndex].schedules.push(schedule)
            //     allUser[userIndex].count += 1
            // }))                

            // Filtering the active user
            let unavailableUser: any = []       
            // Declaring all value for genetic algorithm
            this.thisMonthSchedules = thisMonthSchedules
            this.weekendSchedule = weekendSchedule
            this.scheduleMaxBit = weekendSchedule.length.toString(2).length
            this.userMaxBit = allUser.length.toString(2).length
            this.individualBit = this.scheduleMaxBit + this.userMaxBit + 1
            this.individualBit = this.userMaxBit
            this.activeUser = allUser
            this.population = []
            this.bestFitness = 0
            this.preferenceCount = 0
            this.coordinatorCount = 0
            this.distributeCount = 0
            this.consecutiveCount = 0
            this.plot = []
            this.geneticSchedule()
            // Assigning random user to the schedule
            // getting one week before
            // week = 0
            // let todayUser: any = []
            // let todayUserId: any = []
            // for (let i = 0; i < weekendSchedule.length; i++) {

            //     if (i !== 0 && new Date(weekendSchedule[i].date).getTime() !== new Date(weekendSchedule[i - 1].date).getTime()) {
            //         todayUser = []
            //         todayUserId = []
            //     }
            //     const quota = weekendSchedule[i].quota
            //     const minAman = Math.ceil(weekendSchedule[i].quota * 0.7)
            //     let temp
                
            //     // Previous Week
                // const prevWeek = thisMonthSchedules.filter(schedule => schedule.week === week)
                // const prevWeekUser = prevWeek.flatMap(item => item.prodeacons)
                // const prevWeekFirstChurch = prevWeek.filter(schedule => schedule.church_id === scheduleBody.church_id)
                // const prevWeekFirstChurchId = prevWeekFirstChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)
                // const prevWeekSecondChurch = prevWeek.filter(schedule => schedule.church_id !== scheduleBody.church_id)
                // const prevWeekSecodChurchId = prevWeekSecondChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)
                
            //     // Current Week
            //     const currWeek = thisMonthSchedules.filter(schedule => schedule.week === weekendSchedule[i].week)
            //     const currWeekUser = currWeek.flatMap(item => item.prodeacons)
            //     const currWeekUserId = currWeekUser.map(item => item.id)
            //     const currWeekFirstChurch = currWeek.filter(schedule => schedule.church_id === scheduleBody.church_id)
            //     const currWeekFirstChurchId = currWeekFirstChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)
            //     const currWeekSecondChurch = currWeek.filter(schedule => schedule.church_id !== scheduleBody.church_id)
            //     const currWeekSecondChurchId = currWeekSecondChurch.map(schedule => schedule.prodeacons.map(user => user)).map(user => user.id)

            //     if (i !== 0 && weekendSchedule[i].mass_name === 'Misa Sabtu' && weekendSchedule[i-1].mass_name === 'Misa Minggu') {
            //         // unavailableUser = []
            //         week++
            //     }

            //     unavailableUser = [ ...prevWeekUser, ...currWeekUser ]
            //     // throw new Error()
            //     let unavailableUserId = unavailableUser.map(user => user.id)

            //     let amanUser = allUser.filter(user => user.status === 'aman' && !unavailableUserId.includes(user.id))
            //     let tanggaUser = allUser.filter(user => user.status === 'tangga' && !unavailableUserId.includes(user.id))
            //     let usiaUser = allUser.filter(user => user.status === 'usia' && !unavailableUserId.includes(user.id))

            //     // Getting all users on the current preferenced schedule
            //     let userOnPreferencedSchedule = allUser.filter(item => item.preferential_schedules.includes(weekendSchedule[i].church_schedule_id))
            //     let coordinatorUser = userOnPreferencedSchedule.filter(item => item.mass_coordination_flag && item.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //     let coordinator

            //     // To check whether he/she was in the previous week schedule
            //     if (coordinatorUser.length !== 0) {
            //         // Finding user that fits the requirement to become a coordinator
            //         let amanCoordinator = coordinatorUser.filter(user => (user.status === 'aman' && user.count < 2) && (!currWeekUserId.includes(user.id)))
            //         let usiaCoordinator = coordinatorUser.filter(user => (user.status === 'usia' && user.count < 2) && (!currWeekUserId.includes(user.id)))
            //         let tanggaCoordinator = coordinatorUser.filter(user => (user.status === 'tangga' && user.count < 2) && (!currWeekUserId.includes(user.id)))
            //     // To check whether he/she was in the previous week schedule
            //     if (coordinatorUser.length !== 0) {
            //         // Finding user that fits the requirement to become a coordinator
            //         let amanCoordinator = coordinatorUser.filter(user => (user.status === 'aman' && user.count < 2) && (!currWeekUserId.includes(user.id)))
            //         let usiaCoordinator = coordinatorUser.filter(user => (user.status === 'usia' && user.count < 2) && (!currWeekUserId.includes(user.id)))
            //         let tanggaCoordinator = coordinatorUser.filter(user => (user.status === 'tangga' && user.count < 2) && (!currWeekUserId.includes(user.id)))
                    
            //         if (amanCoordinator.length !== 0) {
            //             // If there's 'aman' candidate for the coordinator
            //             let random = Math.floor(Math.random() * amanCoordinator.length)
            //             coordinator = amanCoordinator[random]
            //             amanUser = amanUser.filter(user => user.id !== coordinator.id)
            //         } else if (usiaCoordinator.length !== 0) {
            //             // If there's 'usia' candidate for the coordinator
            //             let random = Math.floor(Math.random() * usiaCoordinator.length)
            //             coordinator = usiaCoordinator[random]
            //             usiaUser = usiaUser.filter(user => user.id !== coordinator.id)
            //         } else if (tanggaCoordinator.length !== 0) {
            //             // If there's 'tangga' candidate for the coordinator
            //             let random = Math.floor(Math.random() * tanggaCoordinator.length)
            //             coordinator = tanggaCoordinator[random]
            //             tanggaUser = tanggaUser.filter(user => user.id !== coordinator.id)
            //         } else {
            //             if (unavailableUser.length !== 0) {
            //                 // If there's no candidate for the coordinator
            //                 let unavailableCoordinator = unavailableUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                             .filter(user => user.count < 2)
            //                                                             .filter(user => !currWeekUserId.includes(user.id))
            //                 let random
            //                 if (unavailableCoordinator.length !== 0) {
            //                     random = Math.floor(Math.random() * unavailableCoordinator.length)
            //                 } else {
            //                     unavailableCoordinator = unavailableUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                             .filter(user => !currWeekUserId.includes(user.id))
            //                     if (unavailableCoordinator.length !== 0) {
            //                         random = Math.floor(Math.random() * unavailableCoordinator.length)
            //                     } else {
            //                         unavailableCoordinator = unavailableUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                                 .filter(user => !currWeekSecondChurchId.includes(user.id) && user.count < 2)
            //                                                                 .filter(user => !todayUserId.includes(user.id))
                                    
            //                         random = Math.floor(Math.random() * unavailableCoordinator.length)
            //                     }
            //                 }
            //                 coordinator = unavailableCoordinator[random]
            //             } else {
            //                 // If there's no candidate for the coordinator
            //                 let unavailableCoordinator = allUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                     .filter(user => user.count < 2)
            //                                                     .filter(user => !currWeekUserId.includes(user.id))
            //                 let random
            //                 if (unavailableCoordinator.length !== 0) {
            //                     random = Math.floor(Math.random() * unavailableCoordinator.length)
            //                 } else {
            //                     unavailableCoordinator = allUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                             .filter(user => !currWeekUserId.includes(user.id))
            //                     if (unavailableCoordinator.length !== 0) {
            //                         random = Math.floor(Math.random() * unavailableCoordinator.length)
            //                     } else {
            //                         unavailableCoordinator = allUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                                                 .filter(user => currWeekUserId.includes(user.id) && !todayUserId.includes(user.id))
                                    
            // //                         random = Math.floor(Math.random() * unavailableCoordinator.length)
            // //                     }
            // //                 }
            // //                 coordinator = unavailableCoordinator[random]
            // //             }
            // //         }

            //         let temp = {
            //             schedule_id: weekendSchedule[i].id,
            //             user_id: coordinator.id,
            //             mass_coordinator: true
            //         }
            //         prodeaconSchedules.push(temp)
            //     } else {
            //         coordinatorUser = allUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                     .filter(user => user.count < 2)
            //                                     .filter(user => !currWeekUserId.includes(user.id))
                    
            //         let random
            //         if (coordinatorUser.length !== 0) {
            //             random = Math.floor(Math.random() * coordinatorUser.length)
            //         } else {
            //             coordinatorUser = allUser.filter(user => user.mass_coordination_flag && user.mass_coordination_type >= weekendSchedule[i].min_mass_coordination_type)
            //                                     .filter(user => !currWeekUserId.includes(user.id))

            //             random = random = Math.floor(Math.random() * coordinatorUser.length)
            //         }

            //         coordinator = coordinatorUser[random]

            //         let temp = {
            //             schedule_id: weekendSchedule[i].id,
            //             user_id: coordinator.id,
            //             user_status: coordinator.status,
            //             mass_coordinator: true
            //         }
            //         prodeaconSchedules.push(temp)
            //     }

                // let j = 0
                // let amanCount = 0
                // let availableUser = allUser.filter(user => (user.preferential_schedules.includes(weekendSchedule[i].church_schedule_id) && !unavailableUserId.includes(user.id))  && user.count < 2)
                //                             .filter(user => !currWeekUserId.includes(user.id) && !todayUserId.includes(user.id))
                // while (j < quota) {
                //     let temp
                //     if (j === 0) {
                //         temp = {
                //             schedule_id: weekendSchedule[i].id,
                //             user_id: coordinator.id,
                //             mass_coordinator: false
                //         }
                //     } else {
                //         let assignedUser
                //         if (amanCount < minAman) {
                //             // If the 'aman' has not fulfilled the quota
                //             let aman = amanUser.filter(user => user.preferential_schedules.includes(weekendSchedule[i].church_schedule_id) && user.count < 2)
                //                                 .filter(user => !currWeekUserId.includes(user.id))
                //             if (aman.length !== 0) {
                //                 let random = Math.floor(Math.random() * aman.length)
                //                 assignedUser = aman[random]
                //                 amanUser = amanUser.filter(item => item.id !== assignedUser.id)
                //             } else {
                //                 if (unavailableUser.length !== 0) {
                //                     let amanUnavailable = unavailableUser.filter(user => user.status === 'aman' && user.count < 2)
                //                                                             .filter(user => !currWeekUserId.includes(user.id))                                
                //                     let random
                //                     if (amanUnavailable.length !== 0) {
                //                         random = Math.floor(Math.random() * amanUnavailable.length)
                //                     } else {
                //                         amanUnavailable = unavailableUser.filter(user => user.status === 'aman' && user.count < 2)
                //                                                             .filter(user => !currWeekSecondChurchId.includes(user.id) && !todayUserId.includes(user.id))
                //                         random = Math.floor(Math.random() * amanUnavailable.length)
                //                         if (amanUnavailable.length === 0) {
                //                             amanUnavailable = unavailableUser.filter(user => user.status === 'aman').filter(user => !currWeekSecondChurchId.includes(user.id) && !todayUserId.includes(user.id))
                //                             random = Math.floor(Math.random() * amanUnavailable.length)
                //                         }
                //                     }
                //                     assignedUser = amanUnavailable[random]
                //                 } else {
                //                     let amanUnavailable = allUser.filter(user => user.status === 'aman'  && user.count < 2)
                //                                                     .filter(user => !currWeekUserId.includes(user.id) && !todayUserId.includes(user.id))                                
                //                     let random
                //                     if (amanUnavailable.length !== 0) {
                //                         random = Math.floor(Math.random() * amanUnavailable.length)
                //                     } else {
                //                         amanUnavailable = allUser.filter(user => user.status === 'aman' && user.count < 2)
                //                                                     .filter(user => !currWeekSecondChurchId.includes(user.id) && !todayUserId.includes(user.id))
                //                         if (amanUnavailable.length !== 0) {
                //                             random = Math.floor(Math.random() * amanUnavailable.length)
                //                         } else {
                //                             amanUnavailable = allUser.filter(user => user.status === 'aman')
                //                                                         .filter(user => !currWeekSecondChurchId.includes(user.id) && !todayUserId.includes(user.id))
                //                             random = Math.floor(Math.random() * amanUnavailable.length)
                //                         }
                //                     }
                //                     assignedUser = amanUnavailable[random]
                //                 }
                //             }
                //             amanCount++
                //         } else {
                //             // If the 'aman' has fulfilled the quota
                //             let tempUsers = allUser.filter(user => user.count < 2 && !currWeekUserId.includes(user.id))
                //             if (tempUsers.length !== 0) {
                //                 let random = Math.floor(Math.random() * tempUsers.length)
                //                 assignedUser = tempUsers[random]
                //             } else {
                //                 tempUsers = allUser.filter(user => user.count < 2 && !currWeekSecondChurchId.includes(user.id)).filter(user => !todayUserId.includes(user.id))
                //                 if (tempUsers.length !== 0) {
                //                     let random = Math.floor(Math.random() * tempUsers.length)
                //                     assignedUser = tempUsers[random]
                //                 } else {
                //                     tempUsers = allUser.filter(user =>  !todayUserId.includes(user.id) && !currWeekSecondChurchId.includes(user.id))
                //                     if (tempUsers.length !== 0) {
                //                         let random = Math.floor(Math.random() * tempUsers.length)
                //                         assignedUser = tempUsers[random]
                //                     } else {
                //                         tempUsers = allUser.filter(user =>  !todayUserId.includes(user.id) && currWeekFirstChurchId.includes(user.id))
                //                         let random = Math.floor(Math.random() * tempUsers.length)
                //                         assignedUser = tempUsers[random]
                //                     }
                //                 }
                //             }
                //         }
                //         temp = {
                //             schedule_id: weekendSchedule[i].id,
                //             user_id: assignedUser.id,
                //             mass_coordinator: false
                //         }
                //         unavailableUser.push(assignedUser)
                //     }

            //         // Updating the count of a user
            //         let userIndex = allUser.findIndex(item => item.id === temp.user_id)
            //         allUser[userIndex].count += 1

                    // Updating this month schedules
            //         let scheduleIndex = thisMonthSchedules.findIndex(item => item.id === temp.schedule_id)
            //         thisMonthSchedules[scheduleIndex].prodeacons.push(allUser[userIndex])
            //         prodeaconSchedules.push(temp)
            //         currWeekUser.push(allUser[userIndex])
            //         currWeekUserId.push(allUser[userIndex].id)
            //         currWeekFirstChurch.push(allUser[userIndex])
            //         currWeekFirstChurchId.push(allUser[userIndex].id)
            //         j++
            //     }
            // }

            let finalResult = this.decode()

            await ProdeaconSchedule.bulkCreate(finalResult, {
                transaction: t
            })

            await t.commit()
            
            return responseHandler.returnSuccess(httpStatus.CREATED, responseMessageConstant.MONTHLY_SCHEDULE_201_CREATED, generatedSchedules);
        } catch (e) {
            console.log(e)
            await t.rollback()
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

    updateSchedule = async(id: string, scheduleBody: ISchedule, user: IUser) => {
        try {
            let schedule = await Schedule.findOne({
                where: { id: id }
            })

            if (!schedule) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Jadwal tidak ditemukan');
            }

            const { message, flag } = this.prodeaconsValidation(scheduleBody)

            if (flag) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, message);
            }

            await sequelize.transaction(async(t) => {
                let updatedSchedule = scheduleBody.prodeacons.map((item) => {
                    return { 
                        schedule_id: Number(id),
                        user_id: item.id,
                        mass_coordinator: item.mass_coordinator
                    }
                })
    
                await ProdeaconSchedule.destroy({
                    where: {
                        schedule_id: id
                    },
                    transaction: t
                })
    
                await Schedule.update(
                    {
                        quota: scheduleBody.quota,
                        last_update_by: user.id
                    },
                    { 
                        where: { id: id },
                        transaction: t
                    }
                )
    
                await ProdeaconSchedule.bulkCreate(updatedSchedule, { transaction: t })
            })
            


            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_UPDATED);
        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY)
        }
    }

    deleteSchedule = async(id: string) => {
        try {
            let schedule = await Schedule.findOne({
                where: { id: id }
            })

            if (!schedule) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Jadwal ini tidak ada');
            }

            await sequelize.transaction(async(t) => {    
                await ProdeaconSchedule.destroy({
                    where: {
                        schedule_id: id
                    },
                    transaction: t
                })
    
                await Schedule.destroy({
                    where: {
                        id: id
                    },
                    transaction: t
                })    
            })
            


            return responseHandler.returnSuccess(httpStatus.OK, responseMessageConstant.SCHEDULE_200_DELETED);
        } catch (e) {
            console.log(e)
            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY)
        }
    }

    downloadExcel = async(res, church_id: string, month: string, year: string) => {
        try {
            if (!month) {
                // return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Bulan harus diisi');
                throw {
                    ec: httpStatus.BAD_REQUEST,
                    msg: 'Bulan harus diisi',
                }
            }

            if (!year) {
                // return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Tahun harus diisi');
                throw {
                    ec: httpStatus.BAD_REQUEST,
                    msg: 'Bulan harus diisi',
                }
            }

            if (!church_id) {
                // return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Tahun harus diisi');
                throw {
                    ec: httpStatus.BAD_REQUEST,
                    msg: 'ID Gereja harus diisi',
                }
            }

            const startDate = new Date(Number(year), Number(month) - 1, 1)
            const endDate = new Date(Number(year), Number(month), 1)

            const user = await User.findAll({
                where: { user_registration_number: { [Op.gt]: 0 } },
                order: [['user_registration_number', 'ASC']]
            })

            if (user.length === 0) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, responseMessageConstant.USER_404_NOT_FOUND)
            }

            let schedules = await Schedule.findAll({
                where: { 
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }, 
                    church_id: church_id
                },
                include: [
                    {
                        model: ProdeaconSchedule,
                        include: [
                            {
                                model: User,
                                as: 'prodeacons',
                                attributes: {
                                    exclude: ['email', 'password', 'email_verified', 'address', 
                                            'phone_number', 'role_id', 'dob', 'birthplace', 'province', 'city', 'district', 
                                            'sub_district', 'zipcode', 'is_pwd_resetted', 'created_at', 
                                            'updated_at', 'deleted_at'],
                                }
                            }
                        ]
                    },
                    {
                        model: Church
                    }
                ],
                order: [
                    ['date', 'ASC'],
                    ['time', 'ASC']
                ]
            })

            let formatted_schedules = schedules.map(item => ({
                ...item.toJSON(),
                church_name: item.church.name,
                prodeacons: item.prodeacon_schedules.map(prodeacon => ({
                    ...prodeacon.prodeacons.toJSON(),
                    mass_coordinator: prodeacon.mass_coordinator
                }))
            }))

            for(let i = 0; i < formatted_schedules.length; i++) {
                delete formatted_schedules[i].prodeacon_schedules
                delete formatted_schedules[i].church
            }

            const excel = require('exceljs')
            let columnCount = 4 + formatted_schedules.length
            const getColumnCell = (num: number) => {
                let column = ''
                while (num > 0) {
                    let remainder = (num - 1) % 26;
                    column = String.fromCharCode(65 + remainder) + column;
                    num = Math.floor((num - 1) / 26);
                }
                return column
            }

            let workbook = new excel.Workbook()
            let worksheet = workbook.addWorksheet(`${startDate.toLocaleString('id-ID', { month: 'short' } )} ${startDate.getFullYear()}`)
            // To merge the first row of the excel
            worksheet.mergeCells(`A1:${getColumnCell(columnCount)}1`);
            worksheet.getCell('A1').value = `${startDate.toLocaleString('id-ID', { month: 'long' } )} ${startDate.getFullYear()}`;
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
            
            // To mgerge the No. Registrasi cell
            let registrationCell = worksheet.getCell('A2')
            worksheet.getColumn(1).width = 15;
            worksheet.mergeCells('A2:A3');
            registrationCell.value = 'No. Registrasi';
            registrationCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // To mgerge the Nama cell
            let nameCell = worksheet.getCell('B2')
            worksheet.getColumn(2).width = 20;
            worksheet.mergeCells('B2:B3');
            nameCell.value = 'Nama';
            nameCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // To mgerge the No. Whatsapp cell
            let phoneCell = worksheet.getCell('C2')
            worksheet.getColumn(3).width = 20;
            worksheet.mergeCells('C2:C3');
            phoneCell.value = 'No. Whatsapp';
            phoneCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // To merge the Summary Schedules cell
            let summaryCell = worksheet.getCell('D2') 
            worksheet.getColumn(4).width = 30;
            worksheet.mergeCells('D2:D3');
            summaryCell.value = 'Summary Schedules';
            summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // To input user's registration number, user's name, and user's phone number
            for (let i = 0; i < user.length; i++) {
                worksheet.getCell(`A${i + 4}`).value = String(user[i].user_registration_number).padStart(3, '0')
                worksheet.getCell(`B${i + 4}`).value = user[i].nick_name
                worksheet.getCell(`C${i + 4}`).value = user[i].phone_number
            }
            
            // Assigning date and time
            let start = 5
            let finish = start
            let currentDay = formatted_schedules[0].date
            for (let i = 0; i < formatted_schedules.length; i++) {
                let currentDayCell = worksheet.getCell(`${getColumnCell(start)}2`)
                if (new Date(formatted_schedules[i].date).getTime() === new Date(currentDay).getTime()) {
                    // If the date has not changed
                    if (i !== 0) {
                        finish++
                    }

                    if (i === formatted_schedules.length - 1) {
                        currentDayCell.value = currentDay.getDate()
                        currentDayCell.alignment = { vertical: 'middle', horizontal: 'center' };
                        worksheet.mergeCells(`${getColumnCell(start)}2:${getColumnCell(finish)}2`)
                    }
                } else {
                    // If the date has changed
                    currentDayCell.value = currentDay.getDate()
                    currentDayCell.alignment = { vertical: 'middle', horizontal: 'center' };
                    worksheet.mergeCells(`${getColumnCell(start)}2:${getColumnCell(finish)}2`)
                    currentDay = formatted_schedules[i].date
                    start = finish + 1
                    finish = start
                }

                // Assigning time cell
                worksheet.getCell(`${getColumnCell(i + 5)}3`).value = formatted_schedules[i].time.slice(0,5)
                worksheet.getColumn(i + 5).width = 5

                // Assigning prodeacon schedules
                const prodeacons = formatted_schedules[i].prodeacons
                for (let j = 0; j < prodeacons.length; j++) {
                    let userIndex = user.findIndex(item => item.id === prodeacons[j].id)
                    let userCell = worksheet.getCell(`${getColumnCell(i + 5)}${userIndex + 4}`)
                    userCell.value = 'V'
                    userCell.alignment = { vertical: 'middle', horizontal: 'center' }
                    if (prodeacons[j].mass_coordinator) {
                        userCell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFE599' },
                        };
                    }
                    let userSummaryCell = worksheet.getCell(`D${userIndex + 4}`)
                    let currentDate = new Date(formatted_schedules[i].date).getDate()
                    let currentMonth = new Date(formatted_schedules[i].date).getMonth() + 1
                    let currentTime = formatted_schedules[i].time
                    userSummaryCell.value = (userSummaryCell ? userSummaryCell : '') + '\n' + 
                                            String(currentDate).padStart(2, '0') + '/' + String(currentMonth).padStart(2, '0') + ' -> ' + currentTime.slice(0, 5)
                                            + (prodeacons[j].mass_coordinator ? ' (Koor)' : '')
                    userSummaryCell.alignment = { wrapText: true }
                    worksheet.getCell(`${getColumnCell(start)}2`).alignment = { vertical: 'middle', horizontal: 'center' };
                }
            }

            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.font = {
                        size: 9, // Set font size
                    };
                });
            });

            return workbook

        } catch (e: any) {
            console.log(e)
            if (e.ec) {
                return responseHandler.returnError(e.ec, e.msg)
            }

            return responseHandler.returnError(httpStatus.BAD_GATEWAY, responseMessageConstant.HTTP_502_BAD_GATEWAY);
        }
    }

}