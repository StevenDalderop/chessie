import React from "react"
import { useHistory } from "react-router-dom"

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
      <div id="message" className="welcomeScreen">
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
      <div id="welcomeScreen1" className="welcomeScreen">
        <div className="container_div">
          <h2 id="title_new_game"> New Game </h2>
          <div className="row mr-0 ml-0 mt-3">
            <div className="col no_padding_mobile">
              <div id="vs_human" className="time" onClick={() => props.onClick("human")}>
                <div className="centered_container no_click">
                  <h5> vs Human Offline </h5>
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="online" className="time" onClick={() => props.onClick("online")}> 
                <div className="centered_container no_click">
                  <h5> vs Human Online </h5> 
                </div>
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="vs_pc" className="time" onClick={() => props.onClick("pc")}>
                <div className="centered_container no_click"> 
                  <h5> vs PC </h5>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}


export function ChooseTime(props) { 
  return (
    <div id="welcomeScreen2" className="welcomeScreen">
      <div className="container_div">
      <button name="close" className="close_button btn btn-danger" onClick={() => props.onClose()}> Close </button>
        <h2> Time </h2>
        <div className="row ml-0 mr-0 mt-3">
            <div className="col no_padding_mobile"> 
              <div id="time_60" data-value={60} name="time" className="time" onClick={() => props.onClick(60)}> 
                <div className="centered_container no_click">
                  <h5> 1 minute </h5> 
                </div>
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_180" data-value={180} name="time" className="time" onClick={() => props.onClick(180)}> 
                <div className="centered_container no_click">
                  <h5> 3 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_300" data-value={300} name="time" className="time" onClick={() => props.onClick(300)}> 
                <div className="centered_container no_click">
                  <h5> 5 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_600" data-value={600} name="time" className="time" onClick={() => props.onClick(600)}> 
                <div className="centered_container no_click">
                  <h5> 10 minutes </h5> 
                </div> 
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export function GetUsername(props) {

	if (props["message"]){
	  var message = (<p> Username already exists </p>) 
	} else {
	  var message = null
	}
  return (
    <div id="humanOther" className="welcomeScreen display_not_mobile">
      <h2> Username </h2>
      <div>
        <form name="username" onSubmit={(e) => props.onSubmit(e)}>
          <label> What is your username? </label> <br></br>
          <input id="username" name="username" type="text" maxLength="15" placeholder="username" value={props.username} onChange={props.onChange} /> <br></br>
          {message}
          <button id="submit_username_button" className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}

export function GetUsernameMobile(props) {
    if (props["message"]){
      var message = (<p> Username already exists </p>) 
    } else {
      var message = null
    }
  return (
    <div id="humanOtherMobile" className="welcomeScreen display_mobile">
      <h2> Username </h2>
      <div>
        <form name="username" onSubmit={(e) => props.onSubmit(e)}>
          <label> What is your username? </label> <br></br>
          <input id="username" name="username" type="text" maxLength="15" placeholder="username" onClick={() => {document.querySelector("#humanOtherMobile").style.top = "0px"; document.querySelector("#humanOtherMobile").style.bottom = "0px"}} value={props.username} onChange={props.onChange} /> <br></br>
          {message}
          <button id="submit_username_button" className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}

export function Online_game(props) {
  let users = []
  let i = 0
  let u
  for (u of props["usernames"]) {
    users.push(<li key={i}> {u} </li>)
    i++
  }

  let games = []
  let j = 0
  let g
  for (g of props["games"]) {
    if (props["username"] !== g["username"]) {
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) <a className="color_blue" name="join_game" value={g["game_id"]} onClick={() => click(g["game_id"])}> Join game </a> </li>)
    } else {
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) </li>)   
    }
    j++
  }

  function click(value) {
    document.getElementById("hidden_input").value = value;
    document.getElementById("hidden_input").click()
  }

  let title = window.innerWidth < 768 ? "Games" : "Online"

  if (!(props["display"] === "usersOnline")) {
    return null
  } else {
  return (
    <div id="usersOnline" className="welcomeScreen">
      <div className="container_div">
        <button name="close" className="close_button btn btn-danger" onClick={() => props.onClose()}> Close </button>
        <h2> {title} </h2>
        <div className="row_container mt-3">
          <div className="col_left">
            <div className="relative">
              <h5> Users online </h5>
              <div id="users_online_div" className="align-left scrollable_y">
                <ul>
                  {users}
                </ul>
                <input id="hidden_input" type="hidden" name="join_game" onClick={(e) => props.onClick(e)}></input>
              </div>
            </div>
          </div>
          <div className="col_right">
            <div className="relative"> 
              <h5 id="users_online_subtitle"> Games available </h5>
              <div id="games_available_div" className="align-left scrollable_y">
                <ul>
                  {games}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <button name="newGame" className="btn btn-primary" onClick={(e) => props.onClick(e)}> Create new game </button>
      </div>
    </div>
  )
}}

export function PcSkillLevelForm(props) {
    return (
      <div id="welcomeScreenPC" className="welcomeScreen">
        <div className="container_div">
          <h2> PC strength </h2>
          <div className="mt-3">
            <form name="pcSkillLevel" onSubmit={() => props.onSubmit()}>
              <label> Skill level (0-20): </label> <br></br>
              <input id="elo" type="number" min="0" max="20" name="pcSkillLevel" value={props.skill_level_pc} onChange={props.onChange} /> <br></br>
              <button className="btn btn-primary mt-3"> Submit </button>
            </form>
          </div>
        </div>
      </div>
    )
}
