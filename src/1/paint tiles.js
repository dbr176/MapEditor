var ready = false;
var eurecaServer;
var mId = 0;
var debugMessage = '';
var updateList = [];
var updLen = 0;
var created = false;

//this function will handle client communication with the server
var eurecaClientSetup = function() {
	
	var eurecaClient = new Eureca.Client();
	eurecaClient.ready(function (proxy) {
  		eurecaServer = proxy;	
	});

	eurecaClient.exports.setId = function(id)
	{
			mId = id;
			create();
			eurecaServer.handshake();
			ready = true;
	}
	eurecaClient.exports.setTile = function(x, y, v)
	{
		updateList.push([x, y, v]);
		updLen+=1;
	}
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload() {
    game.load.tilemap('desert', 'assets/tilemaps/maps/desert.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/tmw_desert_spacing.png');

}

var map;
var layer;

var marker;
var currentTile;
var cursors;


function create() {
	eurecaServer.debug('begin create');
	map = game.add.tilemap('desert');
	map.addTilesetImage('Desert', 'tiles');

	currentTile = map.getTile(2, 3);

	layer = map.createLayer('Ground');

	layer.resizeWorld();

	marker = game.add.graphics();
	marker.lineStyle(2, 0x000000, 1);
	marker.drawRect(0, 0, 32, 32);

	cursors = game.input.keyboard.createCursorKeys();
	eurecaServer.updateMap(mId);	
	created = true;
}

function setTile(x,y,v) 
{
	eurecaServer.debug('try set ' + v);
	map.putTile(v, x, y); 
	eurecaServer.debug('' + bId + ' ' + 'set tile');
}

function update() {
    if (!ready || !created) return;

	for (var i = 0; i < updLen; i++)
	{
		var x = updateList[i][0];
		var y = updateList[i][1];
		var v = updateList[i][2];
		map.putTile(v,x,y);
	}
	updateList = [];
	updLen = 0;

    marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
    marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

    if (game.input.mousePointer.isDown)
    {
        if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
        {
            currentTile = map.getTile(layer.getTileX(marker.x), layer.getTileY(marker.y));
        }
        else
        {
	    var x = layer.getTileX(marker.x);
	    var y = layer.getTileX(marker.y);
	
            if (map.getTile(x, y) != currentTile)
            {
                map.putTile(currentTile, x, y);
		eurecaServer.setTile(mId, x, y, currentTile.index);
            }
        }
    }


    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

}

function render() {

    //game.debug.text('Left-click to paint. Shift + Left-click to select tile. Arrows to scroll.', 32, 32, '#efefef');
  game.debug.text(' ' + updLen, 32, 32, '#efefef');
}
