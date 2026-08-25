/** A failed data operation, from either the HTTP client or the local store. */
export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    /** Per-field messages, so forms can show errors inline. */
    this.fields = fields ?? {};
  }
}
