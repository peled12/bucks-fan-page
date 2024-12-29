import React, { useState, useRef, useContext } from "react"

import "./registration.css"

import { useNavigate } from "react-router-dom"

import InputSigning from "../../components/userInputComponents/inputSigning"
import Authentication from "../../components/userInputComponents/Authentication"
import ProfilePic from "../../components/userInputComponents/ProfilePic"

import { Link } from "react-router-dom"
import emailjs from "@emailjs/browser"

import KhrisImg from "../../images/khris1.png"

import axios from "axios"
import { Context } from "../../App"
import sleep from "../../functions/sleep"

const dbApiUrl = process.env.REACT_APP_API_URL

function SignUp({ setcurrentPassword, setcurrentEmail }) {
  const setisSignedIn = useContext(Context)[1]
  const setuserName = useContext(Context)[3]

  const [profilePicUrl, setProfilePicUrl] = useState("")

  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [rpass, setrpass] = useState("")
  const [newUserName, setnewUserName] = useState("")

  const [isValidEmail, setisValidEmail] = useState(true)
  const [isValidUserName, setisValidUserName] = useState(true)
  const [isVaildpw, setisVaildpw] = useState(true)
  const [isValidRPass, setisValidRPass] = useState(true)

  const [emailExistError, setemailExistError] = useState("")
  const [userNameExistError, setuserNameExistError] = useState("")

  const [startAuth, setstartAuth] = useState(false)
  const [authCode, setauthCode] = useState(0)

  const errorPostingRef = useRef(null)

  const navigate = useNavigate()

  function handleChange(e, whatToChange) {
    const changeTo = e.target.value
    switch (whatToChange) {
      case "email":
        setemail(changeTo)
        break
      case "password":
        setpassword(changeTo)
        break
      case "userName":
        setnewUserName(changeTo)
        break
      case "rpass":
        setrpass(changeTo)
        break
    }
  }

  // check if the password structure is valid
  function checkPassword() {
    if (password.length < 6 || !/[A-Z]/.test(password) || !/\d/.test(password))
      return false

    return true
  }

  // check if the user name structure is valid
  function checkUserName() {
    if (
      newUserName.length < 3 ||
      /\d/.test(newUserName.charAt(0)) ||
      newUserName === "Guest"
    )
      return false

    return true
  }

  // get email error:
  function getEmailError() {
    return (
      <p>
        {email === "" ? (
          <>You must enter an email</>
        ) : (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <>Invalid Email</>
        )}
      </p>
    )
  }

  // get user name error:
  function getUserNameError() {
    return (
      <p>
        {newUserName.length < 4 && <>User name must be at least 4 characters</>}
        {newUserName.length > 12 && (
          <>
            <br />
            User name must be shorter than 12 characters
          </>
        )}

        {/\d/.test(newUserName.charAt(0)) && (
          <>
            <br />
            User name cannot start with a number
          </>
        )}
        {newUserName === "Guest" && (
          <>
            <br />
            Invalid user name
          </>
        )}
      </p>
    )
  }

  // get pw error
  function getPwError() {
    return (
      <p>
        {password.length < 6 && <>Password must be at least 6 characters</>}
        {!/[A-Z]/.test(password) && (
          <>
            <br />
            Password must contain at least 1 capital letter
          </>
        )}
        {!/\d/.test(password) && (
          <>
            <br />
            Password must have at least 1 number
          </>
        )}
      </p>
    )
  }

  // get rpass error:
  function getRPassError() {
    return (
      <p>
        {password !== rpass && (
          <>Password and repeat password must be the same</>
        )}
      </p>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // reset existing user error messages
    setemailExistError("")
    setuserNameExistError("")

    let validRegister = true

    // check if the register is valid

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setisValidEmail(true)
    else {
      setisValidEmail(false)
      validRegister = false
    }

    if (checkPassword()) setisVaildpw(true)
    else {
      setisVaildpw(false)
      validRegister = false
    }

    if (checkUserName()) setisValidUserName(true)
    else {
      setisValidUserName(false)
      validRegister = false
    }

    if (rpass === password) setisValidRPass(true)
    else {
      setisValidRPass(false)
      validRegister = false
    }

    if (!document.getElementById("isBucksFan").checked) validRegister = false

    // logic to register (or not) to the site
    if (validRegister) {
      // start the animation
      const loader = document.querySelector(".sign-up-loader")
      loader.style.display = "block"

      try {
        await axios.post(dbApiUrl + "/signUpCheck", {
          email: email,
          username: newUserName,
        })

        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        // if still here, the username and email do not exist and its a valid register

        setstartAuth(true)

        // send the auth code:
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
        try {
          const templateParams = {
            to_name: newUserName,
            to_email: email,
            from_name: "The Bucks Page",
            message: code,
          }

          setauthCode(code)

          const serviceID = "service_1se9bwh"
          const templateID = "template_mch6ska"
          const userID = "xeLPpCLHZXEcSC_OR"

          await emailjs.send(serviceID, templateID, templateParams, userID)

          console.log("Email sent successfully!")
        } catch (err) {
          console.error("Error sending email:", err.message)
        }

        // more animation handling

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      } catch (err) {
        console.error("Failed signing up.", err.message)

        // animation handling

        await sleep(150)

        loader.style.color = "red"
        loader.style.animationPlayState = "paused"

        const reasons = err.response.data.message

        // if the email exists
        if (reasons.includes("email"))
          setemailExistError("An account had already signed up with this email")

        // if the username exists
        if (reasons.includes("username"))
          setuserNameExistError(
            "The user name you have inserted already exists"
          )

        // if there is an internal server error, display it
        if (reasons === "Internal server error.") setemailExistError(reasons)

        // more animation handling
        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      }
    }
  }

  function postUser() {
    axios
      .post(dbApiUrl + "/signUp", {
        email: email,
        password: password,
        userName: newUserName,
        profile_pic_url: profilePicUrl,
        friends: [],
        friend_requests: [],
        coins: 0,
        roster: {
          coins_spent: 0,
          players: ["", "", "", "", "", "", "", "", "", "", "", "", ""],
          coaches: ["", "", ""],
          players_bought: [],
          coaches_bought: [],
          visible: false,
          rating: [],
        },
        last_logged_in: { time: new Date().getTime(), streak: 0 },
      })
      .then(() => {
        setuserName(newUserName)
        setcurrentPassword(password)
        setcurrentEmail(email)
        setisSignedIn(true)
        navigate("/", { replace: true })
      })
      .catch((err) => {
        console.error("Failed creating user. ", err.message)

        // handle error msg:
        const msg = errorPostingRef.current

        // remove the prev animation:
        clearTimeout(msg.animationTimeout)
        msg.classList.remove("showUpdatedAccountMsg")

        void msg.offsetWidth

        // set up the new animation:
        msg.classList.add("showUpdatedAccountMsg")
        msg.animationTimeout = setTimeout(
          () => msg.classList.remove("showUpdatedAccountMsg"),
          8000
        )
      })
  }

  return (
    <>
      <div className="page-description">Sign up to join our community!</div>
      <h1 className="page-title">Sign up</h1>
      <div className="loader4 sign-up-loader"></div>
      {startAuth ? (
        <>
          <p ref={errorPostingRef} className="error-posting-user">
            Problem creating account... Changing the profile picure might help.
          </p>
          <Authentication postUser={postUser} code={authCode} />
        </>
      ) : (
        <div className="login-register register">
          <form onSubmit={handleSubmit}>
            <h2 className="title">Sign up</h2>
            <div>
              <InputSigning
                handleChange={(e) => handleChange(e, "email")}
                type="email"
                placeholder="Enter email"
                value={email}
                title="Email"
              />
              {!isValidEmail && getEmailError()}
            </div>
            <div>
              <InputSigning
                handleChange={(e) => handleChange(e, "userName")}
                type="text"
                placeholder="Enter user name"
                value={newUserName}
                title="User name"
                maxLength={12}
              />
              {!isValidUserName && getUserNameError()}
            </div>
            <div>
              <InputSigning
                handleChange={(e) => handleChange(e, "password")}
                type="password"
                placeholder="Enter password"
                value={password}
                title="Select password"
                maxLength={20}
              />
              {!isVaildpw && getPwError()}
            </div>
            <div>
              <InputSigning
                handleChange={(e) => handleChange(e, "rpass")}
                type="password"
                placeholder="Repeat password"
                value={rpass}
                title="Repeat selected password"
                maxLength={20}
              />
              {!isValidRPass && getRPassError()}
            </div>
            <label className="isFan">
              <input type="checkbox" id="isBucksFan" />
              <p>I am a bucks fan</p>
            </label>
            <div>
              {emailExistError && (
                <p className="finalError">{emailExistError}</p>
              )}
              {userNameExistError && (
                <p className="finalError">{userNameExistError}</p>
              )}
            </div>
            <button className="loginBtn" onClick={handleSubmit}>
              Sign up
            </button>
            <div className="link">
              Already have an account? <Link to="/SignIn">sign in</Link>
            </div>
          </form>
        </div>
      )}
      <img src={KhrisImg} alt="Khris image" className="khris-img1" />
      <div
        className="page-text-container"
        style={startAuth ? { top: "calc(160px + 20vh)" } : {}}
      >
        <h1>Welcome Bucks fan!</h1>
        <p>Welcome to the Bucks Fan Page!</p>
        <br />
        <p>
          Here you can explore the Bucks latest news, stats, schedule and more!
        </p>
        <br />
        <p>Sign in to enjoy the best of this website!</p>
        {!startAuth && (
          <>
            <p style={{ marginTop: "7vh", marginBottom: "1vh" }}>
              Click the icon to change the profile picture (optional)
            </p>
            <ProfilePic
              imageUrl={profilePicUrl}
              setImageUrl={setProfilePicUrl}
            />
          </>
        )}
      </div>
    </>
  )
}

export default SignUp
