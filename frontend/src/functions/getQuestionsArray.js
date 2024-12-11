export default function getQuestionsArray(oppName) {
  return [
    ["Bucks", oppName],
    [
      "Bucks by 8 or more",
      "Bucks by 8 or less",
      oppName + " by 8 or less",
      oppName + " by 8 or more",
    ],
    [
      "Less than 95 pts",
      "95 to 110 pts",
      "110 to 125 pts",
      "More than 125 pts",
    ],
    [
      "Less than 100 pts",
      "100 to 115 pts",
      "115 to 130 pts",
      "More than 130 pts",
    ],
    ["Over", "Under"],
    ["Very good!", "Alright.", "Not so good...", "Horrible ):"],
  ]
}
