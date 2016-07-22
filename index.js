var upload = require("./lib/main");
var root = __dirname;

exports.init = function(cfg) {
    cfg = cfg || {};
    
    upload.init(cfg, root);
};

