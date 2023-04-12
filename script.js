// CREATION ET AFFICHAGE DU LOGIN FORM
function loginPage(){
    const loginPageDiv = document.createElement("div")
    loginPageDiv.classList.add("loginPageDiv")

    const loginForm = document.createElement("form")
    loginForm.classList.add("loginForm")
    loginForm.innerHTML = `
        <label for="loginInput">Login</label>
        <input type="text" name="loginInput" id="loginInput">

        <label for="passwordInput">Password</label>
        <input type="password" name="passwordInput" id="passwordInput">
    `
    const submitBtn = document.createElement("button")
    submitBtn.id = "submitButton"
    submitBtn.innerHTML = "Envoyer"
    submitBtn.onclick = e =>{
        e.preventDefault();
        const loginInputVal = document.getElementById("loginInput").value;
        const passwordInputVal = document.getElementById("passwordInput").value;
        const url = 'https://zone01normandie.org/api/auth/signin';

        const credentials = `${loginInputVal}:${passwordInputVal}`;
        const encodedCredentials = btoa(credentials);

        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/json'
            }
        };

        fetch(url, options)
        .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              loginForm.reset();
              throw new Error('Login ou Mail non valide. Please try again.');
            }
        })
        .then(json=>{
            localStorage.setItem('token', JSON.stringify(json));
            removeLoginPage();
            displayGraph(json);

        })
        .catch(error => {
            alert(error.message);
        });
    }
    loginForm.appendChild(submitBtn)
    loginPageDiv.appendChild(loginForm)
    document.body.appendChild(loginPageDiv)
}

function removeLoginPage(){
    loginPage = document.querySelector(".loginPageDiv");
    document.body.removeChild(loginPage)
}

function displayGraph(JWToken){
    graphQLQuery(JWToken)
}

function graphQLQuery(jwt){
    const endpoint = 'https://zone01normandie.org/api/graphql-engine/v1/graphql';
    const token = jwt;

    const query = `{
      transaction(
        where: {eventId: {_eq: 32}, type: {_eq: "xp"}}
        order_by: {createdAt: asc}
      ) {
        path
        amount
        object {
          name
        }
      }
      user {
        attrs
      }
      skill_Go: transaction_aggregate(where: {type: {_eq: "skill_go"}}) {
        aggregate {
          max {
            amount
          }
        }
      }
      skill_HTML: transaction_aggregate(where: {type: {_eq: "skill_html"}}) {
        aggregate {
          max {
            amount
          }
        }
      }
      skill_CSS: transaction_aggregate(where: {type: {_eq: "skill_css"}}) {
        aggregate {
          max {
            amount
          }
        }
      }
      skill_JS: transaction_aggregate(where: {type: {_eq: "skill_js"}}) {
        aggregate {
          max {
            amount
          }
        }
      }
      skill_SQL: transaction_aggregate(where: {type: {_eq: "skill_sql"}}) {
        aggregate {
          max {
            amount
          }
        }
      }
      current_lvl: transaction_aggregate(
        where: {type: {_eq: "level"}, eventId: {_eq: 32}}
      ) {
        aggregate {
          max {
            amount
          }
        }
      }
      xp_total: transaction_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 32}}) {
        aggregate {
          sum {
            amount
          }
        }
      }
      up_total: transaction_aggregate(where: {type: {_eq: "up"}, eventId: {_eq: 32}}) {
        aggregate {
          sum {
            amount
          }
        }
      }
      down_total: transaction_aggregate(
        where: {type: {_eq: "down"}, eventId: {_eq: 32}}
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }
      `;

    fetch(endpoint, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
    })
    .then(response => response.json())
    .then(datas => displayDatas(datas))
    .catch(error => console.error(error));

}

