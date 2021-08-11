import React from "react"
import { Link } from "react-router-dom"
import { socket } from "./app"
import css from "./header.css"

function LinkItem(props) {
	return (
		<li className="nav-item">
			<Link className="nav-link" to={props.link}> {props.name} </Link>
		</li>		
	)
}


let links_signin_login = <> 
							<LinkItem name="Signup" link="/signup" />
							<LinkItem name="Login" link="/login" />
						</>
						


export default function Header(props) {	
	let link_logout = 	<>
						<LinkItem name="New game" link="/settings" />
						<LinkItem name="Results" link="/results" />
						<li className="nav-item">
							<a className="nav-link" href="/logout" onClick = {() => {socket.emit("user offline", {"username": props.username})}}> Logout </a>
						</li>
						
					</>
	return (
		<div id="header" className="container-fluid bg-black-main">
			<nav className="navbar navbar-expand-lg navbar-dark">
			  <a className="navbar-brand" href="#">Chessie</a>
			  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			  </button>
			  <div className="collapse navbar-collapse" id="navbarNav">
				<ul className="navbar-nav mr-auto">
					{ props.loggedIn ? link_logout : links_signin_login }
				</ul>
				<ul className="navbar-nav">
					<li className="nav-item">
					{ props.loggedIn && <h5 id="username" className="navbar-text"> {props.username}</h5>}
					</li>
				</ul>
			  </div>
			</nav>
		</div>
	)
}

