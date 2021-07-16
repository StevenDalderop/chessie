import React from "react"
import Board from "./board"

export default function BoardContainer(props) {
  return (
      <div id="board_container">
	   {props.children}
      </div>
  )
}