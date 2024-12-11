export default function getCurrentDate() {
  const currentDate = new Date()

  // get year, month, and day
  const year = currentDate.getFullYear()
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0") // month is zero-indexed
  const day = currentDate.getDate().toString().padStart(2, "0")

  // concatenate year, month, and day
  const formattedDate = `${year}${month}${day}`

  return formattedDate
}
