import SpotifyWebApi from 'spotify-web-api-node'

export function formatSearchResults(
  type: 'track' | 'playlist',
  results: SpotifyApi.SearchResponse,
): string {
  if (type === 'track') {
    const tracks = results.tracks?.items
    if (!tracks || tracks.length === 0) return 'No tracks found.'
    return tracks
      .map((t, i) => {
        const artists = t.artists.map((a) => a.name).join(', ')
        return `${i + 1}. ${t.name} - ${artists} (${t.album.name}) [${t.id}]`
      })
      .join('\n')
  }

  const playlists = results.playlists?.items?.filter(
    (p): p is SpotifyApi.PlaylistObjectSimplified => p !== null,
  )
  if (!playlists || playlists.length === 0) return 'No playlists found.'
  return playlists
    .map((p, i) => {
      const owner = p.owner.display_name ?? p.owner.id
      return `${i + 1}. ${p.name} by ${owner} (${p.tracks.total} tracks) [${p.id}]`
    })
    .join('\n')
}

/**
 * Format the current playback status for display
 * @param playbackState The current playback state from Spotify API
 * @returns Formatted string for display
 */
export function formatPlaybackStatus(
  playbackState: SpotifyApi.CurrentPlaybackResponse,
): string {
  if (!playbackState) {
    return 'No active playback'
  }

  const { item, device, is_playing, shuffle_state, repeat_state, progress_ms } =
    playbackState

  if (!item) {
    return 'No track currently playing'
  }

  // Format track information
  let trackInfo = `Title: ${item.name}`

  // Check if it's a track (not a podcast episode)
  if ('artists' in item && 'album' in item) {
    trackInfo += `\nArtist: ${item.artists.map((a: any) => a.name).join(', ')}
Album: ${item.album.name}`
  } else {
    // It's a podcast episode
    trackInfo += '\nType: Podcast Episode'
    if ('show' in item && item.show) {
      trackInfo += `\nShow: ${item.show.name}`
    }
  }

  // Format playback state
  const playbackInfo = `State: ${is_playing ? 'Playing' : 'Paused'}
Device: ${device.name}
Volume: ${device.volume_percent}%
Shuffle: ${shuffle_state ? 'On' : 'Off'}
Repeat: ${formatRepeatState(repeat_state)}`

  // Format progress
  const duration = item.duration_ms
  const progress = progress_ms || 0
  const progressInfo = `Progress: ${formatTime(progress)} / ${formatTime(duration)} (${Math.round((progress / duration) * 100)}%)`

  // Combine all information
  return `${trackInfo}\n\n${playbackInfo}\n\n${progressInfo}`
}

/**
 * Format time in milliseconds to MM:SS format
 * @param ms Time in milliseconds
 * @returns Formatted time string
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format repeat state for display
 * @param state The repeat state from Spotify API
 * @returns Formatted repeat state
 */
function formatRepeatState(state: string): string {
  switch (state) {
    case 'off':
      return 'Off'
    case 'track':
      return 'Track'
    case 'context':
      return 'Context (Playlist/Album)'
    default:
      return state
  }
}
