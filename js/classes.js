//generic Object class

class genericEntitys{
  constructor(position, image, scale=1) {
    this.position=position;
    this.image=image;
    this.scale=scale;
    this.image.width*=this.scale
    this.image.height*=this.scale;
  }
  draw(){
    c.drawImage(
        this.image,
        this.position.x,
        this.position.y);
  }
//   c.drawImage(
//   this.image,
//   this.currentFrame*(this.image.width/this.totalFrames),
//   0,
//   this.image.width/this.totalFrames,
//   this.image.height,
//   this.position.x-this.offSet.x,
//   this.position.y-this.offSet.y,
//   (this.image.width/this.totalFrames)*this.scale,
//   this.image.height*this.scale
// );
}


//punchingBag class
class PunchingBag {

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

class Sprite {

  constructor(position, image, scale = 1, frames = 1, offSet = {x: 0, y: 0}) {
    this.position = position;
    this.image=image;
    this.width = 20;
    this.height = 70;
    this.scale=scale;
    this.totalFrames=frames;
    this.currentFrame=0;
    this.framesAnimated=0;
    this.framesCooldown=5;
    this.offSet=offSet;
  }

  draw() {
    c.drawImage(
        this.image,
        this.currentFrame*(this.image.width/this.totalFrames),
        0,
        this.image.width/this.totalFrames,
        this.image.height*1,
        this.position.x-this.offSet.x,
        this.position.y-this.offSet.y,
        (this.image.width/this.totalFrames)*this.scale,
        this.image.height*this.scale
    );
  }

  startAnimation(){
    this.framesAnimated++;
    if(this.framesAnimated % this.framesCooldown === 0){
      if(this.currentFrame<this.totalFrames-1){
        this.currentFrame++;
      }else {
        this.currentFrame=0;
      }
    }
  }

  update() {
    this.draw();
  }
}

class Player extends Sprite{

  lastKeyPressed;
  midBorderMovement;
  direction;
  attackRange;
  isAttacking=false;
  isInteracting=false;

  score = 0;
  lifes = 3;
  hp = 100;
  coins = 100000;
  currentJumpLevel=5;
  currentSpeedLevel=5;

  currentFrame=0;
  framesAnimated=0;
  framesCooldown=20;

  constructor(position, velocity, direction, attackRange, image, scale = 1, frames = 1, offSet, animations) {
    super(position, image, scale, frames, offSet);

    this.velocity = velocity;
    this.direction = direction;
    this.height = 20;
    this.width = 70;
    this.attackRange = attackRange;
    this.attackArea = {
      position: {
        x: this.position,
        y: this.position
      },
      width: this.attackRange,
      height: this.height / 3
    }
    this.animations=animations;
  }

  update() {
    super.update();
    super.startAnimation();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;


    //life value check

    if(this.lifes<0){
      this.lifes=0;
    }

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
        cloudBlockers.forEach((cloud) => {
          cloud.velocity.y=-force*1.4;
        });
        player1.score+=Math.floor(-force)*5;
        $('#score').html("Score: " + player1.score);
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
  changeAnimation(action){
    switch (action) {
      case "idle":
        if(this.image!==this.animations.idle.image){
          this.image=this.animations.idle.image;
          this.totalFrames=this.animations.idle.frames;
          this.currentFrame=0;
        }
        break;
      case "run":
        if(this.image!==this.animations.run.image){
          this.image=this.animations.run.image;
          this.totalFrames=this.animations.run.frames;
          this.currentFrame=0;
        }
        break;
      case "jump":
        if(this.image!==this.animations.jump.image){
          this.image=this.animations.jump.image;
          this.totalFrames=this.animations.jump.frames;
          this.currentFrame=0;
        }
        break;
      case "fall":
        if(this.image!==this.animations.fall.image){
          this.image=this.animations.fall.image;
          this.totalFrames=this.animations.fall.frames;
          this.currentFrame=0;
        }
        break;
    }
  }
}

//platform class

class Platform extends Sprite{

  hasEntity;

  currentFrame=0;
  framesAnimated=0;
  framesCooldown=20;

  constructor(position, velocity, image, width, entity,  scale, frames, offSet) {
    super(position, image, scale, frames, offSet);
    this.velocity = velocity;
    this.width = width;
    this.height = 20;
    if(entity){
      this.hasEntity=true;
      this.entity = entity;
    }else this.hasEntity=false;
  }

  update(){
    super.update();
    this.position.y += this.velocity.y;
    if(this.velocity.y>0){
      this.velocity.y -= gravity;
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

class Coin extends Sprite{

  currentFrame=0;
  framesAnimated=0;
  framesCooldown=20;

  constructor(position, image, scale = 1, frames = 1, offSet) {
    super(position, image, scale, frames, offSet);
    this.width=30;
    this.height=30;
  }
  update(posY) {
    this.position.y=posY-this.height-30
    super.update();
    super.startAnimation();
  }
  toString(){
    return "coin";
  }
}

//MegaPlatform class

class MegaPlatform extends Sprite{

  constructor(position, velocity, width, entity, entity2, entity3, offset1, offset2, offset3, image, scale, frames, offSet) {
    super(position, image, scale, frames, offSet);

    this.velocity=velocity
    this.width=width;

    this.entity1=entity;
    this.entity1.position.x+=offset1;

    this.entity2=entity2;
    this.entity2.position.x+=offset2;

    this.entity3=entity3;
    this.entity3.position.x+=offset3;
  }

  update() {
    super.update();
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

//projectile class

class Projectile{
  constructor(position, velocity, radius) {
    this.position=position;
    this.velocity=velocity;
    this.radius=radius;
    this.fillstyle = "blue";
  }
  draw(){
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, Math.PI*2, 0, false);
    c.fillStyle=this.fillstyle;
    c.fill();
  }
  update(){
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

//cannon class

class Cannon{

  constructor(position, width, height) {
    this.position=position;
    this.width=width;
    this.height=height;
    this.fillstyle="gray";
  }
  draw() {
    c.fillStyle=this.fillstyle;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(posY) {
    this.position.y=posY-this.height;
    this.draw();
  }
  fire(targetPosX, targetPosY){
    const angle = Math.atan2(targetPosY-this.position.y, targetPosX-this.position.x);
    const projectile = new Projectile({
      x: this.position.x+(this.width/2),
      y: this.position.y+(this.height/2)
    }, {
      x: Math.cos(angle)*6,
      y: Math.sin(angle)*6
    }, 10);
    projectileList.push(projectile);
  }
  toString(){
    return "cannon";
  }
}

//door class

class Door{

  constructor(position, width, height, fillstyle, destination) {
    this.position=position;
    this.width=width;
    this.height=height;
    this.fillstyle=fillstyle;
    this.destination=destination;
  }
  draw() {
    c.fillStyle=this.fillstyle;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update(posY) {
    this.position.y=posY-this.height;
    this.draw();
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

class cloudBlocker extends Sprite{
  constructor(position, velocity, image, scale, frames, offSet) {
    super(position, image, scale, frames, offSet);
    this.velocity=velocity;
  }
  update() {
    super.update();
    this.position.y+=this.velocity.y;

    if(this.velocity.y>0){
      this.velocity.y -= gravity;
    }else{
      this.velocity.y=0;
    }
  }
}

