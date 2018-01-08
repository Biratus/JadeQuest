var Platformer = Platformer || {};
var currEn;
Platformer.Enemy = function (level_state, position, properties) {
    "use strict";
    Platformer.Prefab.call(this, level_state, position, properties);
    
    /*
        Properties
    */
    this.life={};
    this.delay={};
    //this.sight;
    this.weapon=properties.power;
    
    this.init_prop(properties.mobile);
    
    this.life.life_grp=this.game.add.group();
    var bg=this.game.add.image(0,0,'life_en_bg',0,this.life.life_grp);
    this.life.bar=this.game.add.image(1,1,'life_en_bar',0,this.life.life_grp);
    this.life.coef=38/this.life.val;
    
    this.delay.last_time_update=0;
    this.delay.hurt={"val":0,"current":0};
    this.delay.attack.current=0;
    
    this.hurt=false;
    this.spot_player=false;
    this.player;
    
    this.audio={};
    this.audio.katana=this.game.add.audio('katana');
    this.audio.punch=this.game.add.audio('punch');
    this.audio.punch.volume=0.5;
    this.audio.shuriken=this.game.add.audio('shuriken');
    this.alpha_sign=-1;
    
    /*
        Animations
    */
    this.animations.add('idle',[0,1,2,3,4,3,2,1],13,true);
    this.animations.add('punch_move',[5,6],4,false);
    this.animations.add('katana',[7,8,9,10,11],13,false);
    this.animations.add('move',[12,13,14,15,16,17,18,19],12,true);
    this.animations.add('punch_1',[20,21,22],6,false);
    this.animations.add('punch_0',[24,25,26,27,28,29,30,31,32],38,false);
    this.animations.add('shuriken',[33,44,35],12,false);
    var h=this.animations.add('hit',[36,37,38,39,40,41,42,43,44,45],7,false);
    h.onStart.add(function(){this.hit=true;},this);
    h.onComplete.add(function(){
        this.hit=false;
        if(this.life.val<=0) {
            if(this.danger) this.danger.destroy();
            this.life.life_grp.destroy();
            this.destroy();
        }
    },this);
    this.frame_to_col={
        'idle':{"w":80,"h":105},
        'punch_move':{"w":135,"h":95},
        'katana':{"w":180,"h":140},
        'move':{"w":85,"h":100},
        'punch_1':{"w":160,"h":125},
        'punch_0':{"w":137,"h":115},
        'shuriken':{"w":70,"h":110},
        'hit':{"w":90,"h":90},
    }; //to resize body
    this.frame = 0;
    
    /*
        Shape
    */
    this.level_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds=true;
    this.body.velocity.x = properties.direction;
    this.scale.setTo(properties.direction*0.5, 0.5);
    this.anchor.setTo(0.5,1);
};

Platformer.Enemy.HURT_DELAY_PUNCH=1300;
Platformer.Enemy.HURT_DELAY_SHURIKEN=1500;
Platformer.Enemy.HURT_DELAY_KATANA=2000;

Platformer.Enemy.PUNCH=1;
Platformer.Enemy.SHURIKEN=2;
Platformer.Enemy.KATANA=3;

Platformer.Enemy.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Enemy.prototype.constructor = Platformer.Enemy;
 
