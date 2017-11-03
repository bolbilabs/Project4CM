/*
Reload Radio by David Friedman
Description: This project is supposed to simulate an online radio service using
the YouTube API to retrieve audio. I wanted the program to be simple and
intuitive but still remain lively. I decided to make a radio because I felt as
though music is a unique way to generate randomized content.
It works by generating a word via Wordnik to create a "theme" of the radio station. This theme is used to search for 50 YouTube videos with the search query of the Wordnik word plus the word "music." The radio loops through the 50 songs for hours of generated audio content. Note that not all YouTube videos are actual songs, but for the purpose of this simulation, you can pretend that each non-song is just a talk show or podcast.
In addition, the Wordnik word is used to search the Flickr API for
images corresponding to the word. Each song played has its own image. This
image represents the thumbnail of the song. It rotates to give visual feedback that the song is playing. There is a pause/play button and a
next word (refresh) button both drawn on Canvas.

Controls:
Pause/Play Button: Toggles the audio playing from paused to playing and also
toggles the thumbnail of the the song's spinning.
Next Button: Refreshes the page and generates a new word. This simulates
changing the radio station to one with another theme.

Warning: The audio is pulled from YouTube. Therefore, it may have explicit content.
In addition, the thumbnail images pulled from Flickr may have questionable
content from time to time.

Website:
http://homes.lmc.gatech.edu/~dfriedman32/test/

This website was tested with Firefox and Google Chrome.
*/

//API keys are put here for Wordnik and Flickr
var WordnikAPIKey = '8489c93205db115a8d93702980e0ce6775085279d0473e1c6';
var FlickrAPIKey = 'a5b70b7581be4943ba9ffc68232e1c2e';

//Creates iframe for Youtube API.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Youtube player
var player;
var myPlayerState;

//Wordnik variables
var nouns;
var bigWord;

//Indexes of data for each video
var videoName = [];
var videoIdList = [];
var photolist = [];
var videoIndex = 0;

//Various global variables for information managment.
var consistentColor;
var permit = false;
var clicktoggle = false;

//Generates Wordnik word when window loads.
window.onload=getSeedWord();

//Generates colors for background and text every 2.5 seconds.
setInterval(function () {
    consistentColor = '#'+Math.floor(Math.random()*16777215).toString(16);
    document.getElementById("fancy").style.color= consistentColor;
    document.getElementById("fancy2").style.color= consistentColor;
    document.body.style.background= '#'+Math.floor(Math.random()*16777215).toString(16);
}, 2500);

//Selects randomly from an array.
Array.prototype.pick = function() {
    return this[Math.floor(Math.random()*this.length)];
}

//Capitalizes chosen word for title use.
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//Pauses the spinning image when player is paused.
var imgs = document.querySelectorAll('.image1');
function toggleAnimation() {
    var style;
    for (var i = 0; i < imgs.length; i++) {
        style = imgs[i].style;
        if (style.webkitAnimationPlayState === 'running') {
            style.webkitAnimationPlayState = 'paused';
        } else {
            style.webkitAnimationPlayState = 'running';
        }
    }
}

//Generates single word. This word names the radio station and is used by the other APIs to search for images and audio related to the world.
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

//Searches for images via Flickr based on Wordnik Word.
function generate(query)
{
    // IMAGE FOR DISPLAY
    console.log("Fetching images for subject " + query);
    $.ajax({
        url: 'https://api.flickr.com/services/rest/?method=flickr.photos.search&text=' + query + '&format=json&nojsoncallback=1&sort=relevance&api_key=' + FlickrAPIKey,
        success: function(data) {
            console.log("	got images");
            // assemble Flickr image URL (as per https://www.flickr.com/services/api/misc.urls.html)
            photolist = data.photos;
            document.getElementById("sampleimage1").src = "https://farm" + photolist.photo[videoIndex].farm + ".staticflickr.com/" + photolist.photo[videoIndex].server + "/" + photolist.photo[videoIndex].id + "_" + photolist.photo[videoIndex].secret + "_d.jpg";
            draw();
        },
        async: true,
        dataType:"json"
    });
}

