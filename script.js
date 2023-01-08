//向量的class
let Vector = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};
Vector.prototype.add = function (v) {
  return new Vector(this.x + v.x, this.y + v.y);
};
Vector.prototype.length = function () {
  return Math.sqrt(this.x * this.x, this.y * this.y);
};
Vector.prototype.set = function (v) {
  this.x = v.x;
  this.y = v.y;
};
Vector.prototype.equal = function (v) {
  return this.x == v.x && this.y == v.y;
};
Vector.prototype.clone = function () {
  return new Vector(this.x, this.y);
};
Vector.prototype.mul = function (s) {
  return new Vector(this.x * s, this.y * s);
};

//snake類別
let Snake = function () {
  this.body = []; //身體用陣列存
  this.maxLength = 5;
  this.head = new Vector();
  this.speed = new Vector(1, 0);
  this.direction = "Right";
};

//game類別
let Game = function () {
  this.bw = 12; //block寬度
  this.bs = 2; //blck邊框
  this.gameWidth = 40; //長寬各有幾個格子
  this.speed = 30;
  this.snake = new Snake();
  this.foods = [];
  this.init();
  this.start = false;
};

//初始化遊戲
Game.prototype.init = function () {
  this.canvas = document.getElementById("mycanvas");
  this.ctx = this.canvas.getContext("2d");
  this.canvas.width = this.bw * this.gameWidth + this.bs * (this.gameWidth - 1);
  this.canvas.height = this.canvas.width;
  this.render(); //先呼叫渲染畫面
  setTimeout(() => {
    this.update();
  }, 30);
  this.manyFoods();
};

//開始遊戲
Game.prototype.startGame = function () {
  this.start = true;
  this.snake = new Snake(); //遊戲開始都會產生新的蛇
  $(".panel").hide();
  this.update();
  this.playSound("C#5", -20);
  this.playSound("E5", -20, 200);
};

//結束遊戲
Game.prototype.endGame = function () {
  this.start = false;
  $(".panel").show();
  $("h2").text("Score: " + (this.snake.body.length - 5) * 10);
  this.playSound("A3");
  this.playSound("E2", -10, 200);
  this.playSound("A2", -10, 400);
};

//繪製遊戲畫面
Game.prototype.render = function () {
  this.ctx.fillStyle = "rgba(0,0,0,0.3)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  for (let x = 0; x < this.gameWidth; x++) {
    for (let y = 0; y < this.gameWidth; y++) {
      this.drawBlock(new Vector(x, y), "rgba(255,255,255,0.03)");
    }
  }
  this.snake.body.forEach(sp => {
    this.drawBlock(sp, "#fff");
  });
  for (let i = 0; i < this.foods.length; i++) {
    this.drawBlock(this.foods[0], "#81c564");
    this.drawBlock(this.foods[i], "#990000");
  }
  requestAnimationFrame(() => this.render()); //必須重複執行render這個函數
};

//更新遊戲內容
Game.prototype.update = function () {
  if (this.start) {
    this.snake.update(); //更新蛇的移動位置
    this.foods.forEach((food, i) => {
      if (this.snake.head.equal(food)) {
        //蛇的頭和食物位置一樣
        this.snake.maxLength++;
        this.foods.splice(i, 1);
        this.generateFood();
      }
    });

    if (this.snake.checkBoundary(this.gameWidth) == false) {
      this.endGame();
    }
    this.speed = Math.sqrt(this.snake.body.length) + 5;
    setTimeout(() => {
      this.update();
    }, parseInt(1000 / this.speed)); //固定時間呼叫update函式
    this.playSound("A2", -25);
  }
};

//獲取方塊位置
Game.prototype.getPosition = function (x, y) {
  return new Vector(x * this.bw + (x - 1) * this.bs, y * this.bw + (y - 1) * this.bs);
};

//畫出方塊
Game.prototype.drawBlock = function (v, color) {
  this.ctx.fillStyle = color;
  let pos = this.getPosition(v.x, v.y);
  this.ctx.fillRect(pos.x, pos.y, this.bw, this.bw);
};

//畫出食物產生時的紅圈
Game.prototype.drawEffect = function (x, y) {
  let r = 2;
  let pos = this.getPosition(x, y);
  let effect = () => {
    r++;
    this.ctx.strokeStyle = `rgba(255,255,255,${(100 - r) / 100})`;
    this.ctx.beginPath();
    this.ctx.arc(pos.x + this.bw / 2, pos.y + this.bw / 2, 20 * Math.log(r / 2), 0, Math.PI * 2);
    this.ctx.stroke();
    if (r < 100) {
      requestAnimationFrame(effect);
    }
  };
  requestAnimationFrame(effect);
};

//產生食物
Game.prototype.generateFood = function () {
  let x = Math.floor(Math.random() * this.gameWidth);
  let y = Math.floor(Math.random() * this.gameWidth);
  this.foods.push(new Vector(x, y)); //foods為陣列
  this.drawEffect(x, y);
  this.playSound("E5", -20);
  this.playSound("A5", -20, 200);
};

//製造多個食物
Game.prototype.manyFoods = function () {
  for (let i = 0; i < 2; i++) {
    this.generateFood();
  }
};

//產生聲音
Game.prototype.playSound = function (note, volume, when) {
  setTimeout(() => {
    let synth = new Tone.Synth().toMaster();
    synth.volume.value = volume || -12;
    synth.triggerAttackRelease(note, "8n");
  }, when || 0); //第一個參數:音符，第二個參數:聲音持續時間
};

let game = new Game();
game.init();

//控制蛇移動
Snake.prototype.update = function () {
  this.body.push(this.head);
  let newHead = this.head.add(this.speed);
  this.head = newHead;
  while (this.body.length > this.maxLength) {
    this.body.shift();
  }
};

//控制蛇的方向
Snake.prototype.setDirection = function (dir) {
  let target;
  if (dir == "Up") {
    target = new Vector(0, -1);
  } else if (dir == "Down") {
    target = new Vector(0, 1);
  } else if (dir == "Left") {
    target = new Vector(-1, 0);
  } else if (dir == "Right") {
    target = new Vector(1, 0);
  }
  if (target.equal(this.speed) == false && target.equal(this.speed.mul(-1)) == false) {
    //假如target和原本方向及相反方向不同
    this.speed = target;
  }
};

//確認蛇有沒有撞到邊界
Snake.prototype.checkBoundary = function (gameWidth) {
  let xRange = 0 <= this.head.x && this.head.x < gameWidth;
  let yRange = 0 <= this.head.y && this.head.y < gameWidth;
  return xRange && yRange;
};

//按鍵監聽
$(window).keydown(evt => {
  game.snake.setDirection(evt.key.replace("Arrow", ""));
});