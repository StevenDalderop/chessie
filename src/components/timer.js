import React from "react"

export default function Timer(props) {
  let minutes = Math.floor(props.seconds / 60)
  let seconds = props.seconds - minutes * 60
  if (seconds.toString().length < 2) {
    seconds = "0" + seconds.toString()
  }
  return (
    <h3 id={props.id} className="times"> { minutes + ":" + seconds  } </h3>
  )
}