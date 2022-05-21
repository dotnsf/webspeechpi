//. webspeechpi.js
var MIN_WORDS_PI = 20;
var segmenter = new TinySegmenter();

var flag_speech = 0;
var texts = '';

function vr_function() {
  var recognition = null;
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
  }else{
    alert( "このブラウザでは Web Speech API がサポートされていません" );
  }

  $('#miconbtnspan').css( 'display', 'none' );
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
    $.ajax({
      //url: './api/pi',
      url: 'https://urapi.herokuapp.com/api/pi',
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
        console.log( e1, e1, e2 );
      }
    });
  }
}

function drawChart( result ){
  var labels = [];
  var data = [];

  if( result && result.result && result.result.personality ){
    for( var i = 0; i < 5; i ++ ){
      var personality = result.result.personality[i];
      labels.push( personality.name );
      data.push( personality.percentile );
    }
  }

  var data = {
    labels: labels,
    datasets: [
      {
        label: 'Personality Insights',
        data: data,
        backgroundColor: [
          'rgba( 255,  99, 132, 0.2 )',
          'rgba(  54, 162, 235, 0.2 )',
          'rgba( 255, 206,  86, 0.2 )',
          'rgba(  75, 192, 192, 0.2 )',
          'rgba( 153, 102, 255, 0.2 )',
        ],
        borderColor: [
          'rgba( 255,  99, 132, 0.2 )',
          'rgba(  54, 162, 235, 0.2 )',
          'rgba( 255, 206,  86, 0.2 )',
          'rgba(  75, 192, 192, 0.2 )',
          'rgba( 153, 102, 255, 0.2 )',
        ],
        borderWidth: 1
      }
    ]
  };
  var options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  $('#chart_td').html( '<canvas id="mychart" width="400" height="300"></canvas>' );
  var ctx = document.getElementById( 'mychart' );
  var chart = new Chart( ctx, {
    type: 'bar',
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
