import * as dotenv from 'dotenv'
// import axios from 'axios'
// import * as cheerio from 'cheerio'

dotenv.config()

import Discord from 'discord.js'
import { forceRun, restartClient, setBoard, start, stop } from './commands/index.js'
import { startCronJob } from './_utils/index.js'
// import { sendPosts } from './_utils/index.js'
// import fs from 'fs'

const client = new Discord.Client()
const cronJob = startCronJob(client)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', async (msg) => {
  try {
    const message = msg.content.split(' ')
    const userCommand = message[0]

    if (userCommand === '!boardsforcerun') {
      forceRun(client, message)
    } else if (userCommand === '!setboard') {
      setBoard(message)
    } else if (userCommand === '!boardsrestart') {
      restartClient(client, cronJob)
    } else if (userCommand === '!boardsstart') {
      start(client, cronJob)
    } else if (userCommand === '!boardsstop') {
      stop(cronJob)
    }
    // else if (userCommand === '!boardsgetall') {
    //   const serverName = message[1]
    //   const board = message[2]
    //   const lastPage = message[3]

    //   getAllPostsFromBoard({ board, serverName, lastPage })
    // }
  } catch (e) {
    console.log(e)
  }
})

start(client, cronJob)

// const getAllPostsFromBoard = async ({ board, serverName, lastPage = 0, prevTop = 0 }) => {
//   try {
//     const allData = []

//     let newTop = 0

//     for (let i = lastPage; i >= 0; i--) {
//       const data = await axios.get(`http://boards.nexustk.com/${board}/index${i === 0 ? '' : i}.html`)
//       const $ = cheerio.load(data.data)
//       const posts = $('tr td:first-child a')

//       newTop = Number($(posts[0]).text())

//       const links = []

//       for (let i = posts.length - 1; i >= 0; i--) {
//         const post = posts[i]
//         const postNumber = Number($(post).text())

//         if (postNumber > prevTop) {
//           const link = `http://boards.nexustk.com/${board}/${$(post).attr('href')}`

//           links.push({ link, postNumber })
//         }
//       }

//       allData.push(links)
//     }

//     console.log(allData)

//     const data = JSON.parse(fs.readFileSync('./topBoardPosts.json'))

//     sendPosts({
//       client,
//       serverName,
//       newPosts: allData.flat(),
//       topPost: newTop,
//       board,
//       serverBoardIds: data,
//     })

//     return { links: allData, topPost: newTop }
//   } catch (e) {
//     console.log(`an error in getPosts getting ${board}`)

//     return { links: [], topPost: prevTop }
//   }
// }
