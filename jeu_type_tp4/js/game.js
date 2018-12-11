var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;
var start = null,
    i, level, score;

//Canvas
var divArena;
var canArena;
var conArena;
var ArenaWidth = 900;
var ArenaHeight = 540;

//Background
var imgBackground;
var xBackgroundOffset = 0;
var xBackgroundSpeed = 1;
var backgroundWidth = 1782;
var backgroundHeight = 600;

///////////////////////////////////
//Game Status
var _Status = {
    END: 0,
    IN_GAME: 1
};
var status = _Status.IN_GAME;

///////////////////////////////////
//Keys
var keys = {
    UP: 38,
    DOWN: 40,
    SPACE: 32,
    ENTER: 13
};

var keyStatus = {};

function keyDownHandler(e) {
    "use strict";
    var keycode = e.keyCode,
        key;
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = true;
            e.preventDefault();
        }
    }
}
function keyUpHandler(e) {
    var keycode = e.keyCode,
        key;
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = false;
        }
    }
}
///////////////////////////////////


/////////////////////////////////
// Hero Player
var imgPlayer = new Image();
imgPlayer.src = "./assets/Ship/Spritesheet_64x29.png";
var xPlayer = 20,
    yPlayer = 100,
    PlayerImgY = 0;
const yPlayerSpeed = 4,
    PlayerHeight = 29,
    PlayerWidth = 64,
    PlayerImgHeight = 29,
    PlayerImgWidth = 64;
/////////////////////////////////


/////////////////////////////////
// Hatch
var hatchs;
const HatchHeight = 16,
    HatchWidth = 16,
    HatchSpeed = 4;
function Hatch(x, y){
    this.img = new Image();
    this.img.src = './assets/Boss/hatch_sheet.png';
    this.x = x;
    this.y = y;
    this.width = HatchWidth;
    this.height = HatchHeight;
    this.imgy = 0;
    this.imgx = 0;
    this.clear = function(){
        conArena.clearRect(this.x,this.y,HatchWidth,HatchHeight);
    };
    this.update = function(p, me_i){
        this.x += HatchSpeed;
        if (p) {
            this.imgy += HatchHeight;
            this.imgy = this.imgy%(4*HatchHeight);
        }
        if (this.x >= ArenaWidth + HatchHeight) hatchs.splice(me_i, 1);;
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, HatchWidth, HatchHeight, this.x, this.y, HatchWidth, HatchHeight);
    };
}
/////////////////////////////////


/////////////////////////////////
// Enemy
var enemys;
const enemy_skins = [
    'eSpritesheet_40x30.png',
    'Hue Shifted/eSpritesheet_40x30_hue1.png',
    'Hue Shifted/eSpritesheet_40x30_hue2.png',
    'Hue Shifted/eSpritesheet_40x30_hue3.png',
    'Hue Shifted/eSpritesheet_40x30_hue4.png'],
    EnemyHeight = 30,
    EnemyWidth = 40,
    EnemyXSpeed = 1,
    EnemyYSpeed = 2;

function rand(max){
    return Math.random()*max;
}

