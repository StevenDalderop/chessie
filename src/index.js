const baseURL = window.location.href

function Square(props) {
  return (
    <button className={"square bg-" + props.square_color + " " + props.class} onClick={() => props.onClick()}>
      {piece_icon(props.piece)}
    </button>
  )
}

function piece_icon(name) {
  if (name) {
    return (<i className={"fas fa-chess-" + name[0] + " fa-4x color_" + name[1]}></i>)
  } else {
    return null
  }
}

function Promotion(props) {
  if (!props["promotion"]) {
    return null
  } else {
    return (
      <div id="promotion">
        <h1> Promotion </h1>
        <button className="btn btn-primary mr-1" onClick={() => props.onClick("queen")}> Queen </button>
        <button className="btn btn-primary mr-1" onClick={() => props.onClick("knight")}> Knight </button>
        <button className="btn btn-primary mr-1" onClick={() => props.onClick("bishop")}> Bishop </button>
        <button className="btn btn-primary" onClick={() => props.onClick("rook")}> Rook </button>
      </div>
    )
  }
}

function Message(props) {
  if (!props["text"]) {
    return null
  } else {
    return (
      <div id="message" className="welcomeScreen">
        <h1> {props.title} </h1>
        <p> {props.text} </p>
        <button className="btn btn-primary" onClick={props.onClick}> Close </button>
      </div>
    )
  }
}

function Welcome1(props) {
  return (
    <div id="welcomeScreen1" className="welcomeScreen">
      <h1> Welcome </h1>
      <div className="row">
        <div className="col">
          <div className="time" onClick={() => props.onClick("human")}> <h3> vs Human </h3> </div>
        </div>
        <div className="col">
          <div className="time" onClick={() => props.onClick("pc")}> <h3> vs PC </h3> </div>
        </div>
      </div>
    </div>
  )
}

function Welcome2(props) {
  return (
    <div id="welcomeScreen2" className="welcomeScreen">
      <h1> Welcome </h1>
      <div className="row">
        <div className="col">
          <div className="time" onClick={() => props.onClick(60)}> <h3> 1 minute </h3> </div>
        </div>
        <div className="col">
          <div className="time" onClick={() => props.onClick(180)}> <h3> 3 minutes </h3> </div>
        </div>
        <div className="col">
          <div className="time" onClick={() => props.onClick(300)}> <h3> 5 minutes </h3> </div>
        </div>
        <div className="col">
          <div className="time" onClick={() => props.onClick(600)}> <h3> 10 minutes </h3> </div>
        </div>
      </div>
    </div>
  )
}

