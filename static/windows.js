function Promotion(props) {
  if (!props["promotion"]) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "promotion" },
      React.createElement(
        "h1",
        null,
        " Promotion "
      ),
      React.createElement(
        "button",
        { name: "promotion", value: "queen", className: "btn btn-primary mr-1", onClick: e => props.onClick(e) },
        " Queen "
      ),
      React.createElement(
        "button",
        { name: "promotion", value: "knight", className: "btn btn-primary mr-1", onClick: e => props.onClick(e) },
        " Knight "
      ),
      React.createElement(
        "button",
        { name: "promotion", value: "bishop", className: "btn btn-primary mr-1", onClick: e => props.onClick(e) },
        " Bishop "
      ),
      React.createElement(
        "button",
        { name: "promotion", value: "rook", className: "btn btn-primary", onClick: e => props.onClick(e) },
        " Rook "
      )
    );
  }
}

function Message(props) {
  if (!props["text"]) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "message", className: "welcomeScreen" },
      React.createElement(
        "h1",
        null,
        " Result "
      ),
      React.createElement(
        "p",
        null,
        " ",
        props.text,
        " "
      ),
      React.createElement(
        "button",
        { className: "btn btn-primary", onClick: props.onClick },
        " Close "
      )
    );
  }
}

function StartScreen(props) {
  if (!(props["display"] === "welcomeScreen1")) {
    return null;
  } else {
    function createInput(value) {
      document.querySelector("#hidden_input").setAttribute("value", value);
      document.querySelector("#hidden_input").click();
    }
    return React.createElement(
      "div",
      { id: "welcomeScreen1", className: "welcomeScreen" },
      React.createElement(
        "div",
        { className: "container_div" },
        React.createElement(
          "button",
          { name: "close", className: "close_button btn btn-danger", onClick: e => props.onClick(e) },
          " Close "
        ),
        React.createElement(
          "h1",
          null,
          " New Game "
        ),
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { className: "time", onClick: () => createInput("human") },
              " ",
              React.createElement(
                "h3",
                null,
                " vs Human offline "
              ),
              " "
            )
          ),
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { className: "time", onClick: () => createInput("human_other") },
              " ",
              React.createElement(
                "h3",
                null,
                " vs Human Online "
              ),
              " "
            )
          ),
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { className: "time", onClick: () => createInput("pc") },
              " ",
              React.createElement(
                "h3",
                null,
                " vs PC "
              ),
              " "
            )
          ),
          React.createElement(
            "form",
            null,
            React.createElement("input", { id: "hidden_input", name: "vs", type: "hidden", value: "", onClick: e => props.onClick(e) })
          )
        )
      )
    );
  }
}

function WelcomeHuman(props) {
  if (!(props["display"] === "welcomeScreen2")) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "welcomeScreen2", className: "welcomeScreen" },
      React.createElement(
        "div",
        { className: "container_div" },
        React.createElement(
          "button",
          { name: "close", className: "close_button btn btn-danger", onClick: e => props.onClick(e) },
          " Close "
        ),
        React.createElement(
          "h1",
          null,
          " Time "
        ),
        React.createElement(
          "div",
          { className: "row ml-0 mr-0" },
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { "data-value": 60, name: "time", className: "time", onClick: e => props.onClick(e) },
              " ",
              React.createElement(
                "h5",
                null,
                " 1 minute "
              ),
              " "
            )
          ),
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { "data-value": 180, name: "time", className: "time", onClick: e => props.onClick(e) },
              " ",
              React.createElement(
                "h5",
                null,
                " 3 minutes "
              ),
              " "
            )
          ),
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { "data-value": 300, name: "time", className: "time", onClick: e => props.onClick(e) },
              " ",
              React.createElement(
                "h5",
                null,
                " 5 minutes "
              ),
              " "
            )
          ),
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "div",
              { "data-value": 600, name: "time", className: "time", onClick: e => props.onClick(e) },
              " ",
              React.createElement(
                "h5",
                null,
                " 10 minutes "
              ),
              " "
            )
          )
        )
      )
    );
  }
}

function WelcomeHumanOther(props) {
  if (!(props["display"] === "humanOther")) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "humanOther", className: "welcomeScreen" },
      React.createElement(
        "h1",
        null,
        " Username "
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "form",
          { name: "humanOther", onSubmit: e => props.onSubmit(e) },
          React.createElement(
            "label",
            null,
            " What is your username? "
          ),
          " ",
          React.createElement("br", null),
          React.createElement("input", { id: "username", type: "text", placeholder: "username", value: props.username, onChange: props.onChange }),
          " ",
          React.createElement("br", null),
          React.createElement(
            "button",
            { className: "btn btn-primary mt-3" },
            " Submit "
          )
        )
      )
    );
  }
}

function UsersOnline(props) {
  let users = [];
  let i = 0;
  let u;
  for (u of props["usernames"]) {
    users.push(React.createElement(
      "li",
      { key: i },
      " ",
      u["username"],
      " "
    ));
    i++;
  }
  let games = [];
  let j = 0;
  let g;
  for (g of props["games"]) {
    games.push(React.createElement(
      "li",
      { key: j },
      " ",
      g["username"],
      " (",
      g["time"],
      " seconds) ",
      React.createElement(
        "button",
        { className: "link", name: "join_game", value: g["game_id"], onClick: e => props.onClick(e) },
        " Join game "
      ),
      " "
    ));
    j++;
  }

  if (!(props["display"] === "usersOnline")) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "usersOnline", className: "welcomeScreen" },
      React.createElement(
        "div",
        { className: "container_div" },
        React.createElement(
          "button",
          { name: "close", className: "close_button btn btn-danger", onClick: e => props.onClick(e) },
          " Close "
        ),
        React.createElement(
          "h1",
          null,
          " Online "
        ),
        React.createElement(
          "div",
          { className: "row ml-0 mr-0" },
          React.createElement(
            "div",
            { className: "col" },
            React.createElement(
              "h3",
              null,
              " Users online "
            ),
            React.createElement(
              "div",
              { className: "align-left" },
              React.createElement(
                "ul",
                null,
                users
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-auto" },
            React.createElement(
              "h3",
              null,
              " Games available "
            ),
            React.createElement(
              "div",
              { className: "align-left" },
              React.createElement(
                "ul",
                null,
                games
              )
            )
          )
        ),
        React.createElement(
          "button",
          { name: "usersOnline", className: "btn btn-primary", onClick: e => props.onClick(e) },
          " Create new game "
        )
      )
    );
  }
}

function WelcomePC(props) {
  if (!(props["display"] === "welcomeScreenPC")) {
    return null;
  } else {
    return React.createElement(
      "div",
      { id: "welcomeScreenPC", className: "welcomeScreen" },
      React.createElement(
        "div",
        { className: "container_div" },
        React.createElement(
          "button",
          { name: "close", className: "close_button btn btn-danger", onClick: e => props.onClick(e) },
          " Close "
        ),
        React.createElement(
          "h1",
          null,
          " PC strength "
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "form",
            { name: "pc_strength", onSubmit: e => props.onSubmit(e) },
            React.createElement(
              "label",
              null,
              " Skill level (0-20): "
            ),
            " ",
            React.createElement("br", null),
            React.createElement("input", { id: "elo", type: "number", min: "0", max: "20", value: props.skill_level_pc, onChange: props.onChange }),
            " ",
            React.createElement("br", null),
            React.createElement(
              "button",
              { className: "btn btn-primary mt-3" },
              " Submit "
            )
          )
        )
      )
    );
  }
}