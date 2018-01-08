//var Platformer = Platformer || {};

Platformer.Player = function (level_state, position, properties) {
    "use strict";
    
    Platformer.Prefab.call(this, level_state, position, properties);
    
    /*
        Properties
    */    
    if(properties.power) {
        this.power=properties.power;
        if(this.power=='strength') {//Has strength enhancement
            properties.damage=1.3;
            properties.walk_speed=350;
            properties.jump_speed=650;
        }
    }
    localStorage.setItem('player_prop',JSON.stringify(properties));
    this.level_state.player_prop=properties;
    this.walk_speed = properties.walk_speed;
    this.jump_speed = properties.jump_speed;
    this.damage={"current":"punch",
                 "punch":{"value":3*properties.damage,"delay":Platformer.Enemy.HURT_DELAY_PUNCH,"power":2},
                 "katana":{"value":5*properties.damage,"delay":Platformer.Enemy.HURT_DELAY_KATANA,"power":3.5}};
    
    this.hurt=false;
    this.alpha_sign=-1;
    this.delay={};
    this.delay.last_time_update=0;
    this.delay.shuriken={"val":500,"current":0};
    this.delay.katana={"val":1000,"current":0};
    this.delay.hurt={"val":1,"current":0};
    this.resources=properties.res;
    this.weapon=properties.weapon;
    this.scrolls=properties.scrolls;
    
    this.life=10;
    /*
        State
    */
    this.jumping=false;
    this.climbing=false;
    this.allowCollision=true;
    
    this.ladder={"overlap":null,"above":null};
    
    this.cursorEnabled=true;
    
    /*
        Animations
    */
    this.animations.add('hit',[0,1,2,3,4,5,6,7,8,9],7,false);
    this.animations.add('idle',[10,11,12,13,14,13,12,11],13,true);
    this.animations.add('katana',[15,16,17,18,19],13,false);
    this.animations.add('jump',[20,21,22,23,24,25,26],8,false);
    this.animations.add('punch_1',[27,28,29],6,false);
    this.animations.add('punch_0',[30,31,32,33,34,35,36,37,38],38,false);
    this.animations.add('move',[40,41,42,43,44,45,46,47],16,true);
    this.animations.add('punch_move',[48,49],4,false);
    this.animations.add('climb',[50,51,52,53,54,55,56],16,true);
    this.animations.add('shuriken',[57,58,59],12,false);
    this.animations.add('punch_j_0',[65,66],8,false);
    this.animations.add('punch_j_1',[60,61,62,63,64],32,false);
    this.frame_to_col={
        'idle':{"w":80,"h":105},
        'climb':{"w":85,"h":125},
        'punch_move':{"w":135,"h":95},
        'punch_j_1':{"w":155,"h":110},
        'katana':{"w":180,"h":140},
        'move':{"w":85,"h":100},
        'punch_1':{"w":160,"h":125},
        'punch_0':{"w":137,"h":115},
        'shuriken':{"w":70,"h":110},
        'hit':{"w":90,"h":90},
        'punch_j_0':{"w":157,"h":140},
        'jump':{"w":80,"h":80},
    }; //to resize body
    this.frame = 0;
    
    /*
        Audio
    */
    this.audio={};
    this.audio.jump=this.game.add.audio('jump');
    this.audio.jump.volume=0.2;
    this.audio.katana=this.game.add.audio('katana');
    this.audio.punch=this.game.add.audio('punch');
    this.audio.shuriken=this.game.add.audio('shuriken');
    /*
        Input
    */
    this.keyboard=[];
    this.keyboard.push({"wasDown":false,"input":this.level_state.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)});
    this.cursors = this.level_state.game.input.keyboard.createCursorKeys();
    
    
    /*
        Physics
    */
    this.level_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    this.anchor.setTo(0.5,1);
    this.scale.setTo(0.5);
};

Platformer.Player.CLIMB_ENTER=0;
Platformer.Player.CLIMB_UP=1;
Platformer.Player.CLIMB_DOWN=2;
Platformer.Player.CLIMB_STOP=3;

Platformer.Player.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Player.prototype.constructor = Platformer.Player;
 
