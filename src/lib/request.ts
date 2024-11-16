export interface Request {
    tabId: number;
    requestId: string;
    method: "GET" | "POST";
    url: string;
    headers: Map<string, string>;
    body: string | null;
    timestamp: Date;
}

export function copyRequest(req: Request): Request {
    const headers = new Map<string, string>()
    req.headers.forEach((value, name) => headers.set(name, value))

    return {
        ...req,
        headers,
    }
}
