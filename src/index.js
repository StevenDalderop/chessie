import React from "react"
import { render } from "react-dom"
import Container from "./components/container"
import Container_mobile from "./components/container_mobile"
import Mobile_bar from "./components/mobile_bar"
import Sidebar from "./components/sidebar"
import BoardContainer from "./components/board_container"
import Header from "./components/header"
import { fen_to_history, uci_to_row_column, get_uci } from "./chess_notation"
import Board from "./components/board"
import { Promotion, Result, Draw_offered, Choose_game, Choose_time, GetUsername, GetUsernameMobile, Online_game, VS_PC } from "./components/windows"

const baseURL = window.location.href

var socket = io()

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      "history": [{"pieces":
				  [[["rook", 0], ["knight", 0], ["bishop", 0], ["queen", 0], ["king", 0], ["bishop", 0], ["knight", 0], ["rook", 0]],
			      [["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0]],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1]],
                  [["rook", 1], ["knight", 1], ["bishop", 1], ["queen", 1], ["king", 1], ["bishop", 1], ["knight", 1], ["rook", 1]]]
                }],
      "selected_square": null,
      "moved_squares": null,
      "turn": 1,
      "times": [60, 60],
      "step": 0,
      "promotion": false,
      "vs": null,
      "score": 0,
      "skill_level_pc": 10,
      "result": null,
      "san": null,
      "username": "Player1",
      "username2": "Player2",
      "room": null,
      "users_online": [],
      "games_available": [],
      "game_id": null,
      "mirrored": false,
      "display": "humanOther",
      "game_state": null, 
      "username_already_exists": null, 
      "color": null, 
      "draw_offered": null
    }
  }

  handleClickBoard(row, column) {
    if (this.state.game_state !== "started") {
      return
    }

    let history = JSON.parse(JSON.stringify(this.state.history))
    let current = history[this.state.step]
    let pieces = current.pieces
    let selected_square = this.state.selected_square

	var is_piece = pieces[row][column]
	var is_my_color = is_piece && pieces[row][column][1] === this.state.color
	var can_move = selected_square && !is_piece
	var is_friend = is_piece && pieces[row][column][1] === this.state.turn
	var can_attack = selected_square && is_piece && !is_friend

    if ((this.state.vs === "pc" || this.state.vs === "human_other") && is_my_color) {
      this.setState({"selected_square": [row, column]})
    } else if ((this.state.vs === "human") && is_friend) {
      this.setState({"selected_square": [row, column]})
    } else if (can_attack || can_move) {
      let promotion = false
      this.make_moves(selected_square, row, column, promotion)
    }
  }

  async make_moves(selected_square, row, column, promotion) {
	let uci = get_uci(selected_square, row, column, promotion)
    let pieces = this.state.history[this.state.step].pieces
    let possible_promotion = pieces[selected_square[0]][selected_square[1]][0] === "pawn" && (row === 0 || row === 7)
    
    if (possible_promotion && !this.state.promotion) {
	  let uci_promotion = uci + "q"
      let check_promotion = await fetch(`${baseURL}check_promotion_valid/${this.state.game_id}/${uci_promotion}`)
      let data = await check_promotion.json()
	  console.log(data)
      if (data["valid"] === "true") {
        this.setState({"promotion": [row, column], "display": "promotion"})
        return
      }
    }
 
    var response = await fetch(`${baseURL}make_move/${this.state.game_id}/${uci}`)	
    let data = await response.json()
    let step = this.state.step

    if (data["valid"] === "true" && this.state.vs !== "human_other") {
      console.log("move validated")
      this.setState((state) => ({
        "history": state.history.concat([{"pieces": fen_to_history(data["fen"])}]),
        "result": data["result"],
        "turn": data["turn"],
        "score": data["evaluation"],
        "selected_square": null,
        "moved_squares": [state.selected_square, [row, column]],
        "san": data["san"],
        "step": state.step + 1,
        "promotion": false
       }))
      this.startTimer()
     }

    if (this.state.vs === "pc" && data["valid"] === "true") {
      fetch(`${baseURL}get_pc_move/${this.state.game_id}/${this.state.skill_level_pc}`)
      .then(response => response.json())
      .then((data) => {
        this.setState((state) => ({
          "history": state.history.concat([{"pieces": fen_to_history(data["fen"])}]),
          "result": data["result"],
          "turn": data["turn"],
          "score": data["evaluation"],
          "selected_square": null,
          "moved_squares": uci_to_row_column(data["uci"]),
          "san": data["san"],
          "step": state.step + 1,
          "promotion": false
        }))
      })
    } else if (this.state.vs === "human_other" && data["valid"] === "true") {
      socket.emit("make move", {"fen": data["fen"], "moved_squares": [selected_square, [row, column]], "moves_san": data["san"], "step": step + 1, "turn": data["turn"] , "score": data["evaluation"], "result": data["result"], "times": this.state.times, "room": this.state.room})
    }

    if (this.state.result) {
      this.setState({"game_state": "finished", "selected_square": null})
    }
  }

  handleUserNameSubmitted() {
	  this.setState({"display": null})
      socket.emit("add user online", {"username": this.state.username})
  }
  
  handleOnlineGameClick(e) {
	  if (e.target.name === "newGame") {
		this.setState({"display": "welcomeScreen2"})
	  } else if (e.target.name === "close") {
		  this.setState({"display": null})
	  } else if (e.target.name === "join_game") {
      game_id = e.target.value
	  console.log(e.target)
      socket.emit("join game", {"username": this.state.username, "game_id": game_id})
      console.log("join game " + this.state.username + " " + game_id)
    } 
  }
  
  handlePcStrengthSubmitted() {
	  this.setState((state) => ({"display": "welcomeScreen2", "username2": "Stockfish (" + state.skill_level_pc + ")"}))
  }
  
  handleTimeOptionPressed(e) {
	  let time = e.target.getAttribute('data-value')
      this.setState({"display": null})
      this.setState({"times": [time, time]})
      if (this.state.vs === "human_other") {
        socket.emit("new game", {"username": this.state.username, "time": time})
        this.setState({"display": "usersOnline"})
      } else {
        this.setState({"game_state": "started"})
      }
  }	  
  
  handleGameTypePressed(e) {
	  if (e.target.value === "human") {
        this.setState({"display": "welcomeScreen2", "username2": "Player2"})
      } else if (e.target.value == "human_other") {
        this.setState({"display": "usersOnline", "username2": "Player2"})
		fetch(`${baseURL}get_games`)
			.then(response => response.json())
			.then(data => { this.setState({"games_available": data["games_available"]})})
      } else if (e.target.value === "pc") {
        this.setState({"display": "welcomeScreenPC", "username2": "Stockfish"})
      }
      this.setState({"vs": e.target.value})
  }
  
  handleNewGameButtonPressed() {
      this.setState({"selected_square": null,
                     "moved_squares": null, 
                     "turn": 1,
                     "step": 0,
                     "history": this.state.history.slice(0,1),
                     "san": null,
                     "score": 0,
                     "mirrored": false,
                     "display": "welcomeScreen1",
                     "game_state": null})
      fetch(`${baseURL}new_game`)
        .then(response => response.json())
        .then(data => {this.setState({"game_id": data["game_id"]})})
  }
  
  handlePromotionOptionPressed(e) {
	  let row = this.state.promotion[0]
      let column = this.state.promotion[1]
      let selected_square = this.state.selected_square
      let piece = e.target.value
      this.make_moves(selected_square, row, column, piece)	  
  }
  
  handleCloseButtonPressed() {
	  this.setState({"display": null})
  }
  
  handleResignButtonPressed() {
	  if (this.state.vs === "pc") {
        this.setState((state) => ({"result": state.username + " resigned", "game_state": "resigned"}))
      } else if (this.state.vs === "human_other") {
        socket.emit("resign", {"username": this.state.username, "room": this.state.room})
      }
  }
  
  handleOfferDrawButtonPressed() {
	  socket.emit("offer draw", {"username": this.state.username, "room": this.state.room})
  }
  
  handleAcceptDrawButtonPressed() {
	  socket.emit("draw", {"accepted": "true", "room": this.state.room})
  }
  
  handleDeclineDrawButtonPressed() {
	  socket.emit("draw", {"accepted": "false", "room": this.state.room})
  }
  
  startTimer() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
      let seconds = this.state.turn ? this.state.times[0] : this.state.times[1]
      if (seconds === 0) {
        this.setState((state)=> ({"result": state.turn ? "0-1" : "1-0", "game_state": "finished", "selected_square": null}))
        clearInterval(this.interval)
      } else if (this.state.game_state === "started") {
        this.setState((state) => ({"times": state.turn ? [state.times[0] - 1, state.times[1]] : [state.times[0], state.times[1] - 1]}))
      } else {
        clearInterval(this.interval)
      }
    }, 1000)
  }

  componentDidMount() {
    socket.on("announce user", data => {
      this.setState({"users_online": data["users_online"]})
    })

    socket.on("user already exist", () => { this.setState({"display": "humanOther", "username_already_exists": true}) })
	
	socket.on("announce new game", (data) => { 
		console.log(data["game_id"])
		this.setState({"game_id": data["game_id"]})}
	)
	
    socket.on("announce games available", data => {
      this.setState({"games_available": data["games_available"]})
    })

    socket.on("announce game starts", data => {
      console.log("game starts")
      console.log(data)
      document.querySelectorAll(".welcomeScreen").forEach((screen) => {
        screen.style.display = "None"
      })
      if (data["username"] === this.state.username) {
        this.setState({"username": data["username"], "game_id": data["game_id"], "times": [data["time"], data["time"]], "username2": data["username2"], "room": data["room"], "color": 1, "game_state": "started"})
      } else if (data["username2"] === this.state.username) {
        this.setState({"username": data["username2"], "game_id": data["game_id"], "times": [data["time"], data["time"]], "username2": data["username"], "room": data["room"], "color": 0, "mirrored": true, "game_state": "started"})
      }
    })

    socket.on("announce move", data => {
      this.setState((state) => ({
        "history": state.history.concat([{"pieces": fen_to_history(data["fen"])}]),
        "moved_squares": data["moved_squares"],
        "result": data["result"],
        "turn": data["turn"],
        "score": data["evaluation"],
        "selected_square": null,
        "san": data["san"],
        "step": data["step"],
        "times": data["times"],
        "promotion": false
      }))
      this.startTimer()
    })

    socket.on("announce resign", data => {
      this.setState({"result": data["username"] + " resigned", "game_state": "resigned", "draw_offered": null, "selected_square": null, "moved_squares": null})
    })

    socket.on("announce draw offered", data => {
      this.setState({"draw_offered": data["username"]})
    })

    socket.on("announce draw decision", data => {
      if (data["accepted"] === "true") {
        this.setState({"result": "Draw", "draw_offered": null, "selected_square": null, "moved_squares": null, "game_state": "draw"})
      } else if (data["accepted"] === "false") {
        this.setState({"draw_offered": null})
      }
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render () {
    return (
      <div id="main_container">
        <Header display={this.state.display}               
              game_state={this.state.game_state}
              vs={this.state.vs}
              onClick={() => {this.handleNewGameButtonPressed()}}
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()}
        />

        <div className="container-fluid">
          <Choose_game display={this.state.display} onClick={(e) => this.handleGameTypePressed(e)} onClose={() => this.handleCloseButtonPressed()} />
          <Choose_time display={this.state.display} onClick={(e) => this.handleTimeOptionPressed(e)} onClose={() => this.handleCloseButtonPressed()} />
          <GetUsername display={this.state.display} message={this.state.username_already_exists} onChange={(e) => this.setState({"username": e.target.value, "username_already_exists": null})} username={this.state.username} onSubmit={() => this.handleUserNameSubmitted()} />
          <GetUsernameMobile display={this.state.display} message={this.state.username_already_exists} onChange={(e) => this.setState({"username": e.target.value, "username_already_exists": null})} username={this.state.username} onSubmit={() => this.handleUserNameSubmitted()} />
          <VS_PC display={this.state.display} onChange={(e) => this.setState({"skill_level_pc": e.target.value})} skill_level_pc={this.state.skill_level_pc} onSubmit={() => this.handlePcStrengthSubmitted()} onClose={() => this.handleCloseButtonPressed()} />
          <Promotion promotion={this.state.promotion} onClick={(e) => this.handlePromotionOptionPressed(e)} />
          <Result result={this.state.result} onClick={() => {this.setState({"result": null})}} />
          <Online_game display={this.state.display} usernames={this.state.users_online} username={this.state.username} games={this.state.games_available} onClick={(e) => this.handleOnlineGameClick(e)} onClose={() => this.handleCloseButtonPressed()} />
          <Draw_offered draw_offered={this.state.draw_offered} username={this.state.username} onClickAccept={() => this.handleAcceptDrawButtonPressed()} onClickDecline={() => this.handleDeclineDrawButtonPressed()} /> 

          <Container 
            col_left={<BoardContainer 
              pieces={this.state.history[this.state.step].pieces} 
              mirrored={this.state.mirrored}
              selected_square={this.state.selected_square}
              moved_squares={this.state.moved_squares} 
              onClick={(row, col) => this.handleClickBoard(row, col)} 
              />}
            sidebar_right={<Sidebar 
              times={this.state.times} 
              username={this.state.username} 
              username2={this.state.username2} 
              display={this.state.display}
              san={this.state.san} 
              score={this.state.score} 
              mirrored={this.state.mirrored}
              game_state={this.state.game_state}
              vs={this.state.vs}
              onClick={() => {this.handleNewGameButtonPressed()}} 
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()}
              />}
          />

          <Container_mobile 
            board={<Board
              pieces={this.state.history[this.state.step].pieces} 
              mirrored={this.state.mirrored}
              selected_square={this.state.selected_square} 
              moved_squares={this.state.moved_squares}
              onClick={(row, col) => this.handleClickBoard(row, col)} 
              />} 
            mobile_bar={<Mobile_bar 
              mirrored={this.state.mirrored}
              times={this.state.times}
              username={this.state.username} 
              username2={this.state.username2} 
              />}
          />
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector('#chess_board_container');
render(<Game />, domContainer);