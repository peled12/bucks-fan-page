export default function handleGoToFanpost(post, index, fanposts, navigate) {
  const newArray = []

  const arrayLength = fanposts.length

  for (let i = 0; i < Math.min(arrayLength, 5); i++) {
    const newIndex = (index + i) % arrayLength
    newArray.push(fanposts[newIndex])
  }

  navigate("/Fanposts/" + post._id, {
    state: {
      next5posts: newArray,
      index: index - 1,
    },
  })
}
