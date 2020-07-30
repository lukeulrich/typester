import { Subject } from 'rxjs';

export class MainLoop {
  readonly tick$ = new Subject<number>();

  private running = false;

  isRunning() {
    return this.running;
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;

    const onRA = (time: number) => {
      if (!this.running) {
        return;
      }
  
      this.tick$.next(time);
      requestAnimationFrame(onRA);
    };
    requestAnimationFrame(onRA);
  }

  stop() {
    this.running = false;
  }

  toggle() {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  }
}