function Enemy(x,y) {
    this.img = new Image();
    let r = Math.floor(Math.random() * (level <= 5 ? level : 5));
    this.img.src = './assets/Enemy/'+enemy_skins[r];
    this.life = r+1;
    this.x = x;
    this.y = y;
    this.width = EnemyWidth;
    this.height = EnemyHeight;
    this.nexts_pos = [];
    for (let xp=ArenaWidth ; xp >= 0 ; xp-=ArenaWidth/(level*4))
        this.nexts_pos.push({x: xp, y: rand(ArenaHeight-this.height)});
    this.next_p = this.nexts_pos[0];
    this.imgy = 0;
    this.imgx = 0;
    this.clear = function(){
        conArena.clearRect(this.x,this.y,EnemyWidth,EnemyHeight);
    };
    this.update = function(p_change, me_i){
        this.x -= EnemyXSpeed;
        this.y += (this.y-this.next_p.y < 0) ? EnemyYSpeed : -1*EnemyYSpeed;

        // change next position
        if (this.x <= this.next_p.x && this.nexts_pos.length > 1) {
            this.nexts_pos.shift();
            this.next_p = this.nexts_pos[0];
        }
        // sprite switch
        if (p_change) {
            this.imgy += EnemyHeight;
            this.imgy = this.imgy%(4*EnemyHeight);
        }
        // return this.x >= 0;
        if (this.x < 0) lose();

        let hit = this.collision(hatchs); // TODO check Player collision
        if (hit != false) {
            enemys.splice(me_i, 1);
            score++;
            explosions.push(new Explosion(hit.x, hit.y));
        }
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, EnemyWidth, EnemyHeight, this.x, this.y, EnemyWidth, EnemyHeight);
    };
    this.collision = function(tabOfObjects){
        for(let index=0; index<tabOfObjects.length; index++){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    tabOfObjects.splice(index, 1);
                    this.life--;
                    if (this.life <= 0) return {x: this.x, y: this.y};
                    else return false;
            }
        }
        return false;
    };
}
/////////////////////////////////


/////////////////////////////////
//Explosion
var explosions = [];
const ExplosionWidth = 128,
    ExplosionHeight = 128;
function Explosion(x, y, size){
    this.img = new Image();
    this.img.src = './assets/Enemy/explosionSpritesheet_1280x128.png';
    this.x = x-10;
    this.y = y-10;
    this.width = ExplosionWidth;
    this.height = ExplosionHeight;
    this.imgy = 0;
    this.imgx = 128;
    this.clear = function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
    };
    this.update = function(p, me_i){
        if (p) {
            this.imgx += ExplosionWidth;
            if (this.imgx >= ExplosionWidth *10) explosions.splice(me_i, 1);
        }
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, this.width, this.height, this.x, this.y, this.width/2, this.height/2);
    };
}
/////////////////////////////////


/////////////////////////////////
// BOSS
var boss;
const BossHeight = 96,
    BossWidth = 96,
    BossImgHeight = 128,
    BossImgWidth = 128,
    BossXSpeed = 0.8,
    BossYSpeed = 2;
const RingHeight = 96,
    RingWidth = 96,
    RingImgHeight = 256,
    RingImgWidth = 256;

function Boss(){
    this.img = new Image();
    this.img.src = './assets/Boss/head_sheet.png';
    this.iron = new Image();
    this.iron.src = './assets/Boss/ring.png';
    this.life = 10;
    this.iron_life = 50;
    this.width = BossWidth;
    this.height = BossHeight;
    this.x = ArenaWidth;
    this.y = ArenaHeight/2-BossHeight/2;
    this.imgy = 0;
    this.imgx = 0;
    this.nexts_pos = [];
    for (let xp=ArenaWidth ; xp >= 0 ; xp-=ArenaWidth/25)
        this.nexts_pos.push({x: xp, y: rand(ArenaHeight-this.height)});
    this.next_p = this.nexts_pos[0];
    this.clear = function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
    };
    this.update = function(p_change){
        this.x -= BossXSpeed;
        this.y += (this.y-this.next_p.y < 0) ? BossYSpeed : -1*BossYSpeed;

        // change next position
        if (this.x <= this.next_p.x && this.nexts_pos.length > 1) {
            this.nexts_pos.shift();
            this.next_p = this.nexts_pos[0];
        }
        // sprite switch
        if (p_change) {
            this.imgy += BossImgHeight;
            this.imgy = this.imgy%(6*BossImgHeight);
        }
        if (this.x < 0) end();

        let hit = this.collision(hatchs); // TODO check Player collision
        if (hit != false) {
            boss = null;
            score++;
            explosions.push(new Explosion(hit.x, hit.y));
            win();
        }
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, BossImgWidth, BossImgHeight, this.x, this.y, this.width, this.height);
        if (this.iron_life > 0) conArena.drawImage(this.iron, 0, 0, RingImgWidth, RingImgHeight, this.x, this.y, RingWidth, RingHeight);
    };
    this.collision = function(tabOfObjects){
        for(let index=0; index<tabOfObjects.length; index++){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    tabOfObjects.splice(index, 1);
                    this.iron_life--;
                    if (this.iron_life <= 0) {
                        this.life--;
                        if (this.life <= 0) return {x: this.x, y: this.y};
                    }
                    return false;
            }
        }
        return false;
    };
}
/////////////////////////////////


