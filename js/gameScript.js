const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 1200;
let currentScenery="lobby";

c.fillStyle = "black";
c.fillRect(0, 0, canvas.width, canvas.height);

let gravity = .13;
const resistance = .15;
let platFormList = [];
let gameModes = ["Easy", "Normal", "Hard"];
//0=easy, 1=normal, 2=hard
let currentGM = 0;

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  e: {
    pressed: false
  }
}

//--------------------------------------------GAME FUNCTIONS-----------------------------------------------//

function calcRandomPlatform(start, limit, offsetY, interval) {
  function randomIntGen(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  for (let i = start; i >= limit; i -= interval) {
    const width = randomIntGen(80, 150);
    const r = randomIntGen(-1 * offsetY, offsetY);
    const posY = i + r;
    const posX = randomIntGen(0, canvas.width - width - 1);
    const coinSpawnRate = Math.floor(Math.random()*3);
    const platform = new Platform(
      {
        x: posX,
        y: posY
      }, {
        x: 0,
        y: 0
      },
      width,
      10,
    );
    if(coinSpawnRate===1){
      platform.hasEntity=true;
      platform.entity=new Coin(
        {
          x: platform.position.x+((platform.width/2)),
          y: platform.position.y
        },30,30
      );
    }
    platFormList.push(platform);
  }
}
function generatePlatforms(gamemode) {
  let limit;
  let offsetY;
  let interval;
  switch (gamemode) {
    case "Easy":
      limit = -10000;
      offsetY = 40;
      interval = 125;
      break;
    case "Normal":
      limit= -10000;
      offsetY = 50;
      interval = 150;
      break;
    case "Hard":
      limit = -15000;
      offsetY = 60;
      interval = 250;
      break;
    default:
      limit = -10000;
      offsetY = 40;
      interval = 125;
      break;
  }
  calcRandomPlatform(700, -1000, offsetY, interval);
}

generatePlatforms(gameModes[currentGM]);

//update life img's

function updateLifes(lifes){
  let outPut = "life" + lifes;
  $('#' + outPut).attr("src", "img/heart-empty.png");
}

//--------------------------------------------OBJECT INITS-----------------------------------------------//

let blackSmithDoor = new Door(
  {
    x: canvas.width / 2 - 300,
    y: 900
  },
  50,
  100,
  "blue"
);
let armoryDoor = new Door(
  {
    x: canvas.width / 2 - 300,
    y: 900
  },
  50,
  100,
  "pink"
);
let miscDoor = new Door(
  {
    x: canvas.width / 2 - 300,
    y: 900
  },
  50,
  100,
  "lime"
);

let startPlatform = new MegaPlatform(
  {
    x: (canvas.width / 2) - 300,
    y: 1000
  }, {
    x: 0,
    y: 0
  }, 600,
  30,
  blackSmithDoor,
  armoryDoor,
  miscDoor,
  50,
  275,
  500,
);
platFormList.push(startPlatform);

//instance of player class //PLAYER ENTITY

let player1 = new Player(
  {
    x: (canvas.width / 2),
    y: startPlatform.position.y - 75
  },
  {
    x: 0,
    y: 0
  },
  "right",
  20,
  75,
  90
);

//instance of punchingbag class //PUNCHINGBAG ENTITY

let punchingBag = new PunchingBag(60, 300, {x: 0, y: 0});

//--------------------------------------------RESET FUNCTIONS-----------------------------------------------//

//reset Lobby

function resetLobbyGame() {

  platFormList=[];

  blackSmithDoor = new Door(
    {
      x: canvas.width / 2 - 300,
      y: 900
    },
    50,
    100,
    "blue"
  );
  armoryDoor = new Door(
    {
      x: canvas.width / 2 - 300,
      y: 900
    },
    50,
    100,
    "pink"
  );
  miscDoor = new Door(
    {
      x: canvas.width / 2 - 300,
      y: 900
    },
    50,
    100,
    "lime"
  );

  startPlatform = new MegaPlatform(
    {
      x: (canvas.width / 2) - 300,
      y: 1000
    }, {
      x: 0,
      y: 0
    }, 600,
    30,
    blackSmithDoor,
    armoryDoor,
    miscDoor,
    50,
    275,
    500,
  );
  platFormList.push(startPlatform);

  generatePlatforms(gameModes[currentGM]);

  //player position reset (dont wanna create new instance as it'll remove other stats)

  player1.position.x = (canvas.width / 2);
  player1.position.y = startPlatform.position.y - 75;

//instance of punchingbag class //PUNCHINGBAG ENTITY

  punchingBag = new PunchingBag(60, 300, {x: 0, y: 0});
}

//reset armory

function resetArmory() {
  currentScenery="armory";
  platFormList=[];

  const testPlatform = new Platform(
    {
      x: (canvas.width / 2) - 300,
      y: 1000
    }, {
      x: 0,
      y: 0
    }, 600,
    30
  );

  platFormList.push(testPlatform);
  player1.position.x = (canvas.width / 2);
  player1.position.y = testPlatform.position.y - 75;

}

//--------------------------------------------ANIMATOR-----------------------------------------------//

function animate() {

  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  //elements to update between each frame

      //platforms//
  platFormList.forEach((platform) =>{
    platform.update();
  });
  //     //punchingbag//
  // punchingBag.update();
      //player//
  player1.update();

  //win round detection
  if(currentScenery==="lobby"){
    if(player1.position.y+player1.height <= platFormList[platFormList.length-2].position.y){
      resetLobbyGame();
    }
  }
  if(player1.position.y + player1.height + player1.velocity.y >= canvas.height && currentScenery==="lobby"){
    player1.lifes-=1;
    updateLifes(player1.lifes);
    resetLobbyGame();
    //player is dead
  }


  //check for platform detection

  platFormList.forEach((platform) =>{
    if(player1.position.y + player1.height <= platform.position.y &&
      player1.position.y + player1.height + player1.velocity.y >= platform.position.y &&
      player1.position.x + player1.width + player1.velocity.x >= platform.position.x &&
      player1.position.x + player1.velocity.x <= platform.position.x+platform.width){
      player1.velocity.y=0;
      //player is onPlatform
    }

    //check for coin collision

    if(platform.hasEntity && platform.entity?.toString()==="coin"){
      if(player1.position.y <= platform.entity.position.y + platform.entity.height &&
        player1.position.y + player1.height + player1.velocity.y >= platform.entity.position.y &&
        player1.position.x + player1.width + player1.velocity.x >= platform.entity.position.x &&
        player1.position.x + player1.velocity.x <= platform.entity.position.x+platform.entity.width){
        platform.entity=null;
        platform.hasEntity=false;
        platform.update();
        player1.coins++;
        $('#balanceValue').html(player1.coins);
      }
    }
  });

  //enhanced movement
  if (keys.a.pressed && player1.lastKeyPressed === "a") {
    player1.velocity.x = -player1.speed;
  } else if (keys.d.pressed && player1.lastKeyPressed === "d") {
    player1.velocity.x = player1.speed;
  }else if (keys.w.pressed && player1.lastKeyPressed === "w" && player1.velocity.y===0 && player1.midBorderMovement === true){
    player1.velocity.y=player1.jumpForce;
  }

  //collision detection for interactions (e)

  if(player1.position.y + player1.height >= startPlatform.entity1.position.y &&
    player1.position.y <= startPlatform.entity1.position.y + startPlatform.entity1.height &&
    player1.position.x + player1.width >= startPlatform.entity1.position.x &&
    player1.position.x <= startPlatform.entity1.position.x+startPlatform.entity1.width &&
    keys.e.pressed===true){
    resetArmory();
  }

  //hit detection for punchingbag if facing right
  if (player1.direction === "right") {
    if (player1.position.x + player1.attackArea.width >= punchingBag.position.x &&
      player1.position.x <= punchingBag.position.x + punchingBag.width &&
      player1.position.y + player1.attackArea.height >= punchingBag.position.y &&
      player1.isAttacking) {
      player1.isAttacking=false;
      console.log("Hit!");
      punchingBag.velocity.x += 5;
      punchingBag.velocity.y+=player1.velocity.y*0.5;
    }
    //hit detection if facing left
  } else {
    if (player1.position.x + player1.width + (-1 * player1.attackArea.width) <= punchingBag.position.x + punchingBag.width &&
      player1.position.x + player1.width >= punchingBag.position.x &&
      player1.position.y + player1.attackArea.height >= punchingBag.position.y &&
      player1.isAttacking) {
      player1.isAttacking=false;
      console.log("Hit!");
      punchingBag.velocity.x += -5;
      punchingBag.velocity.y+=player1.velocity.y;
    }
  }



}

//running the function to start the game;

animate();


let _timeout;


//--------------------------------------------KEYBOARD EVENTS-----------------------------------------------//

document.addEventListener("keypress", function (e) {
  switch (e.key) {
    case "e":
      keys.e.pressed=true;
      break;
    case "w":
      keys.w.pressed=true;
      player1.lastKeyPressed="w";
      break;
    case "d":
      player1.direction = "right";
      keys.d.pressed = true;
      player1.lastKeyPressed = "d";
      break;
    case "a":
      player1.direction = "left";
      keys.a.pressed = true;
      player1.lastKeyPressed = "a";
      break;
    case " ":
      if (player1.isAttacking === false) {
        player1.swing();
          _timeout = setTimeout(()=>{
          if(player1.isAttacking === true)
            player1.isAttacking=false;
        },20);
      }
      break;
    case "Alt":
      player1.velocity.y-=2;
      console.log(player1.velocity.y);
      break;
  }
});
document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "e":
      keys.e.pressed=false;
      break;
    case "d":
      keys.d.pressed = false;
      player1.velocity.x = 0;
      break;
    case "a":
      keys.a.pressed = false;
      player1.velocity.x = 0;
      break;
    case "w":
      keys.w.pressed=false;
      break;
    case " ":
      if (player1.isAttacking){
        clearTimeout(_timeout);
        player1.isAttacking=false;
      }
      break;
  }
});

