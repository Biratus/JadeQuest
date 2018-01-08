var Platformer= Platformer || {};

Platformer.Collectable=function(level_state,position,properties) {
    Platformer.Prefab.call(this,level_state,position,properties);
    this.level_state.game.physics.arcade.enable(this);
    this.body.allowGravity=false;
    this.scroll=properties.scroll;
    this.name=properties.texture;
    var a='resource';
    if(this.scroll) {
        a='scroll';
        this.scale.setTo(0.09);
    }
    else this.scale.setTo(0.4);
    this.audio=this.level_state.game.add.audio(a);
    this.exists=properties.visible;
    if(this.exists) this.wakeUp();
}

Platformer.Collectable.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Collectable.prototype.constructor = Platformer.Collectable;

Platformer.Collectable.prototype.update=function() {
    if(!this.exists) return; 
    this.level_state.game.physics.arcade.overlap(this,this.level_state.groups.player,function() {
        if (!this.scroll) this.level_state.player.resources++;
        else this.level_state.player.scrolls.push(this.name);
        if(!this.game.mute) this.audio.play();
        this.destroy();
    },null,this);
}
Platformer.Collectable.prototype.wakeUp=function() {
    this.exists=true;
    this.level_state.game.add.tween(this).to({"y":this.y-15},500,Phaser.Easing.Linear.Out,true,20).yoyo(true).loop(true);
}
