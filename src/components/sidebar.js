import React from "react"
import {Time} from "./timer"
import Scrollable from "./scrollable"
import css from "./sidebar.css"

function ScoreEvaluationBar(props) {
  function score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100
  }
  return (
    <svg className="evaluation_bar">
      <rect id="rect_left" width={String(score_to_with(props["evaluation"]))+"%"}/>
      <rect id="rect_right" x={String(score_to_with(props["evaluation"]))+"%"} width={String(100 - score_to_with(props["evaluation"]))+"%"}/>
      <text id="text" x="15" y="18"> Centipawns: {props["evaluation"]} </text>
    </svg>
  )
}

export function GameOptionButtons(props) {
  if (props.vs === "online" && !props.is_finished) {
    let button_resign = <button key="resign" name="resign" className="btn btn-danger" onClick={() => props.onClick2()}> Resign </button>
    let button_draw = <button key="draw" name="offer_draw" className="btn btn-warning" onClick={() => props.onClick3()}> Offer draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.vs === "pc" && !props.is_finished) {
    var buttons = <button key="resign" name="resign" className="btn btn-danger" onClick={() => props.onClick2()}> Resign </button>
  } else {
    var buttons = <button id="button_new_game" name="new_game" onClick={() => props.onClick()} className="btn btn-primary buttons"> New game </button>
  }
  return (
	<div className="game-option-buttons">
		{buttons}
	</div>
  )
}

function SidebarItemTitle(props) {
	return (
		<h5> {props.title} </h5>
	)
}

function SidebarItem(props) {
	return (
		<div className="sidebar_item">
			{props.children}
		</div>
	)
}

function SidebarTimer(props) {
	return (
      <SidebarItem>
        <SidebarItemTitle title={props.title} />
        <Time time={props.time} />
      </SidebarItem>	
	)	
}

function SidebarEvaluationBar(props) {
	return (
      <SidebarItem>
        <SidebarItemTitle title={props.title} />
        <ScoreEvaluationBar evaluation={props["evaluation"]} />
      </SidebarItem>	
	)
}

function SidebarGameOptions(props) {
	return (
      <SidebarItem>
		<GameOptionButtons 
			vs={props.vs} 
			is_finished={props.is_finished}
			onClick={() => {props.onClick()}} 
			onClick2={() => props.onClick2()} 
			onClick3={() => props.onClick3} />
      </SidebarItem>	
	)
}

function SidebarChessNotation(props) {
	return (
      <SidebarItem>
        <SidebarItemTitle title="History" />
        <Scrollable size="large">
          {props["san"]}
        </Scrollable>
      </SidebarItem>	
	)
}

export default function Sidebar(props) {
  let time_opponent = props.mirrored ? props.time_white : props.time_black
  let time_self = props.mirrored ? props.time_black : props.time_white
	
  return (
    <div className="sidebar">
	  <SidebarTimer title={props["usernameOpponent"]} time={time_opponent} />
	  <SidebarChessNotation san={props["san"]} />
	  <SidebarEvaluationBar title="Chess engine" evaluation={props.evaluation} />
	  <SidebarGameOptions 
		vs={props.vs} 
		is_finished={props.is_finished} 
		onClick={() => {props.onClick()}} 
		onClick2={() => props.onClick2()} 
		onClick3={() => props.onClick3} />
	  <SidebarTimer title={props["username"]} time={time_self} />
    </div>
  )
}