const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// return a list of all the players from the cricket_team
// API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team ORDER BY player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// post a player into data base
// API 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');
    `;
  const playerQuery = await db.run(createPlayerQuery);
  response.send("Player Added to Team");
});

// get the player details based on the player id
// API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// update the details of the player using player ID
// API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetails = `UPDATE cricket_team 
    SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role = '${role}'
    WHERE player_id = ${playerId}; 
    `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//  delete the player details
// API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
