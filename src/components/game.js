import React from "react"
import Container from "./container"
import Container_mobile from "./container_mobile"
import Mobile_bar from "./mobile_bar"
import Sidebar from "./sidebar"
import BoardContainer from "./board_container"
import GameHeader from "./game_header"
import { get_board, uci_to_row_column, get_uci, get_piece } from "../chess_notation"
import Board from "./board"
import { Promotion, Result, Draw_offered, GetUsername, GetUsernameMobile, Online_game } from "./windows"

const baseURL = window.location.origin

var socket = io()

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      "game_id": null,
      "game_state": null, 
	  "fen": 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      "selected_square": null,
      "uci": null,
      "san": null,
      "turn": 1,
      "promotion": false,
      "times": [60, 60],
      "evaluation": 0,
      "result": null,
      "draw_offered": null,
      "username_opponent": "Player2",
      "mirrored": false,
      "room": null,
      "users_online": [],
      "games_available": [],
      "skill_level_pc": 10,
      "display": null 
    }
  }

  handleClickBoard(square) {
    if (this.state.game_state !== "started") {
      return
    }

    let board = get_board(this.state.fen)
    let selected_square = this.state.selected_square

	var piece = get_piece(board, square)
	var is_my_color = piece && piece.color === this.props.color
	var can_move = selected_square && !piece
	var is_friend = piece && piece.color === this.state.turn
	var can_attack = selected_square && piece && !is_friend

    if ((this.props.vs === "pc" || this.props.vs === "human_other") && is_my_color) {
      this.setState({"selected_square": square})
    } else if ((this.props.vs === "human") && is_friend) {
      this.setState({"selected_square": square})
    } else if (can_attack || can_move) {
      let move = {"from": selected_square, "to": square, "uci": selected_square + square, "promotion": false}
      this.make_moves(move)
    }
  }

  async make_moves(move) {
    let board = get_board(this.state.fen)
	let piece = get_piece(board, move.from)

	let possible_promotion = piece && piece.type === "p" && move.to[1] === "1" || move.to[1] === "8"
	
    if (possible_promotion && !this.state.promotion) {
	  let uci_promotion = move.uci + "q"
      let check_promotion = await fetch(`${baseURL}/api/check_promotion_valid/${this.state.game_id}/${uci_promotion}`)
      let data = await check_promotion.json()
      if (data["valid"] === "true") {
        this.setState({"promotion": move.to, "display": "promotion"})
        return
      }
    }
	
	let is_valid_move = await this.make_move(this.state.game_id, move.uci)
  }
  
  make_move(game_id, uci) {
    var is_valid = fetch(`${baseURL}/api/make_move/${this.state.game_id}/${uci}`)	
		.then(res => res.json())
		.then(data => {
			if (data["valid"] === "true") {
			  this.setState((state) => ({
				"fen": data["fen"],
				"result": data["result"],
				"turn": data["turn"],
				"evaluation": data["evaluation"],
				"selected_square": null,
				"uci": uci,
				"san": data["san"],
				"promotion": false
			   }))
			  this.startTimer()
			}
			return data["valid"]
		})
	return is_valid
  }
  
  get_pc_move() {
	fetch(`${baseURL}/api/get_pc_move/${this.state.game_id}/${this.state.skill_level_pc}`)
      .then(response => response.json())
      .then((data) => {
        this.setState((state) => ({
          "fen": data["fen"],
          "result": data["result"],
          "turn": data["turn"],
          "evaluation": data["evaluation"],
          "selected_square": null,
          "uci": data["uci"],
          "san": data["san"],
          "promotion": false
        }))
      })
  }

  handleUserNameSubmitted() {
	  this.setState({"display": null})
      socket.emit("add user online", {"username_self": this.props.username})
	  socket.emit("get users online")
  }
  
  handleOnlineGameClick(e) {
	  if (e.target.name === "newGame") {
		this.setState({"display": "welcomeScreen2"})
	  } else if (e.target.name === "close") {
		  this.setState({"display": null})
	  } else if (e.target.name === "join_game") {
		  var game_id = e.target.value
		  socket.emit("join game", {"username": this.props.username, "game_id": game_id})
		  console.log("join game " + this.props.username + " " + game_id)
    } 
  }
  
  handlePcStrengthSubmitted() {
	  this.setState((state) => ({"display": "welcomeScreen2", "username2": "Stockfish (" + state.skill_level_pc + ")"}))
  }
  
  handleTimeOptionPressed(e) {
	  let time = e.target.getAttribute('data-value')

      if (this.props.vs === "human_other") {
        socket.emit("new online game", {"username": this.props.username, "time": time})
        this.setState({"display": "usersOnline", "times": [time, time]})
      } else {
        this.setState({"game_state": "started", "display": null, "times": [time, time]})
      }
  }	  
  
  handleGameTypePressed(e) {
	  if (e.target.value === "human") {
        this.setState({"display": "welcomeScreen2", "username2": "Player2"})
      } else if (e.target.value == "human_other") {
        this.setState({"display": "usersOnline", "username2": "Player2"})
		fetch(`${baseURL}/api/get_users`)
			.then(res => res.json())
			.then(data => this.setState({"users_online": data["users_online"]}))
		
		fetch(`${baseURL}/api/get_games`)
			.then(response => response.json())
			.then(data => { this.setState({"games_available": data["games_available"]})})
      } else if (e.target.value === "pc") {
        this.setState({"display": "welcomeScreenPC", "username2": "Stockfish"})
      }
      this.setState({"vs": e.target.value})
  }
  
  handleNewGameButtonPressed() {
      this.setState({"selected_square": null,
                     "uci": null, 
                     "turn": 1,
                     "fen": 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                     "san": null,
                     "evaluation": 0,
					 "color": 1,
                     "mirrored": false,
                     "display": "welcomeScreen1",
                     "game_state": null})
      fetch(`${baseURL}/api/new_game`)
        .then(response => response.json())
        .then(data => {this.setState({"game_id": data["game_id"]})})
  }
  
  handlePromotionOptionPressed(e) {	  
      let selected_square = this.state.selected_square
	  let promotion_square = this.state.promotion
	  let pieces = {
		  "rook": "r", 
		  "queen": "q", 
		  "knight": "n", 
		  "bishop": "b"
	  }
      let piece = pieces[e.target.value]
	  let uci = selected_square + promotion_square + piece
	  let move = {"from": selected_square, "to": promotion_square, "uci": uci, "promotion": piece}
      this.make_moves(move)	  
  }
  
  handleCloseButtonPressed() {
	  this.setState({"display": null})
  }
  
  handleResignButtonPressed() {
	  if (this.props.vs === "pc") {
        this.setState((state) => ({"result": this.props.username + " resigned", "game_state": "resigned"}))
      } else if (this.props.vs === "human_other") {
        socket.emit("resign", {"username": this.props.username, "room": this.state.room})
      }
  }
  
  handleOfferDrawButtonPressed() {
	  socket.emit("offer draw", {"username": this.props.username, "room": this.state.room})
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
    fetch(`${baseURL}/api/new_game`)
        .then(response => response.json())
        .then(data => {
			this.setState({"game_id": data["game_id"], "game_state": "started"})			
		}) 
  
	socket.on("announce new game", (data) => { 
		console.log(data["game_id"])
		this.setState({"game_id": data["game_id"]})
		}
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
      if (data["username"] === this.props.username) {
        this.setState({"game_id": data["game_id"], "times": [data["time"], data["time"]], "username_opponent": data["username2"], "room": data["room"], "color": 1, "game_state": "started"})
      } else if (data["username2"] === this.props.username) {
        this.setState({"game_id": data["game_id"], "times": [data["time"], data["time"]], "username_opponent": data["username"], "room": data["room"], "color": 0, "mirrored": true, "game_state": "started"})
      }
    })

    socket.on("announce move", data => {
      this.setState((state) => ({
        "fen": data["fen"],
        "uci": data["uci"],
        "result": data["result"],
        "turn": data["turn"],
        "evaluation": data["evaluation"],
        "selected_square": null,
        "san": data["san"],
        "times": data["times"],
        "promotion": false
      }))
      this.startTimer()
    })

    socket.on("announce resign", data => {
      this.setState({"result": data["username"] + " resigned", "game_state": "resigned", "draw_offered": null, "selected_square": null, "uci": null})
    })

    socket.on("announce draw offered", data => {
      this.setState({"draw_offered": data["username"]})
    })

    socket.on("announce draw decision", data => {
      if (data["accepted"] === "true") {
        this.setState({"result": "Draw", "draw_offered": null, "selected_square": null, "uci": null, "game_state": "draw"})
      } else if (data["accepted"] === "false") {
        this.setState({"draw_offered": null})
      }
    })
	
	socket.on("announce users online", data => {
		this.setState({"users_online": data["users_online"]})
	})
  }
  
  componentDidUpdate(prevProps, prevState) {
	if (prevState.fen !== this.state.fen) {
		if (this.props.vs === "pc" && prevState.turn === 1) {
		  this.get_pc_move()
		} else if (this.props.vs === "human_other" && prevState.turn === prevProps.color) {
			var json = {
				"fen": this.state.fen, 
				"uci": this.state.uci, 
				"moves_san": this.state.san, 
				"turn": this.state.turn, 
				"evaluation": this.state.evaluation, 
				"result": this.state.result, 
				"times": this.state.times, 
				"room": this.state.room
			}
		  socket.emit("make move", json)
		}
	}
	
	if (prevState.result !== this.state.result) {
		this.setState({"game_state": "finished", "selected_square": null})
	}
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }


  render () {  
    return (
      <div id="main_container">
        <div className="container-fluid">
          <Online_game display={this.state.display} usernames={this.state.users_online} username={this.props.username} games={this.state.games_available} onClick={(e) => this.handleOnlineGameClick(e)} onClose={() => this.handleCloseButtonPressed()} />
          <Promotion promotion={this.state.promotion} onClick={(e) => this.handlePromotionOptionPressed(e)} />
          <Result result={this.state.result} onClick={() => {this.setState({"result": null})}} />
          <Draw_offered draw_offered={this.state.draw_offered} username={this.props.username} onClickAccept={() => this.handleAcceptDrawButtonPressed()} onClickDecline={() => this.handleDeclineDrawButtonPressed()} /> 

          <Container 
            col_left={<BoardContainer 
              pieces={get_board(this.state.fen)} 
              mirrored={this.state.mirrored}
              selected_square={this.state.selected_square}
              uci={this.state.uci} 
              onClick={(square) => this.handleClickBoard(square)} 
              />}
            sidebar_right={<Sidebar 
              times={this.state.times} 
              username={this.props.username} 
              username2={this.state.username_opponent} 
              display={this.state.display}
              san={this.state.san} 
              evaluation={this.state.evaluation} 
              mirrored={this.state.mirrored}
              game_state={this.state.game_state}
              vs={this.props.vs}
              onClick={() => {this.handleNewGameButtonPressed()}} 
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()}
              />}
          />

          <Container_mobile 
            board={<Board
              pieces={get_board(this.state.fen)} 
              mirrored={this.state.mirrored}
              selected_square={this.state.selected_square} 
              uci={this.state.uci}
              onClick={(square) => this.handleClickBoard(square)} 
              />} 
            mobile_bar={<Mobile_bar 
              mirrored={this.state.mirrored}
              times={this.state.times}
              username={this.props.username} 
              username2={this.state.username_opponent} 
              />}
          />
        </div>
      </div>
    );
  }
}

