import SpotifyWebApi from 'spotify-web-api-node'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'
import { createServer } from 'http'
import { randomBytes } from 'crypto'
import { execSync } from 'child_process'

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Path to store tokens in home directory for portability
const TOKEN_PATH = path.join(os.homedir(), '.spotify-tokens.json')

// Spotify API credentials
// These should be set in a .env file
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:8888/callback'

// Scopes required for the application
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
]

/**
 * Generate a random string for the state parameter
 */
function generateRandomString(length: number): string {
  return randomBytes(length).toString('hex')
}

/**
 * Save tokens to a file
 */
function saveTokens(tokens: {
  accessToken: string
  refreshToken: string
  expiresAt: number
}): void {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
}

/**
 * Load tokens from file
 */
function loadTokens(): {
  accessToken: string
  refreshToken: string
  expiresAt: number
} | null {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const data = fs.readFileSync(TOKEN_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading tokens:', error)
  }
  return null
}

/**
 * Refresh the access token
 */
async function refreshAccessToken(
  spotifyApi: SpotifyWebApi,
): Promise<SpotifyWebApi> {
  try {
    const data = await spotifyApi.refreshAccessToken()
    const accessToken = data.body.access_token

    // Calculate expiration time (subtract 60 seconds to be safe)
    const expiresAt = Date.now() + data.body.expires_in * 1000 - 60000

    // Save the new tokens
    saveTokens({
      accessToken,
      refreshToken: spotifyApi.getRefreshToken() || '',
      expiresAt,
    })

    // Update the API instance
    spotifyApi.setAccessToken(accessToken)

    return spotifyApi
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw error
  }
}

/**
 * Perform the authorization flow
 */
async function authorizeUser(): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: number
}> {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      reject(
        new Error(
          'Missing Spotify API credentials. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file.',
        ),
      )
      return
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
    })

    // Create a random state value
    const state = generateRandomString(16)

    // Create the authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(SCOPES, state)

    // Open the URL in the default browser
    console.log('Opening authorization page in your browser...')
    try {
      execSync(`open "${authorizeURL}"`, { stdio: 'ignore' })
    } catch (error) {
      console.log(
        'Could not open browser automatically. Please open this URL manually:',
      )
      console.log(authorizeURL)
    }

    // Create a server to handle the callback
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url || '', `http://${req.headers.host}`)
        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')

        if (req.url?.includes('/callback') && code && returnedState === state) {
          // Exchange the code for tokens
          const data = await spotifyApi.authorizationCodeGrant(code)

          const accessToken = data.body.access_token
          const refreshToken = data.body.refresh_token
          const expiresIn = data.body.expires_in

          // Calculate expiration time (subtract 60 seconds to be safe)
          const expiresAt = Date.now() + expiresIn * 1000 - 60000

          // Send success response
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(
            '<html><body><h1>Authentication successful!</h1><p>You can close this window now.</p></body></html>',
          )

          // Close the server
          server.close()

          // Resolve the promise with the tokens
          resolve({ accessToken, refreshToken, expiresAt })
        } else {
          // Handle error or invalid request
          res.writeHead(400, { 'Content-Type': 'text/html' })
          res.end(
            '<html><body><h1>Authentication failed!</h1><p>Please try again.</p></body></html>',
          )

          // Close the server
          server.close()

          // Reject the promise
          reject(new Error('Authentication failed'))
        }
      } catch (error) {
        console.error('Error in callback handler:', error)
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(
          '<html><body><h1>Server error!</h1><p>Please try again.</p></body></html>',
        )

        // Close the server
        server.close()

        // Reject the promise
        reject(error)
      }
    })

    // Start the server
    server.listen(8888, () => {
      console.log('Waiting for authentication...')
    })

    // Set a timeout to prevent hanging indefinitely
    setTimeout(
      () => {
        server.close()
        reject(new Error('Authentication timed out'))
      },
      5 * 60 * 1000,
    ) // 5 minutes
  })
}

/**
 * Set up authentication with Spotify
 * @param forceAuth Force a new authentication flow
 * @returns A configured SpotifyWebApi instance
 */
export async function setupAuth(forceAuth = false): Promise<SpotifyWebApi> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      'Missing Spotify API credentials. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file.',
    )
  }

  // Create a new API instance
  const spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  })

  // Check if we have stored tokens
  const tokens = loadTokens()

  if (!forceAuth && tokens && tokens.refreshToken) {
    // Set the tokens on the API instance
    spotifyApi.setAccessToken(tokens.accessToken)
    spotifyApi.setRefreshToken(tokens.refreshToken)

    // Check if the access token is expired
    if (Date.now() > tokens.expiresAt) {
      // Refresh the access token
      return refreshAccessToken(spotifyApi)
    }

    return spotifyApi
  } else {
    // Perform the authorization flow
    const newTokens = await authorizeUser()

    // Save the tokens
    saveTokens(newTokens)

    // Set the tokens on the API instance
    spotifyApi.setAccessToken(newTokens.accessToken)
    spotifyApi.setRefreshToken(newTokens.refreshToken)

    return spotifyApi
  }
}
