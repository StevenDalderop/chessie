import React, {useState} from "react"
import { useHistory } from "react-router-dom"
import Dialog from "./dialog"
import { Option, OptionMenu } from "./option_menu"
import css from "./windows.css"

function PromotionOption(props) {
	return (
		<button 
			name="promotion" 
			value={props.value} 
			className="btn btn-primary" 
			onClick={(e) => props.onClick(e)}> 
			{props.value}		
		</button>
	)
}

export function Promotion(props) {
    return (
	  <Dialog title="Promotion" type="promotion">
	    <div className="promotion-options-container">
			<PromotionOption value="queen" onClick={(e) => props.onClick(e)} />
			<PromotionOption value="knight" onClick={(e) => props.onClick(e)} />
			<PromotionOption value="bishop" onClick={(e) => props.onClick(e)} />
			<PromotionOption value="rook" onClick={(e) => props.onClick(e)} />
		</div>
      </Dialog>
    )
}

export function Result(props) {
    return (
		<Dialog title="Result">
          <p> {props.result} </p>
          <button className="btn btn-primary" onClick={props.onClick}> Close </button>
	    </Dialog>
    )
}

export function DrawDecision(props) {
    return (
      <Dialog title="Draw offered">
          <p> {props.draw_offered} offered a draw </p>
          <button name="accept_draw" className="btn btn-success" onClick={props.onClickAccept}> Accept </button>
          <button name="decline_draw" className="btn btn-danger ml-3" onClick={props.onClickDecline}> Decline </button>
      </Dialog>
    )	
}

export function DrawOffered(props) {
    return (
      <Dialog title="Draw offered">
          <p> You offered a draw </p>
          <p> Waiting for decision </p>
      </Dialog>
    )	
}


export function Draw_offered(props) {
  if (props.draw_offered && props.draw_offered !== props.username) {
    return (
      <Dialog title="Draw offered">
          <p> {props.draw_offered} offered a draw </p>
          <button name="accept_draw" className="btn btn-success" onClick={props.onClickAccept}> Accept </button>
          <button name="decline_draw" className="btn btn-danger ml-3" onClick={props.onClickDecline}> Decline </button>
      </Dialog>
    )
  } else if (props.draw_offered === props.username) {
    return (
      <Dialog title="Draw offered">
          <p> You offered a draw </p>
          <p> Waiting for decision </p>
      </Dialog>
    )
  } else {
    return null
  }
}

export function BackButton(props) {
	return (
		<button className="btn btn-danger" onClick={() => props.onClick()}> Back </button>
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
		<BackButton onClick={() => props.onClickBack()} />
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


export function Signup(props) {
	return (
		<Dialog title = "Signup">
			<form onSubmit={props.onSubmit}>
				<input type="text" name="name" maxLength="15" placeholder="username" value={props.username} onChange={props.onChange} /> <br></br>
				<input type="password" name="password" placeholder="password" className="mt-1" /> <br></br>
				<button className="btn btn-primary mt-3"> Submit </button>
			</form>
		</Dialog>
	)
}

export function Login(props) {
	return (
		<Dialog title = "Login">
			<form onSubmit={props.onSubmit}>
				<input type="text" name="name" maxLength="15" placeholder="username" value={props.username} onChange={props.onChange} /> <br></br>
				<input type="password" name="password" placeholder="password" className="mt-1" /> <br></br>
				<button className="btn btn-primary mt-3"> Submit </button>
			</form>
			<a href="/reset-password"> Forgot password? </a>
		</Dialog>	
	)
}

export function ResetPassword(props) {
	return (
		<Dialog title = "Reset password">
			<form action="/reset-password" method="post">
				<input type="email" name="email" maxLength="100" placeholder="email" /> <br></br>
				<button className="btn btn-primary mt-3"> Submit </button>
			</form>
		</Dialog>	
	)	
}

export function SetPassword(props) {
	return (
		<Dialog title = "Reset password">
			<form action="" method="post">
				<input type="password" name="password" maxLength="100" placeholder="password" /> <br></br>
				<button className="btn btn-primary mt-3"> Submit </button>
			</form>
		</Dialog>	
	)	
}


export function PcSkillLevelForm(props) {
    return (
	  <Dialog title="PC strength">
		<form name="pcSkillLevel" onSubmit={(e) => props.onSubmit(e)}>
		  <label> Skill level (0-20): </label> <br></br>
		  <input id="elo" className="mb-3" type="number" min="0" max="20" name="pcSkillLevel" value={props.skill_level_pc} onChange={props.onChange} /> <br></br>
		  <BackButton onClick={() => props.onClickBack()} />
		  <button type="submit" className="btn btn-primary ml-3"> Submit </button>		  
		</form>					
	  </Dialog>
	)
}
