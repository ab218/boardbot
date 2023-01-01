const axios = require('axios')
const cheerio = require('cheerio')
const { boardLookupTable, DREAM_WEAVER } = require('./boardLookupTable')
const { updatePostNumber } = require('./updatePostNumber')

async function sendPosts(client, newPosts, topPost, board) {
  try {
    for (let i = 0; i < newPosts.length; i++) {
      const post = newPosts[i]
      const linkURL = post.split('.html')[0]
      const postNumber = linkURL.slice(linkURL.length - 4)
      const data = await axios.get(post)
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

      await client.channels.cache.get(boardLookupTable[board]).send(notifyAllIfDreamWeaver + normalTemplate, {
        split: {
          char: ' ',
          prepend: '```md\n',
          append: '```',
        },
      })
    }
  } catch (e) {
    console.log(e)
  }

  updatePostNumber(board, topPost)

  return
}

module.exports = { sendPosts }
