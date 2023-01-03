import fs from 'fs'
import { boardKeys, boardLookupTable, updatePostNumber } from '../_utils/index.js'

export function setBoard(message) {
  const boardName = message[1]
  const newTopPost = message[2]
  const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))
  const serverNames = Object.keys(data)

  if (boardName === 'all') {
    serverNames.forEach((serverName) => {
      for (let i = 0; i < boardKeys.length; i++) {
        updatePostNumber(boardKeys[i], 9999, serverName)
      }
    })

    return
  } else if (!boardLookupTable[boardName]) {
    console.log(`${boardName} board not found. Choose from the following: ${boardKeys}`)

    return
  } else if (!newTopPost || !Number(newTopPost)) {
    console.log('please enter a valid post number to set board to.')

    return
  }

  console.log(`setting post number of ${boardName} to ${newTopPost}...`)

  serverNames.forEach((serverName) => {
    updatePostNumber(boardName, Number(newTopPost), serverName)
  })
}
