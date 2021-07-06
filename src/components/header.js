import React from "react"

export default function Header(props) {
  if (props.game_state === "started" && props.vs === "human_other") {
    let button_resign = <button key="resign" id="button_resign_mobile" name="resign" className="btn btn-danger mobile" onClick={() => props.onClick2()}> Resign </button>
    let button_draw = <button key="draw" id="button_draw_mobile" name="offer_draw" className="btn btn-warning mobile" onClick={() => props.onClick3()}> Draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.game_state === "started" && props.vs === "pc") {
    var buttons = <button key="resign" id="button_resign_mobile" name="resign" className="btn btn-danger mobile" onClick={() => props.onClick2()}> Resign </button>
  } else {
    var buttons = <button id="button_mobile" name="new_game" disabled={props.display === "humanOther" ? true : false} onClick={() => props.onClick()} className="btn btn-primary mobile"> New game </button>
  }

  return (
    <div id="header" className="container-fluid bg-black-main">
      <h1 id="title" className="center"> Chessie </h1>
      {buttons}
  </div>
  )
}