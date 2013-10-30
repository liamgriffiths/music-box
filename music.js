// references:
// http://blog.chrislowis.co.uk/2013/06/05/playing-notes-web-audio-api.html
// http://stuartmemo.com/making-sine-square-sawtooth-and-triangle-waves/

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    audioContext = new webkitAudioContext(),
    keyPresses = [],
    tempo = 60,
    tempoControl = document.getElementById('tempo'),
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
    handleKeys();
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
      keyPresses.push('space');
      e.preventDefault();
    }
  }

  function handleKeys() {
    var len = keyPresses.length;
    for(var i = 0; i < len; i++){
      if(keyPresses[i] == 'space') paused = !paused;
    }
    keyPresses = [];
  }

  function handleForm() {
    tempo = tempoControl.value;
  }

  setup();
  main();
};

function Square(x, y) {
  this.x = x;
  this.y = y;
  this.offset = 20;
  this.speed = this.calcSpeed();
  this.px = this.getPixel(x);
  this.py = this.getPixel(y);
  this.on = false;
  this.onScreen = this.isOnScreen();
  this.active = this.isActive();
  this.playing = false;
  this.tone = undefined;
  this.freq = 440 + ((440 / rows) * y);
}

Square.prototype = {
  calcSpeed: function() {
    return (tempo / 60.0) / cols;
  },

  draw: function() {
    if(this.on){
      if(this.active) {
        context.fillStyle = "rgb(255, 255, 255)";
      }else{
        context.fillStyle = "rgb(255, 200, 200)";
      }
    }else{
      context.fillStyle = "rgb(200, 0, 0)";
    }
    if(this.isOnScreen){
      context.fillRect(this.px, this.py, size, size);
    }
  },

  update: function() {
    this.speed = this.calcSpeed();
    this.onScreen = this.isOnScreen();
    this.active = this.isActive();
    if(this.px + size < 0) this.x = cols - 1;
    this.x -= this.speed;
    this.px = this.getPixel(this.x);
    this.py = this.getPixel(this.y);
  },

  getPixel: function(p) {
    return p * size + (p * this.offset + this.offset);
  },

  isOnScreen: function() {
    if(this.px < canvas.width && this.px + size > 0){
      return true;
    }else{
      return false;
    }
  },

  isActive: function() {
    if(this.px < stringX && this.px + size > stringX){
      return true;
    }else{
      return false;
    }
  },

  updateIfClicked: function(cx, cy) {
    if(cx > this.px && cx < this.px + size){
      if(cy > this.py && cy < this.py + size){
        this.on = !this.on;
      }
    }
    return this.on;
  },

  play: function() {
    if(! this.playing && this.on && this.active){
        this.tone = audioContext.createOscillator();
        this.tone.connect(audioContext.destination);
        this.tone.type = 0;
        this.tone.frequency.value = this.freq;
        this.tone.noteOn(now);
        this.playing = true;
    }else if(this.playing && this.on && !this.active){
      // this.tone.stop(0);
      this.tone.noteOff(0);
      this.playing = false;
    }
  }
};

// http://blog.chrislowis.co.uk/2013/06/05/playing-notes-web-audio-api.html
// http://stuartmemo.com/making-sine-square-sawtooth-and-triangle-waves/



