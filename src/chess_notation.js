export function fen_to_history(fen) {
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

export function uci_to_row_column(uci) {
  let col_start = parseInt(uci[0], 36) - 10
  let col_end = parseInt(uci[2], 36) - 10
  let row_start = 8 - uci[1]
  let row_end = 8 - uci[3]
  return [[row_start, col_start], [row_end, col_end]]
}

export function get_uci(selected_square, row, column, promotion) {
	if (promotion) {
		var promotion_letters = {
			"queen": "q",
			"rook": "r",
			"bishop": "b",
			"knight": "n"
		}		
		promotion_letter = promotion_letters[promotion]		
	} else {
		var promotion_letter = ""
	}
	
	var row_start = parseInt(selected_square[0])
	var col_start = parseInt(selected_square[1])
	
	var alphabet = {
		0: "a",
		1: "b",
		2: "c",
		3: "d",
		4: "e",
		5: "f",
		6: "g",
		7: "h"		
	}
	
	var uci = alphabet[col_start] + (8 - row_start).toString() + alphabet[column] + (8 - parseInt(row)).toString() + promotion_letter	
	
	return uci
}