import { getPostNumber } from './getPostNumber.js'
import { getPosts } from './getPosts.js'
import { sendPosts } from './sendPosts.js'

export const getAndSendPosts = async ({ client, data, serverNames, boardName }) => {
  // {[serverName]: topPost}
  const postNumberForAllServers = getPostNumber(data, serverNames, boardName)

  const lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers = postNumberForAllServers.reduce(
    (acc, { topPost }) => (acc > topPost ? topPost : acc), Infinity
  )

  const { links, topPost } = await getPosts(
    boardName,
    lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers
  )

  console.log('newPosts: ', links, 'topPost: ', topPost)

  postNumberForAllServers.forEach(async ({ serverName, topPost: oldTopPost }) => {
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
