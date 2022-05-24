//. webspeechpi.js
var MIN_WORDS_PI = 20;
var segmenter = new TinySegmenter();

var flag_speech = 0;
var texts = '';

var recognition = null;
function vr_function() {
  try{
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    recognition = new SpeechRecognition();
  }catch( e ){
  }

  if( recognition ){
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
      //console.log( results );
      for( var i = event.resultIndex; i < results.length; i++ ){
        if( results[i].isFinal ){
          var text = results[i][0].transcript;
          var confidence = results[i][0].confidence;
          $('#result_text').html( text );

          texts += ( ' ' + text );
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
    $('#micoffbtnspan').css( 'display', 'block' );
  }else{
    alert( "このブラウザでは Web Speech API がサポートされていません" );
  }
}

function stop_vr_function() {
  if( recognition ){
    recognition.onsoundstart = function(){};
    recognition.onnomatch = function(){};
    recognition.onerror = function(){};
    recognition.onsoundend = function(){};
    recognition.onresult = function( event ){};

    recognition = null;
  }

  $('#miconbtnspan').css( 'display', 'block' );
  $('#micoffbtnspan').css( 'display', 'none' );
}

function generateTagCloud(){
  //. http://dotnsf.blog.jp/archives/1034375557.html
  var tags = {};
  var segs = segmenter.segment( texts );
  segs.forEach( function( tag ){
    if( isValidTag( tag ) ){
      if( tag in tags ){
        tags[tag] ++;
      }else{
        tags[tag] = 1;
      }
    }
  });

  var word_list = [];
  Object.keys( tags ).forEach( function( tag ){
    word_list.push( { text: tag, weight: tags[tag] } );
  });

  $('#tagcloud').html( '' );
  $('#tagcloud').jQCloud( word_list, { width: 500, height: 200 } );

  if( word_list.length >= MIN_WORDS_PI ){
    $('#result_pi').html( '' );
    /*
    $.ajax({
      url: './api/pi',
      type: 'POST',
      data: { text: texts },
      dataType: 'json',
      success: function( result ){
        //console.log( result );
        $('#result_pi').html( JSON.stringify( result, null, 2 ) );

        //. Chart.js
        drawChart( result );
      },
      error: function( e0, e1, e2 ){
        console.log( e0, e1, e2 );
      }
    });
    */
    var result = debugRandomResult();
    drawChart( result );
  }
}


function debugRandomResult(){
  var result = { 
    result: {
      personality: []
    }
  };

  for( var i = 0; i < 5; i ++ ){
    var personality = {
      name: "" + i,
      percentile: Math.random()
    };
    result.result.personality.push( personality );
  }

  return result;
}


function drawChart( result ){
  var labels = [ '開放性', '誠実さ', '外向性', '協調性', '感情' ];
  var data = [];

  if( result && result.result && result.result.personality ){
    for( var i = 0; i < result.result.personality.length; i ++ ){
      var personality = result.result.personality[i];
      //labels.push( personality.name ); //. [ 'Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Emotional range' ]
      data.push( personality.percentile );
    }
  }

  var data = {
    labels: labels,
    datasets: [
      {
        label: '性格診断',
        data: data,
        backgroundColor: 'rgba( 230, 230, 230, 0.5 )',
        borderColor: 'rgba( 255,   0,   0, 1 )',
        fill: true,
        borderWidth: 3
      }
    ]
  };
  var options = {
    scales: {
      r: {
        min: 0.0,
        max: 1.0,
        backgroundColor: 'snow'
      }
    }
  };

  $('#chart_td').html( '<canvas id="mychart" width="400" height="400"></canvas>' );
  var ctx = document.getElementById( 'mychart' );
  var chart = new Chart( ctx, {
    type: 'radar',
    data: data,
    options: options
  });
}

function isValidTag( tag ){
  var r = true;

  if( !tag ){
    r = false;
  }else if( tag.length > 2 ){
    r = true;
  }else{
    var b = true;
    for( var i = 0; i < tag.length && b; i ++ ){
      var c = tag.substr( i, 1 );
      b = ( 'あ' <= c && c <= 'ん' );
    }
    r = !b;
  }

  return r;
}
