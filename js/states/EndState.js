Platformer.EndState = function () {
    "use strict";
    Phaser.State.call(this);
    
};
 
Platformer.EndState.prototype = Object.create(Phaser.State.prototype);
Platformer.EndState.prototype.constructor = Platformer.EndState;

Platformer.EndState.prototype.init=function(a,b) {
    this.level_id=a;
    this.player_prop=b;
    this.sprites=[];
    this.paddle,this.current_scroll=0;
    this.scroll={
      "wisdom":{
          "desc":"Wisdom scroll will give you sight.\nYou are able to analyse the danger coming and hidden areas.",
          "color":"yellow"
      },
        "strength":{
          "desc":"Strength scroll will give you more power.\nYour punches are stronger, your jumps higher and your range better.",
          "color":"red"
      },
        "stealth":{
          "desc":"Stealth allows you to come closer to an enemy without\nbeing noticed and prevent pressure plates of activating.\nCrouch to activate.",
          "color":"green"
      }
    };
    this.text={};
    this.text.title=this.game.add.text(0,0,'',{font:"32pt Matura MT Script Capitals","align":"center","stroke":'black',"strokeThickness":4});
    this.text.title.anchor.x=0.5;
    this.text.title.anchor.y=0.5;
    this.text.title.resolution=1;
    this.text.desc=this.game.add.text(0,0,'',{font:"18pt Matura MT Script Capitals","align":"center"});
    this.text.desc.anchor.x=0.5;
    this.text.desc.anchor.y=0.5;
    this.text.desc.resolution=1;
}

Platformer.EndState.prototype.create=function() {
    if(this.level_id==3 && !this.player_prop.power) this.displayScrollChoice();
    else if(this.level_id==3) {
        this.game.audio_bg.stop();
        this.game.state.start('ChooseLevel',true,false,4);
    }
    else if(this.level_id==5) {
        var lock_level=JSON.parse(localStorage.getItem('locklevel'));
        if(lock_level.indexOf(6)>=0) lock_level.splice(lock_level.indexOf(6),1);
        localStorage.setItem('locklevel',JSON.stringify(lock_level));
        this.game.audio_bg.stop();
        this.game.state.start('ChooseLevel',true,false,6);
    }
    else if(this.level_id==game.nb_level) this.init_end();
    else game.goToNextLevel();
}

