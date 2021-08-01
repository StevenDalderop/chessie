import React from "react"
import css from "./header.css"


export default function Header(props) {	
	return (
		<div id="header" className="container-fluid bg-black-main">
			<h1 id="title"> Chessie </h1>
			{ props.loggedIn && <h3 className="username-header"> {props.username} </h3>}
		</div>
	)
}