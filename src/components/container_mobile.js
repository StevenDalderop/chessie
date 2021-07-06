import React from "react"

export default function Container_mobile(props) {
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