export function start(client, cronJob) {
  console.log('starting...')

  client.login(process.env.BOARD_BOT_TOKEN)

  cronJob.start()
}
