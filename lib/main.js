/**
 * @author: laoono
 * @date:  2016-06-02
 * @time: 17:46
 * @contact: laoono.com
 * @description: #
 */

var formidable = require("formidable");
var http = require("http")
    , fs = require("fs")
    , jade = require("jade")
    , hash = require("hash-util")
    , url = require("url")
    , cfg = require("./config")
    , staticParse = require("./static")
    , util = require("util");

const path = require('path');


function mkdirs(dirname, callback) {  
    fs.exists(dirname, function (exists) {  
        if (exists) {  
            callback(dirname);  
        } else {  
            mkdirs(path.dirname(dirname), function () {  
                fs.mkdir(dirname, function () {
                    callback(dirname);
                });  
            });  
        }  
    });  
} 

function init(config, root) {

    var limitSize = config.limitSize || cfg.limitSize
        , cfgUrl = config.url || cfg.url
        , cfgRoot = config.root || cfg.root
        , dir = config.directory || cfg.directory
        , wsUrl = config.wsUrl || cfg.wsUrl
        , wsPort = config.wsPort || cfg.wsPort
        , MIME = config.MIME || cfg.MIME;

    limitSize = Number(config.limitSize);

    var output = {
        data: ""
        , code: 100
    };

    var isMIME = function (m) {
        var flag;
        for (var M of MIME) {
            if (M === m) {
                flag = true;
                break;
            }
        }

        return flag ? true : false;
    };


    http.createServer(function (req, res) {
        var router = url.parse(req.url, true)
            , path = router.pathname
            , query = router.query || {}
            , static = query.static
            , method = req.method.toLowerCase();

        if (path === "/upload/" && method === "get" && static) {
            var fileDir = root + "/layout/src/" + static;
            staticParse.renderFile(fileDir, req, res);
        }

        if (req.url == "/upload" && req.method.toLowerCase() == "post") {
            var form = new formidable.IncomingForm();

            form.maxFieldsSize = 1 * 1024 * 1024;
            form.multiples = false;

            form.parse(req, function (err, fields, files) {

                res.writeHead(200, {
                    "content-type": "application/json"
                });

                // res.write("received upload \n\n");


                var tmp = files.upload.path
                    , type
                    , name
                    , size = files.upload.size
                    , _res
                    , time = +new Date()
                    , target = files.upload.name;

                const date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth();

                month = month < 10 ? `0${month}` : month;

                const dirDate = `${year}-${month}`;
                const dirFullDate = path.join(dir, dirDate);

                if (size > limitSize) {
                    res.write("limited: size");
                    res.end();
                    return;
                }

                if (!isMIME(files.upload.type)) {
                    res.write("limited: MIME");
                    res.end();
                    return;
                }

                name = target.slice(0, target.lastIndexOf("."));
                type = target.slice(target.lastIndexOf("."));

                _res = hash.md5(time + name + type);

                mkdirs(dirFullDate, function(dir) {
                    target = dir + "/" + _res + type;

                    try {
                        // fs.renameSync(tmp, target);
                        var readStream = fs.createReadStream(tmp);
                        var writeStream = fs.createWriteStream(target);

                        readStream.pipe(writeStream);
                        readStream.on('end', function () {
                            fs.unlinkSync(tmp);
                        });

                        output.data = cfgUrl + cfgRoot + "/" + _res + type;
                        output.code = 100;
                    } catch (e) {
                        output.data = "";
                        output.code = 103;
                    }

                    res.end(JSON.stringify(output));
                });
            });

            return;
        }

        res.writeHead(200, {'content-type': 'text/html'});

        var tplData = {};
        
        if (wsUrl) {
            tplData.wsUrl = wsUrl;
        }
        
        var html = jade.renderFile(root + "/layout/upload.jade", tplData);

        res.end(html);
    }).listen(8080);
    
    
    if (wsUrl) {
        var  s = require("./socket"); 
        s.socket(wsPort);
    }
}

exports.init = init;
