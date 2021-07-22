import React from 'react'

export default function SplitPane(props) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          {props.left}
        </div>
        <div className="col-auto">
          {props.right}
        </div>
      </div>
    </div>
  )
}

