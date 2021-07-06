import React from 'react'

export default function Container(props) {
  return (
    <div id="content" className="container-fluid no-padding not_mobile">
      <div id="content_row" className="row">
        <div className="col">
          {props.col_left}
        </div>
        <div id="col_right" className="col-auto">
          {props.sidebar_right}
        </div>
      </div>
    </div>
  )
}