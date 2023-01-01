const { boardLookupTable, boardKeys } = require('./boardLookupTable')
const { getPostNumber } = require('./getPostNumber')
const { sendPosts } = require('./sendPosts')
const { getPosts } = require('./getPosts')

async function forceRun(client, message) {
  console.log(message, boardLookupTable)

  const boardName = message[1]

  if (boardName === 'all') {
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const board = boardKeys[i]
        const postno = getPostNumber(board)
        const { links, topPost } = await getPosts(board, postno)

        console.log('newPosts: ', links, 'topPost: ', topPost)

        await sendPosts(client, links, topPost, board)
      }
    } catch (e) {
      console.log(e, 'in forcerun command')
    }
  } else if (!boardLookupTable[boardName]) {
    console.log(`${boardName} board not found. Choose from the following: ${boardKeys} or all.`)

    return
  } else if (boardLookupTable[boardName] && typeof boardLookupTable[boardName] === 'string') {
    const postno = getPostNumber(boardName)
    const { links, topPost } = await getPosts(boardName, postno)

    console.log('newPosts: ', links, 'topPost: ', topPost)

    return sendPosts(client, links, topPost, boardName)
  } else {
    console.log('something went wrong, idiot')

    return
  }
}

module.exports = { forceRun }
