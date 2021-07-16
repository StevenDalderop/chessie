import React from "react"
import css from "./scrollable.css"

export default function Scrollable(props) {	
	return (
		<div className={"scrollable scrollable-" + props.size}>
			{props.children}
		</div> 
	)
}