import { getPostNumber } from './getPostNumber.js'
import { getPosts } from './getPosts.js'
import { sendPosts } from './sendPosts.js'

export const getAndSendPosts = async ({ client, data, serverNames, boardName }) => {
  // {[serverName]: topPost}
  const postno = getPostNumber(data, serverNames, boardName)

  const lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers = postno.reduce(
    (acc, { serverName, topPost }) => {
      if (!Object.keys(acc).length || Object.values(acc)[0] > topPost) {
        return { [serverName]: topPost }
      }

      return acc
    },
    {},
  )

  const { links, topPost } = await getPosts(
    boardName,
    Object.values(lowestPostNumberToGetAllNeededPostsInCaseTheresADiscrepancyBetweenServers)[0],
  )

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
