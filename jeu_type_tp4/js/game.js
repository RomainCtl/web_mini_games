var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;
var start = null;

//Canvas
var divArena;
var canArena;
var conArena;
var ArenaWidth = 500;
var ArenaHeight = 300;

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
    PlayerHeight = 15,
    PlayerWidth = 32,
    PlayerImgHeight = 29,
    PlayerImgWidth = 64;
/////////////////////////////////


/////////////////////////////////
// Hatch
var hatchs = [];
const HatchHeight = 16,
    HatchWidth = 16,
    HatchSpeed = 1;
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
    this.update = function(p){
        this.x += HatchSpeed;
        if (p) {
            this.imgy += HatchHeight;
            this.imgy = this.imgy%(4*HatchHeight);
        }
        if (this.x >= ArenaWidth + HatchHeight) return false;
        return true;
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, HatchWidth, HatchHeight, this.x, this.y, HatchWidth/2, HatchHeight/2);
    };
    this.collision = function(tabOfObjects){
        for(let index=0; index<tabOfObjects.length; index++){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    return true;
            }
        }
        return false;
    };
}
/////////////////////////////////


/////////////////////////////////
// Enemy
var enemys = [];
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

function Enemy(x,y) {
    this.img = new Image();
    let r = Math.floor(Math.random() * 5);
    this.img.src = './assets/Enemy/'+enemy_skins[r];
    this.life = 1;
    this.x = x;
    this.y = y;
    this.width = EnemyWidth;
    this.height = EnemyHeight;
    this.imgy = 0;
    this.imgx = 0;
    this.clear = function(){
        conArena.clearRect(this.x,this.y,EnemyWidth,EnemyHeight);
    };
    this.update = function(p){
        let r = Math.random();
        if (r <= 0.4) {
            if (r <= 0.2 && this.y > 0) this.y -= EnemyYSpeed;
            else if (this.y < ArenaHeight - EnemyHeight) this.y += EnemyYSpeed;
        }
        this.x -= EnemyXSpeed;
        if (p) {
            this.imgy += EnemyHeight;
            this.imgy = this.imgy%(4*EnemyHeight);
        }
        if (this.x < 0) return false;
        return true;
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, EnemyWidth, EnemyHeight, this.x, this.y, EnemyWidth/2, EnemyHeight/2);
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
function Explosion(x, y){
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
    this.update = function(p){
        if (p) {
            this.imgx += ExplosionWidth;
            return this.imgx >= ExplosionWidth *10;
        } else return false
    };
    this.draw = function(){
        conArena.drawImage(this.img, this.imgx, this.imgy, this.width, this.height, this.x, this.y, this.width/4, this.height/4);
    };
}
/////////////////////////////////


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
    if (Math.random() <= 0.01)
        enemys.push(new Enemy(ArenaWidth, Math.random() * (ArenaHeight - EnemyHeight)));

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
    for(let h in hatchs) {
        let res = hatchs[h].update(p),
            hit = hatchs[h].collision(enemys);
        if (res == false || hit == true)
            hatchs.splice(h,1);
    }
    for(let en in enemys) {
        let res = enemys[en].update(p),
            hit = enemys[en].collision(hatchs); // TODO check Player collision
        if (res == false)
            end();
        if (hit != false) {
            enemys.splice(en, 1);
            explosions.push(new Explosion(hit.x, hit.y));
        }
    }
    for (let ex in explosions)
        if (explosions[ex].update(p) == true)
            explosions.splice(ex, 1);
}
function drawScene() {
    "use strict";
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict";
    conArena.drawImage(imgPlayer, 0, PlayerImgY, PlayerImgWidth, PlayerImgHeight, xPlayer, yPlayer,PlayerWidth, PlayerHeight);
    for (let h in hatchs)
        hatchs[h].draw();
    for (let en in enemys)
        enemys[en].draw();
    for (let ex in explosions)
        explosions[ex].draw();
}
function clearItems() {
    "use strict";
    conArena.clearRect(xPlayer,yPlayer,PlayerWidth,PlayerHeight);
    for (let h in hatchs)
        hatchs[h].clear();
    for (let en in enemys)
        enemys[en].clear();
    for (let ex in explosions)
        explosions[ex].clear();
}

function updateGame(p) {
    "use strict";
    updateScene();
    updateItems(p);
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

function end() {
    // TODO add btn to restart (or tap enter or another key)
    status = _Status.END;
    conArena.font = "30px Arial";
    conArena.fillStyle = "white";
    conArena.textAlign = "center";
    conArena.fillText("Game over !", ArenaWidth/2 ,ArenaHeight/2);
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

    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);

    animFrame( recursiveAnim );
}

window.addEventListener("load", init, false);
