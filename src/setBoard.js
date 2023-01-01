const { updatePostNumber } = require('./updatePostNumber')
const { boardKeys, boardLookupTable } = require('./boardLookupTable')

function setBoard(message) {
  const boardName = message[1]
  const newTopPost = message[2]

  if (boardName === 'all') {
    for (let i = 0; i < boardKeys.length; i++) {
      updatePostNumber(boardKeys[i], 9999)
    }

    return
  } else if (!boardLookupTable[boardName]) {
    console.log(`${boardName} board not found. Choose from the following: ${boardKeys}`)

    return
  } else if (!newTopPost || !Number(newTopPost)) {
    console.log('please enter a valid post number to set board to.')

    return
  }

  console.log(`setting post number of ${boardName} to ${newTopPost}...`)

  updatePostNumber(boardName, Number(newTopPost))
}

module.exports = { setBoard }
