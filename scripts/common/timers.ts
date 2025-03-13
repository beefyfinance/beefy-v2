export class Timers {
  private active: Record<string, number> = {};
  private completed: Array<{ name: string; start: number; end: number; duration: number }> = [];

  constructor(private enabled: boolean) {}

  start(name: string) {
    if (this.enabled) {
      if (name in this.active) {
        throw new Error(`Timer ${name} already started`);
      }
      this.active[name] = Date.now();
    }
  }

  stop(name: string) {
    if (this.enabled) {
      const start = this.active[name];
      if (!start) {
        throw new Error(`Timer ${name} not started`);
      }
      const end = Date.now();
      this.completed.push({ name, start, end, duration: end - start });
    }
  }

  summary() {
    if (this.enabled && this.completed.length) {
      const earliest = Math.min(...this.completed.map(({ start }) => start));
      const latest = Math.max(...this.completed.map(({ end }) => end));
      const total = latest > 0 ? latest - earliest : 0;
      const timers = this.completed
        .map(({ name, start, end, duration }) => {
          const percent = total > 0 && end ? (duration / total) * 100 : 0;
          const relativeStart = start - earliest;
          return { name, relativeStart, duration, percent };
        })
        .sort((a, b) => a.relativeStart - b.relativeStart);
      for (const { name, duration, percent } of timers) {
        console.log(`${name}: ${duration}ms (${percent.toFixed(2)}%)`);
      }
      console.log(`Total: ${total}ms`);
    }
  }
}
