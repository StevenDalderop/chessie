import React, { useState, useEffect } from "react"
import { ChooseGame, ChooseTime, PcSkillLevelForm } from "./windows"
import Game from "./game"
import OnlineGame from "./online_game"
import { socket } from "./app" 

var pages = {
	vs: "vs",
	time: "time",
	pc: "pc",
	online: "online",
	game: "game"
}

var vs_options = {
	human: "human",
	pc: "pc",
	online: "online"
}

var chess_color = {
	white: 1,
	black: 0
}

function get_previous_page(current_page, vs) {
	if (current_page === pages.time && vs === vs_options.online) {
		return pages.online
	} else if (current_page === pages.time || current_page === pages.pc || current_page === pages.online ) {
		return pages.vs
	}
} 

const baseURL = window.location.origin

export default function GameSettings(props) {
	const [vs, setVs] = useState(null)
	const [time, setTime] = useState(60)
	const [pcSkillLevel, setPcSkillLevel] = useState(10)
	const [usernameOpponent, setUsernameOpponent] = useState("Opponent")
	const [color, setColor] = useState(chess_color.white)
	const [gameId, setGameId] = useState(null)
	const [showPage, setShowPage] = useState(pages.vs)
	
	useEffect(() => {
		let is_cancelled = false
		
		socket.on("announce new game", (data) => { 
				if (!is_cancelled) {
					setGameId(data["game_id"])
				}
			}
		)
				
		socket.on("announce game starts", data => {		  
		  if (!is_cancelled) { 
				let hasWhitePieces = data["username"] === props.username
				setGameId(data["game_id"])
				setShowPage(pages.game)
			  if (hasWhitePieces) {
				  setUsernameOpponent(data["username2"])
				  setColor(chess_color.white)
			  } else {
				  setUsernameOpponent(data["username"])
				  setColor(chess_color.black)				  
			  }				  			  
		  }
		})
		return () => { is_cancelled = true }
	}, []) 

	const handleClick = (vs) => {
		setVs(vs)
		if (vs !== vs_options.online) {
			fetch(`${baseURL}/api/new_game`)
				.then(response => response.json())
				.then(data => {
					setGameId(data["game_id"])		
					setShowPage("time")				
				}) 	
		} else {
			setShowPage(pages.online)
		}
	}
	
	const handleClickTime = (time) => {
		setTime(time)
		if (vs === vs_options.human) {
			setShowPage(pages.game)
		} else if (vs === vs_options.pc) {
			setShowPage(pages.pc)
		} else if (vs === vs_options.online) {
			socket.emit("new online game", {"username": props.username, "time": time})
			setShowPage(pages.online)
		}
	}
	
	const handleClickNewOnlineGame = () => {
		setShowPage(pages.time)
	}
	
	const handleClickJoinGame = (game_id) => {
		socket.emit("join game", {"username": props.username, "game_id": game_id})
	}
	
	const handleNewGameClick = () => {
		setShowPage(pages.vs)
		setColor(chess_color.white)
	}
	
	const handleChange = (e) => {
		var name = e.target.name
		var skillLevel = e.target.value
		setPcSkillLevel(skillLevel)
	}
	
	const handleSubmit = () => {
		setShowPage(pages.game)
	}
	
	const handleClickBack = () => {
		let prevPage = get_previous_page(showPage, vs)
		setShowPage(prevPage)
	}
	
	const pageSwitch = (page) => {
		switch (page) {
			case pages.vs:
				return <ChooseGame 
							onClick={(vs) => handleClick(vs)} />
			case pages.time:
				return <ChooseTime 
							onClick={(time) => handleClickTime(time)} 
							onClickBack={() => handleClickBack()} />
			case pages.game:
				return <Game 
							username={props.username} 
							vs={vs} 
							time={time} 
							color={color}
							usernameOpponent={usernameOpponent}
							skill_level={pcSkillLevel}
							gameId={gameId}
							onClick={() => handleNewGameClick()} />
			case pages.pc:
				return <PcSkillLevelForm 
							skill_level_pc={pcSkillLevel} 
							onChange={(e) => handleChange(e)} 							
							onSubmit={() => handleSubmit()}
							onClickBack={() => handleClickBack()} />
			case pages.online:
				return <OnlineGame 
						username={props.username} 
						onClickJoin={(e) => handleClickJoinGame(e)} 
						onClickNew={() => handleClickNewOnlineGame()}
						onClickBack={() => handleClickBack()} />
			default:
				return <ChooseGame 
							onClick={(vs) => handleClick(vs)} 
							onClickBack={() => handleClickBack()} />
		}		
	} 

	return (
		<>
			{ pageSwitch(showPage) }		
		</>
	)
}
