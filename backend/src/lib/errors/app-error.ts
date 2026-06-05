export class AppError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'AppError';
  }
}

export function throwAppError(code: string): never {
  throw new AppError(code);
}
