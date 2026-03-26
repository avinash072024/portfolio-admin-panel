export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: User;
}
