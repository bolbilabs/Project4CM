<?php

if (isset($_GET['p']))
{

    /* Attempt to open */
    $img = imagecreatefromjpeg($_GET['p']);

	header('Content-Type: image/jpeg');
	imagejpeg($img);
	imagedestroy($img);
}

?>