export const userRole = {
    admin : "admin",
    agent : "agent",
    user : "user",
} as const;

export type ROLES = "admin" | "agent" | "user";