function displayDatas(datas) {
  
  //RECOVER ALL THE DATAS NEEDED FOR THE PAGE
  var userlvl = datas.data.current_lvl.aggregate.max.amount;
  var userFirstname = datas.data.user[0].attrs.firstName;
  var userLastname = datas.data.user[0].attrs.lastName;
  var userXP = datas.data.xp_total.aggregate.sum.amount;
  var userGoSkill = datas.data.skill_Go.aggregate.max.amount;
  var userHtmlSkill = datas.data.skill_HTML.aggregate.max.amount;
  var userCssSkill = datas.data.skill_CSS.aggregate.max.amount;
  var userJsSkill = datas.data.skill_JS.aggregate.max.amount;
  var userSqlSkill = datas.data.skill_SQL.aggregate.max.amount;
  var userRatioUp = datas.data.up_total.aggregate.sum.amount;
  var userRatioDown = datas.data.down_total.aggregate.sum.amount;

  //EACH PROJECT WITH XP ADDED FOR THE SVG GRAPH
  var userGraph = {}
  var sumXp = 0
  for (let i=0; i < datas.data.transaction.length; i++){
    sumXp += datas.data.transaction[i].amount;
    userGraph[`${datas.data.transaction[i].object.name}`] = sumXp
  } 
  headerDiv(userlvl, userXP, userFirstname, userLastname)
  skillsDiv(userGoSkill, userHtmlSkill, userCssSkill, userJsSkill, userSqlSkill);
  graphDiv(userGraph);
  ratioDiv(userRatioUp, userRatioDown)
}

function headerDiv(userlvl, userXP, userFirstname, userLastname){
    
    const logoutBtn= document.createElement("button")
    logoutBtn.innerHTML="LOGOUT"
    logoutBtn.onclick = ( e =>{
      e.preventDefault();
      localStorage.removeItem('token');
      location.reload();
    })
    var namesDiv = document.createElement("div");
    namesDiv.id = "namesDiv";
    namesDiv.innerHTML = `
    <h1>Welcome ${userFirstname} ${userLastname}</h1>
    `
    namesDiv.appendChild(logoutBtn)
    document.body.appendChild(namesDiv);
    var secondSection = document.createElement("div")
    secondSection.id = "secondSection"
    var xpLvlDiv = document.createElement("div");
    xpLvlDiv.id = "xpLvlDiv";
    xpLvlDiv.innerHTML = `
    <p>Your Level : ${userlvl}</p>
    <p>Total XP : ${userXP}</p>
    `
    secondSection.appendChild(xpLvlDiv)
    document.body.appendChild(secondSection)
}

function skillsDiv(userGo, userHtml, userCss, userJs, userSql){
  var mainDiv = document.createElement("div");
  mainDiv.id = "skillsDiv";
  mainDiv.innerHTML = `
  <div>
    <span>GO :</span>
    <svg width="400" height="20">
      <rect x="0" y="0" width="100%" height="100%" fill="#ccc" stroke="black"/>
      <rect x="0" y="0" width="${userGo}%" height="100%" fill="lightgreen" stroke="black"/>
      <text x="${userGo/2}%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12px">${userGo}%</text>
    </svg>
  </div>
  <div>
    <span>HTML :</span>
    <svg width="400" height="20">
      <rect x="0" y="0" width="100%" height="100%" fill="#ccc" stroke="black"/>
      <rect x="0" y="0" width="${userHtml}%" height="100%" fill="lightgreen" stroke="black"/>
      <text x="${userHtml/2}%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12px">${userHtml}%</text>
    </svg>
  </div>
  <div>
    <span>CSS :</span>
    <svg width="400" height="20">
      <rect x="0" y="0" width="100%" height="100%" fill="#ccc" stroke="black" />
      <rect x="0" y="0" width="${userCss}%" height="100%" fill="lightgreen" stroke="black"/>
      <text x="${userCss/2}%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12px">${userCss}%</text>
    </svg>
  </div>
  <div>
    <span>JS :</span>
    <svg width="400" height="20">
      <rect x="0" y="0" width="100%" height="100%" fill="#ccc" stroke="black"/>
      <rect x="0" y="0" width="${userJs}%" height="100%" fill="lightgreen" stroke="black"/>
      <text x="${userJs/2}%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12px">${userJs}%</text>
    </svg>
  </div>
  <div>
    <span>SQL :</span>
    <svg width="400" height="20">
      <rect x="0" y="0" width="100%" height="100%" fill="#ccc" stroke="black"/>
      <rect x="0" y="0" width="${userSql}%" height="100%" fill="lightgreen" stroke="black"/>
      <text x="${userSql/2}%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="12px">${userSql}%</text>
    </svg>
  </div>
  `
  var secondSection = document.getElementById("secondSection")
  secondSection.appendChild(mainDiv);
}

