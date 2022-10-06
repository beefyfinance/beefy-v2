import { featureFlag_logging } from './feature-flags';

interface ILogger {
  log(tag: string, ...rest): void;
  warn(tag: string, ...rest): void;
  error(tag: string, ...rest): void;
}

class Logger implements ILogger {
  log(tag: string, ...rest) {
    console.log(`[${tag}]`, ...rest);
  }
  warn(tag: string, ...rest) {
    console.warn(`[${tag}]`, ...rest);
  }
  error(tag: string, ...rest) {
    console.error(`[${tag}]`, ...rest);
  }
}

class DummyLogger implements ILogger {
  log(tag: string, ...rest) {}
  warn(tag: string, ...rest) {}
  error(tag: string, ...rest) {}
}

export const logger: ILogger = featureFlag_logging() ? new Logger() : new DummyLogger();
