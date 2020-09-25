const baseURL = window.location.href;

var socket = io();

function Square(props) {
  return React.createElement(
    "button",
    { className: "square bg-" + props.square_color + " " + props.class, onClick: () => props.onClick() },
    piece_icon(props.piece)
  );
}

function piece_icon(name) {
  if (name) {
    if (name[1] === 0) {
      var color = "d";
    } else {
      var color = "l";
    }
    return React.createElement("img", { className: "piece_icon", src: "/static/Chess_" + name[0] + color + "t45.svg" });
  } else {
    return null;
  }
}

function Promotion(props) {
  if (!props["promotion"]) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "promotion" },
      React.createElement(
        "h1",
        null,
        " Promotion "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary mr-1", onClick: () => props.onClick("queen") },
        " Queen "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary mr-1", onClick: () => props.onClick("knight") },
        " Knight "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary mr-1", onClick: () => props.onClick("bishop") },
        " Bishop "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: () => props.onClick("rook") },
        " Rook "
      )
    );
  }
}

function Message(props) {
  if (!props["text"]) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "message", className: "welcomeScreen" },
      React.createElement(
        "h1",
        null,
        " ",
        props.title,
        " "
      ),
      React.createElement(
        "p",
        null,
        " ",
        props.text,
        " "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: props.onClick },
        " Close "
      )
    );
  }
}

function StartScreen(props) {
  return React.createElement(
    "div",
    { id: "welcomeScreen1", className: "welcomeScreen" },
    React.createElement(
      "div",
      { className: "container_div" },
      React.createElement(
        "button",
        { className: "close_button btn btn-danger", onClick: () => {
            document.querySelectorAll(".welcomeScreen").forEach(screen => {
              screen.style.display = "None";
            });
          } },
        " Close "
      ),
      React.createElement(
        "h1",
        null,
        " New Game "
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick("human") },
            " ",
            React.createElement(
              "h3",
              null,
              " vs Human offline "
            ),
            " "
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick("human_other") },
            " ",
            React.createElement(
              "h3",
              null,
              " vs Human online "
            ),
            " "
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick("pc") },
            " ",
            React.createElement(
              "h3",
              null,
              " vs PC "
            ),
            " "
          )
        )
      )
    )
  );
}

function WelcomeHuman(props) {
  return React.createElement(
    "div",
    { id: "welcomeScreen2", className: "welcomeScreen" },
    React.createElement(
      "div",
      { className: "container_div" },
      React.createElement(
        "button",
        { className: "close_button btn btn-danger", onClick: () => {
            document.querySelectorAll(".welcomeScreen").forEach(screen => {
              screen.style.display = "None";
            });
          } },
        " Close "
      ),
      React.createElement(
        "h1",
        null,
        " Time "
      ),
      React.createElement(
        "div",
        { className: "row ml-0 mr-0" },
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick(60) },
            " ",
            React.createElement(
              "h5",
              null,
              " 1 minute "
            ),
            " "
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick(180) },
            " ",
            React.createElement(
              "h5",
              null,
              " 3 minutes "
            ),
            " "
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick(300) },
            " ",
            React.createElement(
              "h5",
              null,
              " 5 minutes "
            ),
            " "
          )
        ),
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "div",
            { className: "time", onClick: () => props.onClick(600) },
            " ",
            React.createElement(
              "h5",
              null,
              " 10 minutes "
            ),
            " "
          )
        )
      )
    )
  );
}

function WelcomeHumanOther(props) {
  return React.createElement(
    "div",
    { id: "humanOther", className: "welcomeScreen" },
    React.createElement(
      "h1",
      null,
      " Username "
    ),
    React.createElement(
      "div",
      null,
      React.createElement(
        "form",
        { onSubmit: e => props.onSubmit(e) },
        React.createElement(
          "label",
          null,
          " What is your username? "
        ),
        " ",
        React.createElement("br", null),
        React.createElement("input", { id: "username", type: "text", placeholder: "username", value: props.username, onChange: props.onChange }),
        " ",
        React.createElement("br", null),
        React.createElement(
          "button",
          { className: "btn btn-primary mt-3" },
          " Submit "
        )
      )
    )
  );
}

