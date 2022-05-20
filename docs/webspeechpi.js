//. webspeechpi.js
var flag_speech = 0;
var texts = '';

function vr_function() {
  window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition(); //webkitSpeechRecognition();
  recognition.lang = 'ja';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onsoundstart = function() {
    $('#status').html( '認識中' );
  };
  recognition.onnomatch = function() {
    $('#status').html( 'もう一度試してください。' );
  };
  recognition.onerror = function() {
    $('#status').html( 'エラー' );
    if( flag_speech == 0 ){
      vr_function();
    }
  };
  recognition.onsoundend = function() {
    $('#status').html( '停止中' );
    vr_function();
  };

  recognition.onresult = function(event) {
    var results = event.results;
    for( var i = event.resultIndex; i < results.length; i++ ){
      if( results[i].isFinal ){
        var text = results[i][0].transcript;
        $('#result_text').html( text );

        texts += text;
        $('#result_texts').html( texts );
        
        vr_function();

        //. タグクラウド
        generateTagCloud();
      }else{
        var text = results[i][0].transcript;
        $('#result_text').html( "[途中経過] " + text );
        flag_speech = 1;
      }
    }
  }

  flag_speech = 0;
  $('#status').html( 'Start' );
  recognition.start();

  $('#miconbtnspan').css( 'display', 'none' );
}

function generateTagCloud(){
  //. http://dotnsf.blog.jp/archives/1034375557.html
  var tags = {};
  var tmp = texts.split( ' ' );
  tmp.forEach( function( tag ){
    if( tag in tags ){
      tags[tag] ++;
    }else{
      tags[tag] = 1;
    }
  });

  var word_list = [];
  Object.keys( tags ).forEach( function( tag ){
    word_list.push( { text: tag, weight: tags[tag] } );
  });

  $('#tagcloud').jQCloud( word_list, { width: 500, height: 200 } );
}
