import React, { useCallback, useState, useRef, useEffect } from 'react';
import { fromEvent } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';

import { mainLoop } from './services';
import { useTick } from './hooks/useTickData';

import { MovingCharacter } from './MovingCharacter';

import './App.css';
import { useObservable } from './hooks/useObservable';
import { Sprite } from './Sprite';

const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';

const letters = capitalLetters + numbers + lowerCaseLetters;

const randomLetter = () => {
  const index = Math.floor(Math.random() * letters.length);
  return letters[index];
};

const generateSprite = () => {
  const sprite = Sprite.create(
    randomLetter(),
    {
      x: document.body.offsetWidth,
      y: 250,
    },
  );

  // sprite.addTarget({x: -sprite.size.width});

  return sprite;
};

mainLoop.start();

const generateSprites = (amount: number) => {
  const result = [];
  for (let i = 0; i< amount; i++) {
    result.push(generateSprite());
  }

  if (result.length) {
    result[0].addTarget({x: -result[0].size.width});
  }

  return result;
};

export const App = () => {
  const lettersPerRound = 10;

  // const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  // const [remaining, setRemaining] = useState(lettersPerRound);
  
  const sprites = useRef<Sprite[]>(generateSprites(lettersPerRound));

  const restart = useCallback(() => {
    sprites.current = generateSprites(lettersPerRound);
    setHits(0);
    setMisses(0);
  }, []);

  const removeFirstSprite = useCallback(() => {
    if (!sprites.current.length) {
      return;
    }

    sprites.current.shift();

    if (sprites.current.length) {
      sprites.current[0].addTarget({x: -sprites.current[0].size.width});
    }

    // if (!sprites.current.length) {
      // sprites.current.push(generateSprite());
    // }
  }, [sprites]);

  const speak = useCallback((thing: string) => {
    var utter = new SpeechSynthesisUtterance();
    utter.rate = 1.25;
    utter.pitch = .5;
    utter.text = thing;
    utter.voice = speechSynthesis.getVoices()[33];
    speechSynthesis.speak(utter);
  }, []);

  useObservable(
    () => fromEvent<KeyboardEvent>(document.body, 'keydown').pipe(
      map(({key}) => key),
      filter((key) => Boolean(sprites.current.length && key.toLowerCase() === sprites.current[0].chars[0].toLowerCase())),
      tap((key) => {
        speak(key);
        setHits(hits + 1);
        removeFirstSprite();
      }),
    ),
    [sprites, setHits, hits],
  );

  useEffect(() => {
    switch (hits) {
      case 5:
        speak('You are doing great');
        break;
      case 9:
        speak('Nine out of ten. Keep going');
        break;
      case lettersPerRound:
        speak('Yahoo. You did it!');
        break;
    }
  }, [hits, speak]);

  const tick = useTick();

  useEffect(() => {
    if (sprites.current.length === 0) {
      return;
    }
    const first = sprites.current[0];
    first.update();
    // sprites.current.forEach((sprite) => {
    //   sprite.update();
    // });
  

    const isOffscreen = first.xTargets.length === 0;
    if (isOffscreen) {
      removeFirstSprite();
      setMisses(misses + 1);
      speak('Oops');
    }

    // for (let i = sprites.current.length - 1; i >= 0; i--) {
    //   const isOffscreen = sprites.current[i].xTargets.length === 0;
    //   if (isOffscreen) {
    //     sprites.current.splice(i, 1);
    //     setMisses(misses + 1);
    //     // console.log()
    //     // setRemaining(remaining - 1);
    //   }
    // }
  }, [tick, misses, setMisses, removeFirstSprite, speak]);

  // if (sprites.current.length === 0 && remaining >= 0) {
  //   sprites.current.push(generateSprite());
  // }

  // const x = document.body.offsetWidth - tick * xPxPerMS;

  return (
    <div className="app">
      <button style={{position: 'absolute', right: 0}} onClick={restart}>Restart</button>

      <div style={{color: '#0f0', fontSize: '2rem'}}>Hits: { hits }</div>
      <div style={{color: '#0f0', fontSize: '2rem'}}>Misses: { misses }</div>
      <div style={{color: '#0f0', fontSize: '2rem'}}>Try: { hits + misses } / { lettersPerRound }</div>
      {/* <button onClick={toggle}>Toggle!</button> */}
      {/* <div>Timestamp: { tick }</div> */}

      {/* {sprites.current.map((sprite) => <MovingCharacter key={sprite.id} character={sprite.chars} left={sprite.position.x} />)} */}
      {sprites.current.length && <MovingCharacter character={sprites.current[0].chars} left={sprites.current[0].position.x} />}
    </div>
  );
};
