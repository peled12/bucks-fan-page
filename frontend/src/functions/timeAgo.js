export default function timeAgo(year, month, day, hour, minute) {
  const pastTime = new Date(year, month - 1, day, hour, minute)
  const currentTime = new Date()

  const timeDifference = currentTime - pastTime

  const seconds = Math.floor(timeDifference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`
  if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`
  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  if (minutes > 0)
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`
  {
    return "Just now"
  }
}
