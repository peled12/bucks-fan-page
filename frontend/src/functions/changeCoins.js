const dbApiUrl = process.env.REACT_APP_API_URL

export default async function changeCoins(username, addingNumber) {
  try {
    const response = await fetch(dbApiUrl + "/users/changeCoins/" + username, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        addingNumber: addingNumber,
      }),
    })

    if (!response.ok) {
      return new Error("Problem patching coins number")
    }
  } catch (err) {
    return new Error(err.message)
  }
}
