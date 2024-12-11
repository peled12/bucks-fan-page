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
      "https://cdn.nba.com/manage/2021/09/GettyImages-1480479-1536x864.jpg",
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
      "https://a.espncdn.com/combiner/i?img=%2Fphoto%2F2017%2F0331%2Fr195477_1296x729_16-9.jpg&w=920&h=518&scale=crop&cquality=80&location=origin&format=jpg",
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
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjbXLeBbYicl7-Hy69rxBZ-1oKOTGthrYHxljzfT6XsQ&s",
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
    img_url: "https://pbs.twimg.com/media/DgAMOmOV4AA1NiZ.jpg:large",
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
      "https://www.sportsnet.ca/wp-content/uploads/2010/01/stackhouse_jerry_bucks_courtesy.jpg",
  },
  {
    name: "Eric Bledsoe",
    cost: 49,
    img_url: "https://www.sportsnet.ca/wp-content/uploads/2020/09/Bledsoe.jpg",
  },
  {
    name: "Paul Pressey",
    cost: 42,
    img_url: "https://pbs.twimg.com/media/DgALyQHUcAAUbug.jpg",
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
      "https://cdn.vox-cdn.com/thumbor/cnT3hdFCF_0_Yg2eJWlZlJ2nurI=/0x414:1935x1704/1400x1050/filters:focal(0x414:1935x1704):format(jpeg)/cdn.vox-cdn.com/uploads/chorus_image/image/47049102/GettyImages-1396643.0.jpg",
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
    img_url:
      "https://content.api.news/v3/images/bin/4c7894896d45130468558dbe3bed3fbc",
  },
  {
    name: "Bob Lanier",
    cost: 72,
    img_url: "https://cdn.nba.com/manage/2021/08/bob-lanier-looks-iso.jpg",
  },
  {
    name: "Jon McGlocklin",
    cost: 69,
    img_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5sM182Z3e1ZmaJqmHSl4HISYLfSIVfnXPog&s",
  },
  {
    name: "Bob Boozer",
    cost: 66,
    img_url:
      "https://www.sportsnet.ca/wp-content/uploads/2012/05/boozer_bob640.jpg",
  },
  {
    name: "Ersan İlyasova",
    cost: 59,
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

const coaches = [
  {
    name: "Mike Budenholzer",
    cost: 94,
    img_url:
      "https://cdn.nba.com/manage/2021/06/budenholzer-sideline-iso-1536x864.jpg",
  },
  {
    name: "Larry Costello",
    cost: 86,
    img_url:
      "https://images2.minutemediacdn.com/image/upload/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/shape%2Fcover%2Fsport%2Fa5fdf6bae96fb48834f69b53ebd9e286aa012c86672ef8adc3dbf5ff0d11b0de.jpg",
  },
  {
    name: "Don Nelson",
    cost: 79,
    img_url:
      "https://static.foxnews.com/foxnews.com/content/uploads/2023/08/Coach-Don-Nelson.jpg",
  },
  {
    name: "George Karl",
    cost: 80,
    img_url:
      "https://images2.minutemediacdn.com/image/upload/c_fill,w_720,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/40f7fab6ef65cd59000827448bb7414bec60192d96e90e026ad192a7bfa810c9.jpg",
  },
  {
    name: "Del Harris",
    cost: 72,
    img_url: "https://www.mavs.com/wp-content/uploads/2019/09/DEL-HARRIS.jpg",
  },
  {
    name: "Terry Porter",
    cost: 75,
    img_url:
      "https://www.statesmanjournal.com/gcdn/-mm-/ba563b5a0223ae8f614ef90405fa7af90321df50/c=0-68-3870-2255/local/-/media/2016/04/05/Salem/Salem/635954941029098691-Portland-Porter-Baske-Kirk.jpg?width=660&height=373&fit=crop&format=pjpg&auto=webp",
  },
  {
    name: "Scott Skiles",
    cost: 71,
    img_url:
      "https://cdn.vox-cdn.com/thumbor/xXBYSQ2TT81J4A3T9wXENu1yNwA=/0x242:2930x2195/1200x800/filters:focal(0x242:2930x2195)/cdn.vox-cdn.com/uploads/chorus_image/image/6197283/20130102_kkt_sh5_102.0.jpg",
  },
  {
    name: "Jason Kidd",
    cost: 81,
    img_url: "https://cdn.nba.com/manage/2020/10/jason-kidd_0-784x588.jpg",
  },
  {
    name: "Jim Boylan",
    cost: 68,
    img_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9gxAOwidpPwC6AlEOV2pthGzH_QK9RJVvkw&s",
  },
  {
    name: "Joe Prunty",
    cost: 66,
    img_url:
      "https://cdn.nba.com/teams/legacy/www.nba.com/bucks/sites/bucks/files/coachprunty.png",
  },
  {
    name: "Adrian Griffin",
    cost: 35,
    img_url:
      "https://cdn.vox-cdn.com/thumbor/TYSWGZ2FYatGm9GqBXzX7zHnROQ=/0x0:3000x2000/1200x800/filters:focal(1260x760:1740x1240)/cdn.vox-cdn.com/uploads/chorus_image/image/72865384/1764170510.0.jpg",
  },
]

export { players, coaches }