function WelcomePC(props) {
  return (
    <div id="welcomeScreenPC" className="welcomeScreen">
      <h1> Welcome </h1>
      <div>
        <form onSubmit={(e) => props.onSubmit(e)}>
          <label> Elo strength (1350-2850): </label> <br></br>
          <input id="elo" type="number" name="elo" min="1350" max="2850" value={props.elo_value} onChange={props.onChange} /> <br></br>
          <button className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}

class Board extends React.Component {
  renderSquare(row, column) {
    let square_color;
    if ((row + column) % 2 === 0) {
      square_color = "white" } else {
      square_color = "black"
    }
    return (
      <Square class={"square" + column} square_color={square_color} piece={this.props.pieces[row][column]} onClick={() => this.props.onClick(row, column)} key={row * 8 + column} />
    )
  }

  renderRow(row) {
    let squares = [];
    for (var col = 0; col < 8; col++) {
      squares.push(this.renderSquare(row, col))
    }
    return squares
  }

  renderBoard() {
    let rows = []
    for (var row = 0; row < 8; row++) {
      let element = (
        <div className="chess_row" key={row}>
           {this.renderRow(row)}
        </div>)
      rows.push(element)
    }
    return rows
  }

  render () {
    return (
      <div className="board">
        {this.renderBoard()}
      </div>
    )
  }
}

class Timer extends React.Component {
  render () {
    let minutes = Math.floor(this.props.seconds / 60)
    let seconds = this.props.seconds - minutes * 60
    if (seconds.toString().length < 2) {
      seconds = "0" + seconds.toString()
    }
    return (
      <h2> { minutes + ":" + seconds  } </h2>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      "history": [{"pieces":
                  [[["rook", 0], ["knight", 0], ["bishop", 0], ["queen", 0], ["king", 0], ["bishop", 0], ["knight", 0], ["rook", 0]],
                  [["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0]],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [null, null, null, null, null, null, null, null],
                  [["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1]],
                  [["rook", 1], ["knight", 1], ["bishop", 1], ["queen", 1], ["king", 1], ["bishop", 1], ["knight", 1], ["rook", 1]]]
                }],
      "selected_square": null,
      "last_move": 0,
      "times": [60, 60],
      "step": 0,
      "promotion": false,
      "vs": null,
      "score": 0,
      "elo": 2000,
      "result": null,
      "san": null
    }

    this.handleNewGame = this.handleNewGame.bind(this)
    this.fen_to_history = this.fen_to_history.bind(this)
  }

  fen_to_history(fen) {
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

  handleClick(row, column) {
    let history = JSON.parse(JSON.stringify(this.state.history)) // Deep clone
    let current = history[this.state.step]
    let pieces = current.pieces
    let selected_square = this.state.selected_square

    if ((!selected_square && pieces[row][column]) || (selected_square && pieces[row][column] && pieces[row][column][1] !== this.state.last_move)) {
      this.setState({"selected_square": [row, column]})
    } else if ((selected_square && pieces[row][column] && pieces[row][column][1] === this.state.last_move) || (selected_square && !pieces[row][column])) { // Move or attack piece
        let move = [String.fromCharCode(selected_square[1] + 97) + String(8 - selected_square[0]) + String.fromCharCode(column + 97) + String(8 - row)]
        console.log("move human: " + move)
        let promotion = pieces[selected_square[0]][selected_square[1]][0] === "pawn" && (row === 0 || row === 7)
        if (promotion) {
         this.setState({"promotion": [row, column]})
       } else {
         this.make_moves(selected_square, row, column)
       }
    }
  }

  async make_moves(selected_square, row, column) {
    let response = await fetch(`${baseURL}validated_move_info/${selected_square[0]}/${selected_square[1]}/${row}/${column}`)
    let data = await response.json()

    if (data["validated"] === "true") {
       console.log("move validated")
       this.setState((state) => ({
         "history": state.history.concat([{"pieces": this.fen_to_history(data["fen"])}]),
         "result": data["result"],
         "last_move": data["last_move"],
         "score": data["score"],
         "selected_square": null,
         "san": data["moves_san"],
         "step": state.step + 1,
         "promotion": false
       }))
       this.startTimer()
     }

     if (this.state.vs === "pc") {
       fetch(`${baseURL}get_pc_move`)
       .then(response => response.json())
       .then((data) => {
         this.setState((state) => ({
           "history": state.history.concat([{"pieces": this.fen_to_history(data["fen"])}]),
           "result": data["result"],
           "last_move": data["last_move"],
           "score": data["score"],
           "selected_square": null,
           "san": data["moves_san"],
           "step": state.step + 1,
           "promotion": false
         }))
       })
     }
  }

  handleClick1 (option) {
    document.querySelector("#welcomeScreen1").style.display = "none"
    if (option === "human") {
      document.querySelector("#welcomeScreen2").style.display = "initial"
    } else {
      document.querySelector("#welcomeScreenPC").style.display = "initial"
    }
    this.setState({"vs": option})
  }

  handleClick2 (time) {
    document.querySelector("#welcomeScreen2").style.display = "none"
    this.setState({"times": [time, time]})
  }

  handleClick3 (e) {
    e.preventDefault()
    fetch(`${baseURL}configure/${this.state.elo}`)
    document.querySelector("#welcomeScreenPC").style.display = "none"
    document.querySelector("#welcomeScreen2").style.display = "initial"
  }

  handleClickPromotion (piece) {
    let row = this.state.promotion[0]
    let column = this.state.promotion[1]
    let selected_square = this.state.selected_square
    fetch(`${baseURL}validated_move_info/${selected_square[0]}/${selected_square[1]}/${row}/${column}/${piece}`)
      .then(response => response.json())
      .then(data => {
        if (data["validated"] === "true") {
          console.log("move validated")
          this.setState((state) => ({"history": state.history.concat([{"pieces": this.fen_to_history(data["fen"])}]), "result": data["result"], "last_move": data["last_move"], "score": data["score"], "selected_square": null, "san": data["moves_san"], "step": state.step + 1, "promotion": false}))
          this.startTimer()
        }
      })
  }

  startTimer() {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
      let seconds = this.state.times[!this.state.last_move ? 1 : 0]
      if (seconds === 0) {
        this.setState((state)=> ({"result": state.last_move ? "1-0" : "0-1"}))
        clearInterval(this.interval)
      } else {
        seconds = seconds - 1
      }
      this.setState({"times": this.state.last_move === 0 ? [this.state.times[0], seconds] : [seconds, this.state.times[1]]})
    }, 1000)
  }

  handleNewGame(e) {
    document.querySelector("#welcomeScreen1").style.display = "Initial"
    clearInterval(this.interval)
    this.setState({"selected_square": null,
                   "last_move": 0,
                   "step": 0,
                   "history": this.state.history.slice(0,1),
                   "san": null,
                   "score": 0})
    fetch(`${baseURL}new_game`)
  }

  componentDidMount() {
    this.setState({"history": [{"pieces": this.fen_to_history(board)}]}) // Copy board from server
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100
  }

  render () {
    return (
      <div>
        <Welcome1 onClick={(option) => this.handleClick1(option)} />
        <Welcome2 onClick={(time) => this.handleClick2(time)} />
        <WelcomePC onChange={(e) => this.setState({"elo": e.target.value })} elo_value={this.state.elo} onSubmit={(e) => this.handleClick3(e)} />
        <Promotion promotion={this.state.promotion} onClick={(piece) => this.handleClickPromotion(piece)} />
        <Message title="Result" text={this.state.result} onClick={() => {document.querySelector("#message").style.display="none"; this.setState({"result": null})}} />

        <div className="row">
          <div className="col" id="col_left">
            </div>
          <div className="col-auto" >
            <Board pieces={this.state.history[this.state.step].pieces} onClick={(row, column) => this.handleClick(row, column)}/>
            </div>
          <div className="col" id="col_right" >
            <div id="timer1_div">
              <h2> Time </h2>
              <div id="timer">
                <Timer seconds={this.state.times[0]} />
              </div>
            </div>
            <div id="history">
              <h2> History </h2>
              <div id="list">
                  {this.state.san}
              </div>
            </div>
            <div id="evaluation">
              <h2> Stockfish evaluation </h2>
              <div id="evaluation_figure">
                <svg>
                  <rect id="rect_left" width={String(this.score_to_with(this.state.score))+"%"}/>
                  <rect id="rect_right" x={String(this.score_to_with(this.state.score))+"%"} width={String(100 - this.score_to_with(this.state.score))+"%"}/>
                  <text id="text" x="15" y="18"> Centipawns: {this.state.score} </text>
                </svg>
              </div>
            </div>
            <div id="buttons">
              <button id="button" onClick={this.handleNewGame} className="btn btn-primary"> New game </button>
            </div>
            <div id="timer2_div">
              <h2> Time </h2>
              <div id="timer2">
                <Timer seconds={this.state.times[1]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector('#chess_board_container');
ReactDOM.render(<Game />, domContainer);