Platformer.Player.prototype.update = function () {
    "use strict";
    var was_hurt=this.hurt;
    this.decreaseDelay();
    
    if(this.delay.hurt.current>0) {
        this.hurt=true;
        if(this.alpha+0.1*this.alpha_sign<=0.5 || this.alpha+0.1*this.alpha_sign>1) this.alpha_sign*=-1;
        this.alpha+=0.1*this.alpha_sign;
    }
    else if(was_hurt) {
        this.hurt=false;
        this.alpha=1;
        this.alpha_sign=-1;
    }
    
    this.check_Collision();
    if(!this.ladder.overlap) {
        this.climbing=false;
        this.body.allowGravity=true;
        this.allowCollision=true;
    }
    
    this.init_collision();
    if(this.life<=0) this.level_state.restart_level();
    else if(this.body.blocked.down || this.body.touching.down) {
        this.jumping=false;
        this.climbing=false;
        if(this.animations.currentAnim.name=='hit' && this.animations.currentAnim.isPlaying && this.animations.currentFrame.index>3) {
            this.body.velocity.x=0;
            this.body.velocity.y=0;
        }
    }
    if(this.cursorEnabled) this.input_handler();//defines what to do depending on key pressed and collision
    if (this.body.bottom >= this.level_state.game.world.height && !this.dead) {//dies if touches bottom screen
        this.cursorEnabled=false;
        this.animations.stop();
        this.body.allowGravity=false;
        this.body.velocity.y=0;
        this.body.velocity.x=0;
        this.frame=0;
        this.dead=true;
        setTimeout(function(state){
            state.restart_level();
        },1000,this.level_state);
    }
};
/*

-------------------------
        INITIALIZE
-------------------------

*/

Platformer.Player.prototype.init_collision=function() {
    this.reSize();
    this.level_state.game.physics.arcade.collide(this, this.level_state.layers.collision,function() {return true;},function() {return this.allowCollision;},this);
    this.level_state.physics.arcade.overlap(this,this.level_state.layers.hide,this.level_state.reveal_hidden,null,this.level_state);
    this.level_state.game.physics.arcade.collide(this,this.level_state.groups.effect,function(player,platform) {
        if(platform.body.touching.up) this.body.blocked.down=true;
        else if(this.body.blocked.down && platform.body.touching.down) this.level_state.restart_level();
    },null,this);
    this.level_state.game.physics.arcade.overlap(this, this.level_state.groups.enemies,this.collide_enemy,null,this);
}
Platformer.Player.prototype.check_Collision=function() {
    //ladder collision
    var ladders=this.level_state.ladders;
    if(!ladders.length) return;
    this.ladder.above=null;
    this.ladder.overlap=null;
    ladders.forEach(function(l){
        var a=this.is_above_ladder(l);
        if(a>=0 && a<=2) this.ladder.above=l;
        else if (l.overlapPlayer(this)) this.ladder.overlap=l;
    },this);
    
}
/*

-------------------------
        MOVEMENT
-------------------------

*/
Platformer.Player.prototype.climb=function(val){//called because player overlap ladder
    this.climbing=true;
    switch(val) {
        case Platformer.Player.CLIMB_UP:
            if(this.body.bottom<this.ladder.overlap.top) return;
            if (this.body.x!=this.ladder.overlap.centerX-this.body.halfWidth) this.body.x=this.ladder.overlap.centerX-this.body.halfWidth; //center body on ladder
            this.body.allowGravity=false;
            this.allowCollision=false;
            //animations
            if(this.animations.name!='climb') this.animations.stop();
            this.animations.play('climb');
            //velocity y
            this.body.velocity.y=-150;
        break;
        case Platformer.Player.CLIMB_DOWN:
            //center body on ladder
            if(this.ladder.above) this.body.x!=this.ladder.above.centerX-this.body.halfWidth;
            else if (this.body.x!=this.ladder.overlap.centerX-this.body.halfWidth) this.body.x=this.ladder.overlap.centerX-this.body.halfWidth;
            
            this.body.allowGravity=false;
            if(!this.ladder.above && this.body.y>this.ladder.overlap.ladder_top_bottom)//if beneath top ladder
                this.allowCollision=true;
            else this.allowCollision=false;
            this.ladder.above=null;
            //animations
            if(this.animations.name!='climb') this.animations.stop();
            this.animations.play('climb');
            //velocity y
            this.body.velocity.y=200;
        break;
        case Platformer.Player.CLIMB_STOP:
            this.txt1="stop";
            
            this.body.allowGravity=false;
            this.body.velocity.y=0;
            this.frame=(this.animations.name=='climb')?this.animations.currentFrame:this.frame=0;
            this.animations.stop();
        break;
        case Platformer.Player.CLIMB_ENTER:
            this.txt1="enter";
            this.body.velocity.x=0;
            this.cursors.right.reset(true);
            this.cursors.left.reset(true);
            this.body.x=this.ladder.overlap.centerX-this.body.halfWidth;//center body on ladder
        break;
    }
}
Platformer.Player.prototype.jump=function(coef) {
    this.jumping=true;
    this.animations.play('jump');
    if(!this.game.mute) this.audio.jump.play();    
    this.body.velocity.y = -coef;
    this.frame=2;
}
Platformer.Player.prototype.crouch=function() {
    if(this.body.velocity.x!=0) {
        this.body.velocity.x=(this.body.velocity.x>0)?this.walk_speed/2:-this.walk_speed/2;
    }
    if(this.body.blocked.down || this.body.touching.down) this.body.velocity.x=0;
    this.animations.stop();
    this.frame=39;
}
Platformer.Player.prototype.recoil=function(coef) {
    this.animations.stop();
    this.animations.play('hit');
    this.body.velocity.x=100*coef;
    this.body.velocity.y=-200*Math.abs(coef);
    this.cursorEnabled=false;
    this.level_state.game.input.keyboard.reset();
    for (var i in this.keyboard) {
        this.keyboard[i].input.reset();
    }
}
/*

-------------------------
        WEAPONS
-------------------------

*/
Platformer.Player.prototype.punch=function() {
    var anim='punch';
    
    if(this.jumping || this.body.velocity.x==0) {
        if(this.jumping) anim+="_j";
        anim+="_"+game.rnd.integerInRange(0,1);
    }
    else if (this.body.velocity.x != 0) anim+="_move";
    this.animations.play(anim);
    this.damage.current="punch";
}

