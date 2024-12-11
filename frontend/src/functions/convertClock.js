export default function convertClock(time12h) {
  const timeComponents = time12h.split(":")
  const hour = parseInt(timeComponents[0])
  const minutes = parseInt(timeComponents[1].substring(0, 2))
  const period = timeComponents[1].substring(2, 3)

  // converting to 24-hour format
  let hour24
  if (period.toLowerCase() === "p") hour24 = hour === 12 ? 12 : hour + 12
  else if (period.toLowerCase() === "a") hour24 = hour === 12 ? 0 : hour

  // Formatting the result
  const formattedHour = hour24 < 10 ? "0" + hour24 : hour24
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes

  const formattedTime = `${formattedHour}:${formattedMinutes}`
  return formattedTime
}
