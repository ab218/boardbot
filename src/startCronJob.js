const { CronJob } = require('cron')
const { boardKeys } = require('./boardLookupTable')
const { getPostNumber } = require('./getPostNumber')
const { sendPosts } = require('./sendPosts')
const { getPosts } = require('./getPosts')

const startCronJob = (client) =>
  new CronJob(
    '0 */15 * * * *',
    async function () {
      console.log('running at: ' + Date.now())

      try {
        for (let i = 0; i < boardKeys.length; i++) {
          const board = boardKeys[i]
          const postno = getPostNumber(board)
          const { links, topPost } = await getPosts(board, postno)

          console.log('board: ', board, 'newPosts: ', links, 'topPost: ', topPost)

          await sendPosts(client, links, topPost, board)
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