function graphDiv(datas) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "900");
    svg.setAttribute("height", "600");

    const keys = Object.keys(datas);
    const values = Object.values(datas);
    const max = Math.max(...values);

    // Create x-axis
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", "0");
    xAxis.setAttribute("y1", "360");
    xAxis.setAttribute("x2", "800");
    xAxis.setAttribute("y2", "360");
    xAxis.setAttribute("stroke", "#000");
    svg.appendChild(xAxis);

    // Create y-axis
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", "0");
    yAxis.setAttribute("y1", "20");
    yAxis.setAttribute("x2", "0");
    yAxis.setAttribute("y2", "360");
    yAxis.setAttribute("stroke", "#000");
    svg.appendChild(yAxis);

    // Create x-axis labels
    for (let i = 0; i < keys.length; i++) {
      switch (keys[i]) {
        case "go-reloaded":
        case "ascii-art":
        case "ascii-art-web":
        case "groupie-tracker":
        case "lem-in":
        case "forum":
        case "Piscine JS":
        case "make-your-game":
        case "real-time-forum":
        case "tetris-optimizer":
        case "atm-management-system":
        case "push-swap":
        case "my-ls-1":
        case "net-cat":
        case "math-skills":
        case "guess-it-1":
        case "guess-it-2":
        case "linear-stats":

          const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
          label.setAttribute("x", 20 + i * (800/keys.length));
          label.setAttribute("y", 380);
          label.setAttribute("font-size", "16px");
          label.setAttribute("transform", "rotate(60, " + (20 + i * (800/keys.length)) + ", 380)");
          label.textContent = keys[i];
          label.transform
          svg.appendChild(label);
          break;
      
        default:
          continue;
          
      }
      
    }

    // Create y-axis labels
    for (let i = 0; i <= 5; i++) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", 10);
      label.setAttribute("y", 360 - i * 60);
      label.setAttribute("font-size", "16px");
      label.textContent = (max / 5) * i;
      svg.appendChild(label);
    }

    // Create polyline
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "blue");
    polyline.setAttribute("stroke-width", "2");

    const points = values.map((value, index) => {
      const x = 20 + index * (800/values.length);
      const y = 360 - (value / max) * 300;
      return `${x},${y}`;
    });

    polyline.setAttribute("points", points.join(" "));
    svg.appendChild(polyline);

    var graphDiv = document.createElement("div")
    graphDiv.id = "graphDiv"
    graphDiv.appendChild(svg);
    document.body.appendChild(graphDiv);

}

function ratioDiv(up, down) {
  var ratio = (up / down).toFixed(2)
  var angle = ratio*90
  var mainDiv = document.createElement("div");
  mainDiv.id = "ratioDiv";
  mainDiv.innerHTML = `
  <div>
      <svg width="300" height="200">
          <text x="20" y="150" font-size="24" text-anchor="middle">0</text>
          <text x="150" y="30" font-size="24" text-anchor="middle">1</text>
          <text x="270" y="150" font-size="24" text-anchor="middle">2</text>
          <text x="150" y="180" font-size="20" text-anchor="middle">RATIO: ${ratio}</text>

          <path d="M 150,150 L 50, 150 A 100,100 0 0 1 150, 50 Z" stroke="black" fill="lightpink" stroke-width="2"/>
          <path d="M 150,150 L 250, 150 A 100,100 0 0 0 150, 50 Z" stroke="black" fill="lightgreen" stroke-width="2"/>
          <path d="M 150,160 A 10,10 0 0 0 150,140 L 40, 150 Z" stroke="black" fill="mediumturquoise" stroke-width="2" transform="rotate(${angle}, 150, 150)"/>
      </svg> 
  </div>
  `
  const graphDiv = document.getElementById("graphDiv")
  graphDiv.appendChild(mainDiv)
}



window.onload = () => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
      displayGraph(JSON.parse(storedToken));
  } else {
      loginPage();
  }
};