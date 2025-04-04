<div align=center>
<img src=https://github.com/user-attachments/assets/d8b757eb-9920-462b-838c-9979af38ab8f width=280>
</div>

# spotify-cmd

Control Spotify from the command line.

<img src=https://github.com/user-attachments/assets/2c23b01e-6504-44a3-a43a-afeefca3b594 width=300>

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
cp ./dist/main.js ~/.local/bin/spotify
chmod +x ~/.local/bin/spotify
```

> Make sure `~/.local/bin` is in `$PATH`

3. Create a Spotify application:

- Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Create a new application
- Add `http://localhost:8888/callback` as a Redirect URI
- Note your Client ID and Client Secret

4. Setup

```bash
spotify setup
```

This will open a browser window for authentication. After authenticating, you can close the browser.

## Usage

### Basic Commands

```bash
# Play a specific playlist
spotify play --playlist 0at3rmPoI58LhHtWABBhFY

# Play a specific track
spotify play --track 4iV5W9uYEdYUVa79Axb7Rh

# Play a track with repeat mode
spotify play --track 4iV5W9uYEdYUVa79Axb7Rh --repeat context

# Play a playlist with shuffle enabled
spotify play --playlist 0at3rmPoI58LhHtWABBhFY --shuffle on

# Pause playback
spotify pause

# Resume playback
spotify resume

# Skip to next track
spotify next

# Skip to previous track
spotify prev

# Set volume (0-100)
spotify volume 50

# Show current playback status
spotify status

# Toggle shuffle mode
spotify shuffle on  # or 'off'

# Set repeat mode
spotify repeat off  # or 'track' or 'context'
```

### Device Selection

By default, the application will look for a device with "Echo Dot" in its name. If none is found, it will use the first available device.

You can specify a different device using the `--device` option with the play command:

```bash
spotify play --playlist 0at3rmPoI58LhHtWABBhFY --device "Kitchen Speaker"
```

You can also combine multiple options:

```bash
spotify play --track 4iV5W9uYEdYUVa79Axb7Rh --device "Living Room" --repeat track --shuffle on
```

## Contribute

See [DEVELOPMENT.md](./DEVELOPMENT.md).

Most of code is written using Cline in Vibe coding way. If you are curious about it, please read the initial prompt [HERE](https://github.com/acro5piano/spotify-cmd/blob/main/PROMPT.md)

## License

MIT
