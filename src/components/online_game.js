import React, { useState, useEffect } from "react"
import { socket } from "./app"
import Dialog from "./dialog"
import Scrollable from "./scrollable"
import css from "./online_game.css"
import {BackButton} from "./windows"

const baseURL = window.location.origin

function OnlineGameItemSelf(props) {
	return (
		<li key={props.id}> {props.username_game} ({props.time} seconds) </li>
	)
}

function OnlineGameItemOther(props) {
	return (
		<li key={props.id}> {props.username} ({props.time} seconds) 
			<a className="color_blue" onClick={() => props.onClick()}> Join game </a> 
		</li>
	)
}

function OnlineGameItem(props) {
	let is_creator = props.username === props.username_game
	
	if (is_creator) {
		return (
			<OnlineGameItemSelf 
				id={props.id} 
				username_game={props.username_game} 
				time={props.time} />
		)			
	} else {
		return (
			<OnlineGameItemOther 
				id={props.id} 
				username={props.username_game} 
				time={props.time} 
				onClick={() => props.onClick()} />	
		)
	}
}

					
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
	
  let users = usersOnline.map((user, id) => <li key={id}> {user} </li>)
  
  let games = gamesAvailable.map((game, id) => 
	  <OnlineGameItem 
	    key={id}
		id={id} 
		username={props.username} 
		username_game={game["username"]} 
		game_id={game["game_id"]} 
		time={game["time"]}
		onClick={() => props.onClickJoin(game["game_id"])}/>
  )


  return (
	<Dialog title="Games" size="large">
        <div className="online_games_container">
          <div className="users_container">
              <h5> Users online </h5>
              <Scrollable>
                <ul>
                  {users}
                </ul>
              </Scrollable>
          </div>
          <div className="games_container">
              <h5> Games available </h5>
              <Scrollable size="small">
                <ul>
                  {games}
                </ul>
              </Scrollable>
          </div>
        </div>
		<BackButton onClick={() => props.onClickBack()} />
        <button name="new_game" className="btn btn-primary ml-3" onClick={() => props.onClickNew()}> Create new game </button>
    </Dialog>
  )
}