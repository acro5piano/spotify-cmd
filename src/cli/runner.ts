import { Command } from '@commander-js/extra-typings'
import dotenv from 'dotenv'
import { setupAuth } from '../spotify/auth'
import {
  playTrack,
  playPlaylist,
  pausePlayback,
  resumePlayback,
  skipToNext,
  skipToPrevious,
  setVolume,
  getCurrentPlayback,
  toggleShuffle,
  setRepeatMode,
} from '../spotify/playback'
import { findEchoDevice } from '../spotify/devices'
import { formatPlaybackStatus } from './output'

// Load environment variables
dotenv.config()

// Initialize the CLI program
const program = new Command()
  .name('spotify-cmd')
  .description('Control Spotify from the command line')
  .version('1.0.0')

// Play command
program
  .command('play')
  .description('Play music on Spotify')
  .option('-p, --playlist <playlist ID>', 'Playlist to play')
  .option('-t, --track <track ID>', 'Track (Song) to play')
  .option(
    '-d, --device <device name>',
    'Specify device (default: find Echo Dot)',
  )
  .option('-r, --repeat <mode>', 'Set repeat mode (off/track/context)')
  .option('-s, --shuffle <state>', 'Set shuffle mode (on/off)')
  .action(async (options) => {
    try {
      // Ensure we're authenticated
      const spotifyApi = await setupAuth()

      // Find the device if not specified
      let deviceId: string | undefined
      if (options.device) {
        deviceId = await findEchoDevice(spotifyApi, options.device)
      } else {
        deviceId = await findEchoDevice(spotifyApi)
      }

      if (!deviceId) {
        console.error(
          'No suitable device found. Make sure your Spotify device is active.',
        )
        process.exit(1)
      }

      // Play the requested content
      if (options.playlist) {
        await playPlaylist(spotifyApi, options.playlist, deviceId)
        console.log(`Playing playlist: ${options.playlist}`)
      } else if (options.track) {
        await playTrack(spotifyApi, options.track, deviceId)
        console.log(`Playing track: ${options.track}`)
      } else {
        await resumePlayback(spotifyApi, deviceId)
        console.log('Resuming playback')
      }

      // Set repeat mode if specified
      if (options.repeat) {
        // Validate the repeat mode
        if (!options.repeat.match(/^(off|track|context)$/i)) {
          console.error(
            'Invalid repeat mode. Must be one of: off, track, context',
          )
          process.exit(1)
        }

        const repeatMode = options.repeat.toLowerCase() as
          | 'off'
          | 'track'
          | 'context'
        await setRepeatMode(spotifyApi, repeatMode, deviceId)
        console.log(`Repeat mode set to ${repeatMode}`)
      }

      // Set shuffle mode if specified
      if (options.shuffle) {
        // Validate the shuffle state
        if (!options.shuffle.match(/^(on|off)$/i)) {
          console.error('Invalid shuffle state. Must be "on" or "off"')
          process.exit(1)
        }

        const shuffleState = options.shuffle.toLowerCase() === 'on'
        await toggleShuffle(spotifyApi, shuffleState, deviceId)
        console.log(`Shuffle mode ${shuffleState ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      console.error(
        'Error playing music:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Pause command
program
  .command('pause')
  .description('Pause playback')
  .action(async () => {
    try {
      const spotifyApi = await setupAuth()
      await pausePlayback(spotifyApi)
      console.log('Playback paused')
    } catch (error) {
      console.error(
        'Error pausing playback:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Resume command
program
  .command('resume')
  .description('Resume playback')
  .action(async () => {
    try {
      const spotifyApi = await setupAuth()
      await resumePlayback(spotifyApi)
      console.log('Playback resumed')
    } catch (error) {
      console.error(
        'Error resuming playback:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Next track command
program
  .command('next')
  .description('Skip to next track')
  .action(async () => {
    try {
      const spotifyApi = await setupAuth()
      await skipToNext(spotifyApi)
      console.log('Skipped to next track')
    } catch (error) {
      console.error(
        'Error skipping to next track:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Previous track command
program
  .command('prev')
  .description('Skip to previous track')
  .action(async () => {
    try {
      const spotifyApi = await setupAuth()
      await skipToPrevious(spotifyApi)
      console.log('Skipped to previous track')
    } catch (error) {
      console.error(
        'Error skipping to previous track:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Volume command
program
  .command('volume')
  .description('Set volume level (0-100)')
  .argument('<level>', 'Volume level (0-100)')
  .action(async (level) => {
    try {
      const volumeLevel = parseInt(level, 10)
      if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 100) {
        console.error('Volume level must be a number between 0 and 100')
        process.exit(1)
      }

      const spotifyApi = await setupAuth()
      await setVolume(spotifyApi, volumeLevel)
      console.log(`Volume set to ${volumeLevel}%`)
    } catch (error) {
      console.error(
        'Error setting volume:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Status command
program
  .command('status')
  .description('Show current playback status')
  .action(async () => {
    try {
      const spotifyApi = await setupAuth()
      const playbackState = await getCurrentPlayback(spotifyApi)

      if (!playbackState) {
        console.log('No active playback found')
        return
      }

      console.log(formatPlaybackStatus(playbackState))
    } catch (error) {
      console.error(
        'Error getting playback status:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Shuffle command
program
  .command('shuffle')
  .description('Toggle or set shuffle mode')
  .argument('[state]', 'Shuffle state (on/off)')
  .action(async (state) => {
    try {
      const spotifyApi = await setupAuth()

      // If no state provided, toggle the current state
      if (!state) {
        const playbackState = await getCurrentPlayback(spotifyApi)
        if (!playbackState) {
          console.error('No active playback found')
          process.exit(1)
        }

        const currentState = playbackState.shuffle_state
        await toggleShuffle(spotifyApi, !currentState)
        console.log(`Shuffle mode ${!currentState ? 'enabled' : 'disabled'}`)
      } else {
        // Validate the state
        if (typeof state !== 'string' || !state.match(/^(on|off)$/i)) {
          console.error('Invalid shuffle state. Must be "on" or "off"')
          process.exit(1)
        }

        const shuffleState = state.toLowerCase() === 'on'
        await toggleShuffle(spotifyApi, shuffleState)
        console.log(`Shuffle mode ${shuffleState ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      console.error(
        'Error setting shuffle mode:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Repeat command
program
  .command('repeat')
  .description('Set repeat mode')
  .argument('<mode>', 'Repeat mode (off/track/context)')
  .action(async (mode) => {
    try {
      // Validate the mode
      if (typeof mode !== 'string' || !mode.match(/^(off|track|context)$/i)) {
        console.error(
          'Invalid repeat mode. Must be one of: off, track, context',
        )
        process.exit(1)
      }

      const spotifyApi = await setupAuth()
      const repeatMode = mode.toLowerCase() as 'off' | 'track' | 'context'
      await setRepeatMode(spotifyApi, repeatMode)
      console.log(`Repeat mode set to ${repeatMode}`)
    } catch (error) {
      console.error(
        'Error setting repeat mode:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Setup command for first-time authentication
program
  .command('setup')
  .description('Set up authentication with Spotify')
  .action(async () => {
    try {
      await setupAuth(true)
      console.log('Authentication setup complete')
    } catch (error) {
      console.error(
        'Error setting up authentication:',
        error instanceof Error ? error.message : String(error),
      )
      process.exit(1)
    }
  })

// Parse command line arguments
program.parse()

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help()
}
