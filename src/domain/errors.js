export class DomainError extends Error {
  constructor(message, code) {
    if (typeof message !== "string" || message.trim().length === 0) {
      throw new TypeError("DomainError message must be a non-empty string.");
    }

    if (typeof code !== "string" || !/^[A-Z][A-Z0-9_]*$/.test(code)) {
      throw new TypeError("DomainError code must be an uppercase identifier.");
    }

    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
