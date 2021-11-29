import React, { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Link, Switch, useHistory, Redirect } from "react-router-dom"
import Game from "./game"
import Header from "./header"
import { GetUsername, Signup, Login, ResetPassword, SetPassword } from "./windows"
import GameSettings from "./game_settings"
import css from "./app.css"

const baseURL = window.location.origin

export var socket = null


export default function App(props) {
	const [token, setToken] = useState("")
	const [username, setUsername] = useState("")
	const [loggedIn, setLoggedIn] = useState(false)
	const [alert, setAlert] = useState({"message": "", "type": "primary"})
	const history = useHistory()
	
			
	function handleChange(e) {
		e.preventDefault()
		if (e.target.name === "name") {
			setUsername(e.target.value)
		}
	}
	
	function handleClickLogout() {
		window.localStorage.removeItem("token")
		setToken("")
		setUsername("")
		socket.emit("user offline", {"username": username})
		setLoggedIn(false)
		setAlert({"message": "Succesfully logged out", "type": "success", "timeout": 3000})
	}
	
	function handleSignup(e) {
		e.preventDefault()	
		
		var data = {
			"name": e.target[0].value,
			"password": e.target[1].value
		}
		
		var json = {
			"method": "POST", 
			"headers": {
				'Content-Type': 'application/json',
			},
			"body": JSON.stringify(data)
		}
		
		fetch(`${baseURL}/api/users`, json)
			.then(res => res.json())
			.then(data => {
				console.log(data)
				if ('error' in data) {
					setAlert({"message": data["message"], "type": "danger"})
					let err = new Error(data.message)
					err.status = data.code
					throw err					
				} else {
					setAlert({"message": "Signup succeeded", "type": "success", "timeout": 3000})
					history.push("/login")				
				}
			})
			.catch(err => console.log(err))
	}
			
	function handleSubmit(e) {
		e.preventDefault()
		
		let username = e.target[0].value
		let password = e.target[1].value
		
		var json = {
			"method": "POST",
			"headers": {
				"Authorization": "Basic " + btoa(username + ":" + password)
			}
		}
			
		fetch(`${baseURL}/api/tokens`, json)
			.then(res => {
				if (res.status === 401) {
					setAlert({"message": "Invalid username and/or password", "type": "danger"})
				}
				if (!res.ok) {				
					let err = new Error("http status code " + res.status)
					err.status = res.status
					throw err					
				}
				return res.json()})
			.then(data => {
				setAlert({"message": "Login succeeded", "type": "success", "timeout": 3000})
				localStorage.setItem("token", data["token"])			
				socket = io({
					auth: {
						token: data["token"]
					}
				})
				setToken(data["token"])
				console.log(data)
			})
			.catch(err => console.log(err))		
	}	
	
	function handleError(data) {
		if (data["code"] === 401) {
			history.push("/login")
			setLoggedIn(false)
			setToken(null)
		}
		setAlert({"message": data["message"], "type": "danger"})
	}
	
	useEffect(() => {		
		if (!token) {
			history.push("/login")
		}
		
		let encodedToken = encodeURIComponent(token)
		
		fetch(`${baseURL}/api/is_token_valid?token=${encodedToken}`)
			.then(res => res.json())
			.then(data => {
				if (data["user"]) {
					setLoggedIn(true)
					setUsername(data["user"]["name"])
					socket.emit("user online", {"username": data["user"]["name"]})
					history.push("/settings")
				} else {
					history.push("/login")
				}
		})	
	}, [token])
	
	useEffect(() => {
		let alert_div = document.querySelector("#alert")
		
		if (alert_div) {
			alert_div.style.display = "inherit"
		}
		
		if (alert.timeout) {
			setTimeout(() => {
				alert_div.style.display = "none"
			}, alert.timeout)
		}
	}, [alert])
	

	return (
		<>
			<Header username={username} loggedIn={loggedIn} onClick={() => handleClickLogout()} />
			<div className="main-container">
				{alert.message && <div id="alert" className={"alert alert-" + alert.type}> {alert.message} </div> }
				<Switch>
					<Route exact path="/login">
						<Login onChange={(e) => handleChange(e)} onSubmit={(e) => handleSubmit(e)} />				
					</Route>
					<Route exact path="/signup">
						<Signup onChange={(e) => handleChange(e)} onSubmit={(e) => handleSignup(e)} />
					</Route>
					<Route exact path="/reset-password">
						<ResetPassword />
					</Route>
					<Route exact path="/set-password">
						<SetPassword />
					</Route>					
					<Route path="/">
						{loggedIn ? <GameSettings username={username} socket={socket} handleError={error => handleError(error)} /> : null}
					</Route>	
				</Switch>
			</div>
		</>
	)
}