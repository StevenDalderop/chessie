import React from "react"
import Timer from "./timer"

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

export default function Sidebar(props) {
  let time_above = !props.mirrored ? 1 : 0
  let time_below = !props.mirrored ? 0 : 1

  if (props.game_state === "started" && props.vs === "human_other") {
    let button_resign = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={() => props.onClick2()}> Resign </button>
    let button_draw = <button key="draw" id="button_draw" name="offer_draw" className="btn btn-warning buttons" onClick={() => props.onClick3()}> Offer draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.game_state === "started" && props.vs === "pc") {
    var buttons = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={() => props.onClick2()}> Resign </button>
  } else {
    var buttons = <button id="button_new_game" name="new_game" disabled={props.display === "humanOther" ? true : false} onClick={(e) => props.onClick(e)} className="btn btn-primary buttons"> New game </button>
  }

  return (
    <div>
      <div id="timer1_div">
        <h5> {props["username2"]} </h5>
        <div id="timer">
          <Timer id="time_above" seconds={props["times"][time_above]} />
        </div>
      </div>
      <div id="history">
        <h5> History </h5>
        <div id="list">
          {props["san"]}
        </div>
      </div>
      <div id="evaluation">
        <h5> Chess engine </h5>
        <div id="evaluation_figure">
          <ScoreEvaluationBar evaluation={props["evaluation"]} />
        </div>
      </div>
      <div id="buttons">
        {buttons}
      </div>
      <div id="timer2_div">
        <h5 id="username_below"> {props.username} </h5>
        <div id="timer2">
          <Timer id="time_below" seconds={props["times"][time_below]} />
        </div>
      </div>
    </div>
  )
}