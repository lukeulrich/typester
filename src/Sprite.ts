
type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

export interface InterpolateFunction<T> {
  (fraction: number): T;
}

export interface Interpolate<T> {
  (start: T, stop: T, ...args: any): InterpolateFunction<T>;
}

export const clamp = (min: number, max: number): (value: number) => number => {
  return (value: number) => Math.min(max, Math.max(min, value));
};

export const clampBetween0and1 = clamp(0, 1);

export const linearInterpolate: Interpolate<number> = (start, stop) => {
  const difference = stop - start;
  return (fraction: number) => {
    return start + difference * fraction;
  }
};

export const linearPointInterpolate: Interpolate<Point> = (start, stop, target: Point) => {
  const diffX = stop.x - start.x;
  const diffY = stop.y - start.y;

  return (fraction: number) => {
    fraction = clampBetween0and1(fraction);
    target.x = start.x + diffX * fraction;
    target.y = start.y + diffY * fraction;
    return target;
  };
};

let id = 0;

export class Sprite {
  id = id++;
  xTargets: number[] = [];
  yTargets: number[] = [];
  size: Size = {
    width: 0,
    height: 0,
  };

  // Speed
  dX = 400 / 1000; // px per ms
  dY = 0;

  // Temporal animation tracking data
  tX0 = 0;
  tY0 = 0;

  private interpolateX?: InterpolateFunction<number>;
  private interpolateY?: InterpolateFunction<number>;

  private constructor(
    public readonly chars: string,
    public position: Point,
  ) {}

  static create(
    chars: string,
    Point: Point = {x: 0, y: 0},
  ) {
    const sprite = new Sprite(chars, Point);

    const div = document.createElement('div');
    div.style.fontSize = '35rem';
    div.style.lineHeight = '0';
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.innerText = chars;
    document.body.appendChild(div);
  
    sprite.size.width = div.offsetWidth;
    sprite.size.height = div.offsetHeight;

    div.remove();
  
    return sprite;
  }

  addTarget(target: Partial<Point>) {
    const now = performance.now();
    if (typeof target.x !== undefined) {
      if (!this.xTargets.length) {
        this.xTargets.push(this.position.x);
      }
      this.xTargets.push(target.x!);
      if (this.xTargets.length === 2) {
        this.tX0 = now;
        this.interpolateX = linearInterpolate(this.position.x, target.x!);
      }
    }
    if (typeof target.y !== undefined) {
      if (!this.yTargets.length) {
        this.yTargets.push(this.position.y);
      }
      this.yTargets.push(target.y!);
      if (this.yTargets.length === 2) {
        this.tY0 = now;
        this.interpolateY = linearInterpolate(this.position.y, target.y!);
      }
    }
  }

  update() {
    const now = performance.now();
    if (this.dX && this.xTargets.length > 1) {
      const dT = now - this.tX0;
      const totalTime = Math.abs(this.xTargets[0] - this.xTargets[1]) / this.dX;
      const fraction = dT / totalTime;
      console.assert(this.interpolateX, 'No interpolateX function!');
      this.position.x = this.interpolateX!(fraction);
      if (fraction >= 1) {
        const numToShift = this.xTargets.length === 2 ? 2 : 1;
        this.xTargets.splice(0, numToShift);
      }
    }

    if (this.dY && this.yTargets.length > 1) {
      const dT = now - this.tX0;
      const totalTime = Math.abs(this.yTargets[0] - this.yTargets[1]) / this.dY;
      const fraction = dT / totalTime;
      console.assert(this.interpolateY, 'No interpolateY function!');
      this.position.y = this.interpolateY!(fraction);
      if (fraction >= 1) {
        const numToShift = this.yTargets.length === 2 ? 2 : 1;
        this.yTargets.splice(0, numToShift);
      }
    }
  }
}
