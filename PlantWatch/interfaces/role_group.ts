export interface RoleGroup {
  role_id: string;
  greenhouse_id: string | null;
  name: string;
  owner: boolean;
  view_plants: boolean;
  edit_plants: boolean;
  create_plants: boolean;
  delete_plants: boolean;
  view_devices: boolean;
  edit_devices: boolean;
  create_devices: boolean;
  delete_devices: boolean;
  log_activities: boolean;
}

export interface RoleInfo {
  name: string,
  desc: string
}
