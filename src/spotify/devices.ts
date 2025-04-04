import SpotifyWebApi from 'spotify-web-api-node'

/**
 * Find a device with "Echo Dot" in its name, or a specific device name if provided
 * @param spotifyApi The Spotify API instance
 * @param deviceName Optional specific device name to look for
 * @returns The device ID if found, undefined otherwise
 */
export async function findEchoDevice(
  spotifyApi: SpotifyWebApi,
  deviceName?: string,
): Promise<string | undefined> {
  try {
    // Get available devices
    const response = await spotifyApi.getMyDevices()
    const devices = response.body.devices

    if (devices.length === 0) {
      console.error(
        'No active Spotify devices found. Please open Spotify on a device.',
      )
      return undefined
    }

    // If a specific device name is provided, look for it
    if (deviceName) {
      const device = devices.find((d) =>
        d.name.toLowerCase().includes(deviceName.toLowerCase()),
      )

      if (device && device.id) {
        return device.id
      }

      console.error(`No device found with name containing "${deviceName}"`)
      return undefined
    }

    // Otherwise, look for an Echo Dot
    const echoDevice = devices.find((d) => d.name.includes('Echo Dot'))

    if (echoDevice && echoDevice.id) {
      return echoDevice.id
    }

    // If no Echo Dot is found, use the first available device
    console.warn('No Echo Dot found. Using the first available device instead.')
    const firstDevice = devices[0]
    return firstDevice && firstDevice.id ? firstDevice.id : undefined
  } catch (error) {
    console.error('Error finding devices:', error)
    return undefined
  }
}

/**
 * List all available devices
 * @param spotifyApi The Spotify API instance
 * @returns Array of device objects
 */
export async function listDevices(
  spotifyApi: SpotifyWebApi,
): Promise<SpotifyApi.UserDevice[]> {
  try {
    const response = await spotifyApi.getMyDevices()
    return response.body.devices
  } catch (error) {
    console.error('Error listing devices:', error)
    return []
  }
}
