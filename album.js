var getSongNumberCell = function(number) { //generates attributes for song-item-number
    return $('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function(songNumber, songName, songLength) { //generates HTML elements with song information (song-number, song-title, song-duration)
    var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;

    var $row = $(template);

    var clickHandler = function() { //plays/ pauses songs, shows play/pause button. Also handles seek bars
        var songNumber = parseInt($(this).attr('data-song-number')); //say I clicked 2nd song, 'Green'. It retrieves value of 2 (parseInt'ed "2" into number)

        if (currentlyPlayingSongNumber !== null) { //something is playing
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) { //when other song is playing and I click a different song:
            $(this).html(pauseButtonTemplate); //click that cell so it has pauseButton Template
            setSong(songNumber); //play that song (based on songNumber; recall songNumber is the song number that had just been clicked)
            currentSoundFile.play(); //play the song
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1]; //find song index
            updateSeekBarWhileSongPlays();
            updatePlayerBarSong();

            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
        } else if (currentlyPlayingSongNumber === songNumber) { //if a song is playing and the same song is clicked again
            if (currentSoundFile.isPaused()) { //first scenario: paused (nothing is playing)
                $(this).html(pauseButtonTemplate); //displays pause Button after clicked.
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate); //song wasn't played, but after clicked, it is now playing
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };

    var onHover = function(event) { //Hovers event (eventListener)
        var songNumberCell = $(this).find('.song-item-number'); //when mouse hovers over, say, song#2, green, it finds green's song-item-number DOM
        var songNumber = parseInt(songNumberCell.attr('data-song-number')); //Green's song-item-number has a neighboring attribute, data-song-number. This gets it and stores it in var songNumber

        if (songNumber !== currentlyPlayingSongNumber) { //either another song is playing or no song is playing at all(songNumber === other songNumber or songnumber === null)
            songNumberCell.html(playButtonTemplate); //shows playButton when mouse hovers over that cell
        }
    };

    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number'); //finds, on DOM the mouse was hovering, '.song-item-number' class, stores it in songNumberCell variable
        var songNumber = parseInt(songNumberCell.attr('data-song-number')); //retrieves data-song-number of the cell the mouse is hovering

        if (songNumber !== currentlyPlayingSongNumber) { //if mouse is hoving different song
            songNumberCell.html(songNumber); //when mouse leaves, it shows songNumber again
        }
    };

    $row.find('.song-item-number').click(clickHandler); //in $row (recall $row is cell template), find ('.song-item-number'), applies click eventListener (use clickHalndler() function). This is specific only to song-item-number class; won't work on song-item-title or song-item-duration.
    $row.hover(onHover, offHover); //That same template, applies .hover(a,b) jQuery method. hover(a,b) takes 2 arguments, first is onMouse and second is offMouse.
    return $row; //applies template
};

var setSong = function(songNumber) { //setSong function stops song, plays selected song, and sets volume up!
    if (currentSoundFile) {
        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1]; //index songs in currentAlbum, returns the song[i]
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, { //buzz method to play song
        formats: [ 'mp3' ],
        preload: true
    });
    setVolume(currentVolume); //sets volume
};

var seek = function(time) { //seek-bar's song duration seek
   if (currentSoundFile) { //if there is a song playing, then do
       currentSoundFile.setTime(time); //setTime (buzz method) to currentSoundFile
   }
};

var setVolume = function(volume) { //seek-bar's volume seek
    if (currentSoundFile) { //if there is a song playing, then do
        currentSoundFile.setVolume(volume); //set the volume to volume arg
    }
};

var setCurrentAlbum = function(album) { //sets up album info display, including all songs
    currentAlbum = album; //picks a specific album based on arg

    //stores each class in album to its proper variable
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    //applies text to between elements (i.e. <h2 class = 'album-view-title'>(CONTEXT GOES HERE)</h2>)
    $albumTitle.text(album.name);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl); //in album-covert-art element, there is a 'src' tag. albumUrl goes here to replace the src

    $albumSongList.empty(); //make sure albumSongList (album-view-song-list) is empty

    for (i = 0; i < album.songs.length; i++) { //iterates through each album items and add the album cell information (song number, title, and duration)
        var $newRow= createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
        $albumSongList.append($newRow);
    }
};

var setCurrentTimeInPlayerBar = function(currentTime) { //current playing time of song
    var $currentTimeElement = $('.seek-control .current-time');
    $currentTimeElement.text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime) { //max/ total time of song
    var $totalTimeElement = $('.seek-control .total-time');
    $totalTimeElement.text(totalTime);
};

var filterTimeCode = function(timeInSeconds) { //converts time (given in total seconds) to 'X:XX' formats, in string
    var seconds = Number.parseFloat(timeInSeconds);
    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);

    var remainingSeconds = wholeSeconds % 60;
    var output = minutes + ':';

    if (remainingSeconds < 10) {
        output += '0';
    }

    output += remainingSeconds;
    return output;
};

