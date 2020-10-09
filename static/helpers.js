function Container(props) {
  return React.createElement(
    "div",
    { className: "container-fluid no-padding not_mobile" },
    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col" },
        props.col_left
      ),
      React.createElement(
        "div",
        { id: "col_right", className: "col-auto" },
        props.sidebar_right
      )
    )
  );
}

function Container_mobile(props) {
  return React.createElement(
    "div",
    { className: "container-fluid no-padding mobile" },
    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col" },
        React.createElement(
          "div",
          { className: "content_box" },
          props.board
        )
      )
    ),
    props.mobile_bar
  );
}

function Mobile_bar(props) {
  let time_right = !props.mirrored ? 1 : 0;
  let time_left = !props.mirrored ? 0 : 1;

  return React.createElement(
    "div",
    { className: "row" },
    React.createElement(
      "div",
      { className: "col", id: "timer1_div" },
      React.createElement(
        "h5",
        { className: "overflow_hiddden" },
        " ",
        props["username"],
        " "
      ),
      React.createElement(
        "div",
        { id: "timer" },
        React.createElement(Timer, { seconds: props["times"][time_left] })
      )
    ),
    React.createElement(
      "div",
      { className: "col", id: "timer2_div" },
      React.createElement(
        "h5",
        { className: "overflow_hiddden" },
        " ",
        props.username2,
        " "
      ),
      React.createElement(
        "div",
        { id: "timer2" },
        React.createElement(Timer, { seconds: props["times"][time_right] })
      )
    )
  );
}

function Sidebar(props) {
  let time_above = !props.mirrored ? 1 : 0;
  let time_below = !props.mirrored ? 0 : 1;

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      { id: "timer1_div" },
      React.createElement(
        "h5",
        null,
        " ",
        props["username2"],
        " "
      ),
      React.createElement(
        "div",
        { id: "timer" },
        React.createElement(Timer, { id: "time_above", seconds: props["times"][time_above] })
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
        props["san"]
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
        React.createElement(ScoreEvaluationBar, { score: props["score"] })
      )
    ),
    React.createElement(
      "div",
      { id: "buttons" },
      React.createElement(
        "button",
        { id: "button_new_game", name: "new_game", disabled: props.display === "humanOther" ? true : false, onClick: e => props.onClick(e), className: "btn btn-primary" },
        " New game "
      )
    ),
    React.createElement(
      "div",
      { id: "timer2_div" },
      React.createElement(
        "h5",
        { id: "username_below" },
        " ",
        props.username,
        " "
      ),
      React.createElement(
        "div",
        { id: "timer2" },
        React.createElement(Timer, { id: "time_below", seconds: props["times"][time_below] })
      )
    )
  );
}

function BoardContainer(props) {
  return React.createElement(
    "div",
    { className: "container_div" },
    React.createElement(
      "div",
      { id: "board_container" },
      React.createElement(Board, { pieces: props.pieces, selected_square: props.selected_square, onClick: (row, column) => props.onClick(row, column), mirrored: props.mirrored })
    )
  );
}

function Timer(props) {
  let minutes = Math.floor(props.seconds / 60);
  let seconds = props.seconds - minutes * 60;
  if (seconds.toString().length < 2) {
    seconds = "0" + seconds.toString();
  }
  return React.createElement(
    "h3",
    { id: props.id, className: "times" },
    " ",
    minutes + ":" + seconds,
    " "
  );
}

function ScoreEvaluationBar(props) {
  function score_to_with(score) {
    return Math.E ** (score / 250) / (Math.E ** (score / 250) + 1) * 100;
  }
  return React.createElement(
    "svg",
    null,
    React.createElement("rect", { id: "rect_left", width: String(score_to_with(props["score"])) + "%" }),
    React.createElement("rect", { id: "rect_right", x: String(score_to_with(props["score"])) + "%", width: String(100 - score_to_with(props["score"])) + "%" }),
    React.createElement(
      "text",
      { id: "text", x: "15", y: "18" },
      " Centipawns: ",
      props["score"],
      " "
    )
  );
}

function Header(props) {
  return React.createElement(
    "div",
    { className: "container-fluid bg-black-main" },
    React.createElement(
      "h1",
      { id: "title", className: "center" },
      " Chessie "
    ),
    React.createElement(
      "button",
      { id: "button_mobile", className: "btn btn-primary", name: "new_game", disabled: props.display === "humanOther" ? true : false, onClick: e => props.onclick(e) },
      " New game "
    )
  );
}

function fen_to_history(fen) {
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
        out2_row.push(["rook", 0]);
      } else if (e === "N") {
        out2_row.push(["knight", 0]);
      } else if (e === "B") {
        out2_row.push(["bishop", 0]);
      } else if (e === "K") {
        out2_row.push(["king", 0]);
      } else if (e === "Q") {
        out2_row.push(["queen", 0]);
      } else if (e === "P") {
        out2_row.push(["pawn", 0]);
      } else if (e === "r") {
        out2_row.push(["rook", 1]);
      } else if (e === "n") {
        out2_row.push(["knight", 1]);
      } else if (e === "b") {
        out2_row.push(["bishop", 1]);
      } else if (e === "k") {
        out2_row.push(["king", 1]);
      } else if (e === "q") {
        out2_row.push(["queen", 1]);
      } else if (e === "p") {
        out2_row.push(["pawn", 1]);
      }
    }
    out2.push(out2_row);
  }
  return out2;
}