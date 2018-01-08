var Phaser = Phaser || {};
var game;
var current="game";
var text;

var Platformer = function() {}

window.onkeydown = function(e) { 
        return !(e.keyCode == 32);
};

function displayPower() {
    var power="No power yet!<br/>Current weapon: ";
    try {
        var prop=JSON.parse(localStorage.getItem('player_prop'));
        if(prop.power) power="Current power: "+prop.power+"<br/>Current weapon: ";
        power+=prop.weapon;
    }catch(e) {power+=" punch";}
    $('#power').html(power);
    setTimeout(function() {
        $('#power').css('left',($(document).width()-25-$('#power').width())+"px");
    },10);
}


$(document).ready(function() {
    $(".page").hide();
    $('#game').show();
    $('#title span:first').ready(function(){
        $('#title span:first').css('margin-right',($(document).width()/2-$('#title span:first').width()/2)+"px");
    });
    $('#title').ready(function(){
        $('#tabs span').css('width',$('#title').width()/7+"px");
        $('#tabs').css('margin-left',$('#title').width()*1.7/7+"px");    
    });
   
    $("span[goto]").on('click',function(){
        if(current==$(this).attr('id')) return;
        $(this).css('background-color','#22A867');
        $(".page").hide();
        $("#"+$(this).attr('goto')).show();
    });
    $('span[goto]').on('mouseover',function(a){
        $(this).css('cursor','pointer');
        $(this).css('background-color','#22A867');
    });
    $('span[goto]').on('mouseout',function(){
        $(this).css('cursor','default');
        $(this).css('background-color','#73F5B6');
    });
    $("#game").css('height',$(document).height()-parseInt($('body').css('margin-top'))-$('#title').height()-$('#tabs').height()+"px");
    
    displayPower();
    
    game.state.start("BootState", true, false, "json/asset.json");
});
 
game = new Phaser.Game(900, 500, Phaser.CANVAS,"game");
game.level_id=0;
game.nb_level=7;

game.goToNextLevel=function() {
    game.level_id++;
    game.toLevel(null);
}

game.restart=function() {
    game.state.restart();
}

game.toLevel=function(level_id) {
    var prop=JSON.parse(localStorage.getItem('player_prop'));
    game.level_id=(level_id!=null)?level_id:game.level_id;
    if(game.level_id>game.nb_level) game.backToMenu(game.level_id);//WIN STATE
    else if(game.level_id==0) game.state.start('LevelState',true,false,"level_0",prop,true);
    else game.state.start('LevelState',true,false,"level_"+game.level_id,prop);
}

game.backToMenu=function(level_id) {
    game.state.start('MenuState',true,false,level_id);
}

game.endLevel=function(player) {
    //save player values
    var prop=JSON.parse(localStorage.getItem("player_prop"));
    prop.res=player.resources;
    prop.scrolls=player.scrolls;
    localStorage.setItem("player_prop",JSON.stringify(prop));
    //start end state
    game.state.start('EndState',true,false,game.level_id,prop);
}