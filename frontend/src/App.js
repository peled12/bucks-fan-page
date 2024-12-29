import React, { lazy, Suspense, useRef } from "react"
import "./App.css"

import { Routes, Route, useLocation } from "react-router-dom"

import { useState, useEffect } from "react"

import { useQuery, useQueryClient } from "react-query"

import { v4 as uuidv4 } from "uuid"

import axios from "axios"

import coinImage from "./images/coin_icon.png"

import getCurrentDate from "./functions/getCurrentDate"

import { IoMdClose } from "react-icons/io"

/*
  TODO: fix vercel deployment
*/

const Home = lazy(() => import("./pages/Home"))
const Navigation = lazy(() => import("./navigation/Navigation"))
const SignIn = lazy(() => import("./pages/registration/SignIn"))
const SignUp = lazy(() => import("./pages/registration/SignUp"))
const Profile = lazy(() => import("./pages/registration/Profile"))
const Roster = lazy(() => import("./pages/other/Roster"))
const TradeIdeas = lazy(() =>
  import("./pages/discussions/trade ideas/TradeIdeas")
)
const PostTradeIdea = lazy(() =>
  import("./pages/discussions/trade ideas/PostTradeIdea")
)
const Fanposts = lazy(() => import("./pages/discussions/fanposts/FanPosts"))
const Fanpost = lazy(() => import("./pages/discussions/fanposts/Fanpost"))
const PostFanpost = lazy(() =>
  import("./pages/discussions/fanposts/PostFanpost")
)
const AllArticles = lazy(() => import("./pages/other/AllArticles"))
const Schedule = lazy(() => import("./pages/other/Schedule"))
const GameRecap = lazy(() => import("./pages/games/GameRecap"))
const GamePreview = lazy(() => import("./pages/games/GamePreview"))
const About = lazy(() => import("./pages/other/About"))
const Guide = lazy(() => import("./pages/other/Guide"))
const AvailableTickets = lazy(() =>
  import("./pages/discussions/tickets/AvailableTickets")
)
const SellTickets = lazy(() =>
  import("./pages/discussions/tickets/SellTickets")
)
const GameRates = lazy(() => import("./pages/games/GameRates"))
const UserRoster = lazy(() => import("./pages/users rosters/UserRoster"))
const Leaderboard = lazy(() => import("./pages/users rosters/Leaderboard"))
const OneRoster = lazy(() => import("./pages/users rosters/OneRoster"))

export const Context = React.createContext()

// axios options:

const teamsOptions = {
  method: "GET",
  url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBATeams",
  params: {
    schedules: "true",
    rosters: "true",
    topPerformers: "true",
    teamStats: "true",
    statsToGet: "averages",
  },
  headers: {
    "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
  },
}

const articlesOptions = {
  method: "GET",
  url: "https://nba-latest-news.p.rapidapi.com/articles",
  headers: {
    "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "X-RapidAPI-Host": "nba-latest-news.p.rapidapi.com",
  },
}

const scheduleOptions = {
  method: "GET",
  url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBATeamSchedule",
  params: {
    teamAbv: "MIL",
  },
  headers: {
    "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
  },
}

const date = new Date()

const yesterDate = new Date(date)
yesterDate.setDate(date.getDate() - 1)

const currentYesterDate =
  yesterDate.getFullYear() +
  "" +
  (yesterDate.getMonth() + 1 < 10
    ? "0" + (yesterDate.getMonth() + 1)
    : yesterDate.getMonth() + 1) +
  "" +
  (yesterDate.getDate() < 10
    ? "0" + yesterDate.getDate()
    : yesterDate.getDate())

const yesterdayGamesOptions = {
  method: "GET",
  url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBAScoresOnly",
  params: {
    gameDate: currentYesterDate,
  },
  headers: {
    "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
    "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
  },
}

const dbApiUrl = process.env.REACT_APP_API_URL

//

/*
  TODO: test on netlify without saving requests
*/

