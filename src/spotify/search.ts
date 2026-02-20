import SpotifyWebApi from 'spotify-web-api-node'

export async function searchTracks(
  spotifyApi: SpotifyWebApi,
  query: string,
  limit: number = 10,
) {
  const response = await spotifyApi.searchTracks(query, { limit })
  return response.body
}

export async function searchPlaylists(
  spotifyApi: SpotifyWebApi,
  query: string,
  limit: number = 10,
) {
  const response = await spotifyApi.searchPlaylists(query, { limit })
  return response.body
}
