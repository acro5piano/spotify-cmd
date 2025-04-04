## Setup for Development

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

## After development

Just create a pull request.
