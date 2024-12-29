import React, { useRef } from "react"

import defaultPic from "../../images/default_user.png"

function ProfilePic({ imageUrl, setImageUrl }) {
  const imageInputRef = useRef(null)

  function handleImageChange(e) {
    const selectedImage = e.target.files[0]
    if (selectedImage) handleImage(selectedImage)
  }

  function handleDrop(e) {
    e.preventDefault()
    const droppedImage = e.dataTransfer.files[0]
    if (droppedImage) handleImage(droppedImage)
  }

  function handleImage(image) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageUrl(e.target.result)
      // the request to change the pfp will occur on this change via useEffect in the current page
    }
    reader.readAsDataURL(image)
  }

  function handleClick() {
    imageInputRef.current.click()
  }

  function handleRemoveImg() {
    setImageUrl("")
    // the request to chage the pfp will occur on this change via useEffect in the current page
  }

  return (
    <div className="profile-pic-input">
      <input
        type="file"
        accept="images/**"
        ref={imageInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      <div
        className="profile-pic-container"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <img
          src={imageUrl ? imageUrl : defaultPic}
          alt=""
          className="profile-pic"
        />
      </div>
      <button className="remove-image-btn" onClick={handleRemoveImg}>
        Remove image
      </button>
    </div>
  )
}

export default ProfilePic
