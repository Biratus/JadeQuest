var Platformer = Platformer || {};

Platformer.Cause=function(level_state,position,properties) {
    Platformer.Prefab.call(this, level_state, position, properties);
    this.audio=this.game.add.audio('lever');
}
Platformer.Cause.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Cause.prototype.constructor = Platformer.Cause;

/*

        LEVER

*/
Platformer.Lever=function(level_state,position,properties) {
    Platformer.Cause.call(this, level_state, position, properties);
    this.level_state.game.physics.arcade.enable(this);
    this.body.immovable=true;
    this.body.allowGravity=false;
    this.state= properties.state;
    this.animations.add('activate',[0,1,2],3,false);
    this.animations.add('deactivate',[2,1,0],3,false);
    this.anchor.setTo(0.5,1);
    this.scale.setTo(0.8);
    this.frame=(this.state=="active")?2:0;
    this.exists=properties.visible;
}
Platformer.Lever.prototype = Object.create(Platformer.Cause.prototype);
Platformer.Lever.prototype.constructor = Platformer.Lever;

Platformer.Lever.prototype.update=function() {
    this.level_state.game.physics.arcade.overlap(this,this.level_state.groups.player,this.collide,null,this);
}

Platformer.Lever.prototype.collide=function(lever,player) {
    if(player.cursors.up.isDown && this.frame!=1 && player.body.velocity.x==0 ) {
        player.cursors.up.reset();
        player.cursors.left.reset();
        player.cursors.right.reset();
        if(this.state=="active") {
            this.animations.play('deactivate');
            this.state="deactivate";
        }
        else {
            this.animations.play('activate');
            this.state="active";
        }
        if(!this.game.mute) this.audio.play();
    }
}

/*


        PLATE


*/
Platformer.Plate=function(level_state,position,properties) {
    Platformer.Cause.call(this, level_state, position, properties);
    this.level_state.game.physics.arcade.enable(this);
    this.body.immovable=true;
    this.body.allowGravity=false;
    this.state= +properties.state;
    this.initial_state=this.state;
    this.anchor.setTo(0.5,1);
    this.initial_height=this.body.height;
    this.press_height=this.body.height*59/64;
    if(game.level_id>5) this.frame=4;
    else if(game.level_id>3) this.frame=2;
    else this.frame=0;
    this.orig_frame=this.frame;
}
Platformer.Plate.prototype = Object.create(Platformer.Cause.prototype);
Platformer.Plate.prototype.constructor = Platformer.Plate;

Platformer.Plate.prototype.update=function() {
    if(this.collision) {
        var player=this.level_state.player;
        if(player.body.x>=this.body.right 
           || player.body.right<=this.body.x 
           || player.body.bottom<this.body.bottom-this.initial_height) this.collision=false;
    }
    this.level_state.game.physics.arcade.collide(this,this.level_state.groups.player,function(plate,player){
        if ((player.frame==39 && player.power=='stealth') || (player.power!='stealth')) this.collision=true;
        else this.collision=false;
    },null,this);
    if(this.collision) {
        if(this.frame!=this.orig_frame+1 && !this.game.mute) this.audio.play();
        this.frame=this.orig_frame+1;
        this.state="active";
    }
    else {
        if(this.frame!=this.orig_frame && !this.game.mute) this.audio.play();
        this.frame=this.orig_frame;
        this.state="stop";
    }
}

/*

    DUMMY
    
*/
Platformer.Dummy=function(level_state,position,properties) {
    Platformer.Cause.call(this,level_state,position,properties);
    this.level_state.game.physics.arcade.enable(this);
    this.body.allowGravity=false;
    this.body.immovable=true;
    this.anchor.setTo(0.5,1);
    this.width=(properties.height+30)*this.width/this.height;
    this.height=properties.height+30;
    this.body.width=properties.width;
    this.body.height=properties.height;
    this.state="deactivate";
    this.frame=0;
}

Platformer.Dummy.prototype = Object.create(Platformer.Cause.prototype);
Platformer.Dummy.prototype.constructor = Platformer.Dummy;

Platformer.Dummy.prototype.update=function() {
   this.level_state.game.physics.arcade.overlap(this,this.level_state.groups.player,function(dum,play) {
        if(play.isPunching()) {
            this.state="active";
            this.frame=1;
        }
    },null,this);
}