export interface ISchedule {
  id: number;
  date: Date;
  church_id: number;
  time: string;
  quota: number;
  min_mass_coordination_type: string;
  auto_generated: Date | null;
  last_update_by: string;
  prodeacons: any[]
  created_at: Date;
  updated_at: Date;
}