import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Switch, useHistory, Redirect } from "react-router-dom"
import Game from "./game"
import Header from "./header"
import { GetUsername, Signup, Login } from "./windows"
import GameSettings from "./game_settings"
import css from "./app.css"

const baseURL = window.location.origin

export var socket = io()

export default function App(props) {
	const [username, setUsername] = useState("test")
	const [usernameExists, setUsernameExists] = useState(false)
	const [loggedIn, setLoggedIn] = useState(false)
	const history = useHistory()
	
	useEffect(() => {
		let usernameStored = localStorage.getItem("username")
		
		if (usernameStored) {
			setLoggedIn(true)
			setUsername(usernameStored)
			socket.on("connect", () => {
				let json = {
					"method": "PATCH",
					"headers": {
						'Content-Type': 'application/json'
					},
					"body": JSON.stringify({"username": usernameStored, "sid": socket.id, "is_online": true})
				}
				fetch(`${baseURL}/api/user_online`, json)
					.then(res => {
						socket.emit("new user")						
					})
			})
		} else {
			history.push("/login")
		}
	}, [])   
			
	function handleChange(e) {
		e.preventDefault()
		if (e.target.name === "name") {
			setUsername(e.target.value)
		}
	}
	
	function createNewUser() {
		let json = {
			"method": "POST",
			"headers": {
				'Content-Type': 'application/json'
			},
			"body": JSON.stringify({"username": username, "sid": socket.id, "is_online": true})
		}
		
		fetch(`${baseURL}/api/create_new_user`, json)
			.then(res => {
				localStorage.setItem("username", username)
				setUsernameExists(false)
				setLoggedIn(true)
				socket.emit("new user")	
				history.push("/settings")
			})
			.catch(err => console.log(err))
	}
	
	function handleUserNameSubmitted(e) {
		e.preventDefault()
		
		fetch(`${baseURL}/api/users/exists?username=${username}`)
			.then(res => res.json())
			.then(already_exists => {
				if (already_exists) {
					setUsernameExists(true)
					setLoggedIn(false)
				} else {
					createNewUser()
				}
			})
	}		


	return (
		<>
			<Header username={username} loggedIn={loggedIn} />
			<div className="main-container">
				<ul>
					<li>
						<Link to="/signup"> Signup </Link>
					</li>
					<li>
						<Link to="/login"> Login </Link>
					</li>
					<li>
						<a href="/logout"> Logout </a>
					</li>
				</ul>
				<Switch>
					<Route exact path="/login">
						<Login onChange={(e) => handleChange(e)} />					
					</Route>
					<Route exact path="/signup">
						<Signup onChange={(e) => handleChange(e)} />
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