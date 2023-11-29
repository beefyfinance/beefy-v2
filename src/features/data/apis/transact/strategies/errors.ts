export class QuoteChangedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuoteChangedError';
  }
}
