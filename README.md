# European Roulette - Multiplayer game

## Table of contents

-   [Overview](#overview)
-   [The game](#the-game)
-   [Links](#links)
-   [Built with](#built-with)

## Overview

This is a multiplayer European Roulette game with some 3D animations.
Response from server can get couple seconds.

### The game

Users should be able to:

-   log in with automatically generated id
-   drag and drop chips on board in 'PLACE BET' state of game
-   see an animation for spinning roulette wheel
-   see winning number and everyone's sum of win
-   play soundtrack on button click
-   start a new round right after resetting the board

### Links

-   Repository URL: https://github.com/k-stopczynska/roulette
-   Live Demo URL: https://m-r.surge.sh/

### Built with

-   Typescript
-   React
-   Babylon.js
-   MobX
-   easytimer.js
-   react-dnd
-   WebSockets

### Play locally on your machine:

type: `git clone [repository URL]` and then:
`npm start` for running front-end and in server directory install nodemon and: `ts-node server.ts` for running backend
