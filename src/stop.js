function stop(cronJob) {
  console.log('stopping jobs...')

  cronJob.stop()
}

module.exports = { stop }
