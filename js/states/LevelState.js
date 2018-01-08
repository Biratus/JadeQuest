//var Platformer = Platformer || {};

Platformer.LevelState = function () {
    "use strict";
    Phaser.State.call(this);
};
 
Platformer.LevelState.prototype = Object.create(Phaser.State.prototype);
Platformer.LevelState.prototype.constructor = Platformer.LevelState;
 
Platformer.LevelState.prototype.init = function (level_name,player_prop,first_time) {
    "use strict";
    this.name = level_name;
    this.first_time=first_time;
    //for basic level to check which input have been pressed
    this.input={};
    this.input.left=false;
    this.input.up=false;
    this.input.right=false;
    this.input.spacebar=false;
    if(this.game.audio_bg.name.split('_')[0]!='bg') this.game.audio_bg.stop();
    
    //remove current level from level locked if not already
    try {
        var lock_level=JSON.parse(localStorage.getItem('locklevel'));
        if(lock_level.indexOf(game.level_id)>=0) lock_level.splice(lock_level.indexOf(game.level_id),1);
        localStorage.setItem('locklevel',JSON.stringify(lock_level));
    } catch(e) {}
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y=1100;
    game.time.desiredFps=60;
    
    // create map and set tileset
    if(!this.first_time) this.map = this.game.add.tilemap(level_name);
    else this.map=this.game.add.tilemap("level_0");
    this.map.addTilesetImage("tilesheet", "map_tiles");
    var level="level_1";
    if(game.level_id>5) level="level_3";
    else if(game.level_id>3) level="level_2";
    this.bg={};
    this.bg.image=this.game.add.image(0,0,"bg_"+level);
    this.bg.image.anchor.setTo(0.5);
    
    if(!this.game.audio_bg.isPlaying && this.game.audio_bg.name.split[0]!='bg' && !this.game.mute) {
        this.audio_start=this.game.add.audio('start');
        this.audio_start.play();
        this.game.audio_bg=this.game.add.audio('bg_'+level);
        this.audio_start.onStop.add(function(){
            this.game.audio_bg.loopFull();
        },this);
    }
    game.graphics=game.add.graphics(0,0); 
    
    //variable for background movement
    var a={'x':this.map.widthInPixels-this.bg.image.width/2,'y':this.map.heightInPixels-this.bg.image.height/2};
    var b={'x':this.map.widthInPixels-450,'y':this.map.heightInPixels-250};
    var bg_halfW=a.x-this.map.widthInPixels/2;
    var bg_halfH=a.y-this.map.heightInPixels/2;
    var c_halfW=b.x-this.map.widthInPixels/2;
    var c_halfH=b.y-this.map.heightInPixels/2;
    this.bg.coefX=bg_halfW/c_halfW;
    this.bg.coefY=bg_halfH/c_halfH;
    
    //state attributes
    this.layers={};
    this.objects={};
    this.ladders=[];
    this.groups = {};
    this.player;
    this.player_prop=player_prop;
    this.wisdom={};
    this.wisdom.particles=[];//array of positions
    this.wisdom.danger=[];//array of positions
    this.audio={};
    this.audio.reveal_hid=this.game.add.audio('reveal_hid');
};

