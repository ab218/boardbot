const fs = require('fs')

function updatePostNumber(board, postno) {
  const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))

  data[board] = postno

  fs.writeFileSync('./topBoardPosts.json', JSON.stringify(data), function (err) {
    if (err) {
      console.error('Crap happens')
    }
  })
}

module.exports = { updatePostNumber }
