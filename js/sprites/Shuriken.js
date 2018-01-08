var Platformer=Platformer || {}

Platformer.Shuriken=function(level_state,position,properties,origin) {
    Platformer.Weapon.call(this,level_state,position,properties);
    this.origin=origin;
    this.distance=properties.distance;
    this.initial_x=position.x;
    this.initial_y=position.y;
    this.speed=properties.speed;
    this.damage=+properties.damage;
    
    this.level_state.game.physics.arcade.enable(this);
    this.body.allowGravity=false;
    
    this.anchor.setTo(0.5,0.5);
    this.body.velocity.x=properties.velocity.x;
    this.body.velocity.y=properties.velocity.y;
    this.body.angularVelocity=-(Math.abs(properties.velocity.x)/properties.velocity.x)*500;
    
}
Platformer.Shuriken.prototype = Object.create(Platformer.Weapon.prototype);
Platformer.Shuriken.prototype.constructor = Platformer.Shuriken;

Platformer.Shuriken.prototype.update=function() {
    if(!this.alive) {this.destroy();return;}
    if(Math.sqrt(Math.pow(this.initial_x-this.body.x,2)+Math.pow(this.initial_y-this.body.y,2))>this.distance) {
        if(this.level_state.in_basic) this.level_state.input.spacebar=true;
        this.alive=false;
    }
    this.level_state.game.physics.arcade.collide(this, this.level_state.layers.collision,function(s) {
        if(s.level_state.in_basic) s.level_state.input.spacebar=true;
        s.alive=false;
    });
    this.level_state.game.physics.arcade.overlap(this, this.level_state.groups.enemies,this.collide_enemy,null,this); 
    this.level_state.game.physics.arcade.overlap(this, this.level_state.groups.player,this.collide_player,null,this);
    this.level_state.game.physics.arcade.overlap(this, this.level_state.groups.effect,function(shu,eff) {
           if(eff instanceof Platformer.Platform) shu.alive=false;
    },null,this);

}
Platformer.Shuriken.prototype.collide_enemy=function(shu,enemy) {
    if(this.origin==enemy) return false;
    if(enemy.hurt) return false;
    var recoil=2; //left
    if(enemy.body.touching.right && this.body.velocity.x<0) recoil=-2; //right
    enemy.takeDamage(this.damage,Platformer.Enemy.HURT_DELAY_SHURIKEN,recoil);
    this.alive=false;
}
Platformer.Shuriken.prototype.collide_player=function(shu,player) {
    if(this.origin==player || player.hurt) return false;
    var recoil=2;
    if(player.body.touching.right && this.body.velocity.x<0) recoil=-2; //right
    player.takeDamage(this.damage,Platformer.Enemy.HURT_DELAY_SHURIKEN,recoil);
    this.alive=false;
}