import SpotifyWebApi from 'spotify-web-api-node'

/**
 * Play a specific track
 * @param spotifyApi The Spotify API instance
 * @param trackId The Spotify track ID
 * @param deviceId The device ID to play on
 */
export async function playTrack(
  spotifyApi: SpotifyWebApi,
  trackId: string,
  deviceId: string,
): Promise<void> {
  try {
    await spotifyApi.play({
      device_id: deviceId,
      uris: [`spotify:track:${trackId}`],
    })
  } catch (error) {
    console.error('Error playing track:', error)
    throw error
  }
}

/**
 * Play a specific playlist
 * @param spotifyApi The Spotify API instance
 * @param playlistId The Spotify playlist ID
 * @param deviceId The device ID to play on
 */
export async function playPlaylist(
  spotifyApi: SpotifyWebApi,
  playlistId: string,
  deviceId: string,
): Promise<void> {
  try {
    await spotifyApi.play({
      device_id: deviceId,
      context_uri: `spotify:playlist:${playlistId}`,
    })
  } catch (error) {
    console.error('Error playing playlist:', error)
    throw error
  }
}

/**
 * Pause playback
 * @param spotifyApi The Spotify API instance
 * @param deviceId Optional device ID to pause on
 */
export async function pausePlayback(
  spotifyApi: SpotifyWebApi,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.pause(options)
  } catch (error) {
    console.error('Error pausing playback:', error)
    throw error
  }
}

/**
 * Resume playback
 * @param spotifyApi The Spotify API instance
 * @param deviceId Optional device ID to resume on
 */
export async function resumePlayback(
  spotifyApi: SpotifyWebApi,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.play(options)
  } catch (error) {
    console.error('Error resuming playback:', error)
    throw error
  }
}

/**
 * Skip to the next track
 * @param spotifyApi The Spotify API instance
 * @param deviceId Optional device ID
 */
export async function skipToNext(
  spotifyApi: SpotifyWebApi,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.skipToNext(options)
  } catch (error) {
    console.error('Error skipping to next track:', error)
    throw error
  }
}

/**
 * Skip to the previous track
 * @param spotifyApi The Spotify API instance
 * @param deviceId Optional device ID
 */
export async function skipToPrevious(
  spotifyApi: SpotifyWebApi,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.skipToPrevious(options)
  } catch (error) {
    console.error('Error skipping to previous track:', error)
    throw error
  }
}

/**
 * Set the volume
 * @param spotifyApi The Spotify API instance
 * @param volumePercent Volume level (0-100)
 * @param deviceId Optional device ID
 */
export async function setVolume(
  spotifyApi: SpotifyWebApi,
  volumePercent: number,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.setVolume(volumePercent, options)
  } catch (error) {
    console.error('Error setting volume:', error)
    throw error
  }
}

/**
 * Get the current playback state
 * @param spotifyApi The Spotify API instance
 * @returns The current playback state or null if no active playback
 */
export async function getCurrentPlayback(
  spotifyApi: SpotifyWebApi,
): Promise<SpotifyApi.CurrentPlaybackResponse | null> {
  try {
    const response = await spotifyApi.getMyCurrentPlaybackState()
    return response.body
  } catch (error) {
    console.error('Error getting current playback:', error)
    throw error
  }
}

/**
 * Toggle shuffle mode
 * @param spotifyApi The Spotify API instance
 * @param state The shuffle state to set
 * @param deviceId Optional device ID
 */
export async function toggleShuffle(
  spotifyApi: SpotifyWebApi,
  state: boolean,
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.setShuffle(state, options)
  } catch (error) {
    console.error('Error setting shuffle mode:', error)
    throw error
  }
}

/**
 * Set repeat mode
 * @param spotifyApi The Spotify API instance
 * @param state The repeat state to set ('off', 'track', or 'context')
 * @param deviceId Optional device ID
 */
export async function setRepeatMode(
  spotifyApi: SpotifyWebApi,
  state: 'off' | 'track' | 'context',
  deviceId?: string,
): Promise<void> {
  try {
    const options = deviceId ? { device_id: deviceId } : undefined
    await spotifyApi.setRepeat(state, options)
  } catch (error) {
    console.error('Error setting repeat mode:', error)
    throw error
  }
}
