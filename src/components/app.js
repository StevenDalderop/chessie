import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Switch, useHistory, Redirect } from "react-router-dom"
import Game from "./game"
import Header from "./header"
import { GetUsername, Signup, Login } from "./windows"
import Results from "./results"
import GameSettings from "./game_settings"
import css from "./app.css"

const baseURL = window.location.origin

export var socket = io()

export default function App(props) {
	const [username, setUsername] = useState("test")
	const [loggedIn, setLoggedIn] = useState(false)
	const [message, setMessage] = useState("")
	const history = useHistory()
			
	function handleChange(e) {
		e.preventDefault()
		if (e.target.name === "name") {
			setUsername(e.target.value)
		}
	}
	
	function handleSubmit(e) {
		e.preventDefault()
		let username = e.target[0].value
		let password = e.target[1].value
		
		var json = {
			"method": "POST",
			"headers": {
				"Content-Type": "application/json"
			},
			"body": JSON.stringify({"name": username, "password": password})
		}
		
		fetch(`${baseURL}/login`, json)
			.then(res => res.json())
			.then(data => {
				console.log(data)
				setUsername(data["name"])
				setLoggedIn(data["is_authenticated"])
				if (data["is_authenticated"]) {
					socket.emit("user online")
					history.push("/settings")					
				} else {
					history.push("/login")
				}
			})
		
	}
	
	useEffect(() => {
		fetch(`${baseURL}/is_authenticated`)
			.then(res => res.json())
			.then(data => {
				setLoggedIn(data["logged_in"])
				setUsername(data["username"])
			})
	}, [])
	

	

	return (
		<>
			<Header username={username} loggedIn={loggedIn} />
			<div className="main-container">
				<Switch>
					<Route exact path="/login">
						<Login onChange={(e) => handleChange(e)} onSubmit={(e) => handleSubmit(e)} />					
					</Route>
					<Route exact path="/signup">
						<Signup onChange={(e) => handleChange(e)} />
					</Route>
					<Route exact path="/results">
						<Results username={username} />
					</Route>
					<Route exact path="/">
						<Redirect to="/settings" />
					</Route>
					<Route path="/">
						<GameSettings username={username} />
					</Route>	
				</Switch>
			</div>
		</>
	)
}