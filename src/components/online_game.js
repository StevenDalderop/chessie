import React, { useState, useEffect } from "react"
import { socket } from "./app"

const baseURL = window.location.origin

  // handleUserNameSubmitted() {
	  // this.setState({"display": null})
      // socket.emit("add user online", {"username_self": this.props.username})
	  // socket.emit("get users online")
  // }
  							
export default function OnlineGame(props) {
	const [gamesAvailable, setGamesAvailable] = useState([])
	const [usersOnline, setUsersOnline] = useState([])
	
    useEffect(() => {
		let is_cancelled = false
		fetch(`${baseURL}/api/get_users`)
			.then(res => res.json())
			.then(data => {
				if (!is_cancelled) {
					setUsersOnline(data["users_online"])					
				}
			})	
		return () => {is_cancelled = true }
	}, [])
	
	useEffect(() => {
		let is_cancelled = false
		fetch(`${baseURL}/api/get_games`)
			.then(response => response.json())
			.then(data => {
				if (!is_cancelled) {
					setGamesAvailable(data["games_available"])
				}
			})	
		return () => {is_cancelled = true }			
	}, []) 
	
 	useEffect(() => {
		let is_cancelled = false
		socket.on("announce games available", data => {
			if (!is_cancelled) {
				setGamesAvailable(data["games_available"])
			}
		})
		return () => { is_cancelled = true }
	}, []) 
	
  let users = []
  let i = 0
  let u
  for (u of usersOnline) {
    users.push(<li key={i}> {u} </li>)
    i++
  }

  let games = []
  let j = 0
  let g
  for (g of gamesAvailable) {
    if (props["username"] !== g["username"]) {
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) <a className="color_blue" name="join_game" value={g["game_id"]} onClick={() => click(g["game_id"])}> Join game </a> </li>)
    } else {
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) </li>)   
    }
    j++
  }

  function click(value) {
    document.getElementById("hidden_input").value = value;
    document.getElementById("hidden_input").click()
  }

  let title = window.innerWidth < 768 ? "Games" : "Online"

  return (
    <div id="usersOnline" className="welcomeScreen">
      <div className="container_div">
        <h2> {title} </h2>
        <div className="row_container mt-3">
          <div className="col_left">
            <div className="relative">
              <h5> Users online </h5>
              <div id="users_online_div" className="align-left scrollable_y">
                <ul>
                  {users}
                </ul>
                <input id="hidden_input" type="hidden" name="join_game" onClick={(e) => props.onClick(e)}></input>
              </div>
            </div>
          </div>
          <div className="col_right">
            <div className="relative"> 
              <h5 id="users_online_subtitle"> Games available </h5>
              <div id="games_available_div" className="align-left scrollable_y">
                <ul>
                  {games}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <button name="new_game" className="btn btn-primary" onClick={(e) => props.onClick(e)}> Create new game </button>
      </div>
    </div>
  )
}