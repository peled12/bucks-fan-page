export default function isUpToAWeekBefore(dateString) {
  const parts = dateString.split("-")
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = 2000 + parseInt(parts[2], 10)

  const parsedDate = new Date(year, month, day)

  // get the current date
  const currentDate = new Date()

  // calculate the date one week ago
  const oneWeekAgo = new Date(currentDate)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // check if the parsed date falls within the range of one week ago and the current date
  return parsedDate >= oneWeekAgo && parsedDate <= currentDate
}