function UsersOnline(props) {
  let users = [];
  let i = 0;
  let u;
  for (u of props["usernames"]) {
    users.push(React.createElement(
      "li",
      { key: i },
      " ",
      u["username"],
      " "
    ));
    i++;
  }
  let games = [];
  let j = 0;
  let g;
  for (g of props["games"]) {
    games.push(React.createElement(
      "li",
      { key: j },
      " ",
      g["username"],
      " (",
      g["time"],
      " seconds) ",
      React.createElement(
        "a",
        { className: "link", onClick: () => props.onClickGame(g["username"], g["room"], g["time"]) },
        " Join game "
      ),
      " "
    ));
    j++;
  }
  return React.createElement(
    "div",
    { id: "usersOnline", className: "welcomeScreen" },
    React.createElement(
      "div",
      { className: "container_div" },
      React.createElement(
        "button",
        { className: "close_button btn btn-danger", onClick: () => {
            document.querySelectorAll(".welcomeScreen").forEach(screen => {
              screen.style.display = "None";
            });
          } },
        " Close "
      ),
      React.createElement(
        "h1",
        null,
        " Online "
      ),
      React.createElement(
        "div",
        { className: "row ml-0 mr-0" },
        React.createElement(
          "div",
          { className: "col" },
          React.createElement(
            "h3",
            null,
            " Users online "
          ),
          React.createElement(
            "div",
            { className: "align-left" },
            React.createElement(
              "ul",
              null,
              users
            )
          )
        ),
        React.createElement(
          "div",
          { className: "col-auto" },
          React.createElement(
            "h3",
            null,
            " Games available "
          ),
          React.createElement(
            "div",
            { className: "align-left" },
            React.createElement(
              "ul",
              null,
              games
            )
          )
        )
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: e => props.onClick(e) },
        " Create new game "
      )
    )
  );
}

function WelcomePC(props) {
  return React.createElement(
    "div",
    { id: "welcomeScreenPC", className: "welcomeScreen" },
    React.createElement(
      "div",
      { className: "container_div" },
      React.createElement(
        "button",
        { className: "close_button btn btn-danger", onClick: () => {
            document.querySelectorAll(".welcomeScreen").forEach(screen => {
              screen.style.display = "None";
            });
          } },
        " Close "
      ),
      React.createElement(
        "h1",
        null,
        " PC strength "
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "form",
          { onSubmit: e => props.onSubmit(e) },
          React.createElement(
            "label",
            null,
            " Skill level (0-20): "
          ),
          " ",
          React.createElement("br", null),
          React.createElement("input", { id: "elo", type: "number", min: "0", max: "20", value: props.skill_level_pc, onChange: props.onChange }),
          " ",
          React.createElement("br", null),
          React.createElement(
            "button",
            { className: "btn btn-primary mt-3" },
            " Submit "
          )
        )
      )
    )
  );
}

class Board extends React.Component {
  renderSquare(row, column) {
    let square_color;
    if (this.props.mirrored) {
      var row_new = 7 - row;
    } else {
      var row_new = row;
    }
    if ((row_new + column) % 2 === 0) {
      square_color = "white";
    } else {
      square_color = "black";
    }
    return React.createElement(Square, { "class": "square" + column, square_color: square_color, piece: this.props.pieces[row_new][column], onClick: () => this.props.onClick(row, column), key: row * 8 + column });
  }

  renderRow(row) {
    let squares = [];
    for (var col = 0; col < 8; col++) {
      squares.push(this.renderSquare(row, col));
    }
    return squares;
  }

  renderBoard() {
    let rows = [];
    for (var row = 0; row < 8; row++) {
      let element = React.createElement(
        "div",
        { className: "chess_row", key: row },
        this.renderRow(row)
      );
      rows.push(element);
    }
    return rows;
  }

  render() {
    return React.createElement(
      "div",
      { className: "board" },
      this.renderBoard()
    );
  }
}

