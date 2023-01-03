// get post numbers for all servers
export function getPostNumber(data, serverNames, board) {
  // {[serverName]: topPost}
  const mapServerNamesToTopPosts = serverNames
    .map((serverName) => {
      if (!data[serverName][board]) return null

      return { serverName, topPost: data[serverName][board].top }
    })
    .filter(Boolean)

  return mapServerNamesToTopPosts
}
