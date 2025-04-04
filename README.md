# spotify-cmd

Control Spotify from the command line.

## Features

- Play specific playlists or tracks
- Control playback (play, pause, skip, etc.)
- Adjust volume
- Toggle shuffle and repeat modes (including directly when playing tracks/playlists)
- View current playback status
- Automatically find and play on Echo Dot devices

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime
- Spotify Premium account
- Spotify Developer account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/acro5piano/spotify-cmd.git
cd spotify-cmd
```

2. Build and install:

```bash
bun install
bun run build
cp ./dist/main.js ~/.local/bin/spotify-cmd
chmod +x ~/.local/bin/spotify-cmd
```

> Make sure `~/.local/bin` is in `$PATH`

3. Create a Spotify application:

- Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Create a new application
- Add `http://localhost:8888/callback` as a Redirect URI
- Note your Client ID and Client Secret

4. Setup

```bash
spotify-cmd setup
```

This will open a browser window for authentication. After authenticating, you can close the browser.

## Usage

### Basic Commands

```bash
# Play a specific playlist
spotify-cmd play --playlist 0at3rmPoI58LhHtWABBhFY

# Play a specific track
spotify-cmd play --track 4iV5W9uYEdYUVa79Axb7Rh

# Play a track with repeat mode
spotify-cmd play --track 4iV5W9uYEdYUVa79Axb7Rh --repeat context

# Play a playlist with shuffle enabled
spotify-cmd play --playlist 0at3rmPoI58LhHtWABBhFY --shuffle on

# Pause playback
spotify-cmd pause

# Resume playback
spotify-cmd resume

# Skip to next track
spotify-cmd next

# Skip to previous track
spotify-cmd prev

# Set volume (0-100)
spotify-cmd volume 50

# Show current playback status
spotify-cmd status

# Toggle shuffle mode
spotify-cmd shuffle on  # or 'off'

# Set repeat mode
spotify-cmd repeat off  # or 'track' or 'context'
```

### Device Selection

By default, the application will look for a device with "Echo Dot" in its name. If none is found, it will use the first available device.

You can specify a different device using the `--device` option with the play command:

```bash
spotify-cmd play --playlist 0at3rmPoI58LhHtWABBhFY --device "Kitchen Speaker"
```

You can also combine multiple options:

```bash
spotify-cmd play --track 4iV5W9uYEdYUVa79Axb7Rh --device "Living Room" --repeat track --shuffle on
```

## Contribute

See [DEVELOPMENT.md](./DEVELOPMENT.md).

Most of code is written using Cline in Vibe coding way. If you are curious about it, please read the initial prompt [HERE](https://github.com/acro5piano/spotify-cmd/blob/main/PROMPT.md)

## License

MIT