Platformer.LevelState.prototype.create=function() {
    
    if(this.first_time) {//init level basic
        var ladders_tile=this.createLayers();
        this.init_ladders(ladders_tile);
        this.layers[this.map.layer.name].resizeWorld();
        //create groups
        this.game.group_name.forEach(function (name) {
            this.groups[name] = this.game.add.group();
        }, this);
        //create object
        for (var i in this.map.objects) {
            if (this.map.objects.hasOwnProperty(i)) {
                this.map.objects[i].forEach(this.create_object, this);
            }
        }
        this.player.cursorEnabled=false;
        this.player.animations.play('idle');
        this.init_story();
        return;
    }
    
    
    // LEVEL INITIALIZATION
    
    //create Layers
    var ladders_tile=this.createLayers();
    this.init_ladders(ladders_tile);
    
    // resize the world to be the size of the current layer
    this.layers[this.map.layer.name].resizeWorld();
    
    //create groups
    this.game.group_name.forEach(function (name) {
        this.groups[name] = this.game.add.group();
    }, this);
    //create object
    for (var i in this.map.objects) {
        if (this.map.objects.hasOwnProperty(i)) {
            this.map.objects[i].forEach(this.create_object, this);
        }
    }
    
    if(this.player.power=="wisdom") this.init_wisdom();
    this.player.inputEnabled=true;
    
    //UI
    this.life={};
    this.life.image=this.game.add.image(0,0,"life");
    this.life.image.scale.setTo(0.1);
    
    this.life.image_bg=this.game.add.image(0,0,'life_pl_bg');
    this.life.image_bg.width=253;
    this.life.image_bg.height=22;
    
    this.life.image_value=this.game.add.image(0,0,'life_pl_bar');
    this.life.image_value.width*=0.8;
    this.life.image_value.height*=0.5;
    
    
    this.resources={};
    this.resources.image=this.game.add.image(0,0,"resource");
    this.resources.image.scale.setTo(0.5);
    var color='white';
    if(game.level_id>3) color='#088A4B';
    if(game.level_id>5) color='#610B0B';
    this.resources.text=this.game.add.text(0,0,this.player.resources,{"fill":color});
    this.resources.text.alpha=0.8;
    
    var back_group=this.game.add.group();
    var back_ui=this.game.add.image(0,0,'ui',2,back_group);
    var back_text=this.game.add.sprite(70,back_ui.centerY,'text_ui',2,back_group);
    back_text.anchor.setTo(0,0.5);
    this.back_key=this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    this.back_key.onDown.add(function() {
        this.game.audio_bg.stop();
        if(!this.game.mute) this.game.audio_select.play();
        this.game.state.start('ChooseLevel',true,false,game.level_id);
    },this);
    this.groups.back_group=back_group;
    
    //assign cause to effect 
    for (var i in this.groups.effect.children) {
        if(this.groups.effect.children[i].cause!=null) {
            this.groups.effect.children[i].cause=this.objects[this.groups.effect.children[i].cause];
        }
    }
    
    //create end image
    if(game.level_id<7) {
        var end=this.game.add.image(this.end_level.x-50,this.end_level.y,'end');
        end.anchor.setTo(0.5,1);
    }
    else {
        var st=this.statue=this.game.add.image(this.end_level.x,this.end_level.y,'statue');
        st.anchor.setTo(0.5,1);
        st.scale.setTo(0.15);
        this.game.add.tween(st).to({"y":st.y-10},500,'Linear',true).yoyo(true).loop(true);
    }
    this.game.camera.follow(this.player,Phaser.Camera.FOLLOW_PLATFORMER,0.1,0.1);
}

Platformer.LevelState.prototype.update=function() {
    //center background on camera
    var dx=this.game.camera.x+450-this.game.world.centerX;
    var dy=this.game.camera.y+250-this.game.world.centerY;
    this.bg.image.x=this.game.world.centerX+dx*this.bg.coefX;
    this.bg.image.y=this.game.world.centerY+dy*this.bg.coefY;
    
    if(this.player && !this.in_basic && !this.story) {//Actual game
        this.life.image.x=this.game.camera.view.left+5;
        this.life.image.y=this.game.camera.view.top+10;
        
        this.life.image_value.width=25*this.player.life;
        this.life.image_value.x=this.life.image.x+this.life.image.width+5;
        this.life.image_value.anchor.setTo(0,0.5);
        this.life.image_value.y=this.life.image.centerY;
        
        this.life.image_bg.x=this.life.image_value.x;
        this.life.image_bg.anchor.setTo(0,0.5);
        this.life.image_bg.y=this.life.image_value.y;
        
        this.resources.image.x=this.game.camera.view.left+5;
        this.resources.text.x=this.game.camera.view.left+60;
        this.resources.image.y=this.game.camera.view.top+70;
        this.resources.text.y=this.game.camera.view.top+70;
        this.resources.text.text=this.player.resources;
        
        this.groups.back_group.x=this.game.camera.view.right-10-this.groups.back_group.width;
        this.groups.back_group.y=this.game.camera.view.top+10;
        if(this.player_prop.power && this.player_prop.power=="wisdom") {//show sight enemy
            game.graphics.clear();
            for (var i in this.objects) {
                if(this.objects[i] instanceof Platformer.Enemy && this.objects[i].alive) this.objects[i].showSight();
            }
        }
        if(this.player.body.right>=this.end_level.x && this.player.body.bottom<=this.end_level.bottom && this.player.body.bottom>=this.end_level.y-80) this.game.endLevel(this.player);
    }
    if(this.in_basic && this.in_basic!="timeout") {
        var good=true;
        for (var i in this.input) {
            var val=this.input[i];
            if(!val) good=false;
        }
        if(good) {//Player has learned how to play
            this.in_basic="timeout";
            setTimeout(function(level) {
                level.player.destroy();
                level.controls.destroy();
                level.game.camera.x=0;
                level.game.camera.y=0;
                level.story=new Platformer.Story(level,"basic",function() {
                    this.story=null;
                    this.in_basic=null;
                    game.toLevel(1);
                });
            },500,this);
        }
    }
    if(game.level_id==3 && this.objects['dum_1'].state=="active" && this.objects['dum_2'].state=="active" && this.objects['dum_3'].state=="active" && !this.objects['strength'].exists) this.objects["strength"].wakeUp();//Strengh scroll mechanic
    
    if(this.story) this.story.update();
}

