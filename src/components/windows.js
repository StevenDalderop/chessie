import React, {useState} from "react"
import { useHistory } from "react-router-dom"
import Dialog from "./dialog"
import { Option, OptionMenu } from "./option_menu"

export function Promotion(props) {
  if (!props["promotion"]) {
    return null
  } else {
    return (
      <div id="promotion">
        <h1> Promotion </h1>
        <button name="promotion" value="queen" className="btn btn-primary mr-1" onClick={(e) => props.onClick(e)}> Queen </button>
        <button name="promotion" value="knight" className="btn btn-primary mr-1" onClick={(e) => props.onClick(e)}> Knight </button>
        <button name="promotion" value="bishop" className="btn btn-primary mr-1" onClick={(e) => props.onClick(e)}> Bishop </button>
        <button name="promotion" value="rook" className="btn btn-primary" onClick={(e) => props.onClick(e)}> Rook </button>
      </div>
    )
  }
}

export function Result(props) {
  if (props.result) {
    return (
      <div className="welcomeScreen">
        <h1> Result </h1>
        <p> {props.result} </p>
        <button className="btn btn-primary" onClick={props.onClick}> Close </button>
      </div>
    )
  } else {
    return null
  }
}

export function Draw_offered(props) {
  if (props.draw_offered && props.draw_offered !== props.username) {
    return (
      <div id="draw_offered" className="welcomeScreen">
        <div className="container_div">
          <h1> Draw offered </h1>
          <p> {props.draw_offered} offered a draw </p>
          <button name="accept_draw" className="btn btn-success" onClick={props.onClickAccept}> Accept </button>
          <button name="decline_draw" className="btn btn-danger ml-3" onClick={props.onClickDecline}> Decline </button>
        </div>
      </div>
    )
  } else if (props.draw_offered === props.username) {
    return (
      <div id="draw_offered" className="welcomeScreen">
        <div className="container_div">
          <h1> Draw offered </h1>
          <p> You offered a draw </p>
          <p> Waiting for decision </p>
        </div>
      </div>
    )
  } else {
    return null
  }
}

export function ChooseGame(props) {
  return (
	  <Dialog title="New game">
		<OptionMenu>
			<Option text="vs Human Offline" onClick={() => props.onClick("human")} />
			<Option text="vs Human Online" onClick={() => props.onClick("online")} />
			<Option text="vs PC" onClick={() => props.onClick("pc")} />
        </OptionMenu>
	  </Dialog>
    )
}


export function ChooseTime(props) { 
  return (
	<Dialog title="Time">
		<OptionMenu>
			<Option text="1 minute" onClick={() => props.onClick(60)} />
			<Option text="3 minutes" onClick={() => props.onClick(180)} />
			<Option text="5 minutes" onClick={() => props.onClick(300)} />
			<Option text="10 minutes" onClick={() => props.onClick(600)} />
		</OptionMenu>
	</Dialog>
  )
}

function MessageBanner(props) {
	if (!props.message) {
		return null
	}
	return (
		<p> Username already exists </p>
	)
}

export function GetUsername(props) {
  return (
    <div id="humanOther" className="welcomeScreen display_not_mobile">
      <h2> Username </h2>
      <div>
        <form name="username" onSubmit={(e) => props.onSubmit(e)}>
          <label> What is your username? </label> <br></br>
          <input id="username" name="username" type="text" maxLength="15" placeholder="username" value={props.username} onChange={props.onChange} /> <br></br>
          <MessageBanner message={props.message} />
          <button id="submit_username_button" className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}

export function GetUsernameMobile(props) {
  return (
    <div id="humanOtherMobile" className="welcomeScreen display_mobile">
      <h2> Username </h2>
      <div>
        <form name="username" onSubmit={(e) => props.onSubmit(e)}>
          <label> What is your username? </label> <br></br>
          <input id="username" name="username" type="text" maxLength="15" placeholder="username" onClick={() => {document.querySelector("#humanOtherMobile").style.top = "0px"; document.querySelector("#humanOtherMobile").style.bottom = "0px"}} value={props.username} onChange={props.onChange} /> <br></br>
          <MessageBanner message={props.message} />
          <button id="submit_username_button" className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}


export function PcSkillLevelForm(props) {
    return (
	  <Dialog title="PC strength">
		<form name="pcSkillLevel" onSubmit={() => props.onSubmit()}>
		  <label> Skill level (0-20): </label> <br></br>
		  <input id="elo" type="number" min="0" max="20" name="pcSkillLevel" value={props.skill_level_pc} onChange={props.onChange} /> <br></br>
		  <button className="btn btn-primary mt-3"> Submit </button>
		</form>	  
	  </Dialog>
	)
}
