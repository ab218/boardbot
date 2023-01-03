const { boardLookupTable, boardKeys } = require('./boardLookupTable')
const { getPostNumber } = require('./getPostNumber')
const { sendPosts } = require('./sendPosts')
const { getPosts } = require('./getPosts')
const fs = require('fs')

async function forceRun(client, message) {
  console.log(message, boardLookupTable)

  const boardName = message[1]
  const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))
  const serverNames = Object.keys(data)

  if (boardName === 'all') {
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i]
        const postno = getPostNumber(data, serverNames, board)

        const lowestPostNo = postno.reduce((acc, { serverName, topPost }) => {
          if (!Object.keys(acc).length || Object.values(acc)[0] > topPost) {
            return { [serverName]: topPost }
          }

          return acc
        }, {})
        // {[serverName]: topPost}

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
      console.log('an error happened in forcerun: ', e)
    }
  } else if (!boardLookupTable[boardName]) {
    console.log(`${boardName} board not found. Choose from the following: ${boardKeys} or all.`)

    return
  } else if (boardLookupTable[boardName] && typeof boardLookupTable[boardName] === 'string') {
    // {[serverName]: topPost}
    const postno = getPostNumber(data, serverNames, boardName)

    const lowestPostNo = postno.reduce((acc, { serverName, topPost }) => {
      if (!Object.keys(acc).length || Object.values(acc)[0] > topPost) {
        return { [serverName]: topPost }
      }

      return acc
    }, {})

    const { links, topPost } = await getPosts(boardName, Object.values(lowestPostNo)[0])

    console.log('newPosts: ', links, 'topPost: ', topPost)

    postno.forEach(async ({ serverName, topPost: oldTopPost }) => {
      const filteredLinksIfNecessary = links.filter(({ postNumber }) => postNumber > oldTopPost)

      // client, sName, newPosts, topPost, board
      sendPosts({
        client,
        serverName,
        newPosts: filteredLinksIfNecessary,
        topPost,
        board: boardName,
        serverBoardIds: data,
      })
    })

    return
  } else {
    console.log('something went wrong, idiot')

    return
  }
}

module.exports = { forceRun }
