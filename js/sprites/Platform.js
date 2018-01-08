var Platformer = Platformer || {};
 
Platformer.Effect=function(level_state,position,properties) {
    Platformer.Prefab.call(this, level_state, position, properties);
    this.cause=properties.cause;
    this.repeat=properties.repeat;
    this.interval=properties.interval;
}

Platformer.Effect.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Effect.prototype.constructor = Platformer.Effect;

Platformer.Platform = function (level_state, position, properties) {
    "use strict";
    Platformer.Effect.call(this, level_state, position, properties);
        
    this.distance= properties.distance;
    this.direction= properties.direction;
    this.speed=properties.speed;
    
    this.level_state.game.physics.arcade.enable(this);
    this.body.allowGravity=false;
    this.body.immovable=true;
    this.anchor.setTo(0.5,1);
    this.width=properties.width;
    this.height=properties.height;
    this.initial_x,this.initial_y;
    this.orientation=this.direction;
    
};
 
Platformer.Platform.prototype = Object.create(Platformer.Effect.prototype);
Platformer.Platform.prototype.constructor = Platformer.Platform;
Platformer.Platform.DIRECTION_UP=-1;
Platformer.Platform.DIRECTION_DOWN=1;
Platformer.Platform.DIRECTION_RIGHT=2;
Platformer.Platform.DIRECTION_LEFT=-2;

Platformer.Platform.prototype.update = function () {
    "use strict";
    this.level_state.game.physics.arcade.collide(this,this.level_state.player,function(platform,player){
        if(player.body.blocked.down && platform.body.touching.down) player.level_state.restart_level();
    },null,this);
    this.level_state.game.physics.arcade.overlap(this,this.level_state.player,function(plat,player) {
        player.body.y=plat.top-player.body.height;
        player.body.velocity.y=0;
    },null,this);
    if(this.initial_x==null && this.initial_y==null) {
        this.initial_x=this.body.x;
        this.initial_y=this.body.y;
    }
    if(this.cause) {
        if(this.cause.state=="active") {
            if(this.reachEnd()) {
                if(this.repeat) this.toDefaultState();
                else {
                    this.body.velocity.x=0;
                    this.body.velocity.y=0;
                }
            }
            else {
                if(this.orientation==this.direction) this.activate();
                else this.toDefaultState();
                if(this.pastDefaultState()) this.activate();
            }
        }
        else if(this.cause.state=="stop") {
            this.body.velocity.x=0;
            this.body.velocity.y=0;
        }
        else if(this.pastDefaultState() && this.cause.state=="deactivate") {
            this.body.velocity.x=0;
            this.body.velocity.y=0;
            this.body.x=this.initial_x;
            this.body.y=this.initial_y;
        }
        else this.toDefaultState();
    }
    else {
        if(this.orientation==this.direction) this.activate();
        else this.toDefaultState();
        if(this.pastDefaultState()) this.activate();
        else if(this.reachEnd()) this.toDefaultState();
    }
    //this.display();
        
};
Platformer.Platform.prototype.pastDefaultState=function() {
    if(this.direction%2==0) {//right or left
        if(this.direction>0) {//going right
            return this.body.x<=this.initial_x;
        }
        else {//going left
            return this.body.x>=this.initial_x;
        }
    }
    else {
        if(this.direction>0) {//going down
            return this.body.y<=this.initial_y;
        }
        else {//going up
            return this.body.y>=this.initial_y;
        }
    }
}
Platformer.Platform.prototype.display=function() {
    text.text="reachEnd: "+this.reachEnd()+" cause: "+this.cause.state
    +"\nvelocity X: "+this.body.velocity.x+" body X: "+this.body.x
    +"\nvelocity Y: "+this.body.velocity.y+" body Y: "+this.body.y
    +"\nrepeat: "+this.repeat+" interval: "+this.interval
    +"\nspeed: "+this.speed+" direction: "+this.direction;
}
Platformer.Platform.prototype.toDefaultState=function() {
    this.orientation=-1*this.direction;
    if(this.direction%2==0) {//Right or left
        this.body.velocity.x=-this.speed*(this.direction/Math.abs(this.direction));
    }
    else {//Up or down
        this.body.velocity.y=-this.speed*(this.direction/Math.abs(this.direction));
    }
}
Platformer.Platform.prototype.activate=function() {
    this.orientation=this.direction;
    if(this.direction%2==0) {//Right or left
        this.body.velocity.x=this.speed*(this.direction/Math.abs(this.direction));
    }
    else {//Up or down
        this.body.velocity.y=this.speed*(this.direction/Math.abs(this.direction));
    }
}
Platformer.Platform.prototype.reachEnd=function() {
    return Math.abs(this.body.y-this.initial_y)>= this.distance || Math.abs(this.body.x-this.initial_x)>= this.distance; 
}