import React, { useState, useRef, useContext } from "react"

import InputSigning from "../../components/userInputComponents/inputSigning"

import emailjs from "@emailjs/browser"

import "./registration.css"

import axios from "axios"

import { Link, useNavigate } from "react-router-dom"

import dameImg from "../../images/dame1.png"
import { Context } from "../../App"
import sleep from "../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function SignIn({ setcurrentPassword, setcurrentEmail }) {
  const setisSignedIn = useContext(Context)[1]
  const setuserName = useContext(Context)[3]

  const [email, setemail] = useState("") // email could also be the user name
  const [password, setpassword] = useState("")

  const [loginErrorMessage, setloginErrorMessage] = useState("")

  const [forgotPassword, setforgotPassword] = useState(false)
  const [forgotUserId, setforgotUserId] = useState("")
  const [forgotPasswordMsg, setforgotPasswordMsg] = useState("")
  const [forgotPasswordEmail, setforgotPasswordEmail] = useState("")

  const [authCode, setauthCode] = useState("")
  const [acceptNewPassword, setacceptNewPassword] = useState(false)

  const [isValidNewPw, setisValidNewPw] = useState(true)
  const [newPassword, setnewPassword] = useState("")

  const forgotPasswordMsgRef = useRef(null)
  const correctAuthMsgRef = useRef(null)

  const navigate = useNavigate()

  // get new pw error
  function getNewPwError() {
    return (
      <p>
        {newPassword.length < 6 && <>Password must be at least 6 characters</>}
        {!/[A-Z]/.test(newPassword) && (
          <>
            <br />
            Password must contain at least 1 capital letter
          </>
        )}
        {!/\d/.test(newPassword) && (
          <>
            <br />
            Password must have at least 1 number
          </>
        )}
      </p>
    )
  }

  function handleChange(e, whatToChange) {
    const changeTo = e.target.value
    switch (whatToChange) {
      case "email":
        setemail(changeTo)
        break
      case "password":
        setpassword(changeTo)
        break
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // start the animation
    const loader = document.querySelector(".sign-in-loader")
    loader.style.display = "block"

    try {
      const res = await axios.post(dbApiUrl + "/login", {
        usernameOrEmail: email,
        password: password,
      })

      // animation handling

      await sleep(150)

      loader.style.color = "green"
      loader.style.animationPlayState = "paused"

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"

      // successful login; update variables
      const {
        username: newUsername,
        email: newEmail,
        password: newPassword,
      } = res.data
      setuserName(newUsername)
      setcurrentEmail(newEmail)
      setcurrentPassword(newPassword)
      setisSignedIn(true)

      // navigate to the home page
      navigate("/", { replace: true })
    } catch (err) {
      console.error("Failed logging in.", err.message)

      setloginErrorMessage(err.response.data.message)

      // animation handling

      await sleep(150)

      loader.style.color = "red"
      loader.style.animationPlayState = "paused"

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"
    }
  }

  async function handleForgotPassword(e) {
    if (e.key === "Enter") {
      const loader = document.querySelector(".sign-in-loader")
      loader.style.display = "block" // start the animation

      try {
        const user = await axios.get(
          dbApiUrl + "/users/findWithEmail/" + forgotPasswordEmail
        )

        // send an auth code
        async function sendEmail() {
          // create the new auth code:
          const code =
            Math.floor(Math.random() * 10) +
            "" +
            Math.floor(Math.random() * 10) +
            "" +
            Math.floor(Math.random() * 10) +
            "" +
            Math.floor(Math.random() * 10) +
            "" +
            Math.floor(Math.random() * 10) +
            "" +
            Math.floor(Math.random() * 10)
          setauthCode(code)
          // send the email:
          try {
            const templateParams = {
              to_name: user.data.username,
              to_email: user.data.email,
              message: code,
            }

            const serviceID = "service_wir2ei4"
            const templateID = "template_j5w1djw"
            const userID = "wBp93C977rmFOlQKX"

            await emailjs.send(serviceID, templateID, templateParams, userID)

            console.log("Email sent successfully!")

            // animation handling
            await sleep(150)

            loader.style.color = "green"
            loader.style.animationPlayState = "paused"

            // pop the auth code box
            setforgotPasswordMsg("Good")
            setforgotUserId(user.data.id) // save the forgotten user's id
            forgotPasswordMsgRef.current.classList.remove(
              "showForgotPasswordError"
            ) // remove the error msg

            await sleep(250)

            loader.style.animationPlayState = "running"
            loader.style.display = "none"
            loader.style.color = "black"
          } catch (err) {
            console.error("Error sending email: " + err.message)

            // animation handling
            await sleep(150)

            loader.style.color = "red"
            loader.style.animationPlayState = "paused"

            // tell the user the error
            setforgotPasswordMsg(
              "Problem sending email... Please try again later."
            )
            applyForgotPasswordErrorAni("email")
            setacceptNewPassword(false)

            await sleep(250)

            loader.style.animationPlayState = "running"
            loader.style.display = "none"
            loader.style.color = "black"
          }
        }
        sendEmail()
      } catch (err) {
        console.error("failed getting user's data.", err.message)

        // animation handling
        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        if (err.message && err.message.includes("500"))
          alert("Internal server error.")

        // tell the user the error
        setforgotPasswordMsg(err.response.data.message)
        applyForgotPasswordErrorAni("email")
        setacceptNewPassword(false)

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      }
    }
  }

  function handleForgotPasswordAuth(e) {
    if (e.key === "Enter" && !acceptNewPassword) {
      if (authCode === e.target.value) {
        setacceptNewPassword(true)
        correctAuthMsgRef.current.classList.remove("showForgotPasswordError") // remove the error msg
      } else applyForgotPasswordErrorAni("auth")
    }
  }

  function handleChangePw(e) {
    if (e.key === "Enter") {
      if (
        newPassword.length < 6 ||
        !/[A-Z]/.test(newPassword) ||
        !/\d/.test(newPassword)
      )
        setisValidNewPw(false)
      else {
        setisValidNewPw(true)

        // change the password:
        patchUser(newPassword, forgotUserId)
      }
    }
  }

  function patchUser(newPassword, id) {
    // start the animation
    const loader = document.querySelector(".sign-in-loader")
    loader.style.display = "block"

    axios
      .patch(dbApiUrl + "/users/" + id, {
        password: newPassword,
      })
      .then(async () => {
        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        alert("Password changed!")

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Failed changing password.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
  }

  function applyForgotPasswordErrorAni(error) {
    let msg

    switch (error) {
      case "email":
        msg = forgotPasswordMsgRef.current
        break
      case "auth":
        msg = correctAuthMsgRef.current
        break
    }

    // remove the prev animation:
    clearTimeout(msg.animationTimeout)
    msg.classList.remove("showForgotPasswordError")

    void msg.offsetWidth

    // set up the new animation:
    msg.classList.add("showForgotPasswordError")
    msg.animationTimeout = setTimeout(
      () => msg.classList.remove("showForgotPasswordError"),
      8000
    )
  }

  return (
    <>
      <h1 className="page-title">Sign in</h1>
      <p className="page-description">
        Sign in to post, chat, and enjoy the best out of this website!
      </p>
      <div className="loader4 sign-in-loader"></div>
      <div className="login">
        <form onSubmit={handleSubmit}>
          <h2 className="title">Sign in</h2>
          <div>
            <InputSigning
              handleChange={(e) => handleChange(e, "email")}
              type="email"
              placeholder="Enter email or user name"
              value={email}
              title="Email or user name"
            />
          </div>
          <div>
            <InputSigning
              handleChange={(e) => handleChange(e, "password")}
              type="password"
              placeholder="Enter password"
              value={password}
              title="Password"
            />
            {loginErrorMessage && <p>{loginErrorMessage}</p>}
          </div>
          <button className="loginBtn" onClick={handleSubmit}>
            Sign In
          </button>
          <div className="link">
            Don't have an account? <Link to="/SignUp">sign up</Link>
          </div>
        </form>
      </div>
      <img src={dameImg} alt="Damian image" className="dame-img1" />
      <div className="page-text-container">
        <h1>Welcome Back!</h1>
        <p>Welcome back to the Bucks Fan Page!</p>
        <br />
        <p>Sign in to your account to enjoy the best of the this website!</p>
        <br />
        <p>
          Forgot your password?{" "}
          <button
            className="forgot-password"
            onClick={() => setforgotPassword((prev) => !prev)}
          >
            {forgotPassword ? "Hide" : "Click here"}
          </button>
        </p>
        <br />
        {forgotPassword && (
          <>
            <input
              placeholder="Enter email..."
              className="forgot-password-input"
              value={forgotPasswordEmail}
              onChange={(e) => setforgotPasswordEmail(e.target.value)}
              onKeyDown={handleForgotPassword}
            />
            <p className="forgot-password-error" ref={forgotPasswordMsgRef}>
              {forgotPasswordMsg}
            </p>
            {forgotPasswordMsg === "Good" && (
              <>
                <input
                  placeholder="Enter code sent to your email..."
                  className="forgot-password-input"
                  type="number"
                  onKeyDown={handleForgotPasswordAuth}
                />
                <p className="forgot-password-error" ref={correctAuthMsgRef}>
                  Incorrect authentication password
                </p>
                {acceptNewPassword && (
                  <>
                    <input
                      placeholder="Enter new password..."
                      className="forgot-password-input"
                      onChange={(e) => setnewPassword(e.target.value)}
                      onKeyDown={handleChangePw}
                    />
                    {!isValidNewPw && (
                      <div className="change-password-error">
                        {getNewPwError()}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default SignIn
