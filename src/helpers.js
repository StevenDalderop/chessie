function Container(props) {
  return (
    <div id="content" className="container-fluid no-padding not_mobile">
      <div id="content_row" className="row">
        <div className="col">
          {props.col_left}
        </div>
        <div id="col_right" className="col-auto">
          {props.sidebar_right}
        </div>
      </div>
    </div>
  )
}

function Container_mobile(props) {
  return (
    <div id="content_mobile" className="container-fluid no-padding mobile">
      <div className="row">
        <div className="col">
          <div className="content_box">
            {props.board}
          </div>
        </div>
      </div>
      {props.mobile_bar} 
    </div>
  )
}

function Mobile_bar(props) {
  let time_right = !props.mirrored ? 1 : 0
  let time_left = !props.mirrored ? 0 : 1
  
  return(
    <div id="mobile_bar_row" className="row">
      <div className="col" id="timer1_div">
        <h5 className="overflow_hiddden"> {props["username"]} </h5>
        <div id="timer">
          <Timer seconds={props["times"][time_left]} />
        </div>
      </div>
      <div className="col" id="timer2_div">
        <h5 className="overflow_hiddden"> {props.username2} </h5>
        <div id="timer2">
          <Timer seconds={props["times"][time_right]} />
        </div>
      </div>
    </div>
  )
}

function Sidebar(props) {
  let time_above = !props.mirrored ? 1 : 0
  let time_below = !props.mirrored ? 0 : 1

  if (props.game_state === "started" && props.vs === "human_other") {
    let button_resign = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={(e) => props.onClick(e)}> Resign </button>
    let button_draw = <button key="draw" id="button_draw" name="offer_draw" className="btn btn-warning buttons" onClick={(e) => props.onClick(e)}> Offer draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.game_state === "started" && props.vs === "pc") {
    var buttons = <button key="resign" id="button_resign" name="resign" className="btn btn-danger buttons" onClick={(e) => props.onClick(e)}> Resign </button>
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
          <ScoreEvaluationBar score={props["score"]} />
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

function BoardContainer(props) {
  return (
    <div id="board_container_2" className="container_div">
      <div id="board_container">
        <Board 
          pieces={props.pieces} 
          selected_square={props.selected_square} 
          moved_squares={props.moved_squares} 
          onClick={(row, column) => props.onClick(row, column)} 
          mirrored={props.mirrored} 
        />
      </div>
    </div>
  )
}

function Timer(props) {
  let minutes = Math.floor(props.seconds / 60)
  let seconds = props.seconds - minutes * 60
  if (seconds.toString().length < 2) {
    seconds = "0" + seconds.toString()
  }
  return (
    <h3 id={props.id} className="times"> { minutes + ":" + seconds  } </h3>
  )
}

function ScoreEvaluationBar(props) {
  function score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100
  }
  return (
    <svg>
      <rect id="rect_left" width={String(score_to_with(props["score"]))+"%"}/>
      <rect id="rect_right" x={String(score_to_with(props["score"]))+"%"} width={String(100 - score_to_with(props["score"]))+"%"}/>
      <text id="text" x="15" y="18"> Centipawns: {props["score"]} </text>
    </svg>
  )
}

function Header(props) {
  if (props.game_state === "started" && props.vs === "human_other") {
    let button_resign = <button key="resign" id="button_resign_mobile" name="resign" className="btn btn-danger mobile" onClick={(e) => props.onClick(e)}> Resign </button>
    let button_draw = <button key="draw" id="button_draw_mobile" name="offer_draw" className="btn btn-warning mobile" onClick={(e) => props.onClick(e)}> Draw </button>
    var buttons = [button_resign, button_draw]
  } else if (props.game_state === "started" && props.vs === "pc") {
    var buttons = <button key="resign" id="button_resign_mobile" name="resign" className="btn btn-danger mobile" onClick={(e) => props.onClick(e)}> Resign </button>
  } else {
    var buttons = <button id="button_mobile" name="new_game" disabled={props.display === "humanOther" ? true : false} onClick={(e) => props.onClick(e)} className="btn btn-primary mobile"> New game </button>
  }

  return (
    <div id="header" className="container-fluid bg-black-main">
      <h1 id="title" className="center"> Chessie </h1>
      {buttons}
  </div>
  )
}

function fen_to_history(fen) {
  let fen_board = fen.split(" ")[0]
  let list = fen_board.split("/")
  let out = []
  let r;
  for (r of list) {
    let temp = r.split("")
    out.push(temp)
  }

  let out2 = []
  for (r of out) {
    let out2_row = []
    let e;
    for (e of r) {
      if (e >= 0) {
        for (let i = 0; i < e; i++) {
          out2_row.push(null)
        }
      } else if ( e === "R") {
        out2_row.push(["rook", 1])
      } else if ( e === "N") {
        out2_row.push(["knight", 1])
      } else if ( e === "B") {
        out2_row.push(["bishop", 1])
      } else if ( e === "K") {
        out2_row.push(["king", 1])
      } else if ( e === "Q") {
        out2_row.push(["queen", 1])
      } else if ( e === "P") {
        out2_row.push(["pawn", 1])
      } else if ( e === "r") {
        out2_row.push(["rook", 0])
      } else if ( e === "n") {
        out2_row.push(["knight", 0])
      } else if ( e === "b") {
        out2_row.push(["bishop", 0])
      } else if ( e === "k") {
        out2_row.push(["king", 0])
      } else if ( e === "q") {
        out2_row.push(["queen", 0])
      } else if ( e === "p") {
        out2_row.push(["pawn", 0])
      }
    }
  out2.push(out2_row)
  }
  return out2
}

function uci_to_row_column(uci) {
  let col_start = parseInt(uci[0], 36) - 10
  let col_end = parseInt(uci[2], 36) - 10
  let row_start = 8 - uci[1]
  let row_end = 8 - uci[3]
  return [[row_start, col_start], [row_end, col_end]]
}