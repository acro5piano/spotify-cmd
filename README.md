# spotify-cmd

Control Spotify from the command line.

## Features

- Play specific playlists or tracks
- Control playback (play, pause, skip, etc.)
- Adjust volume
- Toggle shuffle and repeat modes
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

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a Spotify application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Add `http://localhost:8888/callback` as a Redirect URI
   - Note your Client ID and Client Secret

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file and add your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

6. Run the setup command to authenticate with Spotify:
   ```bash
   bun run setup
   ```
   This will open a browser window for authentication. After authenticating, you can close the browser.

## Usage

### Basic Commands

```bash
# Play a specific playlist
bun run start play --playlist 0at3rmPoI58LhHtWABBhFY

# Play a specific track
bun run start play --track 4iV5W9uYEdYUVa79Axb7Rh

# Pause playback
bun run start pause

# Resume playback
bun run start resume

# Skip to next track
bun run start next

# Skip to previous track
bun run start prev

# Set volume (0-100)
bun run start volume 50

# Show current playback status
bun run start status

# Toggle shuffle mode
bun run start shuffle on  # or 'off'

# Set repeat mode
bun run start repeat off  # or 'track' or 'context'
```

### Device Selection

By default, the application will look for a device with "Echo Dot" in its name. If none is found, it will use the first available device.

You can specify a different device using the `--device` option with the play command:

```bash
bun run start play --playlist 0at3rmPoI58LhHtWABBhFY --device "Kitchen Speaker"
```

## Building

To build a standalone executable:

```bash
bun run build
```

This will create a build in the `dist` directory.

## License

MIT
