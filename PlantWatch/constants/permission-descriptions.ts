import { RoleInfo } from "@/interfaces/role_group";

export const colToRoleInfo: Record<string, RoleInfo> = {
  owner: {
    name: 'Owner',
    desc: 'Give the user permission to act as the owner of the greenhouse. Overrides all other permissions.'
  },
  view_plants: {
    name: 'View Plants',
    desc: 'Allow the user to view plants in this greenhouse.'
  },
  edit_plants: {
    name: 'Edit Plant Info',
    desc: 'Allow the user to edit the information of any plant in this greenhouse.'
  },
  create_plants: {
    name: 'Add Plants',
    desc: 'Allow the user to add new plants to the greenhouse.'
  },
  delete_plants: {
    name: 'Delete Plants',
    desc: 'Allow the user to delete plants from the greenhouse.'
  },
  view_devices: {
    name: 'View Devices',
    desc: 'Allow the user to view any devices linked to this greenhouse.'
  }, 
  edit_devices: {
    name: 'Edit Device Information',
    desc: 'Allow the user to edit the information for any devices linked to this greenhouse.'
  },
  create_devices: {
    name: 'Add Devices',
    desc: 'Allow the user to link new devices to this greenhouse.'
  },
  delete_devices: {
    name: 'Remove Devices',
    desc: 'Allow the user to disconnect devices from this greenhouse.'
  },
  log_activities: {
    name: 'Log Plant Activities',
    desc: 'Allow the user to add new entries to the activity log for plants.'
  },
}