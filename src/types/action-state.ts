export type ActionState = {
    success?: boolean;
    message?: string;
    errors?: {
        [key: string]: string[];
    };
    formData?: Record<string, unknown>;
} | null;