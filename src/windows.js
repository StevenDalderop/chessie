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

function Message(props) {
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

function StartScreen(props) {
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
          <h1> New Game </h1>
          <div className="row mr-0 ml-0">
            <div className="col">
              <div className="time" onClick={() => createInput("human")}>
                <div className="centered_container no_click">
                  <h5> vs Human Offline </h5>
                </div> 
              </div>
            </div>
            <div className="col">
              <div className="time" onClick={() => createInput("human_other")}> 
                <div className="centered_container no_click">
                  <h5> vs Human Online </h5> 
                </div>
              </div>
            </div>
            <div className="col">
              <div className="time" onClick={() => createInput("pc")}>
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

function WelcomeHuman(props) {
  if (!(props["display"] === "welcomeScreen2")) {
    return null
  } else {
  return (
    <div id="welcomeScreen2" className="welcomeScreen">
      <div className="container_div">
      <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onClick(e)}> Close </button>
        <h1> Time </h1>
        <div className="row ml-0 mr-0">
            <div className="col"> 
              <div data-value={60} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 1 minute </h5> 
                </div>
              </div>
            </div>
            <div className="col">
              <div data-value={180} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 3 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col">
              <div data-value={300} name="time" className="time" onClick={(e) => props.onClick(e)}> 
                <div className="centered_container no_click">
                  <h5> 5 minutes </h5> 
                </div> 
              </div>
            </div>
            <div className="col">
              <div data-value={600} name="time" className="time" onClick={(e) => props.onClick(e)}> 
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
      <h1> Username </h1>
      <div>
        <form name="username" onSubmit={(e) => props.onSubmit(e)}>
          <label> What is your username? </label> <br></br>
          <input id="username" name="username" type="text" placeholder="username" value={props.username} onChange={props.onChange} /> <br></br>
          {message}
          <button className="btn btn-primary mt-3"> Submit </button>
        </form>
      </div>
    </div>
  )
}}

function UsersOnline(props) {
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
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) <button name="join_game" value={g["game_id"]} onClick={(e) => props.onClick(e)}> Join game </button> </li>)
    } else {
      games.push(<li key={j}> {g["username"]} ({g["time"]} seconds) </li>)   
    }
    j++
  }

  if (!(props["display"] === "usersOnline")) {
    return null
  } else {
  return (
    <div id="usersOnline" className="welcomeScreen">
      <div className="container_div">
        <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onClick(e)}> Close </button>
        <h1> Online </h1>
        <div className="row">
          <div className="col">
            <h3> Users online </h3>
            <div className="align-left">
              <ul>
                {users}
              </ul>
            </div>
          </div>
          <div className="col"> 
            <h3> Games available </h3>
            <ul id="list">
              {games}
            </ul>
          </div>
        </div>
        <button name="usersOnline" className="btn btn-primary" onClick={(e) => props.onClick(e)}> Create new game </button>
        <button name="refresh" className="btn btn-primary ml-3" onClick={(e) => props.onClick(e)}> Refresh </button>
      </div>
    </div>
  )
}}

function WelcomePC(props) {
  if (!(props["display"] === "welcomeScreenPC")) {
    return null
  } else {
    return (
      <div id="welcomeScreenPC" className="welcomeScreen">
        <div className="container_div">
          <button name="close" className="close_button btn btn-danger" onClick={(e) => props.onSubmit(e)}> Close </button>
          <h1> PC strength </h1>
          <div>
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
