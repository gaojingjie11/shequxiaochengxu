const formatTime = (date, withSeconds = true) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const part1 = [year, month, day].map(formatNumber).join('/')
  const part2 = [hour, minute, second].map(formatNumber).join(':')

  return withSeconds ? `${part1} ${part2}` : `${part1} ${part2.substring(0, 5)}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime
}
