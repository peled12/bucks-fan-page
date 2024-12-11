import React from "react"

import { IoMdSend } from "react-icons/io"

function ChatInput({ handleSendDM, placeholder, typingMsg, settypingMsg }) {
  return (
    <form className="form" style={{ width: "100%" }}>
      <label htmlFor="search">
        <button
          className="send-btn"
          onClick={(e) => handleSendDM(e, true)}
          style={
            typingMsg ? { backgroundColor: "rgba(20, 96, 20, 0.799)" } : {}
          }
        >
          <IoMdSend />
        </button>
        <input
          autoComplete="off"
          placeholder={placeholder}
          id="search"
          className="add-DM-input"
          onKeyDown={handleSendDM}
          onChange={(e) => settypingMsg(e.target.value)}
          value={typingMsg}
          maxLength={100}
        />
        <button
          type="reset"
          className="close-btn"
          onClick={() => settypingMsg("")}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
      </label>
    </form>
  )
}

export default ChatInput
