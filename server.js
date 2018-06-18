console.log('Start server');

var express = require('express'), app = express(app), server = require('http').createServer(app);
// serve static files from the current directory
app.use(express.static(__dirname));

var EurecaServer = require('eureca.io').EurecaServer;
//create an instance of EurecaServer
var eurecaServer = new EurecaServer({allow:['setId','setTile', 'setMarker', 'connect']});
var clients = {};

var map = [];

for (var i = 0; i < 40; i++) {
	map[i] = [];
	for (var j = 0; j < 40; j++) {
		map[i][j] = -1;
	}
}
//attach eureca.io to our http server
eurecaServer.attach(server);
//detect client connection
eurecaServer.onConnect(function (conn) {
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);

		for(var c in clients)
		{
				try {
						clients[c].remote.connect(conn.id);
				} catch (e) {

				}
		}

    var remote = eurecaServer.getClient(conn.id);
    clients[conn.id] = {id:conn.id, remote:remote};
    remote.setId(conn.id);
});
//detect client disconnection
eurecaServer.onDisconnect(function (conn) {
    console.log('Client disconnected ', conn.id);

    var removeId = clients[conn.id].id;
    delete clients[conn.id];
});

eurecaServer.exports.handshake = function()
{
}

eurecaServer.exports.debug = function(i)
{
	console.log('debug ' + i);
}

eurecaServer.exports.updateMap = function(id)
{
	console.log('update map');
	var remote = clients[id].remote;
	for (var i = 0; i < 40; i++) {
		for (var j = 0; j < 40; j++) {
			var t = map[i][j]
			if (t != -1)
			{
				remote.setTile(i, j, t);
			}
		}
	}
}

eurecaServer.exports.getClients = function(id)
{
		var r = [];
		var i = 0;
		for(var c in clients)
		{
				r[i++] = c;
		}
		return r;
}

eurecaServer.exports.setMarker = function(id, x, y)
{
		for(var c in clients)
		{
				if(id != c)
				{ clients[c].remote.setMarker(id, x, y);}
		}
}

eurecaServer.exports.getTile = function(x, y)
{
	console.log('get tile %d %d', x, y);
	console.log('%d', map[x][y]);
	return map[x][y];
}

eurecaServer.exports.setTile = function(id, x, y, v)
{
	map[x][y] = v;
	for(var c in clients)
	{
		if (id != c)
		{clients[c].remote.setTile(x, y, v);}
	}
}

server.listen(8001);
