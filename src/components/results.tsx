import React, { useState, useEffect } from "react"


const baseURL = window.location.origin


const TableRowResults : React.FC<{username: string, opponent: string, time: number, result: string, color: string}> = (props) => {
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


const Results : React.FC<{username: string}> = (props) => {
	const [results, setResults] = useState([])
	const [filterType, setFilterType] = useState("online")
	
	useEffect(() => {
		fetch(`${baseURL}/api/me/results`)
			.then(res => res.json())
			.then(data => {
				setResults(data["results"])
			})
	}, [])
	
	function handleChange(e : React.ChangeEvent<HTMLSelectElement>) {
		setFilterType(e.target.value)
	}
	
	return (
		<div className="container">
			<select className="form-control mb-3" value={filterType} onChange={(e) => handleChange(e)}>
			  <option value="pc">PC</option>
			  <option value="online">Online</option>
			</select>
			<table className="table table-dark table-striped">
				<TableHead colnames={["Players", "Result", "Time"]} />
				<tbody>
					{ results && results.filter(x => x.type === filterType).map((result, key) => { 
						return <TableRowResults key={key}
												username={props.username}
												opponent={result.opponent} 
												result={result.result}
												time={result.time}
												color={result.color} />})
					}
				</tbody>
			</table>
		</div>
	)
}

export default Results