var updateSeekBarWhileSongPlays = function() { //dynamic function. This will update the current time
    if (currentSoundFile) { //if there is currently a song playing, then do
        currentSoundFile.bind('timeupdate', function(event) { //buzz's method timeupdate, eventListener. Something about binding them?
            var currentTime = this.getTime(); //buzz's getTime method (current time). The result will be displayed and upated periodically!
            var songLength = this.getDuration(); //total duration
            var seekBarFillRatio = currentTime / songLength; //gives the ratio of seek-bar based on current time vs total time
            var $seekBar = $('.seek-control .seek-bar'); //gets seek bar
            updateSeekPercentage($seekBar, seekBarFillRatio); //calls te updateSeekPercentage function
            setCurrentTimeInPlayerBar(filterTimeCode(currentTime)); //sets up the time in player bar
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) { //takes 2 arguments: first is which seek bar, second is the ratio (dynamic value, always changing as song is playing)
    //calculation to figure out the offset (in %)
    var offsetXPercent = seekBarFillRatio * 100;
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    var percentageString = offsetXPercent + '%'; // shows percentage in num%
    $seekBar.find('.fill').width(percentageString); //CSS: '.fil' updates class to num%
    $seekBar.find('.thumb').css({left: percentageString}); //CSS to '.thumb' num%
};

var setupSeekBars = function() { //controls seekBars
    var $seekBars = $('.player-bar .seek-bar'); //gets .player-bar (parent) .seek-bar (distant child) class

    $seekBars.click(function(event) { //click event
        var offsetX = event.pageX - $(this).offset().left; //offsets the bar
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        if ($(this).parent().attr('class') == 'seek-control') { //seek-control is the song duration's seek-bar
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100); //changes the volume
        }
        updateSeekPercentage($(this), seekBarFillRatio);
    });

    $seekBars.find('.thumb').mousedown(function(event) { //mousedown event (hold mouse down); different from click: click is rapid press, mousedown is long press
        var $seekBar = $(this).parent(); //whichever bar it is choosing; if it is on volume, then thumb's parent is volume's seek bar, similar with song seek-bar
        $(document).bind('mousemove.thumb', function(event){ //moves mouse
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            if ($seekBar.parent().attr('class') == 'seek-control') { //if it is song seek-bar, then do:
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else { //otherwise, it has to be volume's seek-bar
                setVolume(seekBarFillRatio);
            }
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        $(document).bind('mouseup.thumb', function() { //when mouseup event happens. This requires $(document).bind, because mouse can be anywhere in the document, but moving in attempt to move thumb class. We want to bind/lock this event so seek-bar's thumb will still move even when mouse is no longer on thumb.
            $(document).unbind('mousemove.thumb'); //unbinds mousemove
            $(document).unbind('mouseup.thumb'); //unbinds mouseup
        });
    });
 };

var updatePlayerBarSong = function() { //display the right song info in player bar
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);

    $('.main-controls .play-pause').html(playerBarPauseButton);

    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length)); //displays total time (static?)
};

var trackIndex = function(album, song) { //keeps track of song index from album; return song's index
    return album.songs.indexOf(song);
};

var nextSong = function() { //nextSong function. Does: increases currentSongIndex +=1, plays the next song
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum); //recall trackIndex returns song's index in album songs context
    currentSongIndex++;

    if (currentSongIndex >= currentAlbum.songs.length) { //loops back to 0
        currentSongIndex = 0;
    }

    setSong(currentSongIndex + 1); //setSongs (functionality includes plays song); since +1, it sets the "next song"
    currentSoundFile.play(); //plays the selected song
    updateSeekBarWhileSongPlays(); //runs seek bar attribute updates
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    //displays the next song
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    //variables to keep track of current song, next song, and song cell info (song number)
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $nextSongNumberCell.html(pauseButtonTemplate); //displays the pause button on the next song (because we just chose the next song!)
    $lastSongNumberCell.html(lastSongNumber); //previous song no longer has pause button (it is no longer playing song), so we put number back
};

var previousSong = function() { //simply opposite of nextSong function
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };

    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;

    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }

    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);

    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};

var togglePlayFromPlayerbar = function() { //switches button between play/pause
    var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber); //fetch what song number it is playing now

    if (currentSoundFile.isPaused()) { //if paused, then do this:
        $currentlyPlayingCell.html(pauseButtonTemplate); //there is a song playing, then it was paused. When clicked again, it plays. Now when a song is playing, it displays pause button
        $(this).html(playerBarPauseButton); //also updates player bar's to display pause button for the same reason above
        currentSoundFile.play(); //because it is paused, clicking it again will play it
    } else if (currentSoundFile) { //if song is playing (if song is playing, currentSoundFile is true! Does that mean it is false if it isPaused()?)
        $currentlyPlayingCell.html(playButtonTemplate); //opposite of above
        $(this).html(playerBarPlayButton);
        currentSoundFile.pause();
    }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() { //when page is ready
    setCurrentAlbum(albumPicasso); //first, sets up the display - this includes album info and all songs!
    setupSeekBars(); //set up seek bar control
    //enables/ prepares previousButton and nextButton for click eventListener
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    //prepares play/pause button for click event
    $playPauseButton.click(togglePlayFromPlayerbar);
});