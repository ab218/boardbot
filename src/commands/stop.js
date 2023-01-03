export function stop(cronJob) {
  console.log('stopping jobs...')

  cronJob.stop()
}