Platformer.Enemy.prototype.update = function () {
    "use strict";
    //init some properties
    if(!this.player) {//On first time 
        this.player=this.level_state.player;
        
        if(this.walk.distance) {
            this.walk.left=(this.body.x-this.walk.distance<0)?0:this.body.x-this.walk.distance;
            this.walk.right=(this.body.x+this.walk.distance>this.level_state.game.world.right)?this.level_state.game.world.right:this.body.x+this.walk.distance;
        }
        if(this.player.power=='wisdom') {
            this.danger=this.game.add.image(this.body.center.x,this.body.center.y,'danger');
            this.game.add.tween(this.danger).to({"alpha":0},800,Phaser.Easing.Quadratic.Out,true,10,true,true).loop(true);
        }
    }
    //collision
    this.level_state.game.physics.arcade.collide(this,this.level_state.layers.hide,function() {
        if(this.body.blocked.left) this.walk.left=this.body.x+1;
        else if(this.body.blocked.right) this.walk.right=this.body.right-1;
    },null,this);
    var vel=this.body.velocity.y;
    this.level_state.game.physics.arcade.collide(this, this.level_state.layers.collision,function(){
        if(this.body.blocked.left) this.walk.left=this.body.x+1;
        else if(this.body.blocked.right) this.walk.right=this.body.right-1;
    },null,this);
    if(this.hit && this.body.velocity.y==0 && this.animations.currentFrame.index<=40) this.body.velocity.y=vel;
    if(this.body.blocked.down && this.hit && this.animations.currentFrame.index>40) {//hit the ground when hit
        if(this.walk.distance) {
            this.walk.left=(this.body.x-this.walk.distance<0)?0:this.body.x-this.walk.distance;
            this.walk.right=(this.body.x+this.walk.distance>this.level_state.game.world.right)?this.level_state.game.world.right:this.body.x+this.walk.distance;
        }
        this.body.velocity.y=0;
        this.body.velocity.x=0;
    }
    //hurt
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
    //life ui
    this.life.life_grp.x=this.body.x+5;
    this.life.life_grp.y=this.body.y-30;
    this.life.bar.width=this.life.val*this.life.coef;
    
    //AI
    var spotted_before=this.spot_player;
    var coefSpot=(spotted_before)?this.sight*0.5:0;
    this.spot_player=(this.level_state.game.physics.arcade.distanceBetween(this,this.player,true) <= this.sight+coefSpot
                     && this.body.bottom-this.player.body.bottom<=50 && this.body.bottom-this.player.body.bottom>=0);
    if(this.spot_player && !this.hit) {//Player spotted !!
        //Attack
        if(this.delay.attack.current<=0 ) {
            var anim=this.attack_anim;
            if(this.body.velocity.x<=10 && this.body.velocity.x>=-10 && anim=="punch") {
                this.body.velocity.x=0;
                anim+="_"+game.rnd.integerInRange(0,1);;
            }
            else if(anim=="punch") anim+="_move";
            if(anim=='shuriken' || anim=='katana') this.body.velocity.x=0;
            if(!this.game.mute) this.audio[this.attack_anim].play();
            this.animations.play(anim);
            this.delay.attack.current=this.delay.attack.val;
            if(this.weapon==Platformer.Enemy.SHURIKEN) this.throwShurik();
        }
        else if(!this.isPunching()) {
            this.animations.play('move');
            
            //Move to player
            if(this.body.center.x<this.player.body.center.x && !this.body.blocked.right) {
                this.body.velocity.x=Math.abs(this.body.velocity.x)+1;
                this.scale.setTo(0.5);
            }
            else if(!this.body.blocked.left) {
                this.body.velocity.x= -Math.abs(this.body.velocity.x)+1;
                this.scale.setTo(-0.5,0.5);
            }
        } 
        
    }
    else {
        //display danger sign on screen
        var r_cam=new Phaser.Rectangle().copyFrom(this.game.camera);
        var r_en=new Phaser.Rectangle().copyFrom(this.body);
        if(this.player.power=='wisdom') {
            var r_cam_horiz=new Phaser.Rectangle(0,this.game.camera.y,this.game.world.width,this.game.camera.height);
            var r_cam_vert=new Phaser.Rectangle(this.game.camera.x,0,this.game.camera.width,this.game.world.height);
            
            if(r_cam.containsRect(r_en)) this.danger.exists=false;
            else if(r_cam_horiz.containsRect(r_en)) {//in horizontal view
                this.danger.exists=true;
                this.danger.y=this.body.center.y;
                if(this.body.right<this.game.camera.x) this.danger.x=this.game.camera.x+5;
                else if(this.body.x>this.game.camera.x+900) this.danger.x=this.game.camera.x+900-this.danger.width-5;
            }
            else if(r_cam_vert.containsRect(r_en)) {//in vertical view
                this.danger.exists=true;
                this.danger.x=this.body.center.x;
                if(this.body.bottom<this.game.camera.y) this.danger.y=this.game.camera.y+5;
                else if(this.body.top>this.game.camera.y+500) this.danger.y=this.game.camera.y+500-this.danger.height-5;
            }
            else this.danger.exists=false;
        }
        
        if(spotted_before && !this.has_called) this.call_others();
        r_cam=r_cam.inflate(30,30);
        if(this.walk.distance && r_cam.containsRect(r_en) && !this.hurt) {
            //redefine walk limits if keeping guard
            if(!this.body.blocked.down) {//sprite about to fall
                if(this.body.velocity.x<0){//going left
                    this.body.x=this.body.right;
                    this.walk.left=this.body.x;
                }
                else if(this.body.velocity.x>0) {//going right
                    this.walk.right=this.body.x;
                    this.body.x-=this.body.width;
                }
            }
            if(!this.hit) this.keepGuard();
        }
        else if(!this.hit) {
            this.body.velocity.x=0;
            this.animations.play('idle');
        }
    }    
    if(this.body.velocity.x!=0 && !this.hit) {
        if(this.hurt) this.body.velocity.x=0.5*this.walk.speed*(this.body.velocity.x/Math.abs(this.body.velocity.x));
        else this.body.velocity.x=this.walk.speed*(this.body.velocity.x/Math.abs(this.body.velocity.x));
    }
    this.reSize();
    
    if (this.body.bottom >= this.level_state.game.world.height) {//dies if touches bottom screen
        this.body.allowGravity=false;
        this.animations.stop();
        this.body.velocity.y=0;
        this.body.velocity.x=0;
        this.frame=36;
        setTimeout(function(en){
            if(this.danger) en.danger.destroy();
            en.life.life_grp.destroy();
            en.destroy();
        },1000,this);
    }
};

