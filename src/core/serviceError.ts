const NOT_FOUND = 404;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 403;
const FORBIDDEN = 401;
const INTERNAL_SERVER_ERROR = 500;
const CONFLICT = 409;

export default class ServiceError extends Error {
  
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ServiceError';
  }

  static notFound(message: string) {
    return new ServiceError(NOT_FOUND, message);
  }

  static validationFailed(message: string) {
    return new ServiceError(BAD_REQUEST, message);
  }

  static unauthorized(message: string) {
    return new ServiceError(UNAUTHORIZED, message);
  }

  static forbidden(message: string) {
    return new ServiceError(FORBIDDEN, message);
  }

  static internalServerError(message: string) {
    return new ServiceError(INTERNAL_SERVER_ERROR, message);
  }

  static conflict(message: string) {
    return new ServiceError(CONFLICT, message);
  }

  get isNotFound(): boolean {
    return this.status === NOT_FOUND;
  }

  get isValidationFailed(): boolean {
    return this.status === BAD_REQUEST;
  }

  get isUnauthorized(): boolean {
    return this.status === UNAUTHORIZED;
  }

  get isForbidden(): boolean {
    return this.status === FORBIDDEN;
  }

  get isInternalServerError(): boolean {
    return this.status === INTERNAL_SERVER_ERROR;
  }

  get isConflict(): boolean {
    return this.status === CONFLICT;
  }
}
