import React from "react"
import {Time} from "./timer"
import Scrollable from "./scrollable"

function ScoreEvaluationBar(props) {
  function score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100
  }
  return (
    <svg>
      <rect id="rect_left" width={String(score_to_with(props["evaluation"]))+"%"}/>
      <rect id="rect_right" x={String(score_to_with(props["evaluation"]))+"%"} width={String(100 - score_to_with(props["evaluation"]))+"%"}/>
      <text id="text" x="15" y="18"> Centipawns: {props["evaluation"]} </text>
    </svg>
  )
}

export function GameOptionButtons(props) {
  if (props.vs === "online" && !props.is_finished) {
    let button_resign = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={() => props.onClick2()}> Resign </button>
    let button_draw = <button key="draw" id="button_draw" name="offer_draw" className="btn btn-warning buttons" onClick={() => props.onClick3()}> Offer draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.vs === "pc" && !props.is_finished) {
    var buttons = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={() => props.onClick2()}> Resign </button>
  } else {
    var buttons = <button id="button_new_game" name="new_game" onClick={() => props.onClick()} className="btn btn-primary buttons"> New game </button>
  }
  return (buttons)
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
  let time_above = props["times"][props.mirrored ? 0 : 1]
  let time_below = props["times"][props.mirrored ? 1 : 0]
	
  return (
    <div className="sidebar">
	  <SidebarTimer title={props["username2"]} time={time_above} />
	  <SidebarChessNotation san={props["san"]} />
	  <SidebarEvaluationBar title="Chess engine" evaluation={props.evaluation} />
	  <SidebarGameOptions 
		vs={props.vs} 
		is_finished={props.is_finished} 
		onClick={() => {props.onClick()}} 
		onClick2={() => props.onClick2()} 
		onClick3={() => props.onClick3} />
	  <SidebarTimer title={props["username"]} time={time_below} />
    </div>
  )
}