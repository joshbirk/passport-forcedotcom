var should = require('chai').should(),
    child = require('child_process').fork,
    server;

describe('Test suite for ForceDotCom strategy',function(){

  it('Express should run',function(done){
    // Begin our test server
    server = child(process.cwd()+'/test/app.js');
    server.on('message',function(m){
      if(m==="running") done();
    });
  });

  // Require any tests in this block
  require(process.cwd()+'/test/tests/connection.js');
  // End of required tests

  after(function(done){
    // Kill our test server
    server.kill();
    done();
  });
});
