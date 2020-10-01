const baseURL = window.location.href;

var socket = io();

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
      "mirrored": false,
      "display": "humanOther",
      "game_state": null
    };
  }

  handleClickBoard(row, column) {
    if (this.state.game_state !== "started") {
      return;
    }

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
        this.setState({ "promotion": [row, column], "display": "promotion" });
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
        "history": state.history.concat([{ "pieces": fen_to_history(data["fen"]) }]),
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
          "history": state.history.concat([{ "pieces": fen_to_history(data["fen"]) }]),
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

  handleClick(e) {
    e.preventDefault();
    if (e.target.name === "humanOther") {
      this.setState({ "display": null });
      let d = new Date();
      socket.emit("add user online", { "username": this.state.username, "time": d.toUTCString() });
    } else if (e.target.name === "usersOnline") {
      this.setState({ "display": "welcomeScreen2" });
    } else if (e.target.name === "pc_strength") {
      fetch(`${baseURL}configure/${this.state.skill_level_pc}`);
      this.setState({ "display": "welcomeScreen2" });
    } else if (e.target.getAttribute('name') === "time") {
      let time = e.target.getAttribute('data-value');
      this.setState({ "display": null });
      this.setState({ "times": [time, time] });
      if (this.state.vs === "human_other") {
        socket.emit("new game", { "game_id": this.state.game_id, "username": this.state.username, "time": time });
        this.setState({ "display": "usersOnline" });
      } else {
        this.setState({ "game_state": "started" });
      }
    } else if (e.target.name === "vs") {
      if (e.target.value === "human") {
        this.setState({ "display": "welcomeScreen2" });
      } else if (e.target.value == "human_other") {
        this.setState({ "display": "usersOnline" });
      } else if (e.target.value === "pc") {
        this.setState({ "display": "welcomeScreenPC" });
      }
      this.setState({ "vs": e.target.value });
    } else if (e.target.name === "new_game") {
      clearInterval(this.interval);
      this.setState({ "selected_square": null,
        "last_move": 0,
        "step": 0,
        "history": this.state.history.slice(0, 1),
        "san": null,
        "score": 0,
        "mirrored": false,
        "display": "welcomeScreen1",
        "game_state": null });
      fetch(`${baseURL}new_game`).then(response => response.json()).then(data => {
        this.setState({ "game_id": data["game_id"] });
      });
    } else if (e.target.name === "promotion") {
      let row = this.state.promotion[0];
      let column = this.state.promotion[1];
      let selected_square = this.state.selected_square;
      let piece = e.target.value;
      this.make_moves(selected_square, row, column, piece);
    } else if (e.target.name === "close") {
      this.setState({ "display": null });
    } else if (e.target.name === "join_game") {
      game_id = e.target.value;
      socket.emit("join game", { "username": this.state.username, "game_id": game_id });
      console.log("join game " + this.state.username + " " + game_id);
    } else if (e.target.name === "refresh") {
      socket.emit("refresh");
    }
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

  componentDidMount() {
    this.setState({ "history": [{ "pieces": fen_to_history(board) }], "game_id": game_id }); // Copy board from server

    this.intervalOnline = setInterval(() => {
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
        this.setState({ "username": data["username"], "game_id": data["game_id"], "username2": data["username2"], "room": data["room"], "game_state": "started" }); // Play as white
      } else if (data["username2"] === this.state.username) {
        this.setState({ "username": data["username2"], "game_id": data["game_id"], "username2": data["username"], "room": data["room"], "mirrored": true, "game_state": "started" }); // Play as black
      }
    });

    socket.on("announce move", data => {
      this.setState(state => ({
        "history": state.history.concat([{ "pieces": fen_to_history(data["fen"]) }]),
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
    clearInterval(this.intervalOnline);
  }

  render() {
    return React.createElement(
      "div",
      null,
      React.createElement(StartScreen, { display: this.state.display, onClick: e => this.handleClick(e) }),
      React.createElement(WelcomeHuman, { display: this.state.display, onClick: e => this.handleClick(e) }),
      React.createElement(WelcomeHumanOther, { display: this.state.display, onChange: e => this.setState({ "username": e.target.value }), username: this.state.username, onSubmit: e => this.handleClick(e) }),
      React.createElement(WelcomePC, { display: this.state.display, onChange: e => this.setState({ "skill_level_pc": e.target.value }), skill_level_pc: this.state.skill_level_pc, onSubmit: e => this.handleClick(e) }),
      React.createElement(Promotion, { promotion: this.state.promotion, onClick: e => this.handleClick(e) }),
      React.createElement(Message, { text: this.state.result, onClick: () => {
          this.setState({ "result": null });
        } }),
      React.createElement(UsersOnline, { display: this.state.display, usernames: this.state.users_online, games: this.state.games_available, onClick: e => this.handleClick(e) }),
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
                React.createElement(Board, { pieces: this.state.history[this.state.step].pieces, onClick: (row, column) => this.handleClickBoard(row, column), mirrored: this.state.mirrored })
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
                React.createElement(ScoreEvaluationBar, { score: this.state.score })
              )
            ),
            React.createElement(
              "div",
              { id: "buttons" },
              React.createElement(
                "button",
                { id: "button", name: "new_game", onClick: e => this.handleClick(e), className: "btn btn-primary" },
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