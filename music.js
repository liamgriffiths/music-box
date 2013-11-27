// references:
// http://blog.chrislowis.co.uk/2013/06/05/playing-notes-web-audio-api.html
// http://stuartmemo.com/making-sine-square-sawtooth-and-triangle-waves/
//
// to read:
// http://flippinawesome.org/2013/10/28/audio-synthesis-in-javascript/?utm_source=html5weekly&utm_medium=email
// https://developer.tizen.org/documentation/articles/advanced-web-audio-api-usage
// http://joshondesign.com/p/books/canvasdeepdive/chapter12.html

window.requestAnimFrame = (function(){
  return window.requestAnimationFrame  ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function MusicBox(settings) {
  this.rows = settings.rows || 12;
  this.cols = settings.cols || 32;
  this.squareSize = settings.squareSize || 40;
  this.canvas = document.getElementById('canvas');
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = this.squareSize * this.rows + (this.squareSize / 2.5) * this.rows + this.squareSize;
  this.context = this.canvas.getContext('2d');
  this.stringPosition = settings.stringPosition || (this.canvas.width / 4);
  this.squares = [];

  this.tempo = 60;
  this.tempoControl = document.getElementById('tempo');
  this.gain = 1;
  this.gainControl = document.getElementById('gain');

  this.startSpeed = settings.startSpeed || (this.tempo / 60 / this.cols);

  this.audioContext = new window.AudioContext();
  this.now = this.audioContext.currentTime;

  this.isPlaying = true;

  canvas.addEventListener('click', function(e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    _each(this.squares, function(square) { square.updateIfClicked(x, y); });
  }.bind(this));

  window.addEventListener('keydown', function(e) {
    if(e.keyCode == 32){
      this.isPlaying = !this.isPlaying;
      e.preventDefault();
    }
  }.bind(this));

  for(var x = 0; x < this.cols; x++) {
    for(var y = 0; y < this.rows; y++) {
      var freq = 880 - ((880 / 2 / this.rows) * y);
      this.squares.push(new Square(x, y, this.startSpeed, freq, this.cols - 1, this.squareSize));
    }
  }
}

MusicBox.prototype = {
  update: function() {
    // update squares
    _each(this.squares, function(square) {
      square.update({
        stringPosition: this.stringPosition,
        speed: this.isPlaying ? (this.tempo / 60) / this.cols : 0
      });
    }.bind(this));

    this.now = this.audioContext.currentTime;

    // update values from form
    this.tempo = parseInt(this.tempoControl.value, 10);
    this.gain = parseInt(this.gainControl.value, 10);
  },

  draw: function() {
    // clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw squares
    _each(this.squares, function(square) {
      square.draw(this.context);
    }.bind(this));

    // draw string
    this.context.strokeStyle = 'white';
    this.context.moveTo(this.stringPosition, 0);
    this.context.lineTo(this.stringPosition, this.canvas.height);
    this.context.stroke();
  },

  play: function() {
    // play squares
    _each(this.squares, function(square) {
      square.play(this.audioContext, this.now);
    }.bind(this));
  },

  kickOutTheJams: function() {
    this.update();
    this.draw();
    this.play();
    window.requestAnimFrame(this.kickOutTheJams.bind(this));
  }
};

function _each(array, fn) {
  var len = array.length;
  for (var i = 0; i < len; i++) {
    fn(array[i], i);
  }
}

window.onload = function() {
  new MusicBox({}).kickOutTheJams();
};

function Square(x, y, speed, freq, start, size) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.offset = Math.floor(this.size / 2.5);
  this.px = this.getPixelPosition(x);
  this.py = this.getPixelPosition(y);
  this.on = false;
  this.active = false;
  this.playing = false;
  this.sound = undefined;
  this.freq = freq;
  this.color = new Color(y);
  this.speed = speed;
  this.start = start;
}

Square.prototype = {
  draw: function(ctx) {
    if(this.isOnScreen()){
      if(this.on) {
        // active squares are currently touching the line
        if(this.active) {
          ctx.fillStyle = this.color.rgba(0.9);
          ctx.fillRect(this.px, this.py, this.size, this.size);
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fillRect(this.px - 1, this.py - 1, this.size + 2, this.size + 2);
        }else{
          ctx.fillStyle = this.color.rgba(0.9);
          ctx.fillRect(this.px, this.py, this.size, this.size);
        }
      }else{
        ctx.fillStyle = this.color.rgba(0.2);
        ctx.fillRect(this.px, this.py, this.size, this.size);
      }
    }
  },

  update: function(settings) {
    for (var prop in settings) {
      this[prop] = settings[prop];
    }

    this.active = this.isActive(settings.stringPosition);
    if (this.px + this.size < 0) this.x = this.start;
    this.x -= this.speed;
    this.px = this.getPixelPosition(this.x);
    this.py = this.getPixelPosition(this.y);
  },

  getPixelPosition: function(p) {
    return p * this.size + (p * this.offset + this.offset);
  },

  isOnScreen: function() {
    return (this.px < canvas.width && this.px + this.size > 0);
  },

  isActive: function(stringPosition) {
    return (this.px < stringPosition && this.px + this.size > stringPosition);
  },

  updateIfClicked: function(cx, cy) {
    if(cx > this.px && cx < this.px + this.size){
      if(cy > this.py && cy < this.py + this.size){
        this.on = !this.on;
      }
    }
    return this.on;
  },

  play: function(actx, time) {
    if(! this.playing && this.on && this.active){
        // create a synthetic tone for now
        // replace with microphone?
        var tone = actx.createOscillator();
        tone.type = 1;
        tone.frequency.value = this.freq;

        // create a new sound and play it (now)
        this.sound = new Sound(actx, tone);
        this.playing = true;
        this.sound.start(time);
    }else if(this.playing && this.on && !this.active){
      this.sound.stop(0);
      this.playing = false;
    }
  }
};

// builds rgb(a) color strings for drawing to canvas
function Color(i) {
  var colors = [[177,  14,  30],  // RED
                [223,  48,  52],  // LRED
                [  0, 100,  53],  // GREEN
                [244, 119,  56],  // ORANGE
                [255, 191,  71],  // YELLOW
                [  0, 120, 186],  // BBLUE
                [  0,   0, 255],  // BLUE
                [ 43, 140, 196],  // LBLUE
                [ 40, 161, 151],  // CYAN
                [213,  56, 128],  // PINK
                [ 77,  41,  66],  // DPURPLE
                [133, 153,  75]]; // LGREEN
  var color = colors[i % colors.length];
  this.rgb = 'rgb(' + color.join(',') + ')';
  this.rgba = function(a) {
    return 'rgba(' + color.concat(a).join(',') + ')';
  };
}

// takes a source and pushes it through available effect audio nodes to output
// returns a context
function Sound(actx, source) {

  // create a gain node - which can be used to alter the volume of the input
  var volume = actx.createGain();
  volume.gain.value = gain;
  source.connect(volume);

  // create convolver node
  // var reverb = audioContext.createConvolver();
  // volume.connect(reverb);

  // create delay node
  var delay = actx.createDelay();
  delay.delayTime.value = 0;
  volume.connect(delay);


  delay.connect(actx.destination);
  return source;
}


