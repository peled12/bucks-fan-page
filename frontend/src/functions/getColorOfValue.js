export default function getColorOfRating(value) {
  const hue = (value / 10) * 120
  return `hsl(${hue}, 100%, 50%)`
}
