import { stop } from './stop.js'
import { start } from './start.js'

export async function restartClient(client, cronJob) {
  try {
    stop(cronJob)

    client.destroy()
  } catch (e) {
    console.log(e)
  } finally {
    console.log('restarting...')

    start(client, cronJob)
  }
}
