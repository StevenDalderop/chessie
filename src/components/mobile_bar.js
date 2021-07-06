import React from "react"
import Timer from "./timer"

export default function Mobile_bar(props) {
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
