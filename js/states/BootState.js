Platformer.BootState = function () {
    "use strict";
    Phaser.State.call(this);
};
 
Platformer.prototype = Object.create(Phaser.State.prototype);
Platformer.prototype.constructor = Platformer.BootState;
 
Platformer.BootState.prototype.init = function (level_file) {
    "use strict";
    this.level_file = level_file;
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
};
 
Platformer.BootState.prototype.preload = function () {
    "use strict";
    this.load.text("assets", this.level_file);//save in cache?
    this.load.image("logo","assets/ui/logo.png");
    this.load.spritesheet("loading","assets/ui/loading.png",98,98,90,0,0);
};
 
Platformer.BootState.prototype.create = function () {
    "use strict";
    var level_text, level_data;
    level_text = this.game.cache.getText("assets");//retrieve from cache?
    level_data = JSON.parse(level_text);
    this.game.state.start("LoadingState", true, false, level_data);
};

game.state.add("BootState", new Platformer.BootState());