import chalk from 'chalk';
import { formatWithOptions, InspectOptions } from 'node:util';

class PrettyConsole {
  private successTag: string = '[SUCCESS]';
  private infoTag: string = '[INFO]';
  private warnTag: string = '[WARN]';
  private errorTag: string = '[ERROR]';
  private formatOptions: InspectOptions = { colors: false };
  private supportsColor: boolean = false;

  constructor(color: boolean = true) {
    if (color) {
      this.enableColor();
    }
  }

  enableColor() {
    if (chalk.supportsColor) {
      this.supportsColor = true;
      this.successTag = chalk.green('success');
      this.infoTag = chalk.blue('info');
      this.warnTag = chalk.yellow('warn');
      this.errorTag = chalk.red('error');
      this.formatOptions = { colors: true };
    }
  }

  disableColor() {
    if (this.supportsColor) {
      this.supportsColor = false;
      this.successTag = '[SUCCESS]';
      this.infoTag = '[INFO]';
      this.warnTag = '[WARN]';
      this.errorTag = '[ERROR]';
      this.formatOptions = { colors: false };
    }
  }

  private get columns() {
    return process.stdout.columns || 80;
  }

  success(...args: any[]) {
    console.log(this.successTag, ...args);
  }

  info(...args: any[]) {
    console.info(this.infoTag, ...args);
  }

  warn(...args: any[]) {
    console.warn(this.warnTag, ...args);
  }

  error(...args: any[]) {
    console.error(this.errorTag, ...args);
  }

  log(...args: any[]) {
    console.log(...args);
  }

  dim(...args: any[]) {
    if (this.supportsColor) {
      console.log(chalk.dim(this.format(...args)));
    } else {
      console.log(...args);
    }
  }

  private format(...args: any[]) {
    // should be very similar to how console.log formats to string
    return formatWithOptions(this.formatOptions, ...args);
  }
}

export const pconsole = new PrettyConsole();
