package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var clients = make(map[*websocket.Conn]bool) // connected clients
var broadcast = make(chan Message)           // broadcast channel
var players []*Player						 // connected players
var playgrounds []*Playground				 // one Playground
var counter int								 // connected counter
// Configure the upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Define our message object
type Message struct {
	Type         string `json:"type"`
	PlaygroundId string `json:"playground_id"`
	Message      string `json:"message"`
}

type Player struct {
	conn    *websocket.Conn
	id 		int
	playgroundId string
	no		int			// 1p 2p
}

type Playground struct {
	conn    *websocket.Conn
	id 		int
	playerNum int		// Number of players
}

func main() {
	// Create a simple file server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	go handleMessages()

	// Start the server on localhost port 8000 and log any errors
	log.Println("http server started on :8000 ver 0.1")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	clients[ws] = true

	counter++

	for {
		var msg Message

		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)

		if msg.Type == "login" {
			var player  = new(Player)
			player.conn = ws
			player.id = counter
			player.playgroundId = msg.PlaygroundId
			players = append(players, player)

			// notify player playground
			for _, playground := range playgrounds {
				if strconv.Itoa(playground.id) == msg.PlaygroundId {
					playground.playerNum ++
					if playground.playerNum <= 2 {
						player.no = playground.playerNum
						var message= new(Message)
						message.Type = "join"
						message.PlaygroundId = msg.PlaygroundId
						message.Message = strconv.Itoa(playground.playerNum)
						playground.conn.WriteJSON(message)
						player.conn.WriteJSON(message)
					} else {
						// error
					}
				}
			}

		} else if msg.Type == "playground" {
			var playground = new(Playground)
			playground.conn = ws
			playground.id = counter
			playground.playerNum = 0;
			playgrounds = append(playgrounds, playground)

			// send login success
			var message = new (Message)
			message.Type = "playground"
			message.PlaygroundId = strconv.Itoa(playground.id)
			message.Message = ""
			ws.WriteJSON(message)
		}

		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast

		if msg.Type == "action" {
			for _, playground := range playgrounds {
				if strconv.Itoa(playground.id) == msg.PlaygroundId {
					playground.conn.WriteJSON(msg)
				}
			}
		}

		//else {
		//	// Send it out to every client that is currently connected
		//	for client := range clients {
		//		err := client.WriteJSON(msg)
		//		if err != nil {
		//			log.Printf("error: %v", err)
		//			client.Close()
		//			delete(clients, client)
		//		}
		//	}
		//}


	}
}