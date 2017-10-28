<?php
ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
$settings = array(
    'oauth_access_token' => "919215854457446401-WdXf7BFafFxu6EXeLa0EYqJuP60PFPf",
    'oauth_access_token_secret' => "opfEOvySSiU4CSNUPmNINRYqq6l1pA9OlDKWxGNz7GB4I",
    'consumer_key' => "0lYQVkqKbwmHTr7SOy5WCsbuL",
    'consumer_secret' => "KdqaCEIA5AEY7DedKtQ4QbRQjrniGbLqAV9sYa5v4ItfDVWIfn"
);

// Perform the request using variables passed in the query string (i.e., search.php?q=cornbread&type=tweets)
if (isset($_GET['q']) && isset($_GET['type'])) {
	header('Content-type: text/plain');
	$type = 	$_GET['type'];
	$twitter = new TwitterAPIExchange($settings);

	// pass type=tweets in the query string for tweet results
	if ($type == "tweets") {
		$requestMethod = 'GET';
		$url = 'https://api.twitter.com/1.1/search/tweets.json';
		$getfield = "?q=" . $_GET['q'] . "&result_type=recent&lang=en&count=100&include_entities=true";
		echo $twitter->setGetfield($getfield)
   	         ->buildOauth($url, $requestMethod)
   	         ->performRequest();
	}

	// pass type=users in the query string for tweet results
	else if ($type == "users") {
		$requestMethod = 'GET';
		$url = 'https://api.twitter.com/1.1/users/search.json';
		$max = 10;
		// annoying, the user search is paginated with a 20 item page limit,
		// so we have to loop to get enough data to work with.
		echo "{";
		for ($i=1; $i<=$max; $i++) {
			$getfield = "?q=" . $_GET['q'] . "&count=20&page=" . $i;
			echo "\"result\":";
			echo $twitter->setGetfield($getfield)
   	 	         ->buildOauth($url, $requestMethod)
   		          ->performRequest();
			if ($i<$max) echo ",";
		}
		echo "}";
	}
}
