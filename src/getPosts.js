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
      const post = posts[i]
      const postNumber = Number($(post).text())

      if (postNumber > prevTop) {
        const link = `http://boards.nexustk.com/${board}/${$(post).attr('href')}`

        links.push({ link, postNumber })
      }
    }

    return { links, topPost: newTop }
  } catch (e) {
    console.log(`an error in getPosts getting ${board}`)

    return { links: [], topPost: prevTop }
  }
}

module.exports = { getPosts }