Platformer.Player.prototype.shuriken=function() {
    if(this.delay.shuriken.current>0) return;
    this.animations.play('shuriken');
    this.damage.current="punch";
    var prop=Platformer.Weapon.getProp(Platformer.Weapon.SHURIKEN_NORMAL);
    var pos=(this.scale.x>0)?{"x":this.body.right,"y":this.body.y+20}:{"x":this.body.x,"y":this.body.y+20};
    var dir=(this.scale.x>0)?1:-1;
    prop.velocity={"x":dir*prop.speed,"y":0};
    var shu=new Platformer.Shuriken(this.level_state,pos,prop,this);
    this.delay.shuriken.current=this.delay.shuriken.val;
}

Platformer.Player.prototype.katana=function() {
    if(this.delay.katana.current>0) return;
    this.audio.katana.play();
    this.animations.play('katana');
    this.damage.current="katana";
    this.delay.katana.current=this.delay.katana.val;
}
/*

-------------------------
        COLLISION
-------------------------

*/
Platformer.Player.prototype.collide_enemy=function (player,enemy) {
    if(enemy.hurt && !enemy.isPunching()) return false;
    if(this.isPunching()) {
        var damage=this.damage[this.damage.current];
        if(this.body.x>enemy.body.x && this.scale.x<0) { //punch right
            enemy.takeDamage(damage.value,damage.delay,-damage.power);
        }
        else if(this.body.right<enemy.body.right  && this.scale.x>0) { //punch left
            enemy.takeDamage(damage.value,damage.delay,damage.power);
        }
    }
    if(enemy.alive && enemy.isPunching() && !this.hurt) {
        var damage=enemy.damage;
        if(this.body.x<enemy.body.x && enemy.scale.x<0) { //punch right
            this.takeDamage(damage.value,damage.delay,-damage.power);
        }
        else if(this.body.right>enemy.body.right && enemy.scale.x>0) { //punch left
            this.takeDamage(damage.value,damage.delay,damage.power);
        }
    }
}
Platformer.Player.prototype.takeDamage=function(dmg,delay,recoil) {
    this.life-=dmg;
    if(this.life<=0) this.level_state.restart_level();
    else {
        this.recoil(recoil);
        this.hurt=true;
        this.delay.hurt.current=delay;
        setTimeout(function(player){player.cursorEnabled=true},800,this);
    }
}

