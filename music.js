// references:
// http://blog.chrislowis.co.uk/2013/06/05/playing-notes-web-audio-api.html
// http://stuartmemo.com/making-sine-square-sawtooth-and-triangle-waves/
//
// to read:
// http://flippinawesome.org/2013/10/28/audio-synthesis-in-javascript/?utm_source=html5weekly&utm_medium=email
// https://developer.tizen.org/documentation/articles/advanced-web-audio-api-usage
// http://joshondesign.com/p/books/canvasdeepdive/chapter12.html

<<<<<<< HEAD
var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    audioContext = new (window.AudioContext || window.webkitAudioContext)(),
    tempo = 60,
    tempoControl = document.getElementById('tempo'),
    gain = 0.5,
    gainControl = document.getElementById('gain'),
    size = 40,
    rows = 12,
    cols = 32,
    startFreq = 440 * 2, // one octacve between 440 && 880
    paused = false, // whether we are currently moving the canvas
    now = audioContext.currentTime,
    stringPosition,
    sound;

var squares = [];

window.onload = function() {
  function setup() {
    canvas.width = screen.width;
    canvas.height = size * rows + (size / 2.5) * rows + size;
    stringPosition = canvas.width / 4;
    canvas.addEventListener('click', click, false);
    window.addEventListener('keydown', keydown);

    for(var x = 0; x < cols; x++) {
      for(var y = 0; y < rows; y++) {
        squares.push(new Square(x, y));
      }
    }

  }

  function update() {
    canvas.width = canvas.width;
    var len = squares.length;
    for(var i = 0; i < len; i++){
      var square = squares[i];
      square.update();
    }

    now = audioContext.currentTime;
    handleForm();
  }

  function draw() {
    // draw squares, play sounds
    var len = squares.length;
    for(var i = 0; i < len; i++){
      var square = squares[i];
      square.draw();
      square.play();
    }

    // draw string
    context.strokeStyle = 'white';
    context.moveTo(stringPosition, 0);
    context.lineTo(stringPosition, canvas.height);
    context.stroke();
  }

  function main() {
    update();
    draw();
    window.requestAnimationFrame(main);
  }

  function click(e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;

    for(var i = 0; i < squares.length; i++){
      squares[i].updateIfClicked(x, y);
    }
  }

  function keydown(e) {
    if(e.keyCode == 32){
      // spacebar pauses
      paused = !paused;
      e.preventDefault();
    }
  }

  function handleForm() {
    // tempo = t(tempoControl.valueyy);
    tempo = parseInt(tempoControl.value);
    gain = parseInt(gainControl.value);
  }

  setup();
  main();
};

function Square(x, y) {
  this.x = x;
  this.y = y;
  this.offset = Math.floor(size / 2.5);
=======
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame  ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function MusicBox(settings) {
  // how many squares to put on the screen
  this.rows = settings.rows || 12;
  this.cols = settings.cols || 32;
  this.squareSize = settings.squareSize || 40;
  this.squares = [];

  // setup the canvas, context
  this.canvas = document.getElementById('canvas');
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = this.squareSize * this.rows + (this.squareSize / 2.5) * this.rows + this.squareSize;
  this.ctx = this.canvas.getContext('2d');

  // where to put the string
  this.stringPosition = settings.stringPosition || (this.canvas.width / 4);

  // setup the control knobs
  this.tempoControl = document.getElementById('tempo');
  this.gainControl = document.getElementById('gain');
  this.tempo = this.tempoControl.value;
  this.gain = this.gainControl.value;

  // setup the audio context, start keeping time
  this.actx = new window.AudioContext();
  this.isPlaying = true;

  var speed = this.tempo / 60 / this.cols;

  for(var x = 0; x < this.cols; x++) {
    for(var y = 0; y < this.rows; y++) {
      var freq = 880 - ((880 / 2 / this.rows) * y);
      this.squares.push(new Square(x, y, speed, freq, this.cols - 1, this.squareSize));
    }
  }
}

MusicBox.prototype = {
  update: function() {
    // update squares
    var settings = {
      stringPosition: this.stringPosition,
      speed: this.isPlaying ? (this.tempo / 60 / this.cols) : 0
    };
    _each(this.squares, function(i, sq) { sq.update(settings); });

    // update values from form
    this.tempo = parseInt(this.tempoControl.value, 10);
    this.gain = parseInt(this.gainControl.value, 10);
  },

  draw: function() {
    // clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw squares
    _each(this.squares, function(i, sq) { sq.draw(this.ctx); }, this);

    // draw string
    this.ctx.strokeStyle = 'white';
    this.ctx.moveTo(this.stringPosition, 0);
    this.ctx.lineTo(this.stringPosition, this.canvas.height);
    this.ctx.stroke();
  },

  play: function() {
    // play squares
    var now = this.actx.currentTime;
    _each(this.squares, function(i, sq) { sq.play(this.actx, now); }, this);
  },

  togglePlaying: function() {
    this.isPlaying = !this.isPlaying;
  },

  handleClick: function(e) {
    var x = e.pageX - this.canvas.offsetLeft;
    var y = e.pageY - this.canvas.offsetTop;
    _each(this.squares, function(i, sq) { sq.updateIfClicked(x, y); });
  },

  kickOutTheJams: function() {
    this.update();
    this.draw();
    this.play();
    window.requestAnimFrame(this.kickOutTheJams.bind(this));
  }
};

function _each(array, fn, context) {
  var len = array.length;
  for (var i = 0; i < len; i++) {
    fn.call(context, i, array[i]);
  }
}

window.onload = function() {
  // kick off the app
  var musicbox = new MusicBox({});
  musicbox.kickOutTheJams();

  musicbox.canvas.addEventListener('click', function(e) {
    musicbox.handleClick(e);
  });

  window.addEventListener('keydown', function(e) {
    if (e.keyCode == 32){
      musicbox.togglePlaying();
      e.preventDefault();
    }
  });

};

function Square(x, y, speed, freq, start, size) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.offset = Math.floor(this.size / 2.5);
>>>>>>> master
  this.px = this.getPixelPosition(x);
  this.py = this.getPixelPosition(y);
  this.on = false;
  this.active = false;
  this.playing = false;
  this.sound = undefined;
<<<<<<< HEAD
  this.freq = startFreq - ((startFreq / 2 / rows) * y);
  this.color = new Color(y);
}

