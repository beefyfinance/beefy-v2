import colors from 'yoctocolors-cjs';

export const theme = new (class {
  answer(answer: string) {
    return colors.cyan(answer);
  }

  questionPrefix() {
    return colors.green('?');
  }

  question(question: string) {
    return colors.bold(question);
  }

  warn(warn: string) {
    return colors.yellow(warn);
  }

  warnPrefix() {
    return this.warn('!');
  }

  error(error: string) {
    return colors.red(error);
  }

  errorPrefix() {
    return this.error('×');
  }

  info(info: string) {
    return colors.blue(info);
  }

  infoPrefix() {
    return this.info('i');
  }

  success(success: string) {
    return colors.green(success);
  }

  successPrefix() {
    return this.success('+');
  }

  description(description: string) {
    return colors.dim(description);
  }

  bold(text: string) {
    return colors.bold(text);
  }
})();

const prettyConsole = {
  question(question: string, answer?: string) {
    if (answer) {
      console.log(theme.questionPrefix(), theme.question(question), theme.answer(answer));
    } else {
      console.log(theme.questionPrefix(), theme.question(question));
    }
  },
  info(...args: any[]) {
    console.info(theme.infoPrefix(), ...args);
  },
  warn(...args: any[]) {
    console.warn(theme.warnPrefix(), ...args);
  },
  error(...args: any[]) {
    console.error(theme.errorPrefix(), ...args);
  },
  success(...args: any[]) {
    console.log(theme.successPrefix(), ...args);
  },
  ulItem(...args: any[]) {
    console.info(theme.info('-'), ...args);
  },
};

export const pConsole = new Proxy(console, {
  get(target: typeof console, key: string | symbol, receiver: any): any {
    if (key in prettyConsole) {
      return prettyConsole[key as string];
    }
    return target[key];
  },
}) as Omit<typeof console, keyof typeof prettyConsole> & typeof prettyConsole;
