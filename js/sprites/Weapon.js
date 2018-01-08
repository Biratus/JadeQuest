var Platformer=Platformer || {}

Platformer.Weapon=function(level_state,position,properties) {
    Platformer.Prefab.call(this,level_state,position,properties);
    
    this.damage=+properties.damage;
    this.direction=+properties.direction;
    
}

Platformer.Weapon.SHURIKEN_NORMAL="shuriken";
Platformer.Weapon.SHURIKEN_ENEMY="shu_en";

Platformer.Weapon.prototype = Object.create(Platformer.Prefab.prototype);
Platformer.Weapon.prototype.constructor = Platformer.Weapon;

Platformer.Weapon.getProp=function(type) {
    if(type=="shuriken") return {"group":"weapon","distance":600,"texture":"shuriken","damage":2,"speed":1000};
    else return {"group":"weapon","distance":400,"texture":"shuriken","damage":1.5,"speed":400};
}