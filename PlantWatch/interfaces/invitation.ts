export interface Invitation {
  sender_id: string;
  receiver_id: string;
  greenhouse_id: string;
  created_at: string;
}

export interface InvitationDisplay {
  greenhouse_id: string;
  greenhouse_name: string;
  sender_id: string;
  sender_name: string; // first_name + ' ' + last_name
  sender_email: string;
}