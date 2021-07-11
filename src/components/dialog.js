import React from "react"
import css from "./dialog.css"

export default function Dialog(props) {
	return (
		<div className="dialog">
		  <h2> {props.title} </h2>
		  <div className="mt-3">
		    {props.children}
		  </div>
		</div>		
	) 
}