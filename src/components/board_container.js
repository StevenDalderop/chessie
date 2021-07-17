import React from "react"
import Board from "./board"

export default function BoardContainer(props) {
  return (
      <div className="centered_container">
	   {props.children}
      </div>
  )
}