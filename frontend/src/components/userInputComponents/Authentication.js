import React from "react"

import { useState } from "react"

function Authentication({ postUser, code }) {
  const [inputedCode, setinputedCode] = useState("")
  const [authError, setauthError] = useState("")

  function handleSubmit(e) {
    e.preventDefault()

    if (inputedCode === code) {
      postUser()
      setauthError("")
    } else setauthError("Incorrect code")
  }

  function handleChange(e) {
    // remove non-numeric characters:
    const enteredValue = e.target.value.replace(/\D/g, "")

    if (enteredValue.length < 7) setinputedCode(enteredValue)
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="code">
            <p>Enter the 6-digit code</p>
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={inputedCode}
            title="Please enter a 6-digit code"
            onChange={handleChange}
            placeholder="Enter code..."
            pattern="[0-9]{6}"
            required
          />
        </div>
        <button type="submit">Submit</button>
        {authError && (
          <>
            <br />
            <p className="auth-error">{authError}</p>
          </>
        )}
      </form>
    </>
  )
}

export default Authentication
