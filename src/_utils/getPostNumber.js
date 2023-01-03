// get post numbers for all servers
export function getPostNumber(data, serverNames, board) {
  // {[serverName]: topPost}
  const mapServerNamesToTopPosts = serverNames
    .map((sName) => {
      if (!data[sName][board]) return null

      return { serverName: sName, topPost: data[sName][board].top }
    })
    .filter(Boolean)

  return mapServerNamesToTopPosts
}
