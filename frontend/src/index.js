import React from "react"
import { render } from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./components/app"

function Index() {
	return (
		<Router>
			<App />
		</Router>
	)
}

const domContainer = document.querySelector('#app');
render(<Index />, domContainer);