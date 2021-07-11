import React from 'react'

export default function SplitPane(props) {
	var className = " " + props.className
  return (
    <div className={"container-fluid" + className}>
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

