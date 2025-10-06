export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  role: Role;
  allRole: string[];
  allowedRole: string[];
  company: any;
}

export interface Role {
  id: number;
  name: string;
}
export interface Company {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  email?: string;
  company: Company;
}

export interface UserDetail {
  allRole: string[];
  allowedRole: string[];
  company: any;
  role: Role;
  token: string;
  user: User;
}
