import React from "react"
const css = require('./dialog.css')

type Props = {
	size: string;
	type: string;
	title: string;
	children: React.ReactNode
}

const Dialog : React.FC<Props> = (props) => {
	return (
		<div className={"dialog dialog-" + props.size + " dialog-" + props.type}>
		  <h2> {props.title} </h2>
		  <div className="mt-3">
		    {props.children}
		  </div>
		</div>		
	) 
}

export default Dialog