function updateText() {
    clearText();
    conArena.font = "18px Arial";
    conArena.fillText("Level : "+level, 50, 30);
    conArena.fillText("Score : "+score, 50, 50);
}
function updateScene() {
    "use strict";
    xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems(p) {
    "use strict";
    clearItems();
    if (p) {
        PlayerImgY += PlayerImgHeight;
        PlayerImgY = PlayerImgY%(PlayerImgHeight*4);
    }

    // Enemy generation
    i++;
    if (i%100 == 0)
        enemys.push(new Enemy(ArenaWidth, Math.random() * (ArenaHeight - EnemyHeight)));

    if (i%1500 == 0) level++;
    if (level == 6 && boss == null) boss = new Boss();

    let keycode;
    for (keycode in keyStatus) {
        if(keyStatus[keycode] == true){
            if(keycode == keys.UP && yPlayer > 0)
                yPlayer -= yPlayerSpeed;

            if(keycode == keys.DOWN && yPlayer < ArenaHeight - PlayerHeight)
                yPlayer += yPlayerSpeed;

            if(keycode == keys.SPACE && p)
                hatchs.push(new Hatch(xPlayer+PlayerWidth, yPlayer+4));
        }
    }

    hatchs.map((h, index) => h.update(p, index));
    enemys.map((en, index) => en.update(p, index));
    explosions.map((ex, index) => ex.update(p, index));

    if (boss != null) boss.update();
}
function drawScene() {
    "use strict";
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict";
    conArena.drawImage(imgPlayer, 0, PlayerImgY, PlayerImgWidth, PlayerImgHeight, xPlayer, yPlayer,PlayerWidth, PlayerHeight);
    hatchs.map((h) => h.draw());
    enemys.map((en) => en.draw());
    explosions.map((ex) => ex.draw());
    if (boss != null) boss.draw();
}
function clearItems() {
    "use strict";
    conArena.clearRect(xPlayer,yPlayer,PlayerWidth,PlayerHeight);
    hatchs.map((h) => h.clear());
    enemys.map((en) => en.clear());
    explosions.map((ex) => ex.clear());
    if (boss != null) boss.clear();
}
function clearText() {
    "use strict";
    conArena.clearRect(0, 0, 200, 150);
}

function updateGame(p) {
    "use strict";
    updateScene();
    updateItems(p);
    updateText();
}

function drawGame() {
    "use strict";
    drawScene();
    drawItems();
}


function mainloop (p) {
    "use strict";
    updateGame(p);
    drawGame();
}

function recursiveAnim (timestamp) {
    "use strict";
    if (start == null) start = timestamp;
    let progress = timestamp - start;
    if (progress > 100) start = timestamp;
    mainloop(progress > 100);
    if (status == _Status.IN_GAME) animFrame( recursiveAnim );
}

function lose() {
    end("Game over !");
}

function win() {
    end("Good job ! you defeat the BOSS !");
}

function end(msg){
    // TODO add btn to restart (or tap enter or another key)
    clearText();
    status = _Status.END;
    conArena.font = "30px Arial";
    conArena.fillText(msg, ArenaWidth/2 ,ArenaHeight/2);
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
}

function init() {
    "use strict";
    divArena = document.getElementById("arena");
    canArena = document.createElement("canvas");
    canArena.setAttribute("id", "canArena");
    canArena.setAttribute("width", ArenaWidth);
    canArena.setAttribute("height", ArenaHeight);
    conArena = canArena.getContext("2d");
    divArena.appendChild(canArena);

    conArena.fillStyle = "white";
    conArena.textAlign = "center";

    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);

    i = 0;
    score = 0;
    level = 1;
    hatchs = [];
    enemys = [];
    boss = null;

    animFrame( recursiveAnim );
}

window.addEventListener("load", init, false);
