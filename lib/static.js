/**
 * @author: laoono
 * @date:  2016-06-02
 * @time: 09:42
 * @contact: laoono.com
 * @description: #
 */

var path = require("path")
    , config = require("./config")
    , mime = require("./MIME").mime
    , fs = require("fs");


var renderFile = function (file, req, res) {
    
    var fileFs = fs.readFileSync(file, "binary");
    
    var contentType = mime.lookupExtension(path.extname(file));
    
    res.writeHead(200, {
        "Content-Type": contentType
        , "Content-Length": Buffer.byteLength(fileFs, "binary")
        , "Server": "NodeJS(" + process.version + ")"
    });
    
    res.write(fileFs, "binary");
    res.end();
};

exports.renderFile = renderFile;