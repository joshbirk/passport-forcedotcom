var http = require('http');

describe('Testing a simple app',function(){
  var response = {};
  before(function(done){
    var req = http.get("http://localhost:3000/auth/forcedotcom", function(res) {
      response.res = res;
      res.on('data', function (chunk) {
        response.body += chunk;
      });
      res.on('end', function () {
        done();
      });
    });
  });

  describe('Express should respond',function(){
    it('with a redirect',function(done){
      response.res.should.have.property('statusCode').to.equal(302);
      done();
    });
  });
});
