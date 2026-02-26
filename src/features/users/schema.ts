import { z } from "zod";
import { UserRole } from "@/features/auth/authService";

export const userSchema = z.object({
    id: z.number().optional(),
    username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
    role: z.nativeEnum(UserRole),
    is_active: z.boolean().default(true),
});

export type User = z.infer<typeof userSchema> & {
    created_at?: string;
    updated_at?: string;
};

export interface UsersResponse {
    success: boolean;
    data: {
        users: User[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface UserResponse {
    success: boolean;
    data: User;
}

export interface MessageResponse {
    success: boolean;
    data: {
        message: string;
    };
}
