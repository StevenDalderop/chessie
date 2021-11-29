import React from "react"
import css from "./option_menu.css"

export function Option(props) {
	return (
	  <div className="option" onClick={() => props.onClick()}>
		<div className="centered_div">
		  <h5> {props.text} </h5>
		</div> 
	  </div>
	)
}

export function OptionMenu(props) {
	return (
		<div className="option-menu">
			{props.children}
		</div>
	)
}