var Platformer = Platformer || {};
 
Platformer.Prefab = function (level_state, position, properties) {
    "use strict";
    Phaser.Sprite.call(this, level_state.game, position.x, position.y, properties.texture);
    this.level_state = level_state;
    this.level_state.groups[properties.group].add(this);
};
 
Platformer.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
Platformer.Prefab.prototype.constructor = Platformer.Prefab;