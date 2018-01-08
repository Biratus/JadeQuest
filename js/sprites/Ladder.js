var Platformer= Platformer || {};

Platformer.Ladder=function(ladder_arr) {
    this.ladder_arr=ladder_arr;
    this.top=ladder_arr[0].top,this.bottom=ladder_arr[ladder_arr.length-1].bottom;
    this.left=ladder_arr[0].worldX;
    this.right=this.left+this.ladder_arr[0].width;
    this.centerX=ladder_arr[0].worldX+ladder_arr[0].centerX;
    this.ladder_top_bottom=this.ladder_arr[0].top+this.ladder_arr[0].height;
}
Platformer.Ladder.prototype.has=function(tile) {
    return this.ladder_arr.indexOf(tile)>=0;
}
Platformer.Ladder.prototype.get_tile=function(x,y) {
    var t;
    this.ladder_arr.forEach(function(tile) {
        if(tile.x==x && tile.y==y) {t=tile;return;}
    });
    return t;
}
Platformer.Ladder.prototype.overlapPlayer=function(player) {
    var r1=new Phaser.Rectangle(this.left,this.top,this.right-this.left,this.ladder_arr[0].height*this.ladder_arr.length);
    var r2=new Phaser.Rectangle();
    r2.copyFrom(player.body);
    return Phaser.Rectangle.intersects(r1,r2);
}
Platformer.Ladder.prototype.toString=function() {
    var str="  Ladder \nnumber: "+this.ladder_arr.length+"\ntop: "+this.top+"\nbottom: "+this.bottom;
    this.ladder_arr.forEach(function(l) {
       str+="x: "+l.x+" y: "+l.y; 
    });
    return str;
}