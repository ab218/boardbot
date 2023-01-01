const { start } = require('./start')
const { stop } = require('./stop')

async function restartClient(client, cronJob) {
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

module.exports = { restartClient }
