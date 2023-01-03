import * as dotenv from 'dotenv'

dotenv.config()

import Discord from 'discord.js'
import { forceRun, restartClient, setBoard, start, stop } from './commands/index.js'
import { startCronJob } from './_utils/index.js'

const client = new Discord.Client()
const cronJob = startCronJob(client)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
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
  } catch (e) {
    console.log(e)
  }
})

start(client, cronJob)
