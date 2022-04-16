export class FriendlyError extends Error {
  constructor(message: string, protected innerError: Error) {
    super(message);
  }

  getInnerError(): Error {
    return this.innerError;
  }
}