Square.prototype = {
  currentSpeed: function() {
    return paused ? 0 : (tempo / 60.0) / cols;
  },

  draw: function() {
=======
  this.freq = freq;
  this.color = new Color(y);
  this.speed = speed;
  this.start = start;
}

Square.prototype = {
  draw: function(ctx) {
>>>>>>> master
    if(this.isOnScreen()){
      if(this.on) {
        // active squares are currently touching the line
        if(this.active) {
<<<<<<< HEAD
          context.fillStyle = this.color.rgba(0.9);
          context.fillRect(this.px, this.py, size, size);
          context.fillStyle = "rgba(255, 255, 255, 0.7)";
          context.fillRect(this.px - 1, this.py - 1, size + 2, size + 2);
        }else{
          context.fillStyle = this.color.rgba(0.9);
          context.fillRect(this.px, this.py, size, size);
        }
      }else{
        context.fillStyle = this.color.rgba(0.2);
        context.fillRect(this.px, this.py, size, size);
=======
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
>>>>>>> master
      }
    }
  },

<<<<<<< HEAD
  update: function() {
    this.active = this.isActive();
    if(this.px + size < 0) this.x = cols - 1;
    this.x -= this.currentSpeed();
=======
  update: function(settings) {
    for (var prop in settings) {
      this[prop] = settings[prop];
    }

    this.active = this.isActive(settings.stringPosition);
    if (this.px + this.size < 0) this.x = this.start;
    this.x -= this.speed;
>>>>>>> master
    this.px = this.getPixelPosition(this.x);
    this.py = this.getPixelPosition(this.y);
  },

  getPixelPosition: function(p) {
<<<<<<< HEAD
    return p * size + (p * this.offset + this.offset);
  },

  isOnScreen: function() {
    return (this.px < canvas.width && this.px + size > 0);
  },

  isActive: function() {
    return (this.px < stringPosition && this.px + size > stringPosition);
  },

  updateIfClicked: function(cx, cy) {
    if(cx > this.px && cx < this.px + size){
      if(cy > this.py && cy < this.py + size){
=======
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
>>>>>>> master
        this.on = !this.on;
      }
    }
    return this.on;
  },

<<<<<<< HEAD
  play: function() {
    if(! this.playing && this.on && this.active){
        // create a synthetic tone for now
        // replace with microphone?
        var tone = audioContext.createOscillator();
=======
  play: function(actx, time) {
    if(! this.playing && this.on && this.active){
        // create a synthetic tone for now
        // replace with microphone?
        var tone = actx.createOscillator();
>>>>>>> master
        tone.type = 1;
        tone.frequency.value = this.freq;

        // create a new sound and play it (now)
<<<<<<< HEAD
        this.sound = new Sound(tone);
        this.playing = true;
        this.sound.start(now);
=======
        this.sound = new Sound(actx, tone);
        this.playing = true;
        this.sound.start(time);
>>>>>>> master
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
<<<<<<< HEAD
function Sound(source) {

  // create a gain node - which can be used to alter the volume of the input
  var volume = audioContext.createGain();
=======
function Sound(actx, source) {

  // create a gain node - which can be used to alter the volume of the input
  var volume = actx.createGain();
>>>>>>> master
  volume.gain.value = gain;
  source.connect(volume);

  // create convolver node
  // var reverb = audioContext.createConvolver();
  // volume.connect(reverb);

  // create delay node
<<<<<<< HEAD
  var delay = audioContext.createDelay();
=======
  var delay = actx.createDelay();
>>>>>>> master
  delay.delayTime.value = 0;
  volume.connect(delay);


<<<<<<< HEAD
  delay.connect(audioContext.destination);
=======
  delay.connect(actx.destination);
>>>>>>> master
  return source;
}


