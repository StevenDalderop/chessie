import React, { useState } from "react"
import { GetUsername } from "./windows"

export default function Login(props) {		
	return (
		<div>
			<GetUsername 
				message={props.usernameExists} 
				onChange={(e) => props.onChange(e)} 
				username={props.username} 
				onSubmit={(e) => props.onSubmit(e)} />
		</div>
	)
}