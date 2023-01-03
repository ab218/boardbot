import fs from 'fs'
import { boardLookupTable, boardKeys, getAndSendPosts } from '../_utils/index.js'

export async function forceRun(client, message) {
  const boardName = message[1]
  const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))
  const serverNames = Object.keys(data)

  if (boardName === 'all') {
    try {
      for (let i = 0; i < boardKeys.length; i++) {
        const boardName = boardKeys[i]

        getAndSendPosts({ client, data, serverNames, boardName })
      }
    } catch (e) {
      console.log('an error happened in forcerun: ', e)
    }
  } else if (!boardLookupTable[boardName]) {
    console.log(`${boardName} board not found. Choose from the following: ${boardKeys} or all.`)

    return
  } else if (boardLookupTable[boardName] && typeof boardLookupTable[boardName] === 'string') {
    getAndSendPosts({ client, data, serverNames, boardName })

    return
  } else {
    console.log('something went wrong, idiot')

    return
  }
}
