// src/types.d.ts

export {};

declare global {
  type UserRole = "admin" | "manager" | "employee";

  interface User {
    id?: string;
    role: UserRole;
    isAuthenticated: boolean;
  }
}
