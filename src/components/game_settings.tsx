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

const fetchApiCreateGame = (vs : string, username : string, time : number, color: string, skill_level : number = null) => {	
	let data : {
		[key: string]: string | number | undefined
	}
	
	data = {"username": username, "time": time, "game_type": vs, "color": color}
	

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
	
const GameSettings: React.FC<types.GameSettingsProps> = (props) =>  {
	const [vs, setVs] = useState(null)
	const [time, setTime] = useState(0)
	const [pcSkillLevel, setPcSkillLevel] = useState(10)
	const [usernameOpponent, setUsernameOpponent] = useState("Opponent")
	const [color, setColor] = useState(chess_color.white)
	const [gameId, setGameId] = useState(null)
	const [showPage, setShowPage] = useState(pages.vs)
	const history = useHistory()
	let { path, url } = useRouteMatch();
	
	useEffect(() => {							
		socket.on("announce game starts", (data: types.DataGameStarts) => {	
				let hasWhitePieces = data["username_white"] === props.username
				setGameId(data["game_id"])
							
			  if (hasWhitePieces) {
				  setUsernameOpponent(data["username_black"])
				  setColor(chess_color.white)
			  } else {
				  setUsernameOpponent(data["username_white"])
				  setColor(chess_color.black)				  
			  }										
				setTime(data["time_white"])	
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
			let game = await fetchApiCreateGame(vs, props.username, time_chosen, chess_color)
			setGameId(game.id)
			history.push("/play")
		} else if (vs === vs_options.pc) {
			setShowPage(pages.pc)
		} else if (vs === vs_options.online) {
			let res = await fetchApiLeaveGames()
			let game = await fetchApiCreateGame(vs, props.username, time_chosen, chess_color)
			setGameId(game.id)
			socket.emit("new online game")
			socket.emit("join room", {"room": game.id})
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
	
	const handleClickJoinGame = (game_id: number) => {
		socket.emit("join room", {"room": game_id})
		
		fetchApiJoinGame(game_id)
			.then(res => {
				socket.emit("start game", {"game_id": game_id})	
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
		let game = await fetchApiCreateGame(vs, props.username, time, "white", pcSkillLevel)
		console.log(game)
		setGameId(game.id)	
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
							onClickJoin={(game_id : number) => handleClickJoinGame(game_id)} 
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
