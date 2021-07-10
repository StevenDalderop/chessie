import React from "react"
import css from "./option_menu.css"

export function Option(props) {
	return (
		<div className="col no_padding_mobile">
		  <div className="option" onClick={() => props.onClick()}>
			<div className="centered_div">
			  <h5> {props.text} </h5>
			</div> 
		  </div>
		</div>
	)
}

export function OptionMenu(props) {
	return (
		<div className="row mr-0 ml-0 mt-3">
			{props.children}
		</div>
	)
}