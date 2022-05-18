const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1024;
canvas.height = 1200;
let currentScenery = "lobby";
let currentMenu = "menu";
let playStatus = false;

c.fillStyle = "black";
c.fillRect(0, 0, canvas.width, canvas.height);

let gravity = .13;
const resistance = .15;

let platFormList = [];
let upgradeTowers = [];
let doorList = [];
let projectileList = [];
let backgroundList=[];
let cloudList=[];
let cloudBlockers=[];

const gameModes = ["Easy", "Normal", "Hard"];
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
    }
}

const upgradeLevels = {
    jump: {
        level: [1, 2, 3, 4, 5],
        value: [9, 9.5, 10, 10.5, 11],
        cost: [0, 100, 500, 1000, 1500]
    },
    speed: {
        level: [1, 2, 3, 4, 5],
        value: [2, 3, 4, 5, 6],
        cost: [0, 50, 250, 500, 1000]
    }
}

const bgPositions = [-1800, 600, 900, 900, 900];

const cloudAssets = [
    convertImageSrc("img/clouds/cloud1.png"),
    convertImageSrc("img/clouds/cloud2.png"),
    convertImageSrc("img/clouds/cloud3.png"),
    convertImageSrc("img/clouds/cloud4.png"),
    convertImageSrc("img/clouds/cloud5.png"),
    convertImageSrc("img/clouds/cloud6.png")
]

window.onload = ()=>{
    loadStartMenu();
}

