export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: any;
    constructor(message: string, statusCode?: number, code?: string, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource: string, id?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string, details?: any);
}
export declare class RateLimitExceededError extends AppError {
    constructor(retryAfterSeconds?: number);
}
//# sourceMappingURL=errors.d.ts.map