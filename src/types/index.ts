export const userRole = {
    admin : "admin",
    agent : "agent",
    user : "user",
} as const;

export type ROLES = "admin" | "agent" | "user";

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};