/*

-------------------------
        HANDLER
-------------------------

*/
Platformer.Player.prototype.input_handler=function() {
    if(this.cursors.left.isUp && this.cursors.right.isUp && !this.jumping) this.body.velocity.x=0;
    if(this.cursors.up.isDown) {// UP!
        this.txt2="UP";
        if(this.level_state.in_basic) this.level_state.input.up=true;
        if(this.body.blocked.down || this.body.touching.down) {
            if(this.ladder.overlap) this.climb(Platformer.Player.CLIMB_UP);
            else this.jump(this.jump_speed);
        }
        else if(this.climbing && !this.ladder.above) this.climb(Platformer.Player.CLIMB_UP);
        else if(this.ladder.overlap) this.climb(Platformer.Player.CLIMB_ENTER);        
    }
    else if(this.cursors.down.isDown) {
        this.txt2="DOWN";
        if(this.level_state.in_basic) this.level_state.input.down=true;
        
        if(this.ladder.above && this.is_above_ladder(this.ladder.above)<=3) {
            if(this.body.velocity.x!=0) {
                this.cursors.left.reset();
                this.cursors.right.reset();
            }
            this.climb(Platformer.Player.CLIMB_DOWN);
        }
        else if(this.climbing) {
            if(this.body.blocked.down || this.body.touching.down) this.crouch();
            else this.climb(Platformer.Player.CLIMB_DOWN);
        }
        else this.crouch();
    }
    if (this.cursors.right.isDown){
        if(this.level_state.in_basic) this.level_state.input.right=true;
        this.txt1="move right";
        this.txt2="RIGHT";
        if(this.body.velocity.x<=0) this.body.velocity.x = this.walk_speed;
        if(!this.isPunching() && !this.jumping) this.animations.play('move');
        this.reSize();
        this.scale.setTo(0.5);
        if(this.climbing) this.body.x=this.ladder.overlap.right+7;
    }
    else if (this.cursors.left.isDown){
        if(this.level_state.in_basic) this.level_state.input.left=true;
        this.txt1="move left";
        this.txt2="LEFT";
        if(this.body.velocity.x>=0) this.body.velocity.x = -this.walk_speed;
        if(!this.isPunching() && !this.jumping) this.animations.play('move');
        this.reSize();
        this.scale.setTo(-0.5, 0.5);
        if(this.climbing) this.body.x=this.ladder.overlap.left-this.body.width;
    }
    if(this.cursors.up.isUp && this.cursors.down.isUp && this.cursors.left.isUp && this.cursors.right.isUp) {//stop
        this.body.velocity.x = 0;
        if(!this.jumping && !this.climbing && !this.isPunching() && !this.hurt) this.animations.play('idle');
        else if(this.climbing) this.climb(Platformer.Player.CLIMB_STOP);
    }
    for(var i in this.keyboard) {
        if(this.keyboard[i].input.isDown) this.keyboard[i].wasDown=true;
        else if(this.keyboard[i].wasDown && this.keyboard[i].input.isUp) {
            this.keyboard[i].wasDown=false;
            switch(this.keyboard[i].input.keyCode) {
                case Phaser.Keyboard.SPACEBAR:
                    if(this.level_state.in_basic) this.level_state.input.spacebar=true;
                    if(!this.game.mute) this.audio[this.weapon].play();
                    switch(this.weapon) {
                        case "punch" : this.punch(); break;
                        case "katana" : this.katana(); break;
                        case "shuriken" : this.shuriken(); break;
                    }
                    break;
            }
        }
    }
}

/*

-------------------------
        OTHER
-------------------------

*/
Platformer.Player.prototype.reSize=function() {
    if(!this.animations.currentAnim) return;
    var col=this.frame_to_col[this.animations.currentAnim.name];
    this.body.setSize(col.w,col.h,-0.5*(col.w-this._frame.width),this._frame.height-col.h);
}
//return value of distance between top of ladder (param) and bottom of player's body 
Platformer.Player.prototype.is_above_ladder=function(ladder) {
    if( ( this.body.right>=ladder.left && this.body.right<=ladder.right ) 
          || ( this.body.x>=ladder.left && this.body.x<=ladder.right )) {
            if(Math.floor(this.body.bottom)<=ladder.top) return ladder.top-Math.floor(this.body.bottom);//player on top of ladder
            else return -1;
    }
    else return-1;
}
Platformer.Player.prototype.isPunching=function() {
    return (this.animations.currentAnim.name.split('_')[0]=='punch' && this.animations.currentAnim.isPlaying) || (this.animations.currentAnim.name=='shuriken' && this.animations.currentAnim.isPlaying) ||
        (this.animations.currentAnim.name=='katana' && this.animations.currentAnim.isPlaying);
}
Platformer.Player.prototype.decreaseDelay=function() {
    var process=[];//array of delay to decrease;
    for (var key in this.delay) {
        if(this.delay[key].hasOwnProperty("current")) {
            if(this.delay[key].current>0) process.push(key);
        }
    }
    if(!process.length) {//if no delay activated
        this.delay.last_time_update=0;
        return;
    }
    if(this.delay.last_time_update==0) this.delay.last_time_update=new Date().getTime();
    else {
        var interval=new Date().getTime()-this.delay.last_time_update;
        for (var i in process) {
            this.delay[process[i]].current-=interval;
        }
        this.delay.last_time_update=new Date().getTime();
    }
}