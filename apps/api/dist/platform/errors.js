export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_REQUIRED');
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Access denied: insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}
export class NotFoundError extends AppError {
    constructor(resource, id) {
        const msg = id ? `${resource} with id '${id}' was not found` : `${resource} not found`;
        super(msg, 404, 'NOT_FOUND', { resource, id });
    }
}
export class ConflictError extends AppError {
    constructor(message, details) {
        super(message, 409, 'CONFLICT', details);
    }
}
export class RateLimitExceededError extends AppError {
    constructor(retryAfterSeconds = 60) {
        super(`Too many requests. Please retry after ${retryAfterSeconds} seconds.`, 429, 'RATE_LIMIT_EXCEEDED', {
            retry_after_seconds: retryAfterSeconds
        });
    }
}
//# sourceMappingURL=errors.js.map