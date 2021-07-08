import React from "react"
import { useHistory } from "react-router-dom"

export default function HomePage() {
	const history = useHistory()
	
	function handleClick() {
		history.push("new_game")
	}

	return (
		<div>
			<h1> Welcome! </h1>
			<button onClick={() => handleClick()}> New Game </button>
		</div>
	)
}