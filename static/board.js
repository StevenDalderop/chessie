// Piece icons: By en:User:Cburnett - Own work  This W3C-unspecified vector image was created with Inkscape., CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499809

function Square(props) {
  return React.createElement(
    "div",
    { id: props.id, className: "square color-square-" + props.square_color, onClick: () => props.onClick() },
    React.createElement(
      "div",
      { className: "row_number" },
      props.row
    ),
    React.createElement(
      "div",
      { className: "col_letter" },
      props.col
    ),
    React.createElement(
      "div",
      { className: "centered_container" },
      piece_icon(props.piece)
    )
  );
}

function piece_icon(name) {
  if (name) {
    if (name[1] === 0) {
      var color = "l";
    } else {
      var color = "d";
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
      var col_new = 7 - column;
    } else {
      var row_new = row;
      var col_new = column;
    }
    let row_number = column === 0 ? 8 - row_new : null;
    let col_letter = row === 7 ? String.fromCharCode(col_new + 1 + 64) : null;

    let id = String.fromCharCode(col_new + 1 + 64) + String(8 - row_new);

    if ((row_new + col_new) % 2 === 0) {
      square_color = "white";
    } else {
      square_color = "black";
    }

    if (this.props.selected_square && this.props.selected_square[0] === row_new && this.props.selected_square[1] === col_new) {
      square_color = "yellow";
    }

    if (this.props.moved_squares && this.props.moved_squares[1][0] === row_new && this.props.moved_squares[1][1] === col_new) {
      square_color = "gray";
    }

    return React.createElement(Square, { id: id, row: row_number, col: col_letter, square_color: square_color, piece: this.props.pieces[row_new][col_new], onClick: () => this.props.onClick(row_new, col_new), key: row_new * 8 + col_new });
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