Platformer.LevelState.prototype.init_story=function() {
    this.story=new Platformer.Story(this,"start",this.init_basic);
}

Platformer.LevelState.prototype.init_basic=function() {
    this.story=null;
    this.controls=this.game.add.image(450,30,'controls');
    this.controls.anchor.x=0.5;
    this.controls.scale.setTo(0.25);
    this.game.camera.follow(this.player,Phaser.Camera.FOLLOW_PLATFORMER,0.1,0.1);
    this.in_basic=true;
    this.player.cursorEnabled=true;
}

Platformer.LevelState.prototype.create_object = function (object) {
    var position, obj;
    //need to change position due to anchor set in objects (0.5,1)
    position ={"x": object.x+object.width/2, "y": object.y+object.height};
    if(object.group=="effect") {
        var cause_name=object.cause;
        if(cause_name=="") object.properties.cause=null;
        else {
            for(var i in this.map.objects.Objects) {
                if(this.map.objects.Objects[i].name==cause_name) {
                    object.properties.cause=this.map.objects.Objects[i];
                    break;
                }
            }
        }
    }
    if(object.properties) object.properties.name=object.name;
    if(object.type=='particle') {
        this.wisdom.particles.push(position);
        return;
    }
    else if(object.type=='start') {
        this.start_level=position;
        this.player=new Platformer.Player(this,position,this.player_prop);
        return;
    }
    else if(object.type=="end") {
        this.end_level=position;
        this.end_level.bottom=this.end_level.y+object.height;
        return;
    }
    else 
    // create object according to its type
    switch (object.type) {
        case "enemy":
            this.wisdom.danger.push(position);
            obj = new Platformer.Enemy(this, position, object.properties);
            break;
        case "platform":
            object.properties.width=object.width;
            object.properties.height=object.height;
            obj=new Platformer.Platform(this,position,object.properties);
            break;
        case "lever":
            object.properties.visible=object.visible;
            obj=new Platformer.Lever(this,position,object.properties);
            break;
        case "plate":
            obj=new Platformer.Plate(this,position,object.properties);
            break;
        case "collectables":
            if(!(object.properties.scroll && (!this.player_prop || this.player_prop.scrolls.indexOf(object.name)>=0))) {//if obj is a scroll and player already has it
                object.properties.visible=object.visible;
                obj=new Platformer.Collectable(this,position,object.properties);
            }
            break;
        case "dummy":
            object.properties.width=object.width;
            object.properties.height=object.height;
            obj=new Platformer.Dummy(this,position,object.properties);
            break;
        case "shurik_trap":
            object.properties.visible=object.visible;
            obj=new Platformer.ShuTrap(this,{"x":object.x,"y":object.y},object.properties);
            break;
        case "fire":
            obj=new Platformer.Fire(this,position,object.properties);
            break;
    }
    this.objects[object.name] = obj;
};

Platformer.LevelState.prototype.createLayers=function(ladders_tile) {
    var ladders_tile=[];
    this.map.layers.forEach(function (layer) {
        this.layers[layer.name] = this.map.createLayer(layer.name);
        if (layer.name=='collision') { // collision layer
            var collision_tiles = [];
            layer.data.forEach(function (data_row) {
                data_row.forEach(function (tile) {
                    if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                        collision_tiles.push(tile.index);
                    }
                }, this);
            }, this);
            this.map.setCollision(collision_tiles, true, layer.name);
        }
        else if(layer.name=='ladder') { //ladders layer
            layer.data.forEach(function (data_row) { // find tiles used in the layer
                data_row.forEach(function (tile) {
                    //add all ladder tiles in array
                    if(tile.index>0) ladders_tile.push(tile);
                }, this);
            }, this);
        }
        if (layer.name=='hide') { // hide layer
            var tile_arr = [];
            layer.data.forEach(function (data_row) { // find tiles used in the layer
                data_row.forEach(function (tile) {
                    // check if it's a valid tile index and isn't already in the list
                    if (tile.index > 0 && tile_arr.indexOf(tile.index) === -1) {
                        tile_arr.push(tile.index);
                    }
                }, this);
            }, this);
            this.map.setCollision(tile_arr,true,"hide");
            this.map.setTileIndexCallback(tile_arr,function(p,t){
                if(!this.game.mute) this.audio.reveal_hid.play();
                this.reveal_hidden(p,t);
            },this,this.layers.hide);
        }
    }, this);
    return ladders_tile;
}

