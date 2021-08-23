import React, { useState, useEffect } from "react"
import { ChooseTime, PcSkillLevelForm } from "./windows"
import * as types from "./types"
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom"
import ChooseGame from "./choose_game"
import Game from "./game"
import OnlineGame from "./online_game"
import NotFound from "./not_found"
import { socket } from "./app"

const baseURL = window.location.origin

var pages: types.Pages = {
	vs: "vs",
	time: "time",
	pc: "pc",
	online: "online"
}

var vs_options : types.Vs_options = {
	human: "human",
	pc: "pc",
	online: "online"
}

var chess_color : types.Chess_color = {
	white: 1,
	black: 0
}

function get_previous_page(current_page : string, vs : string) {
	if (current_page === pages.time && vs === vs_options.online) {
		return pages.online
	} else if (current_page === pages.time || current_page === pages.pc || current_page === pages.online ) {
		return pages.vs
	}
} 

const fetchApiCreateGame = (vs : string, time : number, skill_level : number = null) => {	
	let data : {
		[key: string]: string | number | undefined
	}
	
	data = {"time": time, "game_type": vs}
	

	data["skill_level"] = skill_level 
	
	
	let json = {
		"method": "POST",
		"headers": {
			'Content-Type': 'application/json'
		},
		"body": JSON.stringify(data)
	}
	
	return fetch(`${baseURL}/api/me/game`, json)
				.then(response => response.json())		
}

const fetchApiLeaveGames = () => {
	return fetch(`${baseURL}/api/me/leave-games`)
}	

const fetchApiJoinGame = (game_id : number) => {
	let json = {
		"method": "POST",
		"headers": {
			'Content-Type': 'application/json'
		},
		"body": JSON.stringify({"game_id": game_id})			
	}
	
	return fetch(`${baseURL}/api/join-game`, json) 		
}
	
const GameSettings: React.FC<{username: string}> = (props) =>  {
	const [vs, setVs] = useState(null)
	const [time, setTime] = useState(0)
	const [pcSkillLevel, setPcSkillLevel] = useState(10)
	const [usernameOpponent, setUsernameOpponent] = useState("Opponent")
	const [color, setColor] = useState(chess_color.white)
	const [gameId, setGameId] = useState(null)
	const [room, setRoom] = useState(null)
	const [showPage, setShowPage] = useState(pages.vs)
	const history = useHistory()
	let { path, url } = useRouteMatch();
	
	useEffect(() => {							
		socket.on("announce game starts", (data: types.Game) => {	
				console.log(data)
				let user = data["users"].filter(user => user.name === props.username)[0]
				let opponent = data["users"].filter(user => user.name !== props.username)[0]

				setGameId(data["id"])
				setRoom(data["room"])
				setTime(data["time"])							

				setUsernameOpponent(opponent.name)
				setColor(user.color === "white" ? chess_color.white : chess_color.black)
			  					
				history.push("/play")
		  }
		)
		
		return () => { 
			socket.off("announce game starts")
		}
	}, [props.username])

	const handleClick = (vs : string) => {
		setVs(vs)
		if (vs !== vs_options.online) {
			setShowPage(pages.time)
		} else {
			setShowPage(pages.online)
		}
	}
	
	async function onTimeSelected(time_chosen : number) {
		let chess_color = "white"
		if (vs === vs_options.human) {
			let res = await fetchApiLeaveGames()
			let game = await fetchApiCreateGame(vs, time_chosen)
			setGameId(game.id)
			setColor(game.users[0].color === "white" ? 1 : 0)
			history.push("/play")
		} else if (vs === vs_options.pc) {
			setShowPage(pages.pc)
		} else if (vs === vs_options.online) {
			let res = await fetchApiLeaveGames()
			let game = await fetchApiCreateGame(vs, time_chosen)
			setGameId(game.id)
			setColor(game.users[0].color === "white" ? 1 : 0)
			socket.emit("online game added")
			socket.emit("join room", {"room": game.room})
			setShowPage(pages.online)
		}			
	}
	
	function handleClickTime(time_chosen : number) {
		setTime(time_chosen)
		onTimeSelected(time_chosen)
	}
	
	const handleClickNewOnlineGame = () => {
		setShowPage(pages.time)
	}
	
	const handleClickJoinGame = (game: types.Game) => {
		socket.emit("join room", {"room": game.room})
		console.log(`join room ${game.id}`)
		
		fetchApiJoinGame(game.id)
			.then(res => {
				socket.emit("start game", {"game_id": game.id})	
			})	
	}
	
	const handleNewGameClick = () => {
		setShowPage(pages.vs)
		history.push("/settings")
		setGameId(null)
		setColor(chess_color.white)
	}
	
	const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
		var name = e.target.name
		var skillLevel = e.target.value
		setPcSkillLevel(parseInt(skillLevel))
	}
	
	async function handleSubmit(e : React.ChangeEvent<HTMLInputElement>) {
		e.preventDefault()
		let res = await fetchApiLeaveGames()
		let game = await fetchApiCreateGame(vs, time, pcSkillLevel)
		console.log(game)
		setGameId(game.id)	
		setColor(game.users[0].color === "white" ? 1 : 0)
		history.push("/play")
	}
	
	const handleClickBack = () => {
		let prevPage = get_previous_page(showPage, vs)
		setShowPage(prevPage)
	}
	
	const pageSwitch = (page: string) : React.ReactNode => {
		switch (page) {
			case pages.vs:
				return <ChooseGame onClick={(vs: string) => handleClick(vs)} />
			case pages.time:
				return <ChooseTime 
							onClick={(time: number) => handleClickTime(time)} 
							onClickBack={() => handleClickBack()} />						
			case pages.pc:
				return <PcSkillLevelForm 
							skill_level_pc={pcSkillLevel} 
							onChange={(e : React.ChangeEvent<HTMLInputElement>) => handleChange(e)} 							
							onSubmit={(e : React.ChangeEvent<HTMLInputElement>) => handleSubmit(e)}
							onClickBack={() => handleClickBack()} />
			case pages.online:
				return <OnlineGame 
							username={props.username} 
							onClickJoin={(game : types.Game) => handleClickJoinGame(game)} 
							onClickNew={() => handleClickNewOnlineGame()}
							onClickBack={() => handleClickBack()} />
			default:
				return <ChooseGame 
							onClick={(vs : string) => handleClick(vs)} />
		}		
	} 

	return (
		<div>			
			<Switch>
				<Route exact path="/play">
					<Game 
						username={props.username} 
						vs={vs} 
						usernameOpponent={usernameOpponent}
						skill_level={pcSkillLevel}
						gameId={gameId}							
						time={time} 
						color={color}
						room={room}
						onClick={() => handleNewGameClick()} />				
				</Route>
				<Route exact path="/settings">
					{ pageSwitch(showPage) }
				</Route>
				<Route path="/">
					<NotFound />
				</Route>
			</Switch>
		</div>
	)
}

export default GameSettings
