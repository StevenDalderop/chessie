// Piece icons: By en:User:Cburnett - Own work  This W3C-unspecified vector image was created with Inkscape., CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499809
import React from "react"
import css from "./board.css";

function Square(props) {
  return (
    <div id={props.id} className={"square color-square-" + props.square_color} onClick={() => props.onClick()}>
      <div className={"row_number"}>
        {props.row} 
      </div>
      <div className={"col_letter"}>
        {props.col}
      </div>
      <div className="centered_container">
        {piece_icon(props.piece)}
      </div>
    </div>
  )
}

function piece_icon(props) {
  if (props) {
    if (props.color === 1) {
      var color = "l";
    } else {
      var color = "d";
    }
	var types = {
		"q": "queen",
		"r": "rook",
		"k": "king",
		"b": "bishop",
		"n": "knight",
		"p": "pawn"
	}
	var type = types[props.type]
    return (<img className="piece_icon" src={"/static/chess_pieces_svg/Chess_" + type + color + "t45.svg"}></img>)
  } else {
    return null
  }
}

export default class Board extends React.Component {
  renderSquare(row, column) {
    let square_color;
    if (this.props.mirrored) {
      var row_new = 7 - row
      var col_new = 7 - column
    } else {
      var row_new = row
      var col_new = column
    }
    let row_number = column === 0 ? 8 - row_new : null
    let col_letter = row === 7 ? String.fromCharCode(col_new + 1 + 64) : null

    let id = String.fromCharCode(col_new + 1 + 64) + String(8 - row_new)
    
    if ((row_new + col_new) % 2 === 0) {
      square_color = "white"
    } else {
      square_color = "black"
    }
    
    if (this.props.selected_square && this.props.selected_square[0] === row_new && this.props.selected_square[1] === col_new) {
      square_color = "yellow"
    }

    if (this.props.moved_squares && this.props.moved_squares[1][0] === row_new && this.props.moved_squares[1][1] === col_new) {
      square_color = "gray"
    }

    return (
      <Square id={id} row={row_number} col={col_letter} square_color={square_color} piece={this.props.pieces[row_new][col_new]} onClick={() => this.props.onClick(row_new, col_new)} key={row_new * 8 + col_new} />
    )
  }

  renderRow(row) {
    let squares = [];
    for (var col = 0; col < 8; col++) {
      squares.push(this.renderSquare(row, col))
    }
    return squares
  }

  renderBoard() {
    let rows = []
    for (var row = 0; row < 8; row++) {
      let element = (
        <div className="chess_row" key={row}>
           {this.renderRow(row)}
        </div>)
      rows.push(element)
    }
    return rows
  }

  render () {
    return (
      <div className="board">
        {this.renderBoard()}
      </div>
    )
  }
}
