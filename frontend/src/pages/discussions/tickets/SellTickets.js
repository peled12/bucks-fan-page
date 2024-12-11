import React, { useState, useContext, useRef, useEffect } from "react"

import { useLocation, useNavigate } from "react-router-dom"

import "./tickets.css"
import "../fanposts/fanposts.css"

import axios from "axios"

import { Context } from "../../../App"

import UploadImg from "../../../components/userInputComponents/UploadImg"
import DateSelection from "../../../components/userInputComponents/DateSelection"

const dbApiUrl = process.env.REACT_APP_API_URL

function SellTickets() {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const secionRef = useRef(null)
  const rowRef = useRef(null)
  const amountRef = useRef(null)

  const navigate = useNavigate()

  const locationState = useLocation().state
  const ticketData = locationState?.updatingTicket

  // get current date
  const [currentDate, setcurrentDate] = useState(null)
  const [futureDate, setfutureDate] = useState(null)

  // initialize state variables for selected date and time
  const [selectedDate, setselectedDate] = useState(null)
  const [selectedHour, setselectedHour] = useState(null)
  const [selectedMinute, setselectedMinute] = useState(null)

  useEffect(() => {
    const date = new Date()

    setcurrentDate(date)

    const futureDate = new Date(date)
    futureDate.setDate(date.getDate() + 60) // 60 days later

    setfutureDate(futureDate)

    setselectedDate(ticketData ? new Date(ticketData.game_date) : new Date())

    setselectedHour(date.getHours())
    setselectedMinute(date.getMinutes())
  }, [])

  const [imgUrl, setimgUrl] = useState(ticketData ? ticketData.seat_img : "")

  function postTicket() {
    // make sure the user is signed in:
    if (!isSignedIn) {
      alert("You must sign in before posting a ticket.")
      return
    }

    // make sure the selected day is not today:
    const date = new Date()

    if (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    ) {
      alert("You can't sell a ticket from today's game")
      return
    }

    const allInputs = document.querySelectorAll(".ticket-input")
    // make sure all inputs are filled:
    for (let i = 0; i < allInputs.length; i++) {
      if (!allInputs[i].value) {
        alert("Make sure to fill all the inputs.")
        return
      }
    }

    const updates = {
      seat_img: imgUrl,
      seller: username,
      game_arena: document.querySelector(".game-arena-input").value,
      contact_on: document.querySelector(".contact-on-input").value,
      amount: document.querySelector(".amount-input").value,
      seat_info: document.querySelector(".seat-info-input").value,
      seat_location: {
        row: document.querySelector(".row-input").value,
        section: document.querySelector(".section-input").value,
      },
      date: new Date().getTime(),
      game_date: new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedHour,
        selectedMinute
      ).getTime(),
    }

    if (ticketData)
      axios
        .patch(dbApiUrl + "/tickets/" + ticketData._id, updates)
        .then(() => {
          // location will always exist on edit
          navigate("/AvailableTickets", {
            state: {
              // adjust all the tickets by replacing the changed one
              updatedTickets: locationState.tickets.map((ticket) =>
                ticket._id === ticketData._id
                  ? { ...updates, _id: ticketData._id }
                  : ticket
              ),
            },
          })

          // alert after navigation
          setTimeout(
            () =>
              alert(
                `Ticket(s) successfully ${ticketData ? "patched" : "posted"}.`
              ),
            10
          )
        })
        .catch((err) => {
          console.error(
            `Failed to ${ticketData ? "patch" : "post"} ticket.`,
            err.message
          )

          alert(`Failed to ${ticketData ? "patch" : "post"} ticket.`)
        })
    else
      axios
        .post(dbApiUrl + "/tickets", updates)
        .then((res) => {
          navigate("/AvailableTickets", {
            state: {
              // add the new ticket to the start of the array
              updatedTickets: locationState?.tickets
                ? [
                    { ...updates, _id: res.data.insertedId },
                    ...locationState.tickets,
                  ]
                : null ?? null,
            },
          })

          // alert after navigation
          setTimeout(() => alert("Ticket(s) successfully posted."), 10)
        })
        .catch((err) => {
          console.error("failed to post ticket.", err.message)

          alert("Failed to post ticket.")
        })
  }

  function handleChange(inputRef) {
    // remove non-numeric characters:
    const enteredValue = inputRef.current.value.replace(/\D/g, "")

    if (enteredValue < 0) inputRef.current.value = 1 // avoid less than 0
    else inputRef.current.value = enteredValue
  }

  return (
    <div className="sell-tickets-page">
      <p className="page-description">
        Enter information about your ticket(s) to sell it with no fee!
      </p>
      <h1 className="page-title">Tickets</h1>
      <div className="ticket-details-title">
        <h1>{ticketData ? "Edit Tickets" : "Sell Tickets"}</h1>
      </div>
      <div className="first-wrapper">
        <div className="inputs-container">
          <input
            className="game-arena-input ticket-input"
            placeholder="Enter game arena..."
            defaultValue={ticketData ? ticketData.game_arena : "Fiserv Forum"}
            maxLength={45}
          />
          <input
            className="seat-info-input ticket-input"
            placeholder="more information about the seat..."
            defaultValue={ticketData ? ticketData.seat_info : ""}
            maxLength={100}
          />
          <input
            className="contact-on-input ticket-input"
            placeholder="Enter phone number or email..."
            defaultValue={ticketData ? ticketData.contact_on : ""}
            maxLength={45}
          />
        </div>
        <UploadImg imgUrl={imgUrl} setimgUrl={setimgUrl} />{" "}
      </div>
      {currentDate && (
        <div className="second-wrapper">
          <div className="ticket-details-title location">
            <h1>Ticket Details</h1>
          </div>
          <div className="ticket-location-inputs">
            <div>
              <p>Section</p>
            </div>
            <div>
              <p>Row</p>
            </div>
            <div>
              <p>Amount</p>
            </div>
            <div>
              <input
                className="section-input ticket-input"
                ref={secionRef}
                defaultValue={ticketData?.seat_location.section ?? 1}
                maxLength={3}
                onChange={() => handleChange(secionRef)}
              />
            </div>
            <div>
              <input
                className="row-input ticket-input"
                ref={rowRef}
                type="text"
                defaultValue={ticketData?.seat_location.row ?? 1}
                maxLength={2}
                onChange={() => handleChange(rowRef)}
              />
            </div>
            <div>
              <input
                className="amount-input ticket-input"
                ref={amountRef}
                defaultValue={ticketData?.amount ?? 1}
                maxLength={2}
                onChange={() => handleChange(amountRef)}
              />
            </div>
          </div>
          <div className="ticket-details-title date">
            <h1>Game Date</h1>
          </div>
          <DateSelection
            currentDate={currentDate}
            futureDate={futureDate}
            setselectedDate={setselectedDate}
            selectedHour={selectedHour}
            setselectedHour={setselectedHour}
            selectedMinute={selectedMinute}
            setselectedMinute={setselectedMinute}
            defaultDateTime={ticketData?.game_date}
          />
          <button className="post-ticket-button" onClick={postTicket}>
            {ticketData ? "Patch" : "Post"}
          </button>
        </div>
      )}
      <div className="scroll-expandor">hi</div>
    </div>
  )
}

export default SellTickets
