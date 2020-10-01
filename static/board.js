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