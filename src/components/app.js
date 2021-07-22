import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Switch, useHistory } from "react-router-dom"
import Game from "./game"
import Header from "./header"
import { GetUsername } from "./windows"
import GameSettings from "./game_settings"

const baseURL = window.location.origin

export var socket = io()


export default function App() {
	const [username, setUsername] = useState("test")
	const [usernameExists, setUsernameExists] = useState(false)
	const [loggedIn, setLoggedIn] = useState(false)
	const history = useHistory()
	
	useEffect(() => {
		if (!loggedIn) {
			history.push("/login")
		}
	})   
			
	function handleChange(e) {
		e.preventDefault()
		setUsername(e.target.value)
	}
	
	function handleUserNameSubmitted(e) {
		e.preventDefault()
		
		let json = {
			"method": "POST",
			"headers": {
				'Content-Type': 'application/json'
			},
			"body": JSON.stringify({"username": username, "sid": socket.id})
		}
		
		fetch(`${baseURL}/api/create_new_user`, json)
			.then(res => res.json())
			.then(data => {
				if (data.valid_username) {
					setUsernameExists(false)
					setLoggedIn(true)
					socket.emit("new user")
					history.push("/play")					
				} else {
					setUsernameExists(true)
					setLoggedIn(false)
				}
			})
	}

	return (
		<>
			<Header username={username} loggedIn={loggedIn} />
			<Switch>
				<Route exact path="/login">
					<GetUsername 
						message={usernameExists} 
						onChange={(e) => handleChange(e)} 
						username={username} 
						onSubmit={(e) => handleUserNameSubmitted(e)} />							
				</Route>
				<Route path="/">
					<GameSettings username={username} />
				</Route>				
			</Switch>
		</>
	)
}