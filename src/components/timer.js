import React from "react"
import css from "./timer.css"

export function get_time(time) {
  let minutes = Math.floor(time / 60)
  let seconds = time - minutes * 60
  if (seconds.toString().length < 2) {
    seconds = "0" + seconds.toString()
  }
  return (
     minutes + ":" + seconds  
  )
}

export function Time(props) {
	return (
		<div className="timer"> 
			<h3> {get_time(props.time)} </h3>
		</div>
	)
}

export default function Timer(props) {
	return (
		<div className="timer_container">
			<div className="username">
				<h4> {props.username} </h4>
			</div>
			<div className="timer-mobile">
				<h4> {get_time(props.time)} </h4>
			</div>
		</div>		
	)
}



			
