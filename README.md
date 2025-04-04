# spotify-cmd

Controll spotify from the command line.

# Prompt

## Background

I don't want to open a web browser every time. I want to controll Spotify from my command line.

## Goal

- Play the Spotify playlist `0at3rmPoI58LhHtWABBhFY`. It is created by me, and publicly available.
- Play music on a specific device. Play device ending `Echo Dot` in its name.

## Stack

- Use the following tool:
  - TypeScript, with strong type checking
  - Bun as the runtime
  - [commander.js](https://github.com/tj/commander.js) along with [type](https://github.com/commander-js/extra-typings)
  - Spotify API. Choose a correct API. Maybe you can check them:
    - [Web API](https://developer.spotify.com/documentation/web-api)
    - [Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)

## User Story

The command should be something like:

```
bun run src/main.ts

Usage: spotify-cmd [options]

Options:
  -p, --playlist <playlist ID>   Playlist to play
  -t, --track <track ID>         Track (Song) to play
  -h, --help           display help for command
```

If you have any proposal, let me know.
