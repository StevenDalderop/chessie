import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Switch, useHistory } from "react-router-dom"
import Game from "./game"
import Login from "./login"
import HomePage from "./homepage"
import Header from "./header"
import { ChooseGame } from "./windows"
import GameSetting from "./game_settings"

export var socket = io()

const baseURL = window.location.origin

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
			"body": JSON.stringify({"username": username})
		}
		
		fetch(`${baseURL}/api/create_new_user`, json)
			.then(res => res.json())
			.then(data => {
				if (data.valid_username) {
					setUsernameExists(false)
					setLoggedIn(true)
					history.push("/")
					
				} else {
					setUsernameExists(true)
					setLoggedIn(false)
				}
			})
	}

	return (
		<div>
			<Header />
			<Switch>
				<Route exact path="/login">
					<Login 
						onChange={(e) => handleChange(e)}
						onSubmit={(e) => handleUserNameSubmitted(e)} 
						username={username}
						usernameExists={usernameExists}								
					/>
				</Route>
				<Route path="/">
					<HomePage username={username} />
				</Route>				
			</Switch>
		</div>
	)
}