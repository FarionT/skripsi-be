export default interface IChurchSchedule {
    id?: number;
    church_id: number;
    day: string;
    time: Date;
    quota: number;
    min_mass_coordination_type: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}