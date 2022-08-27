export class AuthTokenError extends Error {
  constructor() {
    super('Authorization token error.');
  }
}
