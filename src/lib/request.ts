export interface Request {
    tabId: number;
    requestId: string;
    method: "GET" | "POST";
    url: string;
    headers: any;
    body: string | null;
    timestamp: Date;
}

export function copyRequest(req: Request): Request {
    const headers: any = {};

    Object.entries(req.headers)
        .forEach(([name, value]) => headers[name] = value)

    return {
        ...req,
        headers,
    }
}
