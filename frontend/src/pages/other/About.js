import React, { useState, useContext, useRef } from "react"

import "./pages.css"

import emailjs from "@emailjs/browser"

import { Context } from "../../App"
import sleep from "../../functions/sleep"

import giannisDrawing from "../../images/giannis_drawing.png"

function About() {
  const userName = useContext(Context)[2]

  const [msg, setmsg] = useState("")
  const [fromContact, setfromContact] = useState("")

  const [isEmailInputFocused, setisEmailInputFocused] = useState(false)

  const emailInputLabelRef = useRef(null)

  function handleChange(e, type) {
    const value = e.target.value

    switch (type) {
      case "msg":
        setmsg(value)
        break
      case "from email":
        setfromContact(value)
        break
    }
  }

  async function sendEmail(e) {
    // make sure its either the button the the enter key
    if (e.key && e.key != "Enter") return

    setfromContact("")
    setmsg("")

    // start the animation
    const loader = document.querySelector(".about-page-loader")
    loader.style.display = "block"

    try {
      const templateParams = {
        from_name: userName,
        message: msg,
        from_email: fromContact,
      }

      await emailjs.send(
        "service_wir2ei4",
        "template_jmnx8pz",
        templateParams,
        "wBp93C977rmFOlQKX"
      )

      // animation handling

      await sleep(150)

      loader.style.color = "green"
      loader.style.animationPlayState = "paused"

      alert("Thanks for sending feedback!")

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"
    } catch (err) {
      console.error("Failed to send email.", err.message)

      // animation handling

      await sleep(150)

      loader.style.color = "red"
      loader.style.animationPlayState = "paused"

      alert("Failed to send email... Please try again later")

      await sleep(250)

      loader.style.animationPlayState = "running"
      loader.style.display = "none"
      loader.style.color = "black"
    }
  }

  return (
    <>
      <h1 className="page-title">About</h1>
      <p className="page-description">About this website.</p>
      <div className="styling-container">
        <div className="text">
          <h2>Express Your Thoughts</h2>
          <p>I'm open for criticism. Feel free to contact me</p>
        </div>
        <img src={giannisDrawing} alt="Giannis image" />
      </div>
      <div className="loader4 about-page-loader"></div>
      <div className="about-container">
        <div className="text-container">
          <h1>About</h1>
          <p>
            Welcome to the Bucks Fan Page. Explore All different kinds of
            opinions in this bucks community, and express your own. Be updated
            with Bucks games and all-around stats. I am hoping for you to
            experience a great time exploring this website as a Bucks fan.
          </p>
        </div>
        <div className="meet-container">
          <h1>About Me</h1>
          <p>My name is Peled Koren, React developer.</p>
          <p>
            I have 2 years of experience with react, js, java, mongodb, nodeJs.
          </p>
        </div>
        <div className="contact-container">
          <h1>Email Me</h1>
          <p>
            Enter your email and message here or send directly from{" "}
            <a href="https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=thebuckspage@gmail.com">
              thebuckspage@gmail.com
            </a>
          </p>
          <textarea
            placeholder="Enter your desired message here..."
            onChange={(e) => handleChange(e, "msg")}
            value={msg}
          />
          <h3 className="enter-email-msg">
            Want me to contact you back? Enter your email / phone number here
          </h3>
          <div className="submit-container">
            <div className="email-input">
              <label
                htmlFor="emailInput"
                ref={emailInputLabelRef}
                className={fromContact || isEmailInputFocused ? "active" : ""}
              >
                Email or phone number
              </label>
              <input
                id="emailInput"
                value={fromContact}
                maxLength={40}
                onChange={(e) => handleChange(e, "from email")}
                onFocus={() => {
                  emailInputLabelRef.current.classList.add("active")
                  setisEmailInputFocused(true)
                }}
                onKeyDown={sendEmail}
                onBlur={() => {
                  if (!fromContact)
                    emailInputLabelRef.current.classList.remove("active")
                  setisEmailInputFocused(false)
                }}
              />
            </div>
            <button onClick={sendEmail}>Send</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default About
