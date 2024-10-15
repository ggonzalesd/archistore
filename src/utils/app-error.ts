export class AppError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
  }

  static badRequest(message: string) {
    return new AppError(message, 400);
  }

  static unauthorized(message: string) {
    return new AppError(message, 401);
  }

  static notFound(message: string) {
    return new AppError(message, 404);
  }

  static serverError(message: string) {
    return new AppError(message);
  }
}
