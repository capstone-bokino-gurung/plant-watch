export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  private: boolean;
  created_at: string;
  role_id: string;
}

export interface ProfileInfo {
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

