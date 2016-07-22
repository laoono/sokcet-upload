/**
 * @author: laoono
 * @date:  2016-06-03
 * @time: 10:52
 * @contact: laoono.com
 * @description: #
 */

function socket(port) {
    port = Number(port) || 5000;
    
    var WebSocketServer = require("ws").Server
        , wss = new WebSocketServer({port: port});
    
    wss.broadcast = function broadcast(data) {
        // console.log(data);
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            // console.log('received: %s', message);
            var _mesg = JSON.parse(message);
            
            if (_mesg.online) {
                return;
            }
        
            try {
                // ws.send('something - 1');
                wss.broadcast(message);
            } catch (err) {

            }
        });

        ws.on("close", function (code, mesg) {
            //console.log("closed", code, mesg);
        });
    });
}

exports.socket = socket;
