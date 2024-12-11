import sleep from "./sleep"

export default async function refetch(refetchBtn, loader) {
  loader.style.display = "block" // start the animation

  try {
    const res = await refetchBtn() // refetch

    await sleep(150)

    if ((res.status = "succsess")) {
      loader.style.color = "green"
      loader.style.animationPlayState = "paused"

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"
    } else {
      loader.style.color = "red"
      loader.style.animationPlayState = "paused"

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"
    }
  } catch (err) {
    console.error("Couldn't refetch.", err.message)

    loader.style.color = "red"
    loader.style.animationPlayState = "paused"

    await sleep(250)

    loader.style.animationPlayState = "running"
    loader.style.display = "none"
    loader.style.color = "black"
  }
}
