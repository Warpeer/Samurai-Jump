//punchingBag class
class PunchingBag {
  onGround;

  constructor(width, height, velocity) {
    this.width = width;
    this.height = height;
    this.velocity = velocity;
    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height - this.height
    }
  }

  draw() {
    c.fillStyle = "brown";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //gravity if above ground
    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      this.velocity.y=0;

      //calculating resistance if on ground

      if(this.velocity.x > 0){
        if(this.velocity.x-resistance>=0){
          this.velocity.x -= resistance;
        }else{
          this.velocity.x=0;
        }
      }else if(this.velocity.x < 0){
        if(this.velocity.x+resistance<=0){
          this.velocity.x+=resistance;
        }else{
          this.velocity.x=0;
        }
      }
    }else this.velocity.y+=gravity;

    //collision check for right border

    if (this.position.x + this.velocity.x > 0) {
    } else {
      this.position.x = canvas.width - this.width;
    }

    //collision check for right border

    if(this.position.x + this.width + this.velocity.x >= canvas.width){
      this.position.x = 0;
    }
  }
}

//player class

class Player {

  lastKeyPressed;
  midBorderMovement;
  direction;
  attackRange;
  isAttacking=false;
  isInteracting=false;

  lifes = 3;
  coins = 100000;
  currentJumpLevel=1;
  currentSpeedLevel=1;

  constructor(position, velocity, direction, width, height, attackRange) {
    this.position = position;
    this.velocity = velocity;
    this.direction = direction;
    this.height = height;
    this.width = width;
    this.attackRange = attackRange;
    this.attackArea = {
      position: {
        x: this.position,
        y: this.position
      },
      width: this.attackRange,
      height: this.height / 3
    }
  }

  defineAttackDim() {
    c.fillStyle = "red";
    if (this.direction === "left") {
      c.fillRect(this.position.x + this.width, this.position.y, -1 * this.attackArea.width, this.attackArea.height);
    } else if (this.direction === "right") {
      c.fillRect(this.position.x, this.position.y, this.attackArea.width, this.attackArea.height);
    }
  }

  draw() {
    c.fillStyle = "green";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
    if(this.isAttacking){
      this.defineAttackDim();
    }
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    //collision check for ground

    if(this.position.y + this.height + this.velocity.y >= canvas.height){
      this.velocity.y=0;
      //player is onGround
    }else {
      this.velocity.y+=gravity;
    }

    //collision with mid border

    if(this.position.y +this.velocity.y <= ((canvas.height/2)-100)){
      this.midBorderMovement=false;
      let force = this.velocity.y;
      if(force<=0){
        player1.position.y+=5;
        platFormList.forEach((platform) => {
          platform.velocity.y=-force*1.25;
        });
      }
      player1.velocity.y=0;
    }else{
      this.midBorderMovement=true;
    }

    //collision check for left border

    if(this.position.x + this.velocity.x <= 0){
      this.position.x = canvas.width-this.width;
    }

    //collision check for right border

    if(this.position.x + this.width + this.velocity.x >= canvas.width){
      this.position.x = 0;
    }
  }

  swing(){
    this.isAttacking=true;
    setTimeout(() => {
      this.isAttacking=false;
    }, 100);
  }
  interact(){
    this.isInteracting=true;
    setTimeout(() => {
      this.isInteracting=false
    }, 1000);
  }
}


//platform entity class

class platformEntity{
  constructor(position, width, height) {
    this.position=position;
    this.width=width;
    this.height=height;
  }
  draw(fillstyle){
    c.fillStyle = fillstyle;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(posY){
    this.draw();
    this.position.y=posY-this.height;
  }
}

//platform class

class Platform{

  hasEntity;

  constructor(position, velocity, width, height, entity) {
    this.position = position;
    this.velocity = velocity;
    this.width = width;
    this.height = height;
    if(entity){
      this.hasEntity=true;
      this.entity = entity;
    }else this.hasEntity=false;
  }

  draw(fillstyle){
    c.fillStyle= fillstyle;
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update(){
    this.draw("gray");
    this.position.y += this.velocity.y;
    if(this.velocity.y>0){
      this.velocity.y -= gravity;
      if(this.hasEntity){
      }
    }else{
      this.velocity.y=0;
    }
    if(this.hasEntity){
      this.entity.update(this.position.y);
    }
  }
  toString(){
    return "platform";
  }
}

//coin class

class Coin extends platformEntity{

  constructor(position, width, height) {
    super(position, width, height);
    this.fillstyle="yellow";
  }
  draw() {
    super.draw(this.fillstyle);
  }
  update(posY) {
    this.position.y=posY-this.height-30
    this.draw();
  }
  toString(){
    return "coin";
  }
}

//MegaPlatform class

class MegaPlatform extends Platform{

  constructor(position, velocity, width, height, entity, entity2, entity3, offset, offset2, offset3) {
    super(position, velocity, width, height);

    this.entity1=entity;
    this.entity1.position.x+=offset;

    this.entity2=entity2;
    this.entity2.position.x+=offset2;

    this.entity3=entity3;
    this.entity3.position.x+=offset3;
  }

  draw() {
    c.fillStyle="orange";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {
    this.draw()
    this.position.y += this.velocity.y;
    if(this.velocity.y>0){
      this.velocity.y -= gravity;
    }else{
      this.velocity.y=0;
    }
    this.entity1.update(this.position.y);
    this.entity2.update(this.position.y);
    this.entity3.update(this.position.y);
  }
  toString(){
    return "megaPlatform";
  }
}

//cannon class

class Cannon extends platformEntity{
  constructor() {
    super();
  }
}

//door class

class Door extends platformEntity{

  constructor(position, width, height, fillstyle) {
    super(position, width, height);
    this.fillstyle=fillstyle;
  }
  draw(fillstyle) {
    super.draw(fillstyle);
  }
  update(posY) {
    super.update(posY);
    this.draw(this.fillstyle);
  }
  toString(){
    return "door";
  }
}

//loadingBar class

class loadingBar{
  constructor(position, width, height) {
    this.position=position;
    this.width=width;
    this.height=height;
  }
  draw(){
    c.fillStyle="yellow";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(){
    this.draw();
  }
}

//upgradeTower class

class upgradeTower{
  constructor(position, width, height, loadingBar, type) {
    this.position = position;
    this.width=width;
    this.height=height;
    this.loadingBar=loadingBar;
    this.type=type;
  }
  draw(){
    c.fillStyle="red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(){
    this.draw();
  }
  toString(){
    return this.type;
  }
}

