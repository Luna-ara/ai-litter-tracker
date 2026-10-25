export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

export function error(status: number, message: string, details?: unknown): Response {
  return Response.json(details === undefined ? { error: message } : { error: message, details }, {
    status,
  });
}
