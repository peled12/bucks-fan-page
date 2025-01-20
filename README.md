# Bucks Fan Page App


A Milwaukee Bucks fan page app where fans can connect, share content, engage in discussions, and participate in community activities. It offers a space for fans to interact, share their thoughts on the team, and enjoy a dynamic environment built around their shared passion for the Bucks.

## Features
- **Real-Time Messaging**: Instant messaging with Socket.IO, allowing seamless communication between users.
- **User Interaction**: Users can engage with each other in real-time through messages and notifications.
- **Backend with Node.js & Express**: The server is built using **Node.js** and **Express**, handling all user interactions and data management.
- **Database**: Uses **MongoDB** for storing user data and messages.
- **Frontend with React**: The user interface is built with **React.js** to offer a dynamic, responsive experience.
- **Socket.IO Integration**: Real-time updates and interactions between users, including direct messaging.
- **Real-Time NBA Data**: The app integrates a real-time NBA API to provide live game scores, game recaps, and previews.
- **Leaderboard**: Users that interact more with the website can get more coins and build a roster. The best rosters will be shown on the leaderboard!
- **User-Generated Basketball Opinions**: Users have multiple ways to share and post their opinions on basketball, including game predictions, ratings, and commentary.

## Try it yourself
The project is deployed and hosted on [Vercel](https://vercel.com/). You can try it yourself [on this link](your-demo-link-here) (recommended)  
or install and run it locally:
## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/peled12/bucks-fan-page
2. Install dependencies for the frontend:
   ```bash
   cd bucks-fan-page/frontend
   npm install
3. Install dependencies for the backend:
   ```bash
   cd bucks-fan-page/backend
   npm install
4. Create a .env file for the backend and configure the database API URL:
   - Inside the frontend folder, create a .env file:  
      ```bash
      touch .env
   - Open the .env file and add the following line:  
     ```bash
     dbApiUrl=http://localhost:3001
5. Start both the frontend and backend servers:  
   - For the frontend:
     ```bash
      npm start
   - For the backend:
        ```bash   
    node app
6. Open your browser and go to http://localhost:3000 to view the application.

## Technologies Used
- **Frontend**: React.js, Socket.IO Client, React-query
- **Backend**: Node.js, Express.js, Socket.IO Server
- **Database**: MongoDB
- **Real-Time Communication**: Socket.IO
- **Deployment**: Vercel, Render

## Feedback
Feel free to provide any feedback or suggestions on this project. I'm always looking to improve and grow as a developer!

***
Thank you for taking the time to review my work. I look forward to the opportunity to contribute to your team!

> **Note**: The database hosted on **Render** may take up to 50 seconds to become fully usable after being idle or restarting.  
> **Note**: Game previews and reviews are not available during the offseason.



  

