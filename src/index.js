import React from "react"
import { render } from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./app"

function Index() {
	return (
		<Router>
			<App />
		</Router>
	)
}

const domContainer = document.querySelector('#chess_board_container');
render(<Index />, domContainer);