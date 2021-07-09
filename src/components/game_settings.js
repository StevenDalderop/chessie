import React, { useState } from "react"
import { ChooseGame, ChooseTime, PcSkillLevelForm } from "./windows"
import Game from "./game"

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

export default function GameSettings(props) {
	const [vs, setVs] = useState(null)
	const [time, setTime] = useState(60)
	const [pcSkillLevel, setPcSkillLevel] = useState(10)
	const [usersOnline, setUsersOnline] = useState([])
	const [gamesAvailable, setGamesAvailable] = useState([])
	const [showPage, setShowPage] = useState(pages.vs)

	const handleClick = (vs) => {
		setVs(vs)
		setShowPage("time")			
	}
	
	const handleClickTime = (time) => {
		setTime(time)
		if (vs === vs_options.human) {
			setShowPage(pages.game)
		} else if (vs === vs_options.pc) {
			setShowPage(pages.pc)
		}
	}
	
	const handleChange = (e) => {
		var name = e.target.name
		var skillLevel = e.target.value
		setPcSkillLevel(skillLevel)
	}
	
	const handleSubmit = () => {
		setShowPage("game")
	}
	
	const pageSwitch = (page) => {
		switch (page) {
			case pages.vs:
				return <ChooseGame onClick={(vs) => handleClick(vs)}  />
			case pages.time:
				return <ChooseTime onClick={(time) => handleClickTime(time)} />
			case pages.game:
				return <Game 
							username={props.username} 
							vs={vs} 
							time={time} 
							color={chess_color.white} />
			case pages.pc:
				return <PcSkillLevelForm 
							skill_level_pc={pcSkillLevel} 
							onChange={(e) => handleChange(e)} 							
							onSubmit={() => handleSubmit()} />
			default:
				return <ChooseGame onClick={(vs) => handleClick(vs)} />
		}		
	} 

	return (
		<div>
			{ pageSwitch(showPage) }		
		</div>
	)
}