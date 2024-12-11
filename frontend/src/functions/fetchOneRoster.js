const dbApiUrl = process.env.REACT_APP_API_URL

export default async function fetchOneRoster(rosterMaker) {
  try {
    const response = await fetch(`${dbApiUrl}/users/user/${rosterMaker}`, {
      method: "GET",
    })

    // check if the response is okay
    if (!response.ok) {
      return
    }

    const data = await response.json()
    return data.roster
  } catch (err) {
    console.error("Couldn't fetch user's roster.", err.message)
  }
}