function Timer(props) {
  let minutes = Math.floor(props.seconds / 60);
  let seconds = props.seconds - minutes * 60;
  if (seconds.toString().length < 2) {
    seconds = "0" + seconds.toString();
  }
  return React.createElement(
    "h3",
    { className: "times" },
    " ",
    minutes + ":" + seconds,
    " "
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "history": [{ "pieces": [[["rook", 0], ["knight", 0], ["bishop", 0], ["queen", 0], ["king", 0], ["bishop", 0], ["knight", 0], ["rook", 0]], [["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0], ["pawn", 0]], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [null, null, null, null, null, null, null, null], [["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1], ["pawn", 1]], [["rook", 1], ["knight", 1], ["bishop", 1], ["queen", 1], ["king", 1], ["bishop", 1], ["knight", 1], ["rook", 1]]]
      }],
      "selected_square": null,
      "last_move": 0,
      "times": [60, 60],
      "step": 0,
      "promotion": false,
      "vs": null,
      "score": 0,
      "skill_level_pc": 20,
      "result": null,
      "san": null,
      "username": "Player2",
      "username2": "Player1",
      "room": null,
      "users_online": [],
      "games_available": [],
      "game_id": null,
      "mirrored": false
    };

    this.handleNewGame = this.handleNewGame.bind(this);
    this.fen_to_history = this.fen_to_history.bind(this);
  }

  fen_to_history(fen) {
    let fen_board = fen.split(" ")[0];
    let list = fen_board.split("/");
    let out = [];
    let r;
    for (r of list) {
      let temp = r.split("");
      out.push(temp);
    }

    let out2 = [];
    for (r of out) {
      let out2_row = [];
      let e;
      for (e of r) {
        if (e >= 0) {
          for (let i = 0; i < e; i++) {
            out2_row.push(null);
          }
        } else if (e === "R") {
          out2_row.push(["rook", 1]);
        } else if (e === "N") {
          out2_row.push(["knight", 1]);
        } else if (e === "B") {
          out2_row.push(["bishop", 1]);
        } else if (e === "K") {
          out2_row.push(["king", 1]);
        } else if (e === "Q") {
          out2_row.push(["queen", 1]);
        } else if (e === "P") {
          out2_row.push(["pawn", 1]);
        } else if (e === "r") {
          out2_row.push(["rook", 0]);
        } else if (e === "n") {
          out2_row.push(["knight", 0]);
        } else if (e === "b") {
          out2_row.push(["bishop", 0]);
        } else if (e === "k") {
          out2_row.push(["king", 0]);
        } else if (e === "q") {
          out2_row.push(["queen", 0]);
        } else if (e === "p") {
          out2_row.push(["pawn", 0]);
        }
      }
      out2.push(out2_row);
    }
    return out2;
  }

  handleClick(row, column) {
    let history = JSON.parse(JSON.stringify(this.state.history)); // Deep clone
    let current = history[this.state.step];
    let pieces = current.pieces;
    let selected_square = this.state.selected_square;

    if (this.state.mirrored) {
      var row = 7 - row;
    }

    if (!selected_square && pieces[row][column] || selected_square && pieces[row][column] && pieces[row][column][1] !== this.state.last_move) {
      this.setState({ "selected_square": [row, column] });
    } else if (selected_square && pieces[row][column] && pieces[row][column][1] === this.state.last_move || selected_square && !pieces[row][column]) {
      // Move or attack piece
      let move = [String.fromCharCode(selected_square[1] + 97) + String(8 - selected_square[0]) + String.fromCharCode(column + 97) + String(8 - row)];
      console.log("move human: " + move);
      let promotion = pieces[selected_square[0]][selected_square[1]][0] === "pawn" && (row === 0 || row === 7);
      if (promotion) {
        this.setState({ "promotion": [row, column] });
      } else {
        this.make_moves(selected_square, row, column, promotion);
      }
    }
  }

  async make_moves(selected_square, row, column, promotion) {
    if (!promotion) {
      var response = await fetch(`${baseURL}validated_move_info/${this.state.game_id}/${selected_square[0]}/${selected_square[1]}/${row}/${column}`);
    } else {
      var response = await fetch(`${baseURL}validated_move_info/${this.state.game_id}/${selected_square[0]}/${selected_square[1]}/${row}/${column}/${promotion}`);
    }
    let data = await response.json();
    let step = this.state.step;

    if (data["validated"] === "true" && this.state.vs !== "human_other") {
      console.log("move validated");
      this.setState(state => ({
        "history": state.history.concat([{ "pieces": this.fen_to_history(data["fen"]) }]),
        "result": data["result"],
        "last_move": data["last_move"],
        "score": data["score"],
        "selected_square": null,
        "san": data["moves_san"],
        "step": state.step + 1,
        "promotion": false
      }));
      this.startTimer();
    }

    if (this.state.vs === "pc") {
      fetch(`${baseURL}get_pc_move/${this.state.game_id}`).then(response => response.json()).then(data => {
        this.setState(state => ({
          "history": state.history.concat([{ "pieces": this.fen_to_history(data["fen"]) }]),
          "result": data["result"],
          "last_move": data["last_move"],
          "score": data["score"],
          "selected_square": null,
          "san": data["moves_san"],
          "step": state.step + 1,
          "promotion": false
        }));
      });
    } else if (this.state.vs === "human_other" && data["validated"] === "true") {
      socket.emit("make move", { "fen": data["fen"], "moves_san": data["moves_san"], "step": step + 1, "last_move": data["last_move"], "score": data["score"], "result": data["result"], "room": this.state.room });
    }
  }

  handleClick1(option) {
    document.querySelector("#welcomeScreen1").style.display = "none";
    if (option === "human") {
      document.querySelector("#welcomeScreen2").style.display = "initial";
    } else if (option === "human_other") {
      document.querySelector("#usersOnline").style.display = "initial";
    } else {
      document.querySelector("#welcomeScreenPC").style.display = "initial";
    }
    this.setState({ "vs": option });
  }

  handleClick2(time) {
    document.querySelector("#welcomeScreen2").style.display = "none";
    this.setState({ "times": [time, time] });
    if (this.state.vs === "human_other") {
      socket.emit("new game", { "username": this.state.username, "time": time });
      document.querySelector("#usersOnline").style.display = "initial";
    }
  }

  handleClick3(e) {
    e.preventDefault();
    fetch(`${baseURL}configure/${this.state.skill_level_pc}`);
    document.querySelector("#welcomeScreenPC").style.display = "none";
    document.querySelector("#welcomeScreen2").style.display = "initial";
  }

  handleClick4(e) {
    e.preventDefault();
    document.querySelector("#humanOther").style.display = "none";
    let d = new Date();
    socket.emit("add user online", { "username": this.state.username, "time": d.toUTCString() });
  }

  handleClick5(e) {
    e.preventDefault();
    document.querySelector("#welcomeScreen2").style.display = "initial";
    document.querySelector("#usersOnline").style.display = "none";
  }

  handleClick6(username, room, time) {
    socket.emit("join game", { "username": this.state.username, "game_id": this.state.game_id, "username2": username, "room": room, "time": time });
    this.setState({ "times": [time, time] });
    console.log("join game " + username + " " + room);
  }

  handleClickPromotion(piece) {
    let row = this.state.promotion[0];
    let column = this.state.promotion[1];
    let selected_square = this.state.selected_square;

    this.make_moves(selected_square, row, column, piece);
  }

  startTimer() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      let seconds = this.state.times[!this.state.last_move ? 1 : 0];
      if (seconds === 0) {
        this.setState(state => ({ "result": state.last_move ? "1-0" : "0-1" }));
        clearInterval(this.interval);
      } else {
        seconds = seconds - 1;
      }
      this.setState({ "times": this.state.last_move === 0 ? [this.state.times[0], seconds] : [seconds, this.state.times[1]] });
    }, 1000);
  }

  handleNewGame(e) {
    document.querySelectorAll(".welcomeScreen").forEach(screen => {
      screen.style.display = "None";
    });
    document.querySelector("#welcomeScreen1").style.display = "Initial";
    clearInterval(this.interval);
    this.setState({ "selected_square": null,
      "last_move": 0,
      "step": 0,
      "history": this.state.history.slice(0, 1),
      "san": null,
      "score": 0,
      "mirrored": false });
    fetch(`${baseURL}new_game`).then(response => response.json()).then(data => {
      this.setState({ "game_id": data["game_id"] });
    });
  }

  componentDidMount() {
    this.setState({ "history": [{ "pieces": this.fen_to_history(board) }], "game_id": game_id }); // Copy board from server

    document.querySelector("#humanOther").style.display = "Initial";

    setInterval(() => {
      let d = new Date();
      socket.emit("user online", { "username": this.state.username, "datetime": d.toUTCString() });
    }, 30000);

    socket.on("announce user", data => {
      this.setState({ "users_online": data["users_online"] });
    });

    socket.on("announce games available", data => {
      this.setState({ "games_available": data["games_available"] });
    });

    socket.on("announce new game", data => {
      this.setState({ "games_available": data["games_available"] });
    });

    socket.on("announce game deleted", data => {
      this.setState({ "games_available": data["games_available"] });
    });

    socket.on("announce game starts", data => {
      console.log("game starts");
      console.log(data);
      document.querySelectorAll(".welcomeScreen").forEach(screen => {
        screen.style.display = "None";
      });
      if (data["username"] === this.state.username) {
        this.setState({ "username": data["username"], "game_id": data["game_id"], "username2": data["username2"], "room": data["room"] }); // Play as white
      } else if (data["username2"] === this.state.username) {
        this.setState({ "username": data["username2"], "game_id": data["game_id"], "username2": data["username"], "room": data["room"], "mirrored": true }); // Play as black
      }
    });

    socket.on("announce move", data => {
      this.setState(state => ({
        "history": state.history.concat([{ "pieces": this.fen_to_history(data["fen"]) }]),
        "result": data["result"],
        "last_move": data["last_move"],
        "score": data["score"],
        "selected_square": null,
        "san": data["moves_san"],
        "step": data["step"],
        "promotion": false
      }));
      this.startTimer();
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100;
  }

  render() {
    return React.createElement(
      "div",
      null,
      React.createElement(StartScreen, { onClick: option => this.handleClick1(option) }),
      React.createElement(WelcomeHuman, { onClick: time => this.handleClick2(time) }),
      React.createElement(WelcomeHumanOther, { onChange: e => this.setState({ "username": e.target.value }), username: this.state.username, onSubmit: e => this.handleClick4(e) }),
      React.createElement(WelcomePC, { onChange: e => this.setState({ "skill_level_pc": e.target.value }), skill_level_pc: this.state.skill_level_pc, onSubmit: e => this.handleClick3(e) }),
      React.createElement(Promotion, { promotion: this.state.promotion, onClick: piece => this.handleClickPromotion(piece) }),
      React.createElement(Message, { title: "Result", text: this.state.result, onClick: () => {
          document.querySelector("#message").style.display = "none";this.setState({ "result": null });
        } }),
      React.createElement(UsersOnline, { usernames: this.state.users_online, games: this.state.games_available, onClick: e => this.handleClick5(e), onClickGame: (username, room, time) => this.handleClick6(username, room, time) }),
      React.createElement(
        "div",
        { className: "container-fluid no-padding" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { className: "container_div" },
              React.createElement(
                "div",
                { id: "board_container" },
                React.createElement(Board, { pieces: this.state.history[this.state.step].pieces, onClick: (row, column) => this.handleClick(row, column), mirrored: this.state.mirrored })
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-auto", id: "col_right" },
            React.createElement(
              "div",
              { id: "timer1_div" },
              React.createElement(
                "h5",
                null,
                " ",
                this.state.username2,
                " "
              ),
              React.createElement(
                "div",
                { id: "timer" },
                React.createElement(Timer, { seconds: this.state.times[0] })
              )
            ),
            React.createElement(
              "div",
              { id: "history" },
              React.createElement(
                "h5",
                null,
                " History "
              ),
              React.createElement(
                "div",
                { id: "list" },
                this.state.san
              )
            ),
            React.createElement(
              "div",
              { id: "evaluation" },
              React.createElement(
                "h5",
                null,
                " Chess engine "
              ),
              React.createElement(
                "div",
                { id: "evaluation_figure" },
                React.createElement(
                  "svg",
                  null,
                  React.createElement("rect", { id: "rect_left", width: String(this.score_to_with(this.state.score)) + "%" }),
                  React.createElement("rect", { id: "rect_right", x: String(this.score_to_with(this.state.score)) + "%", width: String(100 - this.score_to_with(this.state.score)) + "%" }),
                  React.createElement(
                    "text",
                    { id: "text", x: "15", y: "18" },
                    " Centipawns: ",
                    this.state.score,
                    " "
                  )
                )
              )
            ),
            React.createElement(
              "div",
              { id: "buttons" },
              React.createElement(
                "button",
                { id: "button", onClick: this.handleNewGame, className: "btn btn-primary" },
                " New game "
              )
            ),
            React.createElement(
              "div",
              { id: "timer2_div" },
              React.createElement(
                "h5",
                null,
                " ",
                this.state.username,
                " "
              ),
              React.createElement(
                "div",
                { id: "timer2" },
                React.createElement(Timer, { seconds: this.state.times[1] })
              )
            )
          )
        )
      )
    );
  }
}

const domContainer = document.querySelector('#chess_board_container');
ReactDOM.render(React.createElement(Game, null), domContainer);