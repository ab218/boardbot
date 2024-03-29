import fs from 'fs'

export function updatePostNumber(board, postNumber, serverName) {
  const topPostData = JSON.parse(fs.readFileSync('./topBoardPosts.json'))

  const updatedData = Object.entries(topPostData).reduce((acc, [key, val]) => {
    if (key !== serverName) return { ...acc, [key]: val }

    const fixedVal = Object.entries(val).reduce((a, [k, v]) => {
      if (k === board) {
        return { ...a, [k]: { ...v, top: postNumber } }
      }

      return { ...a, [k]: v }
    }, {})

    return { ...acc, [key]: fixedVal }
  }, {})

  fs.writeFileSync('./topBoardPosts.json', JSON.stringify(updatedData), function (err) {
    if (err) {
      console.error('Crap happens')
    }
  })
}
