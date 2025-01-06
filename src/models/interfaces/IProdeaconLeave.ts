export interface IProdeaconLeave {
  id: string;
  full_name: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  description: string;
  leave_type: string;
  created_at?: Date;
  updated_at?: Date;
}