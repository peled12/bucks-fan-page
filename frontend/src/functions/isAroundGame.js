export default function isAroundGame(schedule, gameDate) {
  const gameIndex = schedule.findIndex((obj) => obj.gameDate === gameDate)

  // return true if its first or last games
  if (gameIndex === 0 || gameIndex === schedule.length - 1) return true
  if (gameIndex === -1) return false // cuz its not a bucks game then

  const gameBefore = schedule[gameIndex - 1]
  const gameAfter = schedule[gameIndex + 1]

  const currentDate = new Date()

  const currentDateStr =
    currentDate.getFullYear() +
    ("0" + (currentDate.getMonth() + 1)).slice(-2) +
    ("0" + currentDate.getDate()).slice(-2)

  return (
    (currentDateStr > gameBefore.gameDate ||
      (currentDateStr === gameBefore.gameDate && gameBefore.homeResult)) &&
    (currentDateStr < gameAfter.gameDate ||
      (currentDateStr === gameAfter.gameDate && !gameAfter.homeResult))
  )
}
