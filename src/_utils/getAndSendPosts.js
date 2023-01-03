import { getPostNumber } from './getPostNumber.js'
import { getPosts } from './getPosts.js'
import { sendPosts } from './sendPosts.js'

export const getAndSendPosts = async ({ client, data, serverNames, boardName }) => {
  const postNumberForAllServers = getPostNumber(data, serverNames, boardName)

  const lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers =
    postNumberForAllServers.reduce((acc, { topPost }) => Math.min(acc, topPost), Infinity)

  const { links, topPost } = await getPosts(
    boardName,
    lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers,
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
