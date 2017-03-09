Goita AI Sample
===
This sample shows how to implement Goita AI based on [`goita-core`](https://github.com/Goita/goita-core-js).

[![Build Status](https://travis-ci.org/Goita/goita-ai-sample-js.svg?branch=master)](https://travis-ci.org/Goita/goita-ai-sample-js)

Install
---

```
npm install goita-ai-sample
```

Using this module
---
- To use the `RandomAI` class in a TypeScript file -

```ts
import * as Goita from "goita-core";
import { RandomAI } from "goita-ai-sample";
const history = "12345678,12345679,11112345,11112345,s1,113,2p,3p,431,1p,2p,315";
const board = Goita.Board.createFromString(history);
const ai = new RandomAI();
const chosenMove = ai.chooseMove(board.toThinkingInfo());

board.playMove(chosenMove);

```

- To use the `RandomAI` class in a JavaScript file -

```js
const Goita = require('goita-core');
const RandomAI = require('goita-ai-sample').RandomAI;

const history = "12345678,12345679,11112345,11112345,s1,113,2p,3p,431,1p,2p,315";
const board = Goita.Board.createFromString(history);
const ai = new RandomAI();
const chosenMove = ai.chooseMove(history);

board.playMove(chosenMove);
```