Platformer.LevelState.prototype.reveal_hidden=function(player,tile) {
    if(!tile) return;
    if(player instanceof Platformer.Player && tile.index>=0) {
        var l = this.map.getLayer('hide');
        tile.index=-1;
        this.reveal_hidden(player,this.map.getTileAbove(l,tile.x,tile.y));
        this.reveal_hidden(player,this.map.getTileBelow(l,tile.x,tile.y));
        this.reveal_hidden(player,this.map.getTileLeft(l,tile.x,tile.y));
        this.reveal_hidden(player,this.map.getTileRight(l,tile.x,tile.y));
        var tile_rect=new Phaser.Rectangle(tile.worldX,tile.worldY,tile.width,tile.height);
        for (var i in this.objects) {//toggle visibility of hidden objects
            var obj=this.objects[i];
            if(obj && !obj.exists && obj.alive) {
                var rect=new Phaser.Rectangle();
                rect.copyFrom(obj.body);
                if(Phaser.Rectangle.intersects(tile_rect,rect) || tile_rect.containsRect(rect)){
                    obj.exists=true;
                    if(i=="lever_wis") {//change platform cause in the 1st lvl
                        this.objects['plat_1'].cause=obj;
                        this.objects['plat_1'].repeat=false;
                    }
                    else if(obj instanceof Platformer.Collectable) obj.wakeUp();
                }
            }
        }
        this.map.removeTile(tile.x,tile.y,"hide");
    }
    if(player instanceof Platformer.Enemy) return true;
}

Platformer.LevelState.prototype.init_ladders=function(ladders_tile) {
    //Sort tile in array from top left tile
    if(!ladders_tile.length) return; 
    ladders_tile.sort (function(a,b) {
        if(a.x<b.x) return -1;
        else if(a.x==b.x) {//same col
            if(a.y<b.y) return -1;//a on a row before b
            else return 1;
        }
        else return 1;
    });
    //create ladder objects
    var prevTile=null;
    var current_lad=[];
    ladders_tile.forEach(function(tile) {
        if(prevTile==null) {
            prevTile=tile;
            current_lad.push(tile);
        }
        else {
            if(tile.x==prevTile.x && tile.y==prevTile.y+1) current_lad.push(tile);
            else {
                this.ladders.push(new Platformer.Ladder(current_lad));
                current_lad=[];
                current_lad.push(tile);
            }
            prevTile=tile;
        }
    },this);
    if(current_lad.length>0) this.ladders.push(new Platformer.Ladder(current_lad));
}

Platformer.LevelState.prototype.init_wisdom=function() {
    for (var i in this.wisdom.particles) {
        var pos=this.wisdom.particles[i];
        var emitter=this.game.add.emitter(pos.x,pos.y,500);
        emitter.makeParticles('particle');
        emitter.setRotation(0,0);
        emitter.setAlpha(0.3,0.8);
        emitter.setScale(0.3,0.7);
        emitter.setXSpeed(-60,60);
        emitter.setYSpeed(-60,60);
        emitter.gravity=-1100;
        
        emitter.start(false,700,100);
    }
}

Platformer.LevelState.prototype.restart_level = function () {
    "use strict";
    //remove any scroll player picked up during level
    if(this.name=='level_1' && this.player_prop.scrolls.indexOf('wisdom'))
        this.player_prop.scrolls.splice(this.player_prop.scrolls.indexOf('wisdom'),1);
    else if(this.name=='level_2' && this.player_prop.scrolls.indexOf('stealth'))
        this.player_prop.scrolls.splice(this.player_prop.scrolls.indexOf('stealth'),1);
    else if(this.name=='level_3' && this.player_prop.scrolls.indexOf('strength'))
        this.player_prop.scrolls.splice(this.player_prop.scrolls.indexOf('strength'),1);
    
    this.game.state.restart(true, false, this.name,this.player_prop,this.first_time);
}

game.state.add("LevelState", new Platformer.LevelState());