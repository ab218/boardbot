const { CronJob } = require('cron')
const fs = require('fs')
const { boardKeys } = require('./boardLookupTable')
const { getAndSendPosts } = require('./getAndSendPosts')

const startCronJob = (client) =>
  new CronJob(
    '0 */15 * * * *',
    async function () {
      console.log('running at: ' + Date.now())

      const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))
      const serverNames = Object.keys(data)

      try {
        for (let i = 0; i < boardKeys.length; i++) {
          const boardName = boardKeys[i]

          getAndSendPosts({ client, data, serverNames, boardName })
        }
      } catch (e) {
        console.log('an error happened with CronJob: ', e)
      }
    },
    null, // onComplete
    false, // start automatically
    'America/Los_Angeles',
    null, // context
    false, // runOnInit
  )

module.exports = { startCronJob }
