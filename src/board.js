// Piece icons: By en:User:Cburnett - Own work  This W3C-unspecified vector image was created with Inkscape., CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499809

function Square(props) {
  return (
    <button className={"square color-square-" + props.square_color + " " + props.class} onClick={() => props.onClick()}>
      {piece_icon(props.piece)}
    </button>
  )
}

function piece_icon(name) {
  if (name) {
    if (name[1] === 0) {
      var color = "d";
    } else {
      var color = "l";
    }
    return (<img className="piece_icon" src={"/static/Chess_" + name[0] + color + "t45.svg"}></img>)
  } else {
    return null
  }
}

class Board extends React.Component {
  renderSquare(row, column) {
    let square_color;
    if (this.props.mirrored) {
      var row_new = 7 - row
      var col_new = 7 - column
    } else {
      var row_new = row
      var col_new = column
    }
    if ((row_new + col_new) % 2 === 0) {
      square_color = "white"
    } else {
      square_color = "black"
    }
    return (
      <Square class={"square" + column} square_color={square_color} piece={this.props.pieces[row_new][col_new]} onClick={() => this.props.onClick(row_new, col_new)} key={row_new * 8 + col_new} />
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
