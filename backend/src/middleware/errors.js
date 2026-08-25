import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Wraps an async handler so a rejected promise reaches the error middleware. */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
}

/** Turns a Zod issue list into `{ field: message }` for inline form errors. */
function fieldErrors(error) {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]),
  );
}

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity.
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request', fields: fieldErrors(err) });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ?? {}) });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  req.log?.error?.(err);
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
