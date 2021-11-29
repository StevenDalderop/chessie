import React, { useState, useEffect } from "react"
import Dialog from "./dialog"
import Scrollable from "./scrollable"
import { BackButton } from "./windows"
import {socket} from "./app"

import css from "./online_game.css"

import { fetchDataURL } from "../functions"


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
	const [gamesAvailable, setGamesAvailable, errorGames, isLoadingGames] = 
		fetchDataURL('/api/games?is_started=0&user_online=1?&per_page=100')
	const [usersOnline, setUsersOnline, errorUsers, isLoadingUsers] = fetchDataURL('/api/users?is_online=1&per_page=100')

	
	
 	useEffect(() => {
		if (errorGames) {
			props.handleError(errorGames)
		}
		
		if (!isLoadingGames) {
			socket.on("game added", data => {
				console.log(data)
				setGamesAvailable(prevGames => {				
					var object = {...prevGames}
					console.log(object)
					object.items = object.items.filter(game => game.users[0].name !== data["game"].users[0].name)
					object.items = [...object.items, data["game"]]
					return object
				})
			})
		}
		
		return () => {
			socket.off("game added")
		}
	}, [isLoadingGames, errorGames])
		
	
	useEffect(() => {	
		if (errorUsers) {
			props.handleError(errorUsers)
		}
	
		if (!isLoadingGames || !isLoadingUsers) {
			socket.on("status change", data => {
				console.log(data)  
				if (data["is_online"]) {
					setUsersOnline(prevUsers => {
						var object = {...prevUsers}
						object.items = object.items.filter(user => user.id !== data.user.id)
						object.items = [...object.items, data["user"]]
						return object
					})
				} else {
					setUsersOnline(prevUsers => {
						var object = {...prevUsers}
						var index = object.items.findIndex(user => user.id === data["user"].id)
						if (index !== -1) {
							object.items.splice(index, 1)
						}
						return object
					})
					setGamesAvailable(prevGames => {
						var object = {...prevGames}
						console.log(object)
						object.items = object.items.filter(game => game.users[0].id !== data.user.id)
						console.log(object)
						return object					
					})
				}
			})
		}

		return () => { 
			socket.off("status change")
		}
	}, [isLoadingGames, isLoadingUsers, errorUsers]) 

	
  let users = isLoadingUsers ? null : usersOnline.items.map((user, id) => <li key={id}> {user.name} </li>)
  
  let games = isLoadingGames ? null : gamesAvailable.items.map((game, id) => 
	  <OnlineGameItem 
	    key={id}
		id={id} 
		username={props.username} 
		username_game={game["users"][0]["name"]} 
		game_id={game["id"]} 
		time={game["time"]}
		onClick={() => props.onClickJoin(game)}/>
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