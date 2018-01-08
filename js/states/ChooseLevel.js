Platformer.ChooseLevel=function() {
      "use strict";
    Phaser.State.call(this);
};
var code={
    'Enter':0,
    'ArrowUp':1,
    'ArrowDown':2,
    'ArrowLeft':3,
    'ArrowRight':4
};
Platformer.ChooseLevel.prototype = Object.create(Phaser.State.prototype);
Platformer.ChooseLevel.prototype.constructor = Platformer.ChooseLevel;

Platformer.ChooseLevel.prototype.init=function(level_id) {
    this.game.add.image(0,0,'titlescreen');
    this.current_level=level_id;
    this.currentSelect={};
    if(level_id<=3) this.currentSelect.y=1;
    else if(level_id<=5) this.currentSelect.y=2;
    else this.currentSelect.y=3;
    if(level_id==1 || level_id==4 ||level_id==6) this.currentSelect.x=1;
    else if(level_id==3) this.currentSelect.x=3;
    else this.currentSelect.x=2;
    
    //get level_unlock save in local database
    var lock_level;
    try {
        lock_level=JSON.parse(localStorage.getItem('locklevel'));
    }catch(e) {}
    if(!lock_level) {
        lock_level=[1,2,3,4,5,6,7];
        //lock_level=[];
        localStorage.setItem('locklevel',JSON.stringify(lock_level));
    }
    this.first_time_play=(lock_level.indexOf(1)>=0);
    if(this.first_time_play) lock_level=[2,3,4,5,6,7];
    
    if((!this.game.audio_bg || !this.game.audio_bg.isPlaying) && !this.game.mute) {
        this.game.audio_bg=this.game.add.audio('menu');
        this.game.audio_bg.volume=0.5;
        this.game.audio_bg.loopFull();
    }
    
    //create levels display
    this.levels=[];
    this.levels[1]=[];
    this.levels[2]=[];
    this.levels[3]=[];
    for (var i=1;i<4;i++) { //level 1 to 3
        var l=this.game.add.image(75*i+(i-1)*200,50,'bg_level_1');
        l.level_nb=i;
        this.levels[1][i]=l;
    }
    this.levels[2][1]=this.game.add.image(200,200,'bg_level_2');
    this.levels[2][1].level_nb=4;
    this.levels[2][2]=this.game.add.image(500,200,'bg_level_2');
    this.levels[2][2].level_nb=5;
                                          
    this.levels[3][1]=this.game.add.image(200,350,'bg_level_3');
    this.levels[3][1].level_nb=6;
    this.levels[3][2]=this.game.add.image(500,350,'bg_level_3');
    this.levels[3][2].level_nb=7;
    
    for (var i in this.levels) {
        for (var j in this.levels[i]) {
            var obj=this.levels[i][j]
            obj.width=200;
            obj.height=100;
            if(lock_level.indexOf(obj.level_nb)>=0 && obj.level_nb!=1) {
                var l=this.game.add.sprite(obj.centerX,obj.centerY,'level_nb',0);
                obj.lock=true;
            }
            else {
                var l=this.game.add.sprite(obj.centerX,obj.centerY,'level_nb',obj.level_nb);
                obj.lock=false;
            }
            l.anchor.setTo(0.5);
            obj.children.push(l);
        }
    }
    
    //input
    this.cursors=this.game.input.keyboard.createCursorKeys();
    //left
    this.cursors.left.onDown.add(function() {
        if(!this.inputEnabled) return;
        if(this.levels[this.currentSelect.y][this.currentSelect.x-1]) this.currentSelect.x--;
        else if(this.levels[this.currentSelect.y-1][this.levels[this.currentSelect.y-1].length-1]) {
            this.currentSelect.y--;
            this.currentSelect.x=this.levels[this.currentSelect.y].length-1;
        }
        this.updateGraphics();
    },this);
    //right
    this.cursors.right.onDown.add(function() {
        if(!this.inputEnabled) return;
        if(this.levels[this.currentSelect.y][this.currentSelect.x+1] && !this.levels[this.currentSelect.y][this.currentSelect.x+1].lock){
            this.currentSelect.x++;
        } 
        else if(this.levels[this.currentSelect.y+1][1] && !this.levels[this.currentSelect.y+1][1].lock) {
            this.currentSelect.y++;
            this.currentSelect.x=1;
        }
        this.updateGraphics();
    },this);
    //up
    this.cursors.up.onDown.add(function(){
        if(!this.inputEnabled) return;
        if(this.current_level>3) this.currentSelect.y--;
        this.updateGraphics();
    },this);
    //down
    this.cursors.down.onDown.add(function(){
        if(!this.inputEnabled) return;
        if(this.current_level<6 && !this.levels[this.currentSelect.y+1][this.currentSelect.x].lock) {
            this.currentSelect.y++;
            if(this.currentSelect.x==3 && !this.levels[2][2].lock) this.currentSelect.x=2;
        }
        this.updateGraphics();
    },this);
    //enter
    this.enter=this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.enter.onDown.add(function() {
        if(!this.inputEnabled) return;
        if(this.first_time_play && this.current_level==1) this.current_level=0;
        else this.game.audio_bg.stop();
        this.game.toLevel(this.current_level);
    },this);
    
    //back UI
    var ui=this.game.add.sprite(30,435,'ui',2);
    var t=this.game.add.sprite(90,ui.centerY,'text_ui',2);
    t.anchor.setTo(0,0.5);
    this.back=this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    this.back.onDown.add(function(){
        if(!this.game.mute) this.game.audio_select.play();
        this.game.state.start('MenuState');
    },this);
    
    //audio
    
    //Transition animation - Panel opening at start
    var il=this.game.add.image(0,0,'trans_l');
    var ir=this.game.add.image(450,0,'trans_r');
    var tl=this.game.add.tween(il).to({"x":-450},800,Phaser.Easing.Quadratic.Out);
    var tr=this.game.add.tween(ir).to({"x":900},800,Phaser.Easing.Quadratic.Out);
    tr.onComplete.add(function(){
         this.inputEnabled=true;
         this.updateGraphics();
    },this)
    setTimeout(function() {tl.start();},800,tl);
    setTimeout(function() {tr.start();},800,tr);
}
Platformer.ChooseLevel.prototype.updateGraphics=function() {
    //change current select
    var c=this.levels[this.currentSelect.y][this.currentSelect.x];
    this.current_level=c.level_nb;
    if(this.tween) this.tween.stop(true);
    this.tween=this.game.add.tween(c.children[0].scale).to({'x':1.3,'y':1.3},500,Phaser.Easing.Linear.Out,true).yoyo(true).loop(true);
    this.tween.onComplete.add(function(){
        this.scale.setTo(1);
    },c.children[0]);
}

game.state.add('ChooseLevel', new Platformer.ChooseLevel());