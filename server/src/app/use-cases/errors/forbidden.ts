export class Forbidden extends Error {
  constructor(message?: string) {
    super(message ?? 'You are not allowed to access this resource.');
  }
}
