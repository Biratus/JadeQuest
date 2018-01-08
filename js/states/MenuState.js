//var Platformer = Platformer || {};

Platformer.MenuState = function () {
    "use strict";
    Phaser.State.call(this);
};
 
Platformer.MenuState.prototype = Object.create(Phaser.State.prototype);
Platformer.MenuState.prototype.constructor = Platformer.MenuState;

Platformer.MenuState.prototype.create=function() {
    this.init_titleScreen();
}

Platformer.MenuState.prototype.init_titleScreen=function() {
    this.game.world.removeAll();
    var bg=this.game.add.image(0,0,'titlescreen');
    var title=this.game.add.image(450,10,'title');
    title.anchor.setTo(0.5,0);
    this.main_group=this.game.add.group();
    this.gotos=[];
    this.gotos[0]=this.game.add.sprite(450,0,'gotos',0);
    this.main_group.add(this.gotos[0]);
    this.gotos[1]=this.game.add.sprite(450,0,'gotos',1);
    this.main_group.add(this.gotos[1]);
    this.gotos[2]=this.game.add.sprite(450,0,'gotos',2);
    this.main_group.add(this.gotos[2]);
    this.main_group.align(1,3,400,100,Phaser.CENTER);
    this.main_group.alignIn(bg,Phaser.CENTER);
    this.main_group.y+=50;
    
    this.cursors=this.game.input.keyboard.createCursorKeys();
    this.enter=this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.currentSelect=0;
    this.select=this.game.add.image(450,this.gotos[0].y+this.main_group.top,"selection");
    this.select.anchor.x=0.5;
    this.select.anchor.y=0.5;
    
    this.cursors.down.reset();
    this.cursors.down.onDown.add(function(){
        if(this.currentSelect<2) {
            this.select.y=this.gotos[this.currentSelect+1].y+this.main_group.top;
            this.currentSelect++;
        }
    },this);
    this.cursors.up.reset();
    this.cursors.up.onDown.add(function(){
        if(this.currentSelect>0) {
            this.select.y=this.gotos[this.currentSelect-1].y+this.main_group.top;
            this.currentSelect--;
        }
    },this);
    this.enter.reset();
    this.enter.onDown.add(function() {
        this.changeScreen(this.currentSelect);
    },this);
    
    var p=JSON.parse(localStorage.getItem('player_prop'));
    if(p.finish) {
        var ui=this.game.add.sprite(30,455,'ui',1);
        ui.scale.setTo(0.7);
        var t=this.game.add.sprite(75,ui.centerY,'text_ui',0);
        t.anchor.setTo(0,0.5);
        this.reset=this.game.input.keyboard.addKey(Phaser.Keyboard.R);
        this.reset.onDown.add(function(){
            localStorage.clear();
            displayPower();
            this.game.state.start("BootState", true, false, "json/asset.json");
        },this);
    }
    if((!this.game.audio_bg || !this.game.audio_bg.isPlaying) && !this.game.mute) {
        this.game.audio_bg=this.game.add.audio('menu');
        this.game.audio_bg.volume=0.8;
        this.game.audio_bg.loopFull();
    }
    this.game.audio_select=this.game.add.audio('select');
    this.game.audio_select.volume=0.5;
    
    //sound
    var t=this.game.add.sprite(800,460,'text_ui',1);
    var ui=this.game.add.sprite(0,0,'ui',0);
    ui.anchor.setTo(1,0.5);
    ui.y=t.centerY;
    ui.x=t.x-5;
    ui.scale.setTo(0.7);
    
    this.sound=this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.sound.onDown.add(function(){
        this.game.mute=!this.game.mute;
        if(this.game.mute) this.game.audio_bg.stop();
        else this.game.audio_bg.play();
    },this);
}
Platformer.MenuState.prototype.changeScreen=function(dest) {
    if(!this.game.mute) this.game.audio_select.play();
    switch(dest) {
        case 0:
            this.init_levelScreen();
            break;
        case 1:
            this.init_shopScreen();
            break;
        case 2:
            this.game.world.removeAll();
            for (var i in this.gotos) {
                this.gotos[i].destroy();
            }
            this.gotos=[];
            this.game.add.image(0,0,'credit');
            if(!this.back) {//back
                this.back=this.game.input.keyboard.addKey(Phaser.Keyboard.B);
                this.back.onDown.add(function(){
                    if(!this.game.mute) this.game.audio_select.play();
                    this.changeScreen(3);
                },this);
            }
            break;
        case 3:
            this.init_titleScreen();
            break;
    }
    //transition panels
    if(dest!="play") {
        var il=this.game.add.image(0,0,'trans_l');
        var ir=this.game.add.image(450,0,'trans_r');
        var tl=this.game.add.tween(il).to({"x":-450},800,Phaser.Easing.Quadratic.Out);
        var tr=this.game.add.tween(ir).to({"x":900},800,Phaser.Easing.Quadratic.Out);
        setTimeout(function() {tl.start();},800,tl);
        setTimeout(function() {tr.start();},800,tr);
    }
}

