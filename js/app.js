$(document).ready(function() { 
    var CLIENT_ID = 'YOUR_CLIENT_ID';

    var canvas = document.getElementById('visual');
    var canvasContext = canvas.getContext('2d');

    var url, context = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = context.createAnalyser(), bufferLength, frequencyData;
    var audio = document.getElementById('player'); 
    var source = context.createMediaElementSource(audio);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight/2;

    var isPlaying = false;


    SC.initialize({
        client_id: CLIENT_ID
    });

    var isPaused = true;
    
    //Sine wave render
    /*function render() {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteTimeDomainData(frequencyData);

        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(120, 25, 25)';

        canvasContext.beginPath();

        var frequencyWidth = canvas.width * 1.0 / bufferLength;
        var x = 0, frequencyHeight;

        for (var i = 0; i < bufferLength; i++) {
            //canvasContext.strokeStyle = 'rgb(' + Math.floor((Math.random()*255) + 1) + ',' + 
              //  Math.floor((Math.random()*255) + 1) + ',' + Math.floor((Math.random()*255) + 1) + ')'
            var v = frequencyData[i] / 128.0;
            frequencyHeight = v * canvas.height/2;

            if ( i === 0 ) {
                canvasContext.moveTo(x, frequencyHeight);
            } else {
                canvasContext.lineTo(x, frequencyHeight);
            }

            x += frequencyWidth;
        }

        canvasContext.lineTo(canvas.width, canvas.height/2);
        canvasContext.stroke();

        call = requestAnimationFrame(render);
    }*/
    
    //Bar render
    function render() {

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(frequencyData);

        var frequencyWidth = (canvas.width / bufferLength), frequencyHeight = 0, x = 0;

        //canvasContext.fillStyle = 'rgb(255, 120, 120)';

        for (var i = 0; i < bufferLength; i++) {
            frequencyHeight = frequencyData[i] * (canvas.height * 0.003);
            canvasContext.fillStyle ='rgb(' + frequencyData[i*2] + ',' + 
                frequencyData[i+1] + ',' + frequencyData[i*2] + ')';
            canvasContext.fillRect(x, canvas.height - frequencyHeight, frequencyWidth, frequencyHeight);
            x += frequencyWidth + 4;
        }
        if (!isPaused) {
            call = requestAnimationFrame(render);
        }

    }

    var playAudio = function() {
        audio.src = url;
        console.log(audio.volume);
        source.connect(analyser);
        analyser.connect(context.destination);
        audio.volume = 0.5;
        audio.play();
        isPaused = false;
        bufferLength = analyser.frequencyBinCount;
        frequencyData = new Uint8Array(bufferLength);
        render();

    }


    $("#playbutton").click(function() {
        var track_url = $("#songURL").val() || "https://soundcloud.com/deathcabforcutie/death-cab-for-cutie-black-sun";
        SC.get('/resolve', { url: track_url }, function(track) {
            url = 'http://api.soundcloud.com/tracks/' + track.id + '/stream?client_id='+CLIENT_ID;
            playAudio();
            var track_name = track.title;
            $("#track_name").fadeOut(2000, function() {
                $(this).text(track_name)})
                .fadeIn(2000);
            $("#linkback").attr('href', track_url);
            
            if ($("#player").hasClass('hidden')){
                $("#player").toggleClass('hidden');
            }


        }); 
    });

    audio.addEventListener("playing", function() {
        isPaused = false;
        call = requestAnimationFrame(render);
    });

    audio.addEventListener("pause", function() {
        //I forgot what I wanted it to do
        isPaused = true;

    });

});