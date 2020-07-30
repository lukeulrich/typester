import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { mainLoop } from '../services';

export const useTick = (enabled = true) => {
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    let sub: Subscription | null = null;
    if (!enabled) {
      return;
    }

    const t0 = performance.now();
    sub = mainLoop.tick$.pipe(
      map((now) => now - t0),
    ).subscribe(setTick);

    return () => {
      sub!.unsubscribe();
    };
  }, [enabled]);

  return tick;
};
