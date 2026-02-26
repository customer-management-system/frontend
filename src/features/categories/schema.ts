import { z } from "zod";

export const categorySchema = z.object({
    id: z.string().optional(),
    nameEn: z.string().min(2, { message: "English name must be at least 2 characters." }),
    nameAr: z.string().min(2, { message: "Arabic name must be at least 2 characters." }),
    imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    status: z.enum(["active", "inactive", "archived"]),
    createdAt: z.date().optional(),
});

export type Category = z.infer<typeof categorySchema>;
