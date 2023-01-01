require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const { setBoard } = require('./setBoard')
const { forceRun } = require('./forceRun')
const { restartClient } = require('./restartClient')
const { start } = require('./start')
const { stop } = require('./stop')
const { startCronJob } = require('./startCronJob')
const cronJob = startCronJob(client)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', (msg) => {
  try {
    const message = msg.content.split(' ')
    const userCommand = message[0]

    console.log(msg.content)

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
