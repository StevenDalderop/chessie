function Promotion(props) {
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

function Result(props) {
  if (!props["text"]) {
    return null
  } else {
    return (
      <div id="message" className="welcomeScreen">
        <h1> Result </h1>
        <p> {props.text} </p>
        <button className="btn btn-primary" onClick={props.onClick}> Close </button>
      </div>
    )
  }
}

function Choose_game(props) {
  if (!(props["display"] === "welcomeScreen1")) {
    return null
  } else {
    function createInput(value) {
      document.querySelector("#hidden_input").setAttribute("value", value)
      document.querySelector("#hidden_input").click()
    }
  return (
      <div id="welcomeScreen1" className="welcomeScreen">
        <div className="container_div">
          <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onClick(e)}> Close </button>
          <h2> New Game </h2>
          <div className="row mr-0 ml-0 mt-3">
            <div className="col no_padding_mobile">
              <div id="vs_human" className="time" onClick={() => createInput("human")}>
                <div className="centered_container no_click">
                  <h5> vs Human Offline </h5>
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="online" className="time" onClick={() => createInput("human_other")}> 
                <div className="centered_container no_click">
                  <h5> vs Human Online </h5> 
                </div>
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="vs_pc" className="time" onClick={() => createInput("pc")}>
                <div className="centered_container no_click"> 
                  <h5> vs PC </h5>
                </div> 
              </div>
            </div>
            <form>
              <input id="hidden_input" name="vs" type="hidden" value="" onClick={(e) => props.onClick(e)}></input>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

function Choose_time(props) {
  if (!(props["display"] === "welcomeScreen2")) {
    return null
  } else {
  return (
    <div id="welcomeScreen2" className="welcomeScreen">
      <div className="container_div">
      <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onClick(e)}> Close </button>
        <h2> Time </h2>
        <div className="row ml-0 mr-0 mt-3">
            <div className="col no_padding_mobile"> 
              <div id="time_60" data-value={60} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 1 minute </h5> 
                </div>
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_180" data-value={180} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 3 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_300" data-value={300} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 5 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col no_padding_mobile">
              <div id="time_600" data-value={600} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 10 minutes </h5> 
                </div> 
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}}

function GetUsername(props) {
  if (!(props["display"] === "humanOther")) {
    return null
  } else {
    if (props["message"]){
      message = (<p> Username already exists </p>) 
    } else {
      message = null
    }
  return (
    <div id="humanOther" className="welcomeScreen">
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
}}

function Online_game(props) {
  let users = []
  let i = 0
  let u
  for (u of props["usernames"]) {
    users.push(<li key={i}> {u["username"]} </li>)
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
        <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onClick(e)}> Close </button>
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
        <button name="usersOnline" className="btn btn-primary" onClick={(e) => props.onClick(e)}> Create new game </button>
        <button name="refresh" className="btn btn-primary ml-3" onClick={(e) => props.onClick(e)}> Refresh </button>
      </div>
    </div>
  )
}}

function VS_PC(props) {
  if (!(props["display"] === "welcomeScreenPC")) {
    return null
  } else {
    return (
      <div id="welcomeScreenPC" className="welcomeScreen">
        <div className="container_div">
          <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onSubmit(e)}> Close </button>
          <h2> PC strength </h2>
          <div className="mt-3">
            <form name="pc_strength" onSubmit={(e) => props.onSubmit(e)}>
              <label> Skill level (0-20): </label> <br></br>
              <input id="elo" type="number" min="0" max="20" value={props.skill_level_pc} onChange={props.onChange} /> <br></br>
              <button className="btn btn-primary mt-3"> Submit </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}
