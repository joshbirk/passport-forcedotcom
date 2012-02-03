var https = require('https'); //need to offer switch
var http = require('http');


function RESTProxy(options, req, res){
    var label = req.params.label;
    var mode = req.params.mode;
    var host = options.host;
    var http = http;
    if(options.useHTTPS) {
      http = https;
    }
    
    var data = '';

    //define endpoint
    var path = req.url.replace('/'+label+'/'+mode,'');
    var page = null;

    if(mode == 'view') {
      page = path.split('/')[1];
      path = path.replace('/'+page,'');
    }

    var proxy_options = {
      host: options.host,
      path: path,
      method: req.method,
      headers: options.headers
    };
    console.log(proxy_options);

    var _req = http.request(proxy_options, function(_res) {
      _res.on('data', function(_data) {
        data += _data;
      });

      _res.on('end', function(d) {
        console.log("DATA");
        if(mode == "json") {
          res.send(data);
          }
        if(mode == "view") {
          res.render(page,JSON.parse( data ));
          }
        });

      }).on('error', function(e) {
        console.log("ERROR");
        console.log(e);
        res.send(e);
      });

    _req.end();
  }


exports.proxy = RESTProxy;