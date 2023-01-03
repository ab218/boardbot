const { CronJob } = require('cron')
const { getPostNumber } = require('./getPostNumber')
const { sendPosts } = require('./sendPosts')
const { getPosts } = require('./getPosts')
const fs = require('fs')
const { boardKeys } = require('./boardLookupTable')

const startCronJob = (client) =>
  new CronJob(
    '0 */15 * * * *',
    async function () {
      console.log('running at: ' + Date.now())

      const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))
      const serverNames = Object.keys(data)

      try {
        for (let i = 0; i < boardKeys.length; i++) {
          const board = boardKeys[i]
          // {[serverName]: topPost}
          const postno = getPostNumber(data, serverNames, board)

          const lowestPostNo = postno.reduce((acc, { serverName, topPost }) => {
            if (!Object.keys(acc).length || Object.values(acc)[0] > topPost) {
              return { [serverName]: topPost }
            }

            return acc
          }, {})

          const { links, topPost } = await getPosts(board, Object.values(lowestPostNo)[0])

          console.log('board: ', board, 'newPosts: ', links, 'topPost: ', topPost)

          postno.forEach(async ({ serverName, topPost: oldTopPost }) => {
            const filteredLinksIfNecessary = links.filter(({ postNumber }) => postNumber > oldTopPost)

            sendPosts({
              client,
              serverName,
              newPosts: filteredLinksIfNecessary,
              topPost,
              board,
              serverBoardIds: data,
            })
          })
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
