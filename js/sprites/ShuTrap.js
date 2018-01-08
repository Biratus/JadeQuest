var Platformer= Platformer || {}

Platformer.ShuTrap=function(level_state,position,properties) {
    Platformer.Effect.call(this,level_state,position,properties);
    this.level_state.game.physics.arcade.enable(this);
    this.body.immovable=true;
    this.body.allowGravity=false;
    this.currentDelay=0;
    //his.anchor.setTo(0.5,1);
    this.last_time_update;
    var shu_speed=properties.power;
    var angle=Phaser.Math.degToRad(properties.angle);
    //if(Math.cos(angle)<0) this.x+=2;
    //else this.x-=2;
    var speed={};
    speed.x=shu_speed*Math.cos(angle);
    speed.y=-shu_speed*Math.sin(angle);
    this.pos;
    this.prop=Platformer.Weapon.getProp(Platformer.Weapon.SHURIKEN_ENEMY);
    this.prop.velocity=speed;
    this.exists=properties.visible;
}

Platformer.ShuTrap.prototype = Object.create(Platformer.Effect.prototype);
Platformer.ShuTrap.prototype.constructor = Platformer.ShuTrap;

Platformer.ShuTrap.prototype.update=function() {
    if(!this.exists) return;
    this.level_state.game.physics.arcade.enable(this,this.level_state.groups.player);
    if(this.pos==null || this.pos.x!=this.body.center.x || this.pos.y!=this.body.center.y) this.pos={"x":this.body.center.x,"y":this.body.center.y};
    if(this.cause==null || this.cause.state=="active"){
        this.updateDelay();
        if(this.currentDelay>=this.interval) this.throw();
    }
}
Platformer.ShuTrap.prototype.throw=function() {
    this.prop.origin='shutrap';
    var s=new Platformer.Shuriken(this.level_state,this.pos,this.prop);
    this.currentDelay=this.interval;
}
Platformer.ShuTrap.prototype.updateDelay=function() {
    if(this.last_time_update==null) {
        this.last_time_update=new Date().getTime();
        return;
    }
    else if(this.currentDelay<=0) this.currentDelay=this.interval;
    else {
        this.currentDelay-=new Date().getTime()-this.last_time_update;
        this.last_time_update=new Date().getTime();
    }
}

/*

        Fire

*/
Platformer.Fire=function(level_state,position,properties) {
    Platformer.Effect.call(this,level_state,position,properties);
    
    this.level_state.game.physics.arcade.enable(this);
    this.frame=24;
    this.body.setSize(0,0);
    this.body.allowGravity=false;
    this.body.immovable=true;
    this.anchor.setTo(0.5,1);
    this.active=false;
    this.audio=this.game.add.audio('fire');
    this.was_in_cam=false;
    
    this.animations.add('start',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],30,false);
    this.animations.add('idle',[10,11,12,13,14,15,16,15,14,13,12,11],30,true);
    this.animations.add('end',[16,17,18,19,20,21,22,23],30,false);
}
Platformer.Fire.prototype = Object.create(Platformer.Effect.prototype);
Platformer.Fire.prototype.constructor = Platformer.Fire;

Platformer.Fire.prototype.update=function() {
    var prev_active=this.active;
    if(this.cause) {
        if(this.cause.state=="active") this.active=true;
        else this.active=false;
    }
    else this.active=true;
    if(!prev_active && this.active) this.animations.play('start');
    else if(!this.active && prev_active) this.animations.play('end').onComplete.add(function(){
        this.frame=24;
        this.body.setSize(0,0);
    },this);
    else if(this.active) {
        var r_cam=new Phaser.Rectangle().copyFrom(this.game.camera);
        var r_f=new Phaser.Rectangle().copyFrom(this.body);
        if(r_cam.containsRect(r_f) && !this.was_in_cam && !this.game.mute) this.audio.play();
        this.was_in_cam=r_cam.containsRect(r_f);
        this.body.setSize(28,96,this.width/2-14,0);
        this.animations.play('idle');
        this.level_state.game.physics.arcade.collide(this,this.level_state.groups.player,function(fire,player) {
            player.takeDamage(5,500,3);
        },null,this);
    }
}