Platformer.Story=function(level_state,story,callBack) {
    this.level_state=level_state;
    this.story=game.story[story];
    this.callBack=callBack;
    
    this.spacebar=this.level_state.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    setTimeout(function(story) {//blinking 'spacebar'
        story.sp=story.level_state.game.add.image(story.text.right-130,story.text.bottom-10,'spacebar');
        story.sp.alpha=0; story.sp_tween=story.level_state.game.add.tween(story.sp).to({"alpha":1},2000,Phaser.Easing.Quadratic.Out,true,0,1,true).loop(true);
    },1000,this);
    this.text=this.level_state.game.add.text(100,50,this.story[0],{"font":"18pt Matura MT Script Capitals","wordWrap":true,"wordWrapWidth":700});
    this.text.alpha=0;
    this.text.resolution=1;
    var tween=this.level_state.game.add.tween(this.text).to({'alpha':1},700,Phaser.Easing.Linear.In,true);
    this.current=0;
}
Platformer.Story.prototype.update=function() {
    if(this.spacebar && this.spacebar.isDown) {
        this.spacebar.reset();
        this.spacebar=null;
        if(!this.story[this.current+1]) {
           this.callBack.call(this.level_state);
            this.text.destroy();
            if (this.sp) this.sp.destroy();
        }
        else {
            var t1=this.level_state.game.add.tween(this.text).to({'alpha':0},300,Phaser.Easing.Linear.In,true);
            
            var text=this.level_state.game.add.text(100,50,this.story[this.current+1],{"font":"18pt Matura MT Script Capitals","wordWrap":true,"wordWrapWidth":700});
            
            text.alpha=0;
            var t2=this.level_state.game.add.tween(text).to({'alpha':1},400,Phaser.Easing.Linear.In);
            t1.chain(t2);
            t2.onComplete.add(function(t){
                this.text=t;
                this.spacebar=this.level_state.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            },this);
            this.current++;
        }
    }
}