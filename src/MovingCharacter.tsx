import React from 'react';

import './MovingCharacter.css';

type Props = {
  character: string;
  left: number;
}

export const MovingCharacter = ({
  character,
  left,
}: Props) => {

  return (
    <div className="moving-character" style={{left}}>
      {character}
    </div>
  );
};

