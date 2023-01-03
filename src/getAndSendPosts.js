const { getPostNumber } = require('./getPostNumber')
const { sendPosts } = require('./sendPosts')
const { getPosts } = require('./getPosts')

const getAndSendPosts = async ({ client, data, serverNames, boardName }) => {
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

    sendPosts({
      client,
      serverName,
      newPosts: filteredLinksIfNecessary,
      topPost,
      board: boardName,
      serverBoardIds: data,
    })
  })
}

module.exports = { getAndSendPosts }
