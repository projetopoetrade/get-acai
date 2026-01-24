// src/types/auth.ts
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  } 
  
  export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
  }
  