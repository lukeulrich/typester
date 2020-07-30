import { DependencyList, useEffect } from 'react';
import { Observable } from 'rxjs';

export const useObservable = (
  getObservable: () => Observable<any>,
  deps?: DependencyList
) => {
  const newDeps = deps ? [...deps] : [];
  newDeps.push(getObservable);

  useEffect(() => {
    const subscription = getObservable().subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, newDeps); // eslint-disable-line
};
