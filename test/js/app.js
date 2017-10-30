function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}
        var WordnikAPIKey = '8489c93205db115a8d93702980e0ce6775085279d0473e1c6';
        var FlickrAPIKey = 'a5b70b7581be4943ba9ffc68232e1c2e';

        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        var nouns;
        var bigWord;
        var videoName = [];
        var videoIdList = [];
        var videoIndex = 0;
        var consistentColor;
        var permit = false;
        window.onload=getSeedWord();

        setInterval(function () {
            consistentColor = '#'+Math.floor(Math.random()*16777215).toString(16);
            document.getElementById("fancy").style.color= consistentColor;
            document.getElementById("fancy2").style.color= consistentColor;
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
                document.getElementById("output").innerHTML=bigWord;
                generate(bigWord);
            permit = true;              },
              async: true,
              dataType:"json"
            });
        }

        function generate(query)
    	{
    		// IMAGE FOR DISPLAY
    		console.log("Fetching images for subject " + query);
    		$.ajax({
    		  url: 'https://api.flickr.com/services/rest/?method=flickr.photos.search&text=' + query + '&format=json&nojsoncallback=1&sort=relevance&api_key=' + FlickrAPIKey,
    		  success: function(data) {
    			console.log("	got images");
    			// assemble Flickr image URL (as per https://www.flickr.com/services/api/misc.urls.html)
    			var photo = data.photos.photo.pick();
    			var imgUrl = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_d.jpg";
                console.log(imgUrl);

                document.getElementById("sampleimage1").src = imgUrl;

    		  },
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
            maxResults: 50,
            order: "relevance",
            publishedAfter: "2010-01-01T00:00:00Z"
       });
       // execute the request
       request.execute(function(response) {
          var results = response.result;
          $("#results").html("");
              player = new YT.Player('player2', {
                height: '400',
                width: '400',
                videoId: results.items[0].id.videoId,
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
          });
        $.each(results.items, function(index, item) {
            console.log(item.id.videoId);
            videoIdList.push(item.id.videoId);
            videoName.push(item.snippet.title);
            console.log(item.snippet.title);
        });
          document.getElementById("currentTitle").innerHTML=videoName[0];
          //console.log(player);
          resetVideoHeight();
       console.log(videoIdList);
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
      //event.target.loadVideoById("Vw4KVoEVcr0", 0, "default");
      console.log(player);
      player.loadVideoById("Vw4KVoEVcr0", 0, "default");
    videoIndex++;
  }
}



function init() {
    gapi.client.setApiKey("AIzaSyBZyYgmaK8pHWd2ry6sCMODh7w3-Ju4YG8");


    gapi.client.load("youtube", "v3", function() {
        if (permit) {
            onYouTubeIframeAPIReady();
        }
        if (!permit) {
            init();
        }
    });
}
