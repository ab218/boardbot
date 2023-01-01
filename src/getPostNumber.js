const fs = require('fs')

function getPostNumber(board) {
  const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))

  return data[board]
}

module.exports = { getPostNumber }