function App() {
  const [userName, setuserName] = useState(() => {
    const storedUserName = localStorage.getItem("userName")
    return storedUserName ? JSON.parse(storedUserName) : "Guest"
  })
  const [password, setpassword] = useState(() => {
    const storedPassword = localStorage.getItem("password")
    return storedPassword ? JSON.parse(storedPassword) : ""
  })
  const [email, setemail] = useState(() => {
    const storedEmail = localStorage.getItem("email")
    return storedEmail ? JSON.parse(storedEmail) : ""
  })

  const [isSignedIn, setisSignedIn] = useState(userName !== "Guest")

  const [teams, setteams] = useState(() => {
    const storedTeams = localStorage.getItem("teams")
    return storedTeams ? JSON.parse(storedTeams) : []
  })

  const [articles, setarticles] = useState(() => {
    const storedarticles = localStorage.getItem("articles")
    return storedarticles ? JSON.parse(storedarticles) : null
  })

  const [schedule, setschedule] = useState(() => {
    const storedSchedule = localStorage.getItem("schedule")
    return storedSchedule ? JSON.parse(storedSchedule) : []
  })

  // games (initilize here to reset on first load of the day)

  const [yesterdayGames, setyesterdayGames] = useState(() => {
    const storedGames = localStorage.getItem("yesterGames")
    return storedGames ? JSON.parse(storedGames) : null
  })
  const [tomorrowGames, settomorrowGames] = useState(() => {
    const storedGames = localStorage.getItem("tomorGames")
    return storedGames ? JSON.parse(storedGames) : null
  })

  // import queryClient here to avoid importing it in every AddFriend component
  const queryClient = useQueryClient()

  const coinsStreakRef = useRef(null)

  const {
    data: fanposts,
    status: fanpostStatus,
    refetch: refetchFanPosts,
  } = useQuery({
    queryKey: ["fanposts"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await axios.get(dbApiUrl + "/fanposts")
      return res.data
    },
    onError: (error) => {
      console.error("Error fetching fanposts:", error.message)
    },
  })

  const [userData, setuserData] = useState(null)

  useEffect(() => {
    if (isSignedIn)
      axios
        .get(dbApiUrl + "/users/user/" + userName)
        .then((res) => {
          setuserData(res.data)

          // handle the login streak to add coins:
          const lastLoggedIn = res.data.last_logged_in

          // check if last logged in time was yesterday
          const lastLoggedInDate = new Date(lastLoggedIn.time)
          const currentDate = new Date()
          const currentTime = currentDate.getTime()

          lastLoggedInDate.setDate(lastLoggedInDate.getDate() + 1)
          if (
            currentDate.toDateString() === lastLoggedInDate.toDateString() ||
            lastLoggedIn.streak === 0 // or a new streak starts
          ) {
            // display:
            coinsStreakRef.current.style.display = "flex"
            coinsStreakRef.current.style.opacity = "1"

            const overlay = document.querySelector(".overlay")
            overlay.style.display = "block"
            setTimeout(
              // make sure the transition starts
              () => (overlay.style.backgroundColor = "rgba(0, 0, 0, 0.15)")
            )

            const coinsBonuses = [5, 10, 20, 30, 50, 75, 100]
            const coinBonus = coinsBonuses[lastLoggedIn.streak] || 100 // 100 if streak > 6

            const newUserData = {
              ...res.data,
              last_logged_in: {
                time: currentDate,
                streak: lastLoggedIn.streak + 1,
              },
              coins: res.data.coins + coinBonus,
            }

            setuserData(newUserData)

            // update in the db:
            axios.put(dbApiUrl + "/users/user/" + userName, newUserData).catch()
          }

          // logic to reset the streak to 0:

          currentDate.setHours(0, 0, 0, 0) // compare midnights

          const yesterday = new Date(currentDate)
          yesterday.setDate(currentDate.getDate() - 1)

          // go back to the real date
          lastLoggedInDate.setDate(lastLoggedInDate.getDate() - 1)

          lastLoggedInDate.setHours(0, 0, 0, 0) // compare midnights

          if (lastLoggedInDate < yesterday) {
            // update in the db:
            axios
              .patch(dbApiUrl + "/users/user/" + userName, {
                last_logged_in: {
                  time: currentTime,
                  streak: 0, // reset streak
                },
              })
              .catch((err) => {
                console.error("Failed to patch user data.", err.message)
              })
          }
        })
        .catch((err) => console.error("Couldn't fetch user data.", err.message))
  }, [isSignedIn])

  // logic to get the last and next bucks games:

  async function getBoxScore(gameID) {
    const options = {
      method: "GET",
      url: "https://tank01-fantasy-stats.p.rapidapi.com/getNBABoxScore",
      params: {
        gameID: gameID,
      },
      headers: {
        "X-RapidAPI-Key": "29d0db064fmsh97e46a3996b942bp10020bjsn71fb3b4ad390",
        "X-RapidAPI-Host": "tank01-fantasy-stats.p.rapidapi.com",
      },
    }
    try {
      const res = await axios.request(options)
      return res.data.body
    } catch (err) {
      console.error("couldn't fetch game.", err.message)
    }
  }

  const [lastBucksGame, setLastBucksGame] = useState(
    // save requests
    () => {
      const stored = localStorage.getItem("lastBucksGame")
      return stored ? JSON.parse(stored) : null
    }
  )

  // flag to set error if the last bucks game isn't an error
  const [isGameRatesError, setisGameRatesError] = useState(false)

  useEffect(() => {
    return // temp to save requests

    if (isScheduleError) {
      setLastBucksGame("error") // for display msg
      setisGameRatesError(true)
    }

    if (!schedule.length) return // make sure schedule is fetched

    const currentDate = getCurrentDate()

    const lastGame = schedule.reduce((closestGame, game) => {
      // only consider dates before the current date
      if (
        game.gameDate < currentDate ||
        (game.gameDate === closestGame && game.homeResult)
      ) {
        return game
      }
      return closestGame
    }, null)

    // get the game box score if its valid:
    async function getGame() {
      try {
        const boxScore = await getBoxScore(lastGame.gameID)

        localStorage.setItem("lastBucksGame", JSON.stringify(boxScore)) // to save requests
        setLastBucksGame(boxScore)
      } catch (err) {
        setLastBucksGame("error") // for display msg
        setisGameRatesError(true)
        console.error("Couldn't fetch the last Bucks game.", err.message)
      }
    }
    if (lastGame) getGame()
    else setLastBucksGame("Last game yet to come")
  }, [schedule])

  const [nextBucksGame, setNextBucksGame] = useState(null)

  useEffect(() => {
    if (isScheduleError) setNextBucksGame("error") // for display msg

    if (!schedule) return // make sure schedule is fethced

    const currentDate = getCurrentDate()

    const nextGame = schedule.reduce((closestGame, game) => {
      // get the first game after the current date
      if (
        (game.gameDate > currentDate ||
          (game.gameDate === currentDate && !game.homeResult)) &&
        (closestGame === null || game.gameDate < closestGame.gameDate)
      ) {
        return game
      }
      return closestGame
    }, null)

    // get the game box score if its valid:
    if (nextGame) {
      const boxScore = nextGame
      setNextBucksGame(boxScore)
    } else setNextBucksGame("no games left")
  }, [schedule])

  //

  const [isArticlesError, setisArticlesError] = useState(false)
  const [isScheduleError, setisScheduleError] = useState(false)

  const [isScheduleLoading, setisScheduleLoading] = useState(
    schedule.length ? false : true
  )

  const [activeChat, setactiveChat] = useState(null)
  const [activeChatIndex, setactiveChatIndex] = useState()

  // flag to know when to look for the first and last game in Home.js
  const [isScheduleReady, setisScheduleReady] = useState(false)

  // last game rating:
  const [lastGamesRating, setlastGamesRating] = useState(null)

  const { status: lastGamesRatingStatus } = useQuery({
    queryKey: ["lastGamesRating"],
    refetchOnWindowFocus: false,
    queryFn: () =>
      axios.get(dbApiUrl + "/polls/lastGamesRating").then((res) => res.data),
    onSuccess: (data) => {
      setlastGamesRating(data)
    },
  })

  const pathName = useLocation().pathname

  // fetch databases:
  useEffect(() => {
    if (!pathName.includes("leaderboard"))
      // leaderboard uses localStorage to expand
      localStorage.removeItem("leaderboard")

    // articles:
    async function fetchArticlesData() {
      try {
        const res = await axios.request(articlesOptions)
        setarticles(res.data)
        localStorage.setItem("articles", JSON.stringify(res.data)) // to save requests
      } catch (err) {
        setisArticlesError(true)
        console.error("Couldn't fetch articles.", err.message)
      }
    }
    if (!articles) fetchArticlesData()

    // schedule:
    async function getScheduleData() {
      try {
        const res = await axios.request(scheduleOptions)

        setisScheduleLoading(false)
        setschedule(res.data.body.schedule)
        setisScheduleReady(true)

        localStorage.setItem("schedule", JSON.stringify(res.data.body.schedule))

        return res.data.body.schedule
      } catch (err) {
        setisScheduleError(true)
        console.error("Couldn't fetch schedule.", err.message)
      }
    }

    // teams:
    async function fetchTeamsData() {
      try {
        const res = await axios.request(teamsOptions)
        setteams(res.data.body)
        localStorage.setItem("teams", JSON.stringify(res.data.body)) // to save requests
      } catch (err) {
        console.error("Couldn't fetch teams data.", err.message)
      }
    }

    // reset tommorrowGames, yesterdayGames, schedule and teams daily

    const today = new Date().toLocaleDateString() // get the date
    const lastRun = localStorage.getItem("lastRunDate")

    // temp; this is to save requests
    // if (lastRun !== today) {
    //   // this runs max once between midnights

    //   const isBetweenOct15toJune = isDateBetweenOct15ToJune()

    //   localStorage.removeItem("lastBucksGame")
    //   setLastBucksGame(null)
    //   // lastBucksGame will fetch when schedule changes

    //   localStorage.removeItem("schedule")
    //   setschedule([])
    //   if (isBetweenOct15toJune) getScheduleData() // fetch

    // localStorage.removeItem("articles")
    // setarticles(null)
    // fetchArticlesData()

    //   localStorage.removeItem("teams")
    //   setteams([])
    //   if (isBetweenOct15toJune) fetchTeamsData() // fetch

    //   localStorage.removeItem("yesterGames")
    //   setyesterdayGames(null)
    //   fetchYesterdaysGamesData() // fetch

    //   localStorage.removeItem("tomorGames")
    //   settomorrowGames(null)

    //   // no need to fetch tomorrowGames because tomorrowGames fetches after user input
    //   localStorage.setItem("lastRunDate", today) // update last run date to today
    // }

    async function fetchYesterdaysGamesData() {
      try {
        const res = await axios.request(yesterdayGamesOptions)

        // indicate no games have occured yesterday
        if (res.data.error && res.data.error === "No games returned") {
          setyesterdayGames("offseason")
          return
        }

        const games = Object.values(res.data.body)

        setyesterdayGames(games)
        localStorage.setItem("yesterGames", JSON.stringify(games)) // to save requests
      } catch (err) {
        console.error("Couldn't fetch yesterday's games.", err.message)
      }
    }

    function isDateBetweenOct15ToJune() {
      const now = new Date()
      const currentYear = now.getFullYear()

      const oct15 = new Date(currentYear, 9, 15)
      const dec31 = new Date(currentYear, 11, 31)
      const jan1 = new Date(currentYear + 1, 0, 1)
      const apr30 = new Date(currentYear + 1, 5, 30)

      // check if the current date is between October 15th and December 31st (current year)
      // or between January 1st and April 30th (next year)
      return (now >= oct15 && now <= dec31) || (now >= jan1 && now <= apr30)
    }
  }, [])

  // keep signed in:
  useEffect(() => {
    // save the profile stuff:

    localStorage.setItem("userName", JSON.stringify(userName))
    localStorage.setItem("password", JSON.stringify(password))
    localStorage.setItem("email", JSON.stringify(email))
  }, [password])

  // close the streak login container
  function closeStreakLogin() {
    coinsStreakRef.current.style.display = "none"
    const overlay = document.querySelector(".overlay")
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0)"
    setTimeout(() => (overlay.style.display = "none"), 800) // wait for the animation to end
  }

  return (
    <>
      <div className="overlay"></div>
      <Context.Provider
        value={[
          isSignedIn,
          setisSignedIn,
          userName,
          setuserName,
          activeChat,
          setactiveChat,
          activeChatIndex,
          setactiveChatIndex,
          userData,
          setuserData,
          queryClient,
        ]}
      >
        <Navigation setpassword={setpassword} setemail={setemail} />
        <Suspense>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  teams={teams}
                  articles={articles}
                  schedule={schedule}
                  fanposts={fanposts}
                  fanpostsStatus={fanpostStatus}
                  lastGamesRating={lastGamesRating}
                  lastGamesRatingStatus={lastGamesRatingStatus}
                  setlastGamesRating={setlastGamesRating}
                  isScheduleReady={isScheduleReady}
                  yesterdayGames={yesterdayGames}
                  tomorrowGames={tomorrowGames}
                  settomorrowGames={settomorrowGames}
                  lastBucksGame={lastBucksGame}
                  nextBucksGame={nextBucksGame}
                  isGameRatesError={isGameRatesError}
                />
              }
            />
            <Route
              path="/SignIn"
              element={
                <SignIn
                  setcurrentPassword={setpassword}
                  setcurrentEmail={setemail}
                />
              }
            />
            <Route
              path="/SignUp"
              element={
                <SignUp
                  setcurrentPassword={setpassword}
                  setcurrentEmail={setemail}
                />
              }
            />
            <Route
              path="/Profile/:username"
              element={
                <Profile
                  setpassword={setpassword}
                  password={password}
                  email={email}
                  allFanposts={fanposts}
                  fanpostStatus={fanpostStatus}
                />
              }
            />
            <Route path="/Roster" element={<Roster />} />
            <Route path="/TradeIdeas" element={<TradeIdeas />} />
            <Route path="/PostTradeIdea" element={<PostTradeIdea />} />
            <Route
              path="/Fanposts"
              element={
                <Fanposts
                  fanposts={fanposts}
                  status={fanpostStatus}
                  refetchFanposts={refetchFanPosts}
                />
              }
            />
            <Route path="/PostFanpost" element={<PostFanpost />} />
            <Route
              path="/Fanposts/:id"
              element={<Fanpost fanposts={fanposts} status={fanpostStatus} />}
            />
            <Route
              path="/AllArticles"
              element={
                <AllArticles articles={articles} isError={isArticlesError} />
              }
            />
            <Route
              path="/Schedule"
              element={
                <Schedule
                  teams={teams}
                  schedule={schedule}
                  isError={isScheduleError}
                  isLoading={isScheduleLoading}
                />
              }
            />
            <Route
              path="/GameRecap/:id"
              element={<GameRecap teams={teams} schedule={schedule} />}
            />
            <Route
              path="/GamePreview/:id/:date/:time"
              element={<GamePreview teams={teams} schedule={schedule} />}
            />
            <Route path="/About" element={<About />} />
            <Route path="/Guide" element={<Guide />} />
            <Route path="/AvailableTickets" element={<AvailableTickets />} />
            <Route path="/SellTickets" element={<SellTickets />} />
            <Route
              path="/GameRates"
              element={
                <GameRates
                  lastGameRatings={lastGamesRating}
                  status={lastGamesRatingStatus}
                  teams={teams}
                />
              }
            />
            <Route path="/UserRoster" element={<UserRoster />} />
            <Route path="/Leaderboard/:range" element={<Leaderboard />} />
            <Route path="/OneRoster/:id" element={<OneRoster />} />
          </Routes>
        </Suspense>
        <div className="coins-streak-container" ref={coinsStreakRef}>
          <IoMdClose className="close-btn" onClick={closeStreakLogin} />
          <div className="title-container">
            <div>
              <p>Coin Bonuses</p>
              <img src={coinImage} alt="coins" />
            </div>
          </div>
          {userData && (
            <>
              <div className="bonuses-container">
                {[5, 10, 20, 30, 50, 75, 100].map((number, index) => (
                  <div
                    key={uuidv4()}
                    className={
                      index < userData.last_logged_in.streak
                        ? "green "
                        : index === userData.last_logged_in.streak
                        ? "yellow"
                        : ""
                    }
                  >
                    <p className="number">{number}</p>
                    <p>COINS</p>
                  </div>
                ))}
              </div>
              <div className="current-streak">
                CURRENT STREAK: {userData.last_logged_in.streak}
              </div>
            </>
          )}
        </div>
      </Context.Provider>
    </>
  )
}

export default App
