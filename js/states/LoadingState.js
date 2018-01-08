Platformer.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};
 
Platformer.prototype = Object.create(Phaser.State.prototype);
Platformer.prototype.constructor = Platformer.LoadingState;
 
Platformer.LoadingState.prototype.init = function (level_data) {
    "use strict";
    this.level_data = level_data;
};
 
Platformer.LoadingState.prototype.preload = function () {
    "use strict";
    
    var load_spr=this.game.add.sprite(0,0,"loading",0);
    load_spr.animations.add('load',null,43,true);
    load_spr.anchor.x=0.5;
    load_spr.x=this.game.world.centerX;
    load_spr.y=this.game.world.centerY+10;
    
    var logo=this.game.add.image(0,0,'logo');
    logo.anchor.x=0.5;
    logo.x=450;
    logo.y=140;
    
    load_spr.animations.play('load');
    var assets=this.level_data.assets;
    for (var i in assets.image) {
        if(assets.image.hasOwnProperty(i)) this.load.image(i, assets.image[i]);
    }
    for (var i in assets.level) {
        if(assets.level.hasOwnProperty(i)) this.load.tilemap(i, assets.level[i], null, Phaser.Tilemap.TILED_JSON);
    }
    for (var i in assets.spritesheet) {
        var asset=assets.spritesheet[i];
        if(assets.spritesheet.hasOwnProperty(i)) this.load.spritesheet(i, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
    }
    for (var i in assets.audio) {
        if(assets.audio.hasOwnProperty(i)) this.load.audio(i,assets.audio[i]);
    }
    this.game.group_name=this.level_data.groups;
    this.game.story=this.level_data.story;
    var prop,last_up="2016-12-12T19:00:00.00Z";
    try {
        prop=JSON.parse(localStorage.getItem('player_prop'));
        if (!prop.last_up || (prop.last_up && prop.last_up<last_up)) {
            localStorage.clear();
            prop=null;
        }
    }catch(e) {}
    prop=prop || {
        "group":"player",
        "texture":"player_spritesheet",
        "walk_speed":250,
        "jump_speed":550,
        "damage":1,
        "scrolls":[],
        "res":0,
        "weapon":"punch",
        "shop":{
            "shuriken":1,
            "katana":1
        },
        "finish":false,
        "last_up":last_up
    };
    localStorage.setItem('player_prop',JSON.stringify(prop));
};
 
Platformer.LoadingState.prototype.create = function () {
    "use strict";
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.state.start('MenuState');
};

game.state.add("LoadingState", new Platformer.LoadingState());