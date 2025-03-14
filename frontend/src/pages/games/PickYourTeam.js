import React, { useState } from "react"

import coinIcon from "../../images/coin_icon.png"

const players = [
  {
    name: "Giannis Antetokounmpo",
    cost: 100,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
  },
  {
    name: "Kareem Abdul-Jabbar",
    cost: 98,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/76003.png",
  },
  {
    name: "Oscar Robertson",
    cost: 90,
    img_url:
      "https://cdn.nba.com/manage/2021/08/oscar-robertson-dribble-1920-1568x882.jpg",
  },
  {
    name: "Damian Lilard",
    cost: 82,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/203081.png",
  },
  {
    name: "Sidney Moncrief",
    cost: 81,
    img_url:
      "https://media.gettyimages.com/id/947711534/photo/milwaukee-bucks-v-la-clippers.jpg?s=2048x2048&w=gi&k=20&c=yTcB7sPsERInDfcvIxWq5klR8-3AmvK8Ma2tSW4PGjY=",
  },
  {
    name: "Ray Allen",
    cost: 78,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/951.png",
  },
  {
    name: "Khris Middleton",
    cost: 83,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/203114.png",
  },
  {
    name: "Greg Monroe",
    cost: 69,
    img_url: "https://pbs.twimg.com/media/Dj9Fx1WUUAE2Kfd.jpg",
  },
  {
    name: "Bob Dandridge",
    cost: 73,
    img_url:
      "https://www.si.com/.image/c_limit%2Ccs_srgb%2Cq_auto:good%2Cw_700/MTk1MTA2NDA1MzQ1MTQxOTU5/usatsi_5055638_168397759_lowres.webp",
  },
  {
    name: "Jrue Holiday",
    cost: 83,
    img_url:
      "https://bloximages.chicago2.vip.townnews.com/madison.com/content/tncms/assets/v3/editorial/0/db/0db93090-e496-5854-86cc-447d87b9bd13/60a576838f71a.image.png",
  },
  {
    name: "Glenn Robinson",
    cost: 75,
    img_url:
      "https://www.basketballnetwork.net/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTg3MTYwOTUyMDcyMDU0NjY5/glenn-big-dog-robinson.jpg",
  },
  {
    name: "Sam Cassell",
    cost: 68,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/208.png",
  },
  {
    name: "Toni Kukoč",
    cost: 70,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/389.png",
  },
  {
    name: "Malcolm Brogdon",
    cost: 65,
    img_url: "https://s3media.247sports.com/Uploads/Assets/463/923/7923463.jpg",
  },
  {
    name: "Brook Lopez",
    cost: 60,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/201572.png",
  },
  {
    name: "Alvin Robertson",
    cost: 57,
    img_url:
      "https://img.bleacherreport.net/img/images/photos/003/334/492/hi-res-020a52359507a3f8fb711ac16421b442_crop_exact.jpg?w=1200&h=1200&q=75",
  },
  {
    name: "Brian Winters",
    cost: 53,
    img_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCH6jVR0zNreaRGLkqBx1O3DRvRsY7lkRc5NsjGbTUtw&s",
  },
  {
    name: "Bogdan Bogdanović",
    cost: 48,
    img_url:
      "https://media-cdn.socastsrm.com/wordpress/wp-content/blogs.dir/2282/files/2020/11/bogdan.jpg",
  },
  {
    name: "Jerry Stackhouse",
    cost: 50,
    img_url:
      "https://pm1.aminoapps.com/6432/6ad4b031cc7dd6ca9007315fb80b5a2f6e9321e2_00.jpg",
  },
  {
    name: "Eric Bledsoe",
    cost: 49,
    img_url:
      "https://bloximages.chicago2.vip.townnews.com/stlamerican.com/content/tncms/assets/v3/editorial/d/1b/d1b5468e-c835-11ea-a1fd-cf7d9d9a7018/5f11af00b6fc4.image.png?resize=400%2C291",
  },
  {
    name: "Paul Pressey",
    cost: 42,
    img_url:
      "https://scontent.fsdv2-1.fna.fbcdn.net/v/t31.18172-8/21015811_10154958387917817_2043173470951401522_o.jpg?_nc_cat=101&ccb=1-7&_nc_sid=5f2048&_nc_ohc=EJYwOtHmJKQQ7kNvgElNefP&_nc_ht=scontent.fsdv2-1.fna&cb_e2o_trans=t&oh=00_AfBgl74HGTz_hoWn9axyk7Dh8PQYPcEiOrJzPGYFK_O2rg&oe=6662BA67",
  },
  {
    name: "George Hill",
    cost: 38,
    img_url:
      "https://b.fssta.com/uploads/application/nba/headshots/1535.vresize.350.350.medium.9.png",
  },
  {
    name: "Jack Sikma",
    cost: 60,
    img_url:
      "https://cdn.nba.com/teams/legacy/www.nba.com/bucks/sites/bucks/files/getty-images-849108288.jpg",
  },
  {
    name: "Michael Redd",
    cost: 73,
    img_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIJqnwQrTJd0X8mOc3ECz1Tcg85DP0TLeiDBGcYu_B6w&s",
  },
  {
    name: "Junior Bridgeman",
    cost: 70,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/76185.png",
  },
  {
    name: "Bob Lanier",
    cost: 72,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/76117.png",
  },
  {
    name: "Jon McGlocklin",
    cost: 69,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/76109.png",
  },
  {
    name: "Bob Boozer",
    cost: 66,
    img_url:
      "https://bobboozerjinx.com/wp-content/uploads/2017/01/Bob-Boozer-1971-MilwBucks.jpg",
  },
  {
    name: "Ersan İlyasova",
    cost: 65,
    img_url:
      "https://sportshub.cbsistatic.com/i/sports/player/headshot/555957.png?width=160",
  },
  {
    name: "John Henson",
    cost: 49,
    img_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaJavnoG2bVHXhQpp4HwN7xDIxiZVhHiFFTw&s",
  },
  {
    name: "Luke Ridnour",
    cost: 43,
    img_url:
      "https://a57.foxsports.com/statics.foxsports.com/www.foxsports.com/content/uploads/2020/02/647/364/296f77cb-PI-NBA-Luke-Ridnour-121713.jpg?ve=1&tl=1",
  },
  {
    name: "Donte DiVincenzo",
    cost: 37,
    img_url: "https://s3media.247sports.com/Uploads/Assets/379/784/8784379.jpg",
  },
  {
    name: "Nate Wolters",
    cost: 41,
    img_url:
      "https://b.fssta.com/uploads/application/nba/headshots/1880.vresize.350.350.medium.65.png",
  },
  {
    name: "Thon Maker",
    cost: 35,
    img_url: "https://s3media.247sports.com/Uploads/Assets/386/784/8784386.jpg",
  },
  {
    name: "Pat Connaughton",
    cost: 29,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/1626192.png",
  },
  {
    name: "Bobby Portis",
    cost: 62,
    img_url: "https://cdn.nba.com/headshots/nba/latest/1040x760/1626171.png",
  },
]

/*
 TODO: make a list of all time players, each player
       consts money, the better the player is, the more
       expensive he is. You can get money by registering, getting
       likes on posts or trade ideas and streak login
*/

function PickYourTeam() {
  const [showingPlayers, setshowingPlayers] = useState(true)

  return (
    <>
      <h1 className="page-title">Your Roster</h1>
      <p className="page-description">
        Earn coins by getting likes on any of your posts to create the best
        Bucks team possible!
      </p>
      <button onClick={() => setshowingPlayers((prev) => !prev)}>
        {showingPlayers ? "Hide" : "Show"} Players
      </button>
      {showingPlayers ? (
        <div className="player-cards">
          {players.map((player) => (
            <div className="player">
              <p>{player.name}</p>
              <img src={player.img_url} />
              <p>
                Cost: {player.cost} <img src={coinIcon} />
              </p>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </>
  )
}

export default PickYourTeam