Platformer.EndState.prototype.displayScrollChoice=function() {
    var bg=this.game.add.image(0,0,"bg_level_1");
    var parch=this.game.add.image(450,250,"parch");
    parch.anchor.setTo(0.5,0.5);
    
    var scroll_group=this.game.add.group();
    var scrolls=this.player_prop.scrolls;
    for (var i in scrolls) {
        this.sprites[i]=this.game.add.image(450,170,scrolls[i]);
        this.sprites[i].name=scrolls[i];
        this.sprites[i].anchor.setTo(0.5);
        this.sprites[i].scale.setTo(0.3);
    }
    if(scrolls.length==0) {
        this.story=new Platformer.Story(this,"noscroll",function(){
            this.story=null;
            this.game.state.start('ChooseLevel',true,false,1);
        });
    }
    else {
        var enter=this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enter.onDown.add(function(){
            this.player_prop.power=this.sprites[this.current_scroll].name;
            localStorage.setItem("player_prop",JSON.stringify(this.player_prop));
            var lock_level=JSON.parse(localStorage.getItem('locklevel'));
            if(lock_level.indexOf(4)>=0) lock_level.splice(lock_level.indexOf(4),1);
            localStorage.setItem('locklevel',JSON.stringify(lock_level));
            this.game.state.start('ChooseLevel',true,false,4);
            displayPower();
        },this);
        this.paddle=this.game.add.image(0,0,"paddle");
        this.paddle.anchor.setTo(0.5);
        this.paddle.scale.setTo(0.3);
        this.paddle.x=this.sprites[0].centerX;
        this.paddle.y=this.sprites[0].bottom+35;
        this.paddle.isMoving=false;
        var text_group=this.game.add.group();
        text_group.add(this.text.title);
        text_group.add(this.text.desc);
        this.text.title.x=450;
        this.text.title.y=330;
        this.text.desc.x=450;
        this.text.desc.y=390;
        this.story=new Platformer.Story(this,"scroll",function(){
            this.cursors=this.game.input.keyboard.createCursorKeys();
            this.story=null;
            this.tween=this.game.add.tween(this.sprites[0]).to({"y":this.sprites[0].y-20},300,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
        });
        this.displayInfo();
    }
}

Platformer.EndState.prototype.update=function() {
    //replace some elements on canvas
    var first=false;
     if(this.sprites.length==2 && this.sprites[0].x==this.sprites[1].x) {
         first=true;
        this.sprites[0].x-=this.sprites[0].width*0.8;
        this.sprites[1].x+=this.sprites[1].width*0.8;
    }
    else if(this.sprites.length==3  && this.sprites[0].x==this.sprites[1].x) {
         first=true;
        this.sprites[0].x-=this.sprites[0].width*1.5;
        this.sprites[2].x+=this.sprites[2].width*1.5;
    }
    if(first) {
        this.paddle.x=this.sprites[0].centerX;
        this.paddle.y=this.sprites[0].bottom+35;
        this.paddle.isMoving=false;
        this.displayInfo();
    }
    //inputs
    if(this.story) {
        this.story.update();
        return;
    }
    if(!this.paddle) return;// Necessary because update is called between level change
    if(this.paddle.isMoving) return;
    if(this.cursors.left.isDown && this.current_scroll>0 && this.sprites.length>1) {//select left
        this.cursors.left.reset();
        if(this.tween) this.tween.stop();
        this.sprites[this.current_scroll].y=170;
        this.current_scroll--;
        var tween=this.game.add.tween(this.paddle).to({"x":this.sprites[this.current_scroll].centerX,"y":this.paddle.y},
                                                      200,Phaser.Easing.Circular.Out,true,0,0,false);
        this.paddle.isMoving=true;
        tween.onComplete.add(function(){
            this.paddle.isMoving=false;
            this.tween=this.game.add.tween(this.sprites[this.current_scroll]).to({"y":this.sprites[this.current_scroll].y-20},300,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
            this.displayInfo();
        },this);
    }
    else if(this.cursors.right.isDown && this.current_scroll<this.sprites.length && this.sprites.length>1) {//select right
        this.cursors.right.reset();
        if(this.tween) this.tween.stop();
        this.sprites[this.current_scroll].y=170;
        this.current_scroll++;
        var tween=this.game.add.tween(this.paddle).to({"x":this.sprites[this.current_scroll].centerX,"y":this.paddle.y},
                                                      200,Phaser.Easing.Circular.Out,true,0,0,false);
        this.paddle.isMoving=true;
        tween.onComplete.add(function(){
            this.paddle.isMoving=false;
            this.tween=this.game.add.tween(this.sprites[this.current_scroll]).to({"y":this.sprites[this.current_scroll].y-20},300,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
            this.displayInfo();
        },this);
    }
}
Platformer.EndState.prototype.init_end=function() {
    this.game.audio_bg.stop();
    this.game.audio_bg=this.game.add.audio('menu');
    if(!this.game.mute) this.game.audio_bg.loopFull();
    this.map=this.game.add.tilemap("end");
    this.map.addTilesetImage("tilesheet", "map_tiles");
    this.bg=this.game.add.image(0,0,"bg_level_1");
    this.bg.height=900*this.bg.height/this.bg.width;
    this.bg.width=900;
    this.layers={};
    this.map.layers.forEach(function (layer) {
        this.layers[layer.name]=this.map.createLayer(layer.name);
    }, this);
    this.layers[this.map.layer.name].resizeWorld();
    var st=this.map.objects.Objects[0];
    var p=this.game.add.sprite(st.x,st.y+st.height,'player_spritesheet');
    p.anchor.setTo(0,1);
    p.scale.setTo(0.5);
    p.animations.add('idle',[10,11,12,13,14,13,12,11],13,true);
    p.animations.play('idle');
    this.story=new Platformer.Story(this,"end",function(){
        this.player_prop.finish=true;
        localStorage.setItem("player_prop",JSON.stringify(this.player_prop));
        game.backToMenu();
    });
}
Platformer.EndState.prototype.displayInfo=function() {
    this.text.title.addColor(this.scroll[this.sprites[this.current_scroll].name].color,0);
    this.text.title.text=this.sprites[this.current_scroll].name;
    this.text.desc.text=this.scroll[this.sprites[this.current_scroll].name].desc;
}

game.state.add("EndState", new Platformer.EndState());