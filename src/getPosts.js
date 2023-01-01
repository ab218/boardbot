const axios = require('axios')
const cheerio = require('cheerio')

async function getPosts(board, prevTop) {
  try {
    const data = await axios.get(`http://boards.nexustk.com/${board}/index.html`)
    const $ = cheerio.load(data.data)
    const posts = $('tr td:first-child a')
    const newTop = Number($(posts[0]).text())
    const links = []

    for (let i = posts.length - 1; i >= 0; i--) {
      const postNumber = Number($(posts[i]).text())

      if (postNumber > prevTop) {
        links.push(`http://boards.nexustk.com/${board}/${$(posts[i]).attr('href')}`)
      }
    }

    return { links, topPost: newTop }
  } catch (e) {
    console.log(`an error in getPosts getting ${board}`)

    return { links: [], topPost: prevTop }
  }
}

module.exports = { getPosts }
