import axios from 'axios'
import * as cheerio from 'cheerio'
import { DREAM_WEAVER } from './boardLookupTable.js'
import { updatePostNumber } from './updatePostNumber.js'

export async function sendPosts({ client, serverName, newPosts, topPost, board, serverBoardIds }) {
  try {
    for (let i = 0; i < newPosts.length; i++) {
      const { link, postNumber } = newPosts[i]
      const data = await axios.get(link)
      const $ = cheerio.load(data.data)
      const author = $('tr:contains("Author :") td').eq(1).text()
      const subject = $('tr:contains("Subject :") td').eq(1).text()
      const date = $('tr:contains("Date :") td').eq(1).text()
      const body = $('tr:nth-child(5) td').text().split('<b>').join('').split('<B>').join('')
      const notifyAllIfDreamWeaver = board === DREAM_WEAVER ? '@everyone\n' : ''

      const normalTemplate =
        '```md\n' +
        '#' +
        postNumber +
        '\n' +
        '> Date: ' +
        date +
        '\n' +
        '< Author: ' +
        author +
        ' >\n' +
        '< Subject: ' +
        subject +
        ' >\n\n' +
        body.split('**').join('') +
        '```'

      await client.channels.cache
        .get(serverBoardIds[serverName][board].id)
        .send(notifyAllIfDreamWeaver + normalTemplate, {
          split: {
            char: ' ',
            prepend: '```md\n',
            append: '```',
          },
        })
      }
      // only update if posts are made
      updatePostNumber(board, topPost, serverName)
  } catch (e) {
    console.log(e)
  }


  return
}
