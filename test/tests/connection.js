var should = require('chai').should(),
  http = require('http'),
  app = require('../app').app;

describe('Testing a simple app', function () {
  var server;
  var response = {};

  before(function () {
    server = app.listen();
  });

  before(function (done) {
    var req = http.get(
      'http://localhost:' + server.address().port + '/auth/forcedotcom',
      function (res) {
        response.res = res;
        res.on('data', function (chunk) {
          response.body += chunk;
        });
        res.on('end', function () {
          done();
        });
      }
    );
  });

  describe('Express should respond',function(){
    it('with a redirect',function(done){
      response.res.should.have.property('statusCode').to.equal(302);
      done();
    });
  });

  after(function () {
    server.close();
  });
});
