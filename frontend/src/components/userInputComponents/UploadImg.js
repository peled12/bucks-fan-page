import React, { useRef } from "react"

import { FaCloudUploadAlt } from "react-icons/fa"

function UploadImg({ imgUrl, setimgUrl }) {
  const imgInputRef = useRef(null)

  function handleChangeImage(e) {
    const file = e.target.files[0]
    const reader = new FileReader()

    if (file) {
      reader.onloadend = () => {
        setimgUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="all-upload-container">
      <div className="upload-container">
        {imgUrl ? (
          <img src={imgUrl} className="seat-sell-img" alt="" />
        ) : (
          <label htmlFor="post-fanpost-input-file" className="drop-area">
            <FaCloudUploadAlt className="upload-icon" />
            <p>
              Click to choose an image <br /> or drop one here
            </p>
            <input
              type="file"
              accept="image/**"
              id="post-fanpost-input-file"
              onInput={handleChangeImage}
              ref={imgInputRef}
            />
          </label>
        )}
      </div>
      {imgUrl && (
        <button className="remove-btn" onClick={() => setimgUrl("")}>
          Remove Image
        </button>
      )}
    </div>
  )
}

export default UploadImg
