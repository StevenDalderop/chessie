import React from "react"
import Board from "./board"

export default function BoardContainer(props) {
  return (
    <div id="board_container_2" className="container_div">
      <div id="board_container">
        <Board 
          pieces={props.pieces} 
          selected_square={props.selected_square} 
          moved_squares={props.moved_squares} 
          onClick={(row, column) => props.onClick(row, column)} 
          mirrored={props.mirrored} 
        />
      </div>
    </div>
  )
}