//Searches for a list of Wordnik word + music related videos.
function onYouTubeIframeAPIReady() {
    if(permit) {
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
                height: '0',
                width: '0',
                videoId: results.items[0].id.videoId,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            $.each(results.items, function(index, item) {
                videoIdList.push(item.id.videoId);
                videoName.push(item.snippet.title);
            });
            document.getElementById("currentTitle").innerHTML=videoName[0];
        });
    }
}

//When the player is ready, play the video.
function onPlayerReady(event) {
    event.target.playVideo();
}

//When the video ends, load new video and change the image and video title.
function onPlayerStateChange(event) {
    myPlayerState = event.data;
    if (event.data == YT.PlayerState.ENDED) {
        videoIndex++;
        if (videoIndex >= videoIdList.length) {
            videoIndex = 0;
        }
        player.loadVideoById(videoIdList[videoIndex]);
        document.getElementById("currentTitle").innerHTML=videoName[videoIndex];
        document.getElementById("sampleimage1").src = "https://farm" + photolist.photo[videoIndex].farm + ".staticflickr.com/" + photolist.photo[videoIndex].server + "/" + photolist.photo[videoIndex].id + "_" + photolist.photo[videoIndex].secret + "_d.jpg";
    }
}

//Toggles paused and playing through pressing the pause button
function pauseButton() {
    if (clicktoggle && myPlayerState == 1) {
        player.pauseVideo();
    } else if (!clicktoggle && myPlayerState == 2) {
        player.playVideo();
    }
}

$(document).ready(
    function() {
        draw();
        toggleAnimation();
    }
);

//Creates two canvases that represent the pause button and the refresh button.
var element = document.getElementById("canvas");
var elemLeft = element.offsetLeft;
var elemTop = element.offsetTop;
var context = element.getContext('2d');

var element2 = document.getElementById("canvas2");
var elemLeft2 = element2.offsetLeft;
var elemTop2 = element2.offsetTop;
var context2 = element2.getContext('2d');

//Listener to see when the pause/play button is clicked.
element.addEventListener('click', function(event) {
    var x = event.pageX - elemLeft,
    y = event.pageY - elemTop;
    clicktoggle = !clicktoggle;
    toggleAnimation();
    draw();
    pauseButton();
}, false);

//Listener to see when the refresh (next arrow) button is clicked.xwxw
element2.addEventListener('click', function(event) {
    var x = event.pageX - elemLeft2,
    y = event.pageY - elemTop2;
    location.reload(true);
}, false);

//Draws the two buttons using Canvas.
function draw() {

    //clear canvas
    context.save();
    context.clearRect(0, 0, element.width, element.height);
    context2.save();
    context2.clearRect(0, 0, element2.width, element2.height);

    //set strokestyle
    context.strokeStyle = "#55c3ec";

    //Make refresh button, color 0.5 opacity black
    context2.fillStyle = "rgba(0, 0, 0, 0.5)";

    context2.beginPath();
    context2.moveTo(50, 90);
    context2.lineTo(130, 90);
    context2.lineTo(130, 110);
    context2.lineTo(50, 110);
    context2.fill();

    context2.beginPath();
    context2.moveTo(130, 125);
    context2.lineTo(160, 100);
    context2.lineTo(130, 75);
    context2.fill();


    //Make pause/play button, color 0.5 opacity black
    context.fillStyle = "rgba(0, 0, 0, 0.5)";

    //Draws play button if clicked.
    if (clicktoggle) {
        context.beginPath();
        context.moveTo(70, 55);
        context.lineTo(70, 145);
        context.lineTo(150, 100);
        context.fill();
    }

    //Draws pause button if clicked again.
    if (!clicktoggle) {
        context.beginPath();
        context.moveTo(70, 65);
        context.lineTo(70, 135);
        context.lineTo(90, 135);
        context.lineTo(90, 65);
        context.fill();

        context.beginPath();
        context.moveTo(110, 65);
        context.lineTo(110, 135);
        context.lineTo(130, 135);
        context.lineTo(130, 65);
        context.fill();
    }
}

//Callback function to initialize the YouTube API.
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
