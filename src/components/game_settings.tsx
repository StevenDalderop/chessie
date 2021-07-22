import React, { useState, useEffect } from "react"
import { ChooseTime, PcSkillLevelForm } from "./windows"
import ChooseGame from "./choose_game"
import Game from "./game"
import OnlineGame from "./online_game"
import { socket } from "./app"

interface Pages {
	vs: string;
	time: string;
	pc: string;
	online: string;
	game: string;	
}

var pages: Pages = {
	vs: "vs",
	time: "time",
	pc: "pc",
	online: "online",
	game: "game"
}

interface Vs_options {
	human: string;
	pc: string;
	online: string;
}

var vs_options : Vs_options = {
	human: "human",
	pc: "pc",
	online: "online"
}

interface Chess_color {
	white: number;
	black: number;
}

var chess_color : Chess_color = {
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

const baseURL = window.location.origin

type Props = {
	username: string;
}

type Props2 = {
	page: string;
}

interface DataNewGame {
	game_id: number;
}

interface DataGameStarts {
	username: string;
	username2: string;
	time: number;
	game_id: number;
}

const GameSettings: React.FC<Props> = (props) =>  {
	const [vs, setVs] = useState(null)
	const [time, setTime] = useState(60)
	const [pcSkillLevel, setPcSkillLevel] = useState(10)
	const [usernameOpponent, setUsernameOpponent] = useState("Opponent")
	const [color, setColor] = useState(chess_color.white)
	const [gameId, setGameId] = useState(null)
	const [showPage, setShowPage] = useState(pages.vs)
	
	useEffect(() => {			
		socket.on("announce new game", (data: DataNewGame) => { 
			setGameId(data["game_id"])		
		})
				
		socket.on("announce game starts", (data: DataGameStarts) => {		  
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
		)
		
		return () => { 
			socket.off("announce new game") 
			socket.off("announce game starts")
		}
	}, []) 

	const handleClick = (vs : string) => {
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
	
	const handleClickTime = (time : number) => {
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
	
	const handleClickJoinGame = (game_id: number) => {
		socket.emit("join game", {"username": props.username, "game_id": game_id})
	}
	
	const handleNewGameClick = () => {
		setShowPage(pages.vs)
		setColor(chess_color.white)
	}
	
	const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
		var name = e.target.name
		var skillLevel = e.target.value
		setPcSkillLevel(parseInt(skillLevel))
	}
	
	const handleSubmit = () => {
		setShowPage(pages.game)
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
							onChange={(e : React.ChangeEvent<HTMLInputElement>) => handleChange(e)} 							
							onSubmit={() => handleSubmit()}
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
			{ pageSwitch(showPage) }	
		</div>
	)
}

export default GameSettings
