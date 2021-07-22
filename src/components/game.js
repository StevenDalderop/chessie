import React from "react"
import SplitPane from "./splitpane"
import Sidebar, {GameOptionButtons} from "./sidebar"
import { get_board, uci_to_row_column, get_uci, get_piece } from "../chess_notation"
import Board from "./board"
import { Promotion, Result, DrawOffered, DrawDecision, GetUsername, GetUsernameMobile, Online_game } from "./windows"
import { socket } from "./app"
import Timer from "./timer"
import css from "./game.css"

const baseURL = window.location.origin

var turn = {
	white: 1,
	black: 0
}

function is_possible_promotion(move) {	
	return move.piece && move.piece.type === "p" && move.to[1] === "1" || move.to[1] === "8"
}

function get_turn(fen) {
	var turn_letter = fen.split(" ")[1]
	if (turn_letter === "w") {
		return turn.white
	}
	return turn.black
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
	  "is_finished": false,
	  "fen": 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      "selected_square": null,
      "uci": null,
      "san": null,
      "promotion": false,
      "time_white": this.props.time,
	  "time_black": this.props.time, 
      "evaluation": 0,
      "result": null,
      "draw_offered": null
    }
  }

  handleClickBoard(square) {
	if (this.state.is_finished) {
		return 
	}
		
	let is_square_selected = this.select_square(square) 
	
	if (is_square_selected) {
		return 
	}
	
	let is_possible_move = this.can_make_move(square)
	
	if (is_possible_move) {
		let move = this.get_move(square)
		this.make_move_or_promotion(move)	
	}
  }

  async make_move_or_promotion(move) {
	let is_promotion = await this.check_promotion(move)	
	
	if (!is_promotion) {
		this.make_move(this.props.gameId, move.uci)
	}   
  }
  
    can_make_move(square) {
		let selected_square = this.state.selected_square
		let board = get_board(this.state.fen)
		let piece = get_piece(board, square)
		let turn = get_turn(this.state.fen)
				
		var is_opponents_piece = piece && piece.color !== turn 
		
		var can_move = selected_square && !piece
		var can_attack = selected_square && is_opponents_piece
		
		return can_move || can_attack
	}
  
    select_square(square) {
		let board = get_board(this.state.fen)
		let piece = get_piece(board, square)
		let turn = get_turn(this.state.fen)
		
		var is_my_color = piece && piece.color === this.props.color
		var is_pieces_turn = piece && piece.color === turn
		
		var select_vs_human = this.props.vs === "human" && is_pieces_turn 
		var select_vs_pc = this.props.vs === "pc" && is_my_color
		var select_vs_online = this.props.vs === "online" && is_my_color
		
		var can_select_square = select_vs_human || select_vs_pc || select_vs_online
		
		if (can_select_square) {
			this.setState({"selected_square": square})
		}
		return can_select_square
	}
  
    check_promotion(move) {
	  let possible_promotion = is_possible_promotion(move)
	  if (!possible_promotion || this.state.promotion) {
	    return false
	  }
	  
	  let uci_promotion = move.uci + "q"
      fetch(`${baseURL}/api/check_promotion_valid/${this.props.gameId}/${uci_promotion}`)
		.then(res => res.json())
		.then(data => {
		  if (data["valid"] === "true") {
			this.setState({"promotion": move.to})
		  }	
		  var is_promotion = data["valid"]
		  return is_promotion
		}) 
    }
	
	get_move(square, promotion_type = "") {
		let board = get_board(this.state.fen)
		let selected_square = this.state.selected_square
		var piece = get_piece(board, square)
		
		let move = {
			"from": selected_square, 
			"to": square, 
			"uci": selected_square + square + promotion_type, 
			"piece": piece
		}
		return move
	}
  
  make_move(gameId, uci) {
    fetch(`${baseURL}/api/make_move/${gameId}/${uci}`)	
		.then(res => res.json())
		.then(data => {
			if (data["valid"] === "true") {
			  this.setState((state) => ({
				"fen": data["fen"],
				"result": data["result"],
				"evaluation": data["evaluation"],
				"selected_square": null,
				"uci": uci,
				"san": data["san"],
				"promotion": false
			   }))
			  this.switchTimer()
			}
		})
  }
  
  get_pc_move() {
	fetch(`${baseURL}/api/get_pc_move/${this.props.gameId}/${this.props.skill_level}`)
      .then(response => response.json())
      .then((data) => {
        this.setState((state) => ({
          "fen": data["fen"],
          "result": data["result"],
          "evaluation": data["evaluation"],
          "selected_square": null,
          "uci": data["uci"],
          "san": data["san"],
          "promotion": false
        }))
		this.switchTimer()
      })
  }  
  
  handlePromotionOptionPressed(e) {	 
	  let to = this.state.promotion
	  
	  let pieces = {
		  "rook": "r", 
		  "queen": "q", 
		  "knight": "n", 
		  "bishop": "b"
	  }
      let promotion_type = pieces[e.target.value]
	  
	  let move = this.get_move(to, promotion_type)
      this.make_move(this.props.gameId, move.uci)	  
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
  
  switchTimer() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
		  let turn = get_turn(this.state.fen)
		  let seconds = turn ? this.state.time_white : this.state.time_black
		  if (seconds === 0) {
			this.setState((state)=> ({
				"result": turn ? "0-1" : "1-0", 
				"is_finished": true, 
				"selected_square": null
			}))
			clearInterval(this.interval)
		  } else if (!this.state.is_finished) {
			this.setState((state) => ({
				"time_white": turn ? state.time_white - 1 : state.time_white, 
				"time_black": turn ? state.time_black : state.time_black - 1
			}))
		  } else {
			clearInterval(this.interval)
		  }
    }, 1000)
  }

  componentDidMount() {	
	socket.on("announce move", data => {
	  this.setState((state) => ({
		"fen": data["fen"],
		"uci": data["uci"],
		"result": data["result"],
		"evaluation": data["evaluation"],
		"selected_square": null,
		"san": data["san"],
		"time_white": data["time_white"],
		"time_black": data["time_black"],
		"promotion": false
	  }))
	  this.switchTimer()
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
			}			
		)
   }
  
  componentDidUpdate(prevProps, prevState) {
	if (prevState.fen !== this.state.fen) {
		if (this.props.vs === "pc" && get_turn(prevState.fen) === 1) {
		  this.get_pc_move()
		} else if (this.props.vs === "online" && get_turn(prevState.fen) === prevProps.color) {
			var json = {
				"fen": this.state.fen, 
				"uci": this.state.uci, 
				"moves_san": this.state.san, 
				"evaluation": this.state.evaluation, 
				"result": this.state.result, 
				"time_white": this.state.time_white, 
				"time_black": this.state.time_black,
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
	socket.off("announce move")
	socket.off("announce resign")
	socket.off("announce draw offered")
	socket.off("announce draw decision")
  }


  render () { 
	const sidebar = <Sidebar 
              time_white={this.state.time_white} 
			  time_black={this.state.time_black}
              username={this.props.username} 
              usernameOpponent={this.props.usernameOpponent} 
              san={this.state.san} 
              evaluation={this.state.evaluation} 
              mirrored={this.props.color === 0}
              vs={this.props.vs}
			  is_finished={this.state.is_finished}
              onClick={() => {this.props.onClick()}} 
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()}
              />
			  
	const board = <Board 
				  pieces={get_board(this.state.fen)} 
				  selected_square={this.state.selected_square} 
				  uci={this.state.uci} 
				  onClick={(square) => this.handleClickBoard(square)} 
				  mirrored={this.props.color === 0} />
				  
	const centeredBoard = <div className="centered_container">
							{board}
						  </div>
			  
    return (
      <div id="main_container">
			{ this.state.promotion && 
			<Promotion 
				promotion={this.state.promotion} 
				onClick={(e) => this.handlePromotionOptionPressed(e)} /> }
			
			{ this.state.result && 
			<Result 
				result={this.state.result} 
				onClick={() => {this.setState({"result": null})}} /> }
				
			{ this.state.draw_offered === this.props.username && 
				<DrawOffered />			
			}
			
			{
				this.state.draw_offered && this.state.draw_offered !== this.props.username &&
			    <DrawDecision
					draw_offered={this.state.draw_offered}  
					onClickAccept={() => this.handleAcceptDrawButtonPressed()} 
					onClickDecline={() => this.handleDeclineDrawButtonPressed()} /> 				
			}		
		
		  <div className="container-tablet-pc">
			  <SplitPane		    
				left={centeredBoard}
				right={sidebar}
			  />
		  </div>
					
          <div className="container-mobile">
			<Timer username={this.props.usernameOpponent} time={this.state.time_black} />
		    {board}  
			<Timer username={this.props.username} time={this.state.time_white} />
			<GameOptionButtons
		      is_finished={this.state.is_finished}	
			  vs={this.props.vs}
              onClick={() => {this.props.onClick()}} 
			  onClick2={() => this.handleResignButtonPressed()}
			  onClick3={() => this.handleOfferDrawButtonPressed()} />
          </div>
      </div>
    );
  }
}

export default Game
