function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}
        var WordnikAPIKey = '8489c93205db115a8d93702980e0ce6775085279d0473e1c6';
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        var nouns;
        var bigWord;
        window.onload=getSeedWord();

        setInterval(function () {
            document.getElementById("fancy").style.background= '#'+Math.floor(Math.random()*16777215).toString(16);
            document.body.style.background= '#'+Math.floor(Math.random()*16777215).toString(16);
        }, 2500);

        Array.prototype.pick = function() {
            return this[Math.floor(Math.random()*this.length)];
        }

        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }

        function getSeedWord() {
            console.log("Fetching seed word...");
            var minCorpusCount = 100000;
            $.ajax({
              url: "http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=false&includePartOfSpeech=noun&minCorpusCount=" + minCorpusCount +"&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=100&api_key=" + WordnikAPIKey,
              success: function(data) {
                nouns = eval(data);
                var word = nouns.pick().word;
                q = word;
                console.log("	got seed word " + word);
                bigWord = word.capitalize();
                document.getElementById("output").innerHTML=bigWord;              },
              async: true,
              dataType:"json"
            });
        }

    function onYouTubeIframeAPIReady() {
       // prepare the request
       console.log("	this is the word " + bigWord);
       var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: bigWord + " music",
            maxResults: 1,
            order: "relevance",
            publishedAfter: "2010-01-01T00:00:00Z"
       });
       // execute the request
       request.execute(function(response) {
          var results = response.result;
          $("#results").html("");
          $.each(results.items, function(index, item) {
              player = new YT.Player('player2', {
                height: '0',
                width: '0',
                videoId: item.id.videoId,
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
          });
          resetVideoHeight();
       });
    });
}


function resetVideoHeight() {
    $(".video").css("height", $("#results").width() * 9/16);
}

function onPlayerReady(event) {
  event.target.playVideo();
  //player.seekTo(0, true);
}
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
      event.target.playVideo();
  }
}

function init() {
    gapi.client.setApiKey("AIzaSyBZyYgmaK8pHWd2ry6sCMODh7w3-Ju4YG8");


    gapi.client.load("youtube", "v3", function() {
            onYouTubeIframeAPIReady()
    });
}
