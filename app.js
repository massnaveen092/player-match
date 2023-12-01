const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const inistlizerserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Login into...')
    })
  } catch (error) {
    console.log(`Db Error ${error.message}`)
    process.exit(1)
  }
}

inistlizerserver()
const convertdbplayerintoresponseobject = dbobj => {
  return {
    playerId: dbobj.player_id,
    playerName: dbobj.player_name,
  }
}

const consvertdbmatchintoresponseobject = dbobj => {
  return {
    matchId: dbobj.match_id,
    match: dbobj.match,
    year: dbobj.year,
  }
}
//get the all players
app.get('/players/', async (request, response) => {
  const getplayers = `
  SELECT *
  FROM player_details`
  const player = await db.all(getplayers)
  response.send(player.map(each => convertdbplayerintoresponseobject(each)))
})

//get the players based on playerid

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getplayer = `
  SELECT *
  FROM player_details
  WHERE player_id = ${playerId}`
  const player = await db.get(getplayer)
  response.send(convertdbplayerintoresponseobject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const getplayers = `
  UPDATE player_details 
  SET player_name = ${playerName}
  WHERE player_id = ${playerId}`
  await db.run(getplayers)
  response.send('Player Details Updated')
})
//Returns the match details of a specific match
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getmatch = `
  SELECT *
  FROM match_details
  WHERE match_id = ${matchId}`
  const player = await db.get(getmatch)
  response.send(consvertdbmatchintoresponseobject(player))
})
//Returns a list of all the matches of a player

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getmatch = `
  SELECT *
  FROM player_match_score NATURAL JOIN match_details
  WHERE player_id = ${playerId}`
  const player = await db.all(getmatch)
  response.send(
    player.map(each => {
      consvertdbmatchintoresponseobject(each)
    }),
  )
})

//Returns a list of players of a specific match
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getmatch = `
  SELECT *
  FROM player_match_score NATURAL JOIN player_details
  WHERE match_id = ${matchId}`
  const player = await db.all(getmatch)
  response.send(player.map(each => convertdbplayerintoresponseobject(each)))
})

//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getmatchdetails = `
  SELECT player_id AS playerId,
  player_name AS playerName
  SUM(score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM player_match_score NATURAL JOIN player_details
  WHERE player_id = ${playerId}`
  const match = await ab.get(getmatchdetails)
  response.send(match)
})
module.exports = app
