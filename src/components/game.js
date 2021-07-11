import React from "react"
import SplitPane from "./splitpane"
import Container_mobile from "./container_mobile"
import Mobile_bar from "./mobile_bar"
import Sidebar from "./sidebar"
import BoardContainer from "./board_container"
import GameHeader from "./game_header"
import { get_board, uci_to_row_column, get_uci, get_piece } from "../chess_notation"
import Board from "./board"
import { Promotion, Result, Draw_offered, GetUsername, GetUsernameMobile, Online_game } from "./windows"
import { socket } from "./app"

const baseURL = window.location.origin

var turn = {
	white: 1,
	black: 0
}

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
	  "is_finished": false,
	  "fen": 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      "selected_square": null,
      "uci": null,
      "san": null,
      "turn": turn.white,
      "promotion": false,
      "times": [60, 60],
      "evaluation": 0,
      "result": null,
      "draw_offered": null
    }
  }

  handleClickBoard(square) {
	if (this.state.is_finished) {
		return 
	}
	
    let board = get_board(this.state.fen)
    let selected_square = this.state.selected_square

	var piece = get_piece(board, square)
	var is_my_color = piece && piece.color === this.props.color
	var can_move = selected_square && !piece
	var is_friend = piece && piece.color === this.state.turn
	var can_attack = selected_square && piece && !is_friend

    if ((this.props.vs === "pc" || this.props.vs === "online") && is_my_color) {
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
      let check_promotion = await fetch(`${baseURL}/api/check_promotion_valid/${this.props.gameId}/${uci_promotion}`)
      let data = await check_promotion.json()
      if (data["valid"] === "true") {
        this.setState({"promotion": move.to, "display": "promotion"})
        return
      }
    }
	
	let is_valid_move = await this.make_move(this.props.gameId, move.uci)
  }
  
  make_move(gameId, uci) {
    var is_valid = fetch(`${baseURL}/api/make_move/${gameId}/${uci}`)	
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
	fetch(`${baseURL}/api/get_pc_move/${this.props.gameId}/${this.props.skill_level}`)
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
  
  handleResignButtonPressed() {
	  if (this.props.vs === "pc") {
        this.setState((state) => ({"result": this.props.username + " resigned", "is_finished": true}))
      } else if (this.props.vs === "online") {
        socket.emit("resign", {"username": this.props.username, "room": this.props.gameId})
      }
  }
  
  handleOfferDrawButtonPressed() {
	  socket.emit("offer draw", {"username": this.props.username, "room": this.props.gameId})
  }
  
  handleAcceptDrawButtonPressed() {
	  socket.emit("draw", {"accepted": "true", "room": this.props.gameId})
  }
  
  handleDeclineDrawButtonPressed() {
	  socket.emit("draw", {"accepted": "false", "room": this.props.gameId})
  }
  
  startTimer() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
      let seconds = this.state.turn ? this.state.times[0] : this.state.times[1]
      if (seconds === 0) {
        this.setState((state)=> ({"result": state.turn ? "0-1" : "1-0", "is_finished": true, "selected_square": null}))
        clearInterval(this.interval)
      } else if (!this.state.is_finished) {
        this.setState((state) => ({"times": state.turn ? [state.times[0] - 1, state.times[1]] : [state.times[0], state.times[1] - 1]}))
      } else {
        clearInterval(this.interval)
      }
    }, 1000)
  }

  componentDidMount() {	  
    socket.on("announce move", data => {
		console.log(data)
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
      this.setState({"result": data["username"] + " resigned", "is_finished": true, "draw_offered": null, "selected_square": null, "uci": null})
    })

    socket.on("announce draw offered", data => {
      this.setState({"draw_offered": data["username"]})
    })

    socket.on("announce draw decision", data => {
      if (data["accepted"] === "true") {
        this.setState({"result": "Draw", "draw_offered": null, "selected_square": null, "uci": null, "is_finished": true})
      } else if (data["accepted"] === "false") {
        this.setState({"draw_offered": null})
      }
    })
  }
  
  componentDidUpdate(prevProps, prevState) {
	if (prevState.fen !== this.state.fen) {
		if (this.props.vs === "pc" && prevState.turn === 1) {
		  this.get_pc_move()
		} else if (this.props.vs === "online" && prevState.turn === prevProps.color) {
			var json = {
				"fen": this.state.fen, 
				"uci": this.state.uci, 
				"moves_san": this.state.san, 
				"turn": this.state.turn, 
				"evaluation": this.state.evaluation, 
				"result": this.state.result, 
				"times": this.state.times, 
				"room": this.props.gameId
			}
		  socket.emit("make move", json)
		}
		
		if (this.state.result) {
			this.setState({"is_finished": true, "selected_square": null})
		}
	}
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }


  render () { 
	const sidebar = <Sidebar 
              times={this.state.times} 
              username={this.props.username} 
              username2={this.props.usernameOpponent} 
              san={this.state.san} 
              evaluation={this.state.evaluation} 
              mirrored={this.props.color === 0}
              vs={this.props.vs}
			  is_finished={this.state.is_finished}
              onClick={() => {this.props.onClick()}} 
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()}
              />
			  
	const board = <BoardContainer 
              pieces={get_board(this.state.fen)} 
              mirrored={this.props.color === 0}
              selected_square={this.state.selected_square}
              uci={this.state.uci} 
              onClick={(square) => this.handleClickBoard(square)} 
              />
			  
    return (
      <div id="main_container">
          <Promotion 
			promotion={this.state.promotion} 
			onClick={(e) => this.handlePromotionOptionPressed(e)} />
          <Result 
			result={this.state.result} 
			onClick={() => {this.setState({"result": null})}} />
          <Draw_offered 
			draw_offered={this.state.draw_offered} 
			username={this.props.username} 
			onClickAccept={() => this.handleAcceptDrawButtonPressed()} 
			onClickDecline={() => this.handleDeclineDrawButtonPressed()} /> 

          <SplitPane
		    className="show_on_tablet_and_pc"
            left={board}
            right={sidebar}
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
              username2={this.props.usernameOpponent} 
              />}
          />
      </div>
    );
  }
}