//--------------------------------------------GAME FUNCTIONS-----------------------------------------------//
function randomIntGen(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function calcRandomPlatform(start, limit, offsetY, interval) {

    for (let i = start; i >= limit; i -= interval) {
        const width = randomIntGen(150, 250);
        const r = randomIntGen(-1 * offsetY, offsetY);
        const posY = i + r;
        const posX = randomIntGen(0, canvas.width - width - 1);
        const spawnRate = Math.floor(Math.random() * 10);
        const platform = new Platform(
            {
                x: posX,
                y: posY
            }, {
                x: 0,
                y: 0
            },
            convertImageSrc("img/platform.png"),
            width,
            null,  1, 1, {x:0, y:0}
        );
        platform.image.width=platform.width;
        if (spawnRate === 1  || spawnRate===2 || spawnRate===3) {
            platform.hasEntity = true;
            platform.entity = new Coin(
                {
                    x: platform.position.x + (platform.width / 2) - 15,
                    y: platform.position.y
                }, convertImageSrc("img/coin/coin-easy.png"), 3, 5,
                {
                    x: 1,
                    y: 0
                }
            );
            switch (currentGM) {
                case 0:
                    platform.entity.image.src="img/coin/coin-easy.png"
                    break;
                case 1:
                    platform.entity.image.src="img/coin/coin-normal.png"
                    break;
                case 2:
                    platform.entity.image.src="img/coin/coin-hard.png"
                    break;
            }
            }else if(spawnRate===4 || spawnRate===5){
            platform.hasEntity = true;
            platform.entity = new Cannon(
                {
                    x: platform.position.x + (platform.width / 2) - 25,
                    y: platform.position.y
            }, 50, 50
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
            limit = -10000;
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
    calcRandomPlatform(700, -100_000, offsetY, interval);
}

generatePlatforms(gameModes[currentGM]);

//generate position and creating instances for each cloud

function calcRandomClouds(start, limit, offSetY, interval, list, scaleMax=1, scaleMin=1){
    for (let i = start; i >= limit; i -= interval) {
        const r = randomIntGen(-1 * offSetY, offSetY);
        const posY = i + r;
        const posX = randomIntGen(0, canvas.width);
        const cloudIndex = randomIntGen(0, 5);
        const cloudScale = (Math.random()*scaleMax)+scaleMin;

        const cloud = new cloudBlocker({
            x: posX,
            y: posY
        },{
            x: 0,
            y: 0
        }, cloudAssets[cloudIndex], cloudScale, 1, {x:0, y:0});
        list.push(cloud);
    }
}

//generates the clouds

function generateClouds(){
    calcRandomClouds(0, -10_000, 10, 200, cloudList, 2, 1);
}

generateClouds();

//generates the cloud blockers

function generateCloudBlockers(){
    calcRandomClouds(-1000, -10_000, 100, 1000, cloudBlockers, 6, 3);
}
generateCloudBlockers();

//reset background element positions

function resetBackground(){
    for(let i = 0; i<backgroundList.length; i++){
        backgroundList[i].position.y=bgPositions[i];
    }
}

resetBackground();

//update life img's

function removeLifeIMG(lifes) {
    let outPut = "life" + lifes;
    $('#' + outPut).attr("src", "img/heart-empty.png");
}

function playerDeath(object) {
    object.lifes-=3;
    removeLifeIMG(object.lifes);
    resetLobbyGame();
}

function playerWin(object) {
    resetLobbyGame();
    object.coins+=1000;
}

function updateHealth(object) {
    $('#healthbar').width(object.hp*2);
    $('#healthbarVal').html(object.hp);
    if(object.hp<=0){
        object.hp=100;
        object.lifes--;
        removeLifeIMG(object.lifes);
    }
}

//update score

function updateScore(object){
    object.score=0;
    $('#score').html("Score : " + object.score);
}

//object from image source to save dup code

function convertImageSrc(imgsrc) {
    const img = new Image();
    img.src=imgsrc;
    return img;
}
//--------------------------------------------OBJECT INITS-----------------------------------------------//

let blackSmithDoor = new Door(
    {
        x: canvas.width / 2 - 300,
        y: 900
    },
    50,
    100,
    "blue",
    "blacksmith"
);
let armoryDoor = new Door(
    {
        x: canvas.width / 2 - 300,
        y: 900
    },
    50,
    100,
    "pink",
    "armory"
);
let miscDoor = new Door(
    {
        x: canvas.width / 2 - 300,
        y: 900
    },
    50,
    100,
    "lime",
    "misc"
);

let exitArmory = new Door({
    x: 50,
    y: canvas.height - 100
}, 50, 100, "dark_green", "lobby");

doorList.push(blackSmithDoor, armoryDoor, miscDoor, exitArmory);

let startPlatform = new MegaPlatform(
    {
        x: (canvas.width / 2) - 300,
        y: 1000
    }, {
        x: 0,
        y: 0
    }, 550,
    blackSmithDoor,
    armoryDoor,
    miscDoor,
    50,
    240,
    440,
    convertImageSrc("img/startplatform.png"),
    1, 1, {x: 30, y: 10}
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
    90,
    convertImageSrc("img/samurai/Idle.png"),
    2,
    4,
    {
        x: 175,
        y: 235,
    },
    {
        idle: {
            image: convertImageSrc("img/samurai/Idle.png"),
            frames: 4
        },
        run: {
            image: convertImageSrc("img/samurai/Run.png"),
            frames: 8
        },
        jump: {
            image: convertImageSrc("img/samurai/Jump.png"),
            frames: 2
        },
        fall: {
            image: convertImageSrc("img/samurai/Fall.png"),
            frames: 2
        }
    }
);


//instance of punchingbag class //PUNCHINGBAG ENTITY

let punchingBag = new PunchingBag(60, 300, {x: 0, y: 0});


//upgrade jump stand

let jumpBar = new loadingBar({
    x: 225,
    y: canvas.height
}, 50, -50);

let upgradeJumpTower = new upgradeTower({
    x: 200,
    y: canvas.height - 475
}, 100, 475, jumpBar, "jump");

//upgrade speed stand

let speedBar = new loadingBar({
    x: 425,
    y: canvas.height
}, 50, -50);

let upgradeSpeedTower = new upgradeTower({
    x: 400,
    y: canvas.height - 475
}, 100, 475, speedBar, "speed");

//backgrounds

const background = new genericEntitys({
    x: 0,
    y: -1800
}, convertImageSrc("img/background/mountain-sky.png"));
const bgMountainFar = new genericEntitys({
    x: 0,
    y: 600
}, convertImageSrc("img/background/mountain-mountain-far.png"));
const bgMountains = new genericEntitys({
    x: 0,
    y: 900
}, convertImageSrc("img/background/mountain-mountains.png"));
const bgMountainTrees = new genericEntitys({
    x: 0,
    y: 900
}, convertImageSrc("img/background/mountain-trees.png"));
const bgFgTrees = new genericEntitys({
    x: 0,
    y: 900
}, convertImageSrc("img/background/mountain-foreground-trees.png"));

backgroundList.push(background);
backgroundList.push(bgMountainFar);
backgroundList.push(bgMountains);
backgroundList.push(bgMountainTrees);
backgroundList.push(bgFgTrees);

doorList.push(exitArmory);

upgradeTowers.push(upgradeJumpTower);
upgradeTowers.push(upgradeSpeedTower);




//--------------------------------------------RESET FUNCTIONS-----------------------------------------------//

//reset Lobby

function resetLobbyGame() {
    currentScenery = "lobby";
    platFormList = [];
    projectileList=[];
    cloudList=[];
    cloudBlockers=[];

    player1.hp=100;
    updateScore(player1);
    removeLifeIMG(player1.lifes);
    updateHealth(player1);

    blackSmithDoor = new Door(
        {
            x: canvas.width / 2 - 300,
            y: 900
        },
        50,
        100,
        "blue",
        "blacksmith"
    );
    armoryDoor = new Door(
        {
            x: canvas.width / 2 - 300,
            y: 900
        },
        50,
        100,
        "pink",
        "armory"
    );
    miscDoor = new Door(
        {
            x: canvas.width / 2 - 300,
            y: 900
        },
        50,
        100,
        "lime",
        "misc"
    );

    startPlatform = new MegaPlatform(
        {
            x: (canvas.width / 2) - 300,
            y: 1000
        }, {
            x: 0,
            y: 0
        }, 550,
        blackSmithDoor,
        armoryDoor,
        miscDoor,
        50,
        240,
        440,
        convertImageSrc("img/startplatform.png"),
        1, 1, {x: 30, y: 10}
    );
    platFormList.push(startPlatform);

    //regen the platforms

    generatePlatforms(gameModes[currentGM]);

    //regen the clouds

    generateClouds();

    //regen the cloudBlockers

    generateCloudBlockers();

    //resets the background

    resetBackground();

    //player position reset (dont wanna create new instance as it'll remove other stats)

    player1.position.x = (canvas.width / 2);
    player1.position.y = startPlatform.position.y - player1.height - 5;

//instance of punchingbag class //PUNCHINGBAG ENTITY

    punchingBag = new PunchingBag(60, 300, {x: 0, y: 0});

}

//reset armory

function resetArmory() {
    platFormList = [];
    projectileList=[];
    doorList = [];
    doorList.push(exitArmory);
    currentScenery = "armory";
    player1.position.x = (canvas.width / 2);
    player1.position.y = canvas.height - 75;
}

//--------------------------------------------ANIMATOR-----------------------------------------------//
function animate() {

    window.requestAnimationFrame(animate);

    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    //elements to update if player in lobby

    if (currentScenery === "lobby") {

        //parallax scroll effect

        if(player1.velocity.y<0){
            backgroundList[0].position.y+=0.3;
            backgroundList[1].position.y+=0.25;
            backgroundList[2].position.y+=0.15;
            backgroundList[3].position.y+=0.10;
            backgroundList[4].position.y+=0.05;
            cloudList.forEach((cloud) => {
                cloud.position.y+=0.4;
            });
        }

        //background
        backgroundList.forEach((img) =>{
            img.draw();
        });

        //clouds
        cloudList.forEach((cloud) => {
            cloud.draw();
        });

        //platforms//
        platFormList.forEach((platform) => {
            platform.update();
        });

        projectileList.forEach((projectile) => {
            projectile.update();
            if(projectile.position.x>canvas.width ||
                projectile.position.y>canvas.height ||
                projectile.position.x<0 ||
                projectile.position.y<0){
                projectileList.splice(projectile);
            }

            if(projectile.position.x + projectile.radius >= player1.position.x &&
                projectile.position.x -projectile.radius<= player1.position.x+player1.width &&
                projectile.position.y + projectile.radius >= player1.position.y &&
                projectile.position.y - projectile.radius <= player1.position.y+player1.height){
                player1.hp--;
                updateHealth(player1);
            }
        });


        //win round detection
        if (player1.position.y + player1.height <= platFormList[platFormList.length - 2].position.y) {
            playerWin(player1);
        }
        //player death detection
        if (player1.position.y + player1.height + player1.velocity.y >= canvas.height) {
            playerDeath(player1);
            //player is dead
        }
        if (player1.position.y + player1.height >= startPlatform.entity1.position.y &&
            player1.position.y <= startPlatform.entity1.position.y + startPlatform.entity1.height &&
            player1.position.x + player1.width >= startPlatform.entity1.position.x &&
            player1.position.x <= startPlatform.entity1.position.x + startPlatform.entity1.width &&
            player1.isInteracting === true) {
            resetArmory();
        }
    }

    if(player1.lifes===0){
        loadGameOverMenu();
    }
    if(player1.velocity.y<0){
        player1.changeAnimation("jump");
    }else if(player1.velocity.y>0){
        player1.changeAnimation("fall");
    }

    //elements to update if player is in armory

    if (currentScenery === "armory") {
        upgradeTowers.forEach((tower) => {
            tower.update();
            tower.loadingBar.update();

            if (player1.position.y <= tower.position.y + tower.height &&
                player1.position.y + player1.height + player1.velocity.y >= tower.position.y &&
                player1.position.x + player1.width + player1.velocity.x >= tower.position.x &&
                player1.position.x + player1.velocity.x <= tower.position.x + tower.width &&
                player1.isInteracting === true) {
                player1.isInteracting = false;
                switch (tower.type) {
                    case "jump":
                        if (player1.coins >= upgradeLevels.jump.cost[player1.currentJumpLevel] && player1.currentJumpLevel <= upgradeLevels.jump.level.length) {
                            console.log("oppgrader" + tower.type);
                            player1.currentJumpLevel++;
                            tower.loadingBar.height -= 100;
                            tower.loadingBar.update();
                            player1.coins -= upgradeLevels.jump.cost[player1.currentJumpLevel - 1];
                            $('#balanceValue').html(player1.coins);
                        } else console.log("Not enough coins!");
                        break;
                    case "speed":
                        if (player1.coins >= upgradeLevels.speed.cost[player1.currentSpeedLevel] && player1.currentSpeedLevel <= upgradeLevels.speed.level.length) {
                            console.log("oppgraderte" + tower.type);
                            player1.currentSpeedLevel++;
                            tower.loadingBar.height -= 100;
                            tower.loadingBar.update();
                            player1.coins -= upgradeLevels.jump.cost[player1.currentJumpLevel - 1];
                            $('#balanceValue').html(player1.coins);
                        } else console.log("Not enough coins!");
                        break;
                }
            }
        });
        doorList.forEach((door) => {
            door.update(canvas.height);
            if (
                player1.position.x + player1.width >= door.position.x &&
                player1.position.x <= door.position.x + door.width &&
                player1.isInteracting === true) {
                console.log(door.destination);
                switch (door.destination) {
                    case "armory":

                        break;
                    case "lobby":
                        resetLobbyGame();
                }
            }
        });
    }

    player1.update();

    if(currentScenery==="lobby"){
        cloudBlockers.forEach((cloud) => {
            cloud.update();
        });
    }

    //check for platform detection

    platFormList.forEach((platform) => {
        if (player1.position.y + player1.height <= platform.position.y &&
            player1.position.y + player1.height + player1.velocity.y >= platform.position.y &&
            player1.position.x + player1.width + player1.velocity.x >= platform.position.x &&
            player1.position.x + player1.velocity.x <= platform.position.x + platform.width) {
            player1.velocity.y = 0;
            //player is onPlatform
        }

        //check for coin collision

        if (platform.hasEntity && platform.entity?.toString() === "coin") {
            if (player1.position.y <= platform.entity.position.y+30 + platform.entity.height &&
                player1.position.y + player1.height >= platform.entity.position.y &&
                player1.position.x <= platform.entity.position.x+platform.entity.width &&
                player1.position.x + player1.width >= platform.entity.position.x) {
                platform.entity = null;
                platform.hasEntity = false;
                platform.update();
                switch (currentGM) {
                    case 0:
                        player1.coins++;
                        break;
                    case 1:
                        player1.coins += 2;
                        break;
                    case 2:
                        player1.coins += 3;
                        break;
                }
                $('#balanceValue').html(player1.coins);
            }
        }
    });

    //enhanced movement

    if (keys.a.pressed && player1.lastKeyPressed === "a") {
        player1.velocity.x = -upgradeLevels.speed.value[player1.currentSpeedLevel - 1];

        //updates animation
        player1.changeAnimation("run");
    } else if (keys.d.pressed && player1.lastKeyPressed === "d") {
        player1.velocity.x = upgradeLevels.speed.value[player1.currentSpeedLevel - 1];
        //updates animation
        player1.changeAnimation("run");
    } else if (keys.w.pressed && player1.lastKeyPressed === "w" && player1.velocity.y === 0 && player1.midBorderMovement === true) {
        player1.velocity.y = -upgradeLevels.jump.value[player1.currentJumpLevel - 1]
    }else{
        player1.changeAnimation("idle");
    }

    //collision detection for interactions (e)


    //hit detection for punchingbag if facing right
    if (player1.direction === "right") {
        if (player1.position.x + player1.attackArea.width >= punchingBag.position.x &&
            player1.position.x <= punchingBag.position.x + punchingBag.width &&
            player1.position.y + player1.attackArea.height >= punchingBag.position.y &&
            player1.isAttacking) {
            player1.isAttacking = false;
            console.log("Hit!");
            punchingBag.velocity.x += 5;
            punchingBag.velocity.y += player1.velocity.y * 0.5;
        }
        //hit detection if facing left
    } else {
        if (player1.position.x + player1.width + (-1 * player1.attackArea.width) <= punchingBag.position.x + punchingBag.width &&
            player1.position.x + player1.width >= punchingBag.position.x &&
            player1.position.y + player1.attackArea.height >= punchingBag.position.y &&
            player1.isAttacking) {
            player1.isAttacking = false;
            console.log("Hit!");
            punchingBag.velocity.x += -5;
            punchingBag.velocity.y += player1.velocity.y;
        }
    }
}

//running the function to start the game;

animate();

//--------------------------------------------KEYBOARD EVENTS-----------------------------------------------//
let _timeout;
document.addEventListener("keypress", function (e) {
    switch (e.key) {
        case "e":
            if (player1.isInteracting === false) {
                player1.interact();
                _timeout = setTimeout(() => {
                    if (player1.isInteracting === true)
                        player1.isInteracting = false;
                }, 20);
            }
            break;
        case "w":
            keys.w.pressed = true;
            player1.lastKeyPressed = "w";
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
            if (!player1.isAttacking) {
                player1.swing();
                _timeout = setTimeout(() => {
                    if (player1.isAttacking)
                        player1.isAttacking = false;
                }, 20);
            }
            break;
        case "Alt":
            player1.velocity.y -= 2;
            console.log(player1.velocity.y);
            break;
    }
});
document.addEventListener("keyup", function (e) {
    switch (e.key) {
        case "e":
            if (player1.isInteracting) {
                clearTimeout(_timeout);
                player1.isInteracting = false;
            }
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
            keys.w.pressed = false;
            break;
        case " ":
            if (player1.isAttacking) {
                clearTimeout(_timeout);
                player1.isAttacking = false;
            }
            break;
    }
});

//--------------------------------------------cannon fire interval-----------------------------------------------//

setInterval(() => {
    platFormList.forEach((platform) => {
        if(platform.hasEntity){
            if (platform.entity.toString() === "cannon" &&
                platform.entity.position.y + platform.entity.height <= canvas.height &&
                platform.entity.position.y >= 0) {
                platform.entity.fire(player1.position.x, player1.position.y);
            }
        }
    });
}, randomIntGen(1000, 2000));

//--------------------------------------------menu controls-----------------------------------------------//

const playButton = $('#play-button');
const miscButton = $('#menu-button');
const menuImg = $('#menu-logo');

playButton.click(()=>{
    player1.lifes=3;
    $('#gameOverlay').hide();
    $('#menu-background').hide();
    resetLobbyGame();
    for(let i=0;i<=2;i++){
        let outPut = "life" + i;
        $('#' + outPut).attr("src", "img/heart-full.png");
    }
});
miscButton.click(()=>{
    if(currentMenu==="menu"){
        console.log("Leaderboard");
    }else if(currentMenu==="gameOver"){
        player1.lifes=3;
        loadStartMenu();
    }
});

function loadGameOverMenu(){
    currentMenu="gameOver";
    //playStatus=false;

    const menu = $('#gameOverlay');
    const title = $('#menu-title');
    const subTitle = $('#menu-subTitle');
    const bgImg = $('#menu-background');

    miscButton.html("Menu");
    title.html("Game over..");
    subTitle.html("Want to play again?");
    bgImg.css("background-image", "url(img/background/menus/deathmenu.jpg)");
    menuImg.attr("src", "img/menulogos/samuraideathlogo.gif");

    bgImg.show();
    menu.show();
}

function loadStartMenu(){
    currentMenu="menu";
    playStatus=false;

    const menu = $('#gameOverlay');
    const title = $('#menu-title');
    const subTitle = $('#menu-subTitle');
    const bgImg = $('#menu-background');

    miscButton.html("Leaderboard");
    playButton.html("Play");
    title.html("SAMURAI JUMP");
    subTitle.html("Click \"PLAY\" to play");
    bgImg.css("background-image", "url(img/background/menus/startmenu.jpg)");
    menuImg.attr("src", "img/menulogos/samuraistartlogo.gif");

    bgImg.show();
    menu.show();
}
