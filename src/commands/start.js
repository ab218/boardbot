export function start(client, cronJob, krunaCronJob) {
  console.log('starting...')

  client.login(process.env.BOARD_BOT_TOKEN)

  cronJob.start()

  krunaCronJob.start()
}
