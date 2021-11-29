import React, { useState, useEffect } from "react"
import * as types from "./types"

import { fetchDataURLWithPage } from "../functions"


const TableRowResults : React.FC<{username: string, opponent: string, time: number, result: string, color: string, timestamp: string, type:string}> = (props) => {
	if (props.result === "0-1") {var points_white = 0; var points_black = 1}
	else if (props.result === "1/2-1/2") {var points_white = 0.5; var points_black = 0.5}
	else {var points_white = 1; var points_black = 0}	
	
	return (
		<tr>
			<td>
				<div> {props.color === "white" ? props.username : props.opponent} </div>
				<div> {props.color === "white" ? props.opponent : props.username} </div>
			</td>
			<td>
				<div> {points_white} </div>
				<div> {points_black} </div>
			</td>
			<td style={{"verticalAlign": "middle"}}>
				{props.type}
			</td>
			<td style={{"verticalAlign": "middle"}}>
				{props.timestamp}
			</td>
			<td style={{"verticalAlign": "middle"}}>
				{props.time}
			</td>
		</tr>
	)
}

const TableHeadData: React.FC<{title : string}> = (props) => {
	return (
		<th> {props.title} </th>
	)
}

const TableHead : React.FC<{colnames : string[]}> = (props) => {		
	var colnames = props.colnames.map((colname, key) => {
		return <TableHeadData key={key} title={colname} />
	})
	
	return (
		<thead className="thead-dark">
			<tr>
				{colnames}
			</tr>
		</thead>
	)
}

const TableBody = ({results, username} : {results : any , username : string}) => {
	return (
		<tbody>
			{ results && results.items.map((result : types.Game, key : number) => { 					
				if (result.type === "pc") {
					var opponent_name = result.pc_name
					var color = result.users[0].color
				} else if (result.type === "human") {
					var opponent_name = "-"
					var color = result.users[0].color
				} else {
					let opponent = result.users.filter(user => user.name !== username)[0] 
					var opponent_name = opponent.name
					var color = opponent.color === "white" ? "black" : "white"
				}
				
				return <TableRowResults key={key}
										username={username}
										opponent={opponent_name} 
										result={result.result}
										time={result.time}
										color={color} 
										timestamp={result.timestamp}
										type={result.type} />})
			}
		</tbody>		
	)
}


const NavigationButton = ({results, onClick, name} : {results : any, onClick : any, name : string} ) => { 
	var disabled = name === "Next" ? results && !results._links.next : results && !results._links.previous
	return (
		<button className="btn btn-primary" onClick={() => onClick()} disabled={disabled}> 
			{name} 
		</button>
	)
}

const NavigationButtonGroup = (props : any) => {
	return (
		<div className="btn-group mb-3">
			{ props.children }
		</div>
	)
}

const Results : React.FC<{username: string, handleError : any}> = (props) => {
	const [results, setResults, page, setPage, error, isLoading] = fetchDataURLWithPage(`/api/me/games?is_finished=1`)
	
	useEffect(() => {	
		if (error) {
			props.handleError(error)
		}

	}, [error])
	
	
	return (
		<div className="container">
			<NavigationButtonGroup>
				<NavigationButton 
					results={results} 
					onClick={() => setPage(page => {return page - 1})} 
					name="Previous" />
				<NavigationButton 
					results={results} 
					onClick={() => setPage(page => {return page + 1})} 
					name="Next" />
			</NavigationButtonGroup>
			<table className="table table-dark table-striped">
				<TableHead colnames={["Players", "Result", "Type", "Timestamp", "Time"]} />
				<TableBody results={results} username={props.username} />
			</table>
		</div>
	)
}

export default Results