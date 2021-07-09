import React from "react"
import { useHistory, useRouteMatch, useParams, Switch, Route } from "react-router-dom"
import GameSettings from "./game_settings"


export default function HomePage(props) {
	const history = useHistory()
	let { path, url } = useRouteMatch();
	let { vs } = useParams()
	
	function handleClick() {
		history.push("play")
	}

	return (
		<Switch>
			<Route exact path="/play">
				< GameSettings username={props.username} />
			</Route>
			<Route exact path={path}>
				<div>
					<h1> Welcome {props.username}! </h1>
					<button onClick={() => handleClick()}> New Game </button>
				</div>
			</Route>
		</Switch>
	)
}