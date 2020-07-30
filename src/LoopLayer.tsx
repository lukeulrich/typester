import React from 'react';
import { useTick } from './hooks/useTickData';
import { mainLoop } from './services';

mainLoop.start();

export const LoopLayer: React.FC<{}> = ({children}) => {
  useTick();
  return (
    <>
      {children}
    </>
  );
};