Platformer.Enemy.prototype.call_others=function() {
    //display img
    var i=this.game.add.image(this.body.x,this.body.y-50,'alert');
    this.has_called=true;
    this.walk.distance=0;
    setTimeout(function(i,en){
        var t=en.level_state.game.add.tween(i).to({"alpha":0},300,Phaser.Easing.Quadratic.In,true);
        t.onComplete.add(function(a) {
            a.destroy();
        },en);
        en.walk.distance=Platformer.Enemy.getWalkDistance(en.weapon);
    },1000,i,this);
    //alert others
    for (var i in this.level_state.objects) {
        var obj=this.level_state.objects[i];
        if(obj!=this && obj instanceof Platformer.Enemy && !obj.walk.distance)
            obj.walk.distance=Platformer.Enemy.getWalkDistance(obj.weapon);
    }
}

Platformer.Enemy.prototype.takeDamage=function(dmg,delay,recoil) {
    if(this.hurt) return;
    this.life.val-=dmg;
    this.recoil(recoil);
    this.hurt=true;
    this.delay.hurt.current=delay;
}
Platformer.Enemy.prototype.init_prop=function(mobile) {
    this.walk={};
    this.delay.attack={};
    switch (this.weapon) {
        case Platformer.Enemy.PUNCH:
            this.sight=150,this.walk.distance=mobile?210:0,this.walk.speed=40,this.delay.attack.val=700,this.damage={"value":0.5,"power":2,"delay":Platformer.Enemy.HURT_DELAY_PUNCH},this.life.val=5;
            this.attack_anim="punch";
            break;
        case Platformer.Enemy.SHURIKEN:
            this.sight=190,this.walk.distance=mobile?150:0,this.walk.speed=60,this.delay.attack.val=1000,this.damage={"value":0.5,"power":2,"delay":Platformer.Enemy.HURT_DELAY_PUNCH},this.life.val=8;
            this.attack_anim="shuriken";
            break;
        case Platformer.Enemy.KATANA:
            this.sight=240,this.walk.distance=mobile?100:0,this.walk.speed=90,this.delay.attack.val=1400,this.damage={"value":2,"power":3,"delay":Platformer.Enemy.HURT_DELAY_KATANA},this.life.val=10;
            this.attack_anim="katana";
            break;
    }
}
Platformer.Enemy.prototype.decreaseDelay=function() {
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
Platformer.Enemy.prototype.reSize=function() {
    if(!this.animations.currentAnim) return;
    var col=this.frame_to_col[this.animations.currentAnim.name];
    this.body.setSize(col.w,col.h,-0.5*(col.w-this._frame.width),this._frame.height-col.h);
}
Platformer.Enemy.prototype.keepGuard=function() {
    this.animations.play('move');
    if(this.body.velocity.x==0) this.body.velocity.x=2*this.scale.x*this.walk.speed;
    if (this.body.x<=this.walk.left || this.body.right>=this.walk.right) {//out of bounds    
        if(this.body.x<=this.walk.left) {
            this.body.velocity.x=-this.walk.speed;
            this.body.x=this.walk.left+1;
        }
        else if(this.body.right>=this.walk.right) {
            this.body.velocity.x=this.walk.speed;
            this.body.x=this.walk.right-this.body.width-2;
        }
        this.body.velocity.x *= -1;
        this.scale.setTo(-this.scale.x, 0.5);
    }
}
Platformer.Enemy.prototype.throwShurik=function() {
    var prop=Platformer.Weapon.getProp(Platformer.Weapon.SHURIKEN_ENEMY);
    var pos=(this.body.facing!=Phaser.LEFT)?{"x":this.body.right,"y":this.body.y+20}:{"x":this.body.x,"y":this.body.y+20};
    var dir=(this.body.facing!=Phaser.LEFT)?1:-1;
    prop.velocity={"x":dir*prop.speed,"y":0};
    var shu=new Platformer.Shuriken(this.level_state,pos,prop,this);
}
Platformer.Enemy.prototype.showSight=function() {
    game.graphics.beginFill(0xff0000);
    game.graphics.fillAlpha=0.3;
    game.graphics.drawCircle(this.body.center.x,this.body.center.y,this.sight*1.7);
    game.graphics.endFill();
}
Platformer.Enemy.prototype.isPunching=function() {
    return ((this.animations.currentAnim.name==this.attack_anim && this.animations.currentAnim.isPlaying) || 
            (this.animations.currentAnim.name.split('_')[0]=='punch' && this.animations.currentAnim.isPlaying) );
}
Platformer.Enemy.getWalkDistance=function(power) {
    switch(power) {
        case Platformer.Enemy.PUNCH: return 210;
        case Platformer.Enemy.SHURIKEN: return 150;
        case Platformer.Enemy.KATANA: return 100;
    }
}

Platformer.Enemy.prototype.recoil=function(coef) {
    this.animations.stop();
    this.animations.play('hit');
    this.body.velocity.x=100*coef;
    this.body.velocity.y=-200*Math.abs(coef);
}