import SpotifyWebApi from 'spotify-web-api-node'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { createServer } from 'http'
import { randomBytes } from 'crypto'
import { execSync } from 'child_process'
import readline from 'readline'

// Path to store configuration in home directory for portability
const CONFIG_PATH = path.join(os.homedir(), '.spotify-config.json')

// Spotify API redirect URI
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
 * Configuration type definition
 */
type SpotifyConfig = {
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

/**
 * Save configuration to file
 */
function saveConfig(config: SpotifyConfig): void {
  // Load existing config first to avoid overwriting other fields
  const existingConfig = loadConfig() || {}

  // Merge with new config
  const updatedConfig = { ...existingConfig, ...config }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2))
}

/**
 * Load configuration from file
 */
function loadConfig(): SpotifyConfig | null {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading config:', error)
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
    // Make sure we have client credentials set
    const config = loadConfig() || {}

    if (!config.clientId || !config.clientSecret) {
      const credentials = await promptForCredentials()
      config.clientId = credentials.clientId
      config.clientSecret = credentials.clientSecret
      saveConfig(config)
    }

    // Set the credentials on the API instance
    spotifyApi.setClientId(config.clientId)
    spotifyApi.setClientSecret(config.clientSecret)

    const data = await spotifyApi.refreshAccessToken()
    const accessToken = data.body.access_token

    // Calculate expiration time (subtract 60 seconds to be safe)
    const expiresAt = Date.now() + data.body.expires_in * 1000 - 60000

    // Save the new tokens
    saveConfig({
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
async function authorizeUser(
  clientId: string,
  clientSecret: string,
): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: number
}> {
  return new Promise((resolve, reject) => {
    if (!clientId || !clientSecret) {
      reject(
        new Error(
          'Missing Spotify API credentials. Please provide your Spotify Client ID and Client Secret.',
        ),
      )
      return
    }

    const spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
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
 * Get credentials from config file, environment variables, or prompt
 */
async function getCredentials(): Promise<{
  clientId: string
  clientSecret: string
}> {
  // First try config file
  const config = loadConfig()
  if (config?.clientId && config?.clientSecret) {
    return {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    }
  }

  // Then try environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (clientId && clientSecret) {
    // Save to config file for future use
    saveConfig({ clientId, clientSecret })
    console.log(`Credentials saved to ${CONFIG_PATH}`)
    return { clientId, clientSecret }
  }

  // If still not available, prompt the user
  const credentials = await promptForCredentials()

  // Save the entered credentials to config file
  saveConfig({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  })
  console.log(`Credentials saved to ${CONFIG_PATH}`)

  return credentials
}

/**
 * Prompt user for Spotify API credentials
 */
async function promptForCredentials(): Promise<{
  clientId: string
  clientSecret: string
}> {
  console.log('\nSpotify API credentials are required for authentication.')
  console.log('You can get these from https://developer.spotify.com/dashboard')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const clientId = await new Promise<string>((resolve) => {
    rl.question('Enter your Spotify Client ID: ', (answer) => {
      resolve(answer.trim())
    })
  })

  const clientSecret = await new Promise<string>((resolve) => {
    rl.question('Enter your Spotify Client Secret: ', (answer) => {
      resolve(answer.trim())
    })
  })

  rl.close()

  if (!clientId || !clientSecret) {
    throw new Error('Client ID and Client Secret are required.')
  }

  return { clientId, clientSecret }
}

/**
 * Set up authentication with Spotify
 * @param forceAuth Force a new authentication flow
 * @returns A configured SpotifyWebApi instance
 */
export async function setupAuth(forceAuth = false): Promise<SpotifyWebApi> {
  // Get credentials first
  const { clientId, clientSecret } = await getCredentials()

  // Create a new API instance with credentials
  const spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret,
    redirectUri: REDIRECT_URI,
  })

  // Check if we have stored tokens
  const config = loadConfig()

  if (!forceAuth && config?.refreshToken) {
    // Set the tokens on the API instance
    if (config.accessToken) spotifyApi.setAccessToken(config.accessToken)
    spotifyApi.setRefreshToken(config.refreshToken)

    // Check if the access token is expired
    if (!config.expiresAt || Date.now() > config.expiresAt) {
      // Refresh the access token
      return refreshAccessToken(spotifyApi)
    }

    return spotifyApi
  } else {
    // Perform the authorization flow
    const newTokens = await authorizeUser(clientId, clientSecret)

    // Save the tokens along with credentials
    saveConfig({
      ...newTokens,
    })

    // Set the tokens on the API instance
    spotifyApi.setAccessToken(newTokens.accessToken)
    spotifyApi.setRefreshToken(newTokens.refreshToken)

    return spotifyApi
  }
}
