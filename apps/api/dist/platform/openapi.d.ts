export interface OpenApiEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    tag: string;
    summary: string;
    description: string;
    authRequired?: boolean;
    role?: string;
    parameters?: Array<{
        name: string;
        in: 'query' | 'path' | 'header';
        required: boolean;
        description: string;
        type: string;
    }>;
    requestBody?: Record<string, unknown>;
    responses: Record<string, {
        description: string;
        schema?: Record<string, unknown>;
    }>;
}
export declare function generateOpenApiSpec(): Record<string, unknown>;
export declare function getApiDocsHtml(): string;
//# sourceMappingURL=openapi.d.ts.map