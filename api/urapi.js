//. urapi.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    request = require( 'request' ),
    api = express();

api.use( bodyParser.urlencoded( { extended: true } ) );
api.use( bodyParser.json() );
api.use( express.Router() );

api.post( '/urapi', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );
  var text = req.body.text;

  var db_headers = { 
    //'Accept-Language': 'ja',
    'Content-Type': 'application/json',
    'Accept': 'application/json' 
  };
  var data = {
    content: text,
    contentType: 'text/plain',
    //twitter: userId: 'dotnsf',
    //twitter: contentType: 'application/json',
    contentLanguage: 'ja'
  };
  var option = {
    url: 'https://ibm-pi-demo.mybluemix.net/api/profile/text',
    //twitter: url: 'https://ibm-pi-demo.mybluemix.net/api/profile/twitter',
    method: 'POST',
    json: data,
    headers: db_headers
  };
  request( option, ( err, res0, body ) => {
    if( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err }, null, 2 ) );
      res.end();
    }else{
      //console.log( body );
      if( body.status ){
        res.status( body.status );
      }else if( body.code ){
        res.status( body.code );
      }
      if( body.status == 200 ){
        res.write( JSON.stringify( { status: true, result: body.result }, null, 2 ) );
        res.end();
      }else{
        //twitter: 'User credentials cannot be null'
        res.write( JSON.stringify( { status: false, error: body.error }, null, 2 ) );
        res.end();
      }
    }
  });
});

module.exports = api;
