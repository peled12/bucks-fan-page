import React, { useContext, useState } from "react"

import { Link, useNavigate, useLocation } from "react-router-dom"

import "./tickets.css"

import grayLogo from "../../../images/bucks/gray_logo.jpg"

import { v4 as uuidv4 } from "uuid"

import timeAgo from "../../../functions/timeAgo"

import AddFriend from "../../../components/discussionsComponents/AddFriend"

import { Context } from "../../../App"

import axios from "axios"

import { useQuery } from "react-query"

import sleep from "../../../functions/sleep"
import refetch from "../../../functions/refetch"

const dbApiUrl = process.env.REACT_APP_API_URL

const currentDateTime = new Date().getTime()

function AvailableTickets() {
  const isSignedIn = useContext(Context)[0]
  const username = useContext(Context)[2]

  const setactiveChat = useContext(Context)[5]
  const setactiveChatIndex = useContext(Context)[7]

  const locationState = useLocation().state

  const navigate = useNavigate()

  const [availTickets, setavailTickets] = useState(null)

  const { status: availTicketsStatus, refetch: refetchAvailTickets } = useQuery(
    {
      queryKey: ["availTickets"],
      refetchOnWindowFocus: false,
      queryFn: () => {
        if (locationState) {
          setavailTickets(locationState.updatedTickets)
        } else
          axios
            .get(dbApiUrl + "/tickets/" + currentDateTime)
            .then((res) => {
              // filter it for only the tickets whos game date is yet to come
              setavailTickets(res.data)
            })
            .catch((err) => {
              console.error("Couldn't get available tickets", err)
            })
      },
    }
  )

  function handleStartDM(e, name) {
    if (name === username || e.target.closest(".username-display-container"))
      return // avoid DMing cases

    // only post the chat after the first msg

    const chatStartTemplate = {
      chatters: [username, name],
      messages: [],
      came_from_add_friend: true, // temp variable
    }

    setactiveChat(chatStartTemplate)
    // indicate its a new chat and make sure it changes
    setactiveChatIndex((prev) => (prev === null ? undefined : null))

    // scroll to the top of the screen
    window.scrollTo({ top: 0, behavior: "smooth" })

    const dmSlide = document.querySelector(".DM-slide")
    dmSlide.classList.add("active")
    dmSlide.classList.add("double-active")
  }

  function handleEditTicketNav(ticket) {
    navigate("/SellTickets", {
      state: { updatingTicket: ticket, tickets: availTickets },
    })
  }

  function handleDelete(id) {
    const newTickets = availTickets.filter((ticket) => ticket._id !== id)
    setavailTickets(newTickets)

    // start the animation
    const loader = document.querySelector(".avail-tickets-loader")
    loader.style.display = "block"

    axios
      .delete(dbApiUrl + "/tickets/" + id)
      .then(async () => {
        // animation handling

        await sleep(150)

        loader.style.color = "green"
        loader.style.animationPlayState = "paused"

        await sleep(250)

        loader.style.animationPlayState = "running"
        loader.style.display = "none"
        loader.style.color = "black"
      })
      .catch(async (err) => {
        console.error("Couldn't delete ticket.", err.message)

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

  function handleNavigate() {
    navigate("/SellTickets", { state: { tickets: availTickets } })
  }

  return (
    <>
      <h1 className="page-title">Tickets</h1>
      {isSignedIn ? (
        <p className="page-description">
          You got some tickets and you wanna sell it?{" "}
          <a className="sell-tickets-link" onClick={handleNavigate}>
            Click here!
          </a>
        </p>
      ) : (
        <p className="page-description">
          {" "}
          Wanna sell your own tickets? <Link to="/SignIn">Click here</Link> to
          sign in!
        </p>
      )}
      <div className="loader4 avail-tickets-loader"></div>
      <button
        className="refetch-btn"
        onClick={() =>
          refetch(
            refetchAvailTickets,
            document.querySelector(".avail-tickets-loader")
          )
        }
      >
        Refetch
      </button>
      <div className="tickets-container">
        <div className="all-tickets-title">
          <h1>Available Tickets</h1>
        </div>
        {availTickets ? (
          availTickets.length ? (
            <>
              {availTickets.map((ticket, index) => {
                const gameDate = new Date(ticket.game_date)
                const ticketPostDate = new Date(ticket.date)
                const gameDateString = gameDate
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                  .replace(/\//g, "-")
                return (
                  <div
                    key={uuidv4()}
                    className={
                      "ticket " +
                      (index % 2 === 0 ? "even " : "") +
                      (ticket.seller !== username ? "not-mine" : "")
                    }
                    onClick={(e) => handleStartDM(e, ticket.seller)}
                  >
                    <img src={ticket.seat_img || grayLogo} />
                    <div className="info-container">
                      <span>
                        Seller:{" "}
                        <AddFriend name={ticket.seller} className="normal" />
                      </span>
                      <p>Contact on: {ticket.contact_on}</p>
                      <p>Game arena: {ticket.game_arena}</p>
                      <p>Game date: {gameDateString}</p>
                    </div>
                    <div className="seat-info">
                      <p className="name">Seat information:</p>{" "}
                      <p>{ticket.seat_info}</p>
                    </div>
                    <div className="seat-location">
                      <p className="title">SEC</p>
                      <p className="title">ROW</p>
                      <p className="title">Amount</p>
                      <p>{ticket.seat_location.section}</p>
                      <p>{ticket.seat_location.row}</p>
                      <p>{ticket.amount}</p>
                    </div>
                    <div className="post-date">
                      {ticket.seller === username && (
                        <>
                          <button
                            className="edit-ticket-btn delete"
                            onClick={() => handleDelete(ticket._id)}
                          >
                            DELETE
                          </button>
                          <button
                            className="edit-ticket-btn"
                            onClick={() => handleEditTicketNav(ticket)}
                          >
                            EDIT
                          </button>
                        </>
                      )}
                      <p>
                        Last patched{" "}
                        {timeAgo(
                          ticketPostDate.getFullYear(),
                          ticketPostDate.getMonth() + 1,
                          ticketPostDate.getDate(),
                          ticketPostDate.getHours(),
                          ticketPostDate.getMinutes()
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div className="page-expandor">hi</div>
            </>
          ) : (
            <>
              <p className="no-tickets-msg">
                There are no tickets for sale at the moment...
              </p>
              <p className="no-tickets-msg">
                <a onClick={handleNavigate}>Click here</a> to sell one!
              </p>
            </>
          )
        ) : availTicketsStatus === "error" ? (
          <p>It looks like a problem has ocurred... Please try again later.</p>
        ) : (
          <div className="loader8"></div>
        )}
      </div>
    </>
  )
}

export default AvailableTickets