Platformer.MenuState.prototype.init_levelScreen=function() {
    this.game.state.start('ChooseLevel',true,false,1);
} 
Platformer.MenuState.prototype.init_shopScreen=function() {
    this.game.world.removeAll();
    for (var i in this.gotos) {
        this.gotos[i].destroy();
    }
    this.gotos=[];
    this.game.add.image(0,0,'shop_bg');
    this.player_prop=JSON.parse(localStorage.getItem('player_prop'));
    
    this.ui=[];
    this.current='shuriken';
    this.ui[0]=this.game.add.sprite(475,216,'shop_state',this.player_prop.shop.shuriken);
    this.ui[0].anchor.setTo(0.5);
    this.ui[1]=this.game.add.sprite(475,326,'shop_state',this.player_prop.shop.katana);
    this.ui[1].anchor.setTo(0.5);
    this.inputEnabled=true;
    
    this.audio_craft=this.game.add.audio('craft');
    this.audio_nocraft=this.game.add.audio('nocraft');
    this.audio_equip=this.game.add.audio('equip');
    //Input
    //down
    this.cursors.down.reset();
    this.cursors.down.onDown.add(function() {
        if(!this.inputEnabled) return;
        if(this.current=='katana') return;
        this.tween.stop();
        this.ui[1].scale.x=1;
        this.ui[1].scale.y=1;
        this.tween=this.game.add.tween(this.ui[1].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
        this.current='katana';
    },this);
    //up
    this.cursors.up.reset();
    this.cursors.up.onDown.add(function() {
        if(!this.inputEnabled) return;
        if(this.current=='shuriken') return;
        this.tween.stop();
        this.ui[0].scale.x=1;
        this.ui[0].scale.y=1;
        this.tween=this.game.add.tween(this.ui[0].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
        this.current='shuriken';
    },this);
    //enter
    this.enter.reset();
    this.enter.onDown.add(function() {
        if(!this.inputEnabled) return;
        var spr=this.ui[0];
        if(this.current=='katana') spr=this.ui[1]; 
        switch(spr.frame) {
            case 1://craft item
                //Shuriken selected
                if(this.current=='shuriken' && this.player_prop.res>=5) {
                    this.player_prop.res-=5;
                    this.player_prop.shop.shuriken=2;
                   if(!this.game.mute)  this.audio_craft.play();
                }
                else if(this.current=="shuriken") {//player can't craft
                    this.tween.stop();
                    this.ui[0].scale.setTo(1);
                    if(!this.game.mute) this.audio_nocraft.play();
                    if(!this.warn) {
                        this.warn=true;
                        var grp=this.game.add.group();
                        var r=this.game.add.image(10,10,'resource',0,grp);
                        r.scale.setTo(0.7);
                        var t=this.game.add.text(80,30,this.player_prop.res,{"font":"18pt Matura MT Script Capitals"});
                        t.y=r.centerY;
                        t.anchor.setTo(0,0.5);
                        grp.add(t);
                        var tw=this.game.add.tween(grp).to({"x":350,"y":190},500,Phaser.Easing.Quadratic.Out,true,200).yoyo(true);
                        var tw1=this.game.add.tween(grp.scale).to({"x":3,"y":3},499,Phaser.Easing.Quadratic.Out,true,200).yoyo(true);
                        this.inputEnabled=false;
                        tw.onComplete.add(function(g) {
                            g.destroy();
                            this.inputEnabled=true;
                        },this);
                        this.tween=this.game.add.tween(this.ui[0].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
                        tw.chain(this.tween);
                        
                    }
                    else {
                        this.tween.stop();
                        this.ui[0].scale.setTo(1);
                        this.ui[0].x-=4;
                        var tw=this.game.add.tween(this.ui[0]).to({"x":this.ui[0].x+7},30,Phaser.Easing.Linear.Out,true).yoyo(true).loop(true);
                        tw.rep=0;
                        this.inputEnabled=false;
                        tw.onRepeat.add(function(spr,tw) {
                            tw.rep++;
                            if(tw.rep>=8) {
                                tw.stop();
                                spr.x=475;
                                this.inputEnabled=true;
                            }
                        },this);
                        this.tween=this.game.add.tween(this.ui[0].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
                        tw.chain(this.tween);
                    }
                }
                
                //Katana selected
                if(this.current=='katana' && this.player_prop.res>=10) {
                    this.player_prop.res-=10;
                    this.player_prop.shop.katana=2;
                    if(!this.game.mute) this.audio_craft.play();
                }
                else if(this.current=="katana") {//player can't craft
                    if(!this.game.mute) this.audio_nocraft.play();
                    this.tween.stop();
                    this.ui[1].scale.setTo(1);
                    if(!this.warn) {
                        this.warn=true;
                        var grp=this.game.add.group();
                        var r=this.game.add.image(10,10,'resource',0,grp);
                        r.scale.setTo(0.7);
                        var t=this.game.add.text(80,30,this.player_prop.res,{"font":"18pt Matura MT Script Capitals"});
                        t.y=r.centerY;
                        t.anchor.setTo(0,0.5);
                        grp.add(t);
                        var tw=this.game.add.tween(grp).to({"x":350,"y":190},500,Phaser.Easing.Quadratic.Out,true,200).yoyo(true);
                        var tw1=this.game.add.tween(grp.scale).to({"x":3,"y":3},499,Phaser.Easing.Quadratic.Out,true,200).yoyo(true);
                        this.inputEnabled=false;
                        tw.onComplete.add(function(g) {
                            g.destroy();
                            this.inputEnabled=true;
                        },this);
                        this.tween=this.game.add.tween(this.ui[1].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
                        tw.chain(this.tween);
                    }
                    else {
                        this.tween.stop();
                        this.ui[1].scale.setTo(1);
                        this.ui[1].x-=4;
                        var tw=this.game.add.tween(this.ui[1]).to({"x":this.ui[1].x+7},30,Phaser.Easing.Linear.Out,true).yoyo(true).loop(true);
                        tw.rep=0;
                        this.inputEnabled=false;
                        tw.onRepeat.add(function(spr,tw) {
                            tw.rep++;
                            if(tw.rep>=8) {
                                tw.stop();
                                spr.x=475;
                                this.inputEnabled=true;
                            }
                        },this);
                        this.tween=this.game.add.tween(this.ui[1].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
                        tw.chain(this.tween);
                    }
                }
                break;
            case 2://Equip item
                //change frames
                if(this.player_prop.shop.shuriken==0 && this.current!='shuriken') {
                    this.ui[0].frame=2;
                    this.player_prop.shop.shuriken=2;
                    if(!this.game.mute) this.audio_equip.play();
                }
                else if(this.player_prop.shop.katana==0 && this.current!='katana') {
                    this.ui[1].frame=2;
                    this.player_prop.shop.katana=2;
                    if(!this.game.mute) this.audio_equip.play();
                }
                //set weapon
                this.player_prop.weapon=this.current;
                this.player_prop.shop[this.current]=0;
                break;
        }
        this.ui[0].frame=this.player_prop.shop.shuriken;
        this.ui[1].frame=this.player_prop.shop.katana;
        displayPower();
        this.res_text.text=this.player_prop.res;
        localStorage.setItem('player_prop',JSON.stringify(this.player_prop));
    },this);
    
    //back
    this.back=this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    this.back.onDown.add(function(){
        if(!this.game.mute) this.game.audio_select.play();
        this.changeScreen(3);
    },this);
    
    this.res_text=this.game.add.text(80,30,this.player_prop.res,{"font":"18pt Matura MT Script Capitals"});
    this.res_text.resolution=1;
    
    this.tween=this.game.add.tween(this.ui[0].scale).to({"y":0.9,"x":0.9},500,Phaser.Easing.Linear.Out,true,50).yoyo(true).loop(true);
} 
Platformer.MenuState.prototype.init_credScreen=function() {
    
}

game.state.add("MenuState", new Platformer.MenuState());