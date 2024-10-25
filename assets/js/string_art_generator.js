var IMG_SIZE = 500;
var MAX_LINES = 1500;
var N_PINS = 360;
var MIN_LOOP = 20;
var MIN_DISTANCE = 20;
var LINE_WEIGHT = 50;
var FILENAME = "";
var SCALE = 20;
var HOOP_DIAMETER = 0.625;

var img;

// set up element variables
var imgElement = document.getElementById("imageSrc")
var inputElement = document.getElementById("input-image");
inputElement.addEventListener("change", (e) => {
  imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);
var ctx=document.getElementById("canvasOutput").getContext("2d");
var ctx2=document.getElementById("canvasOutput2").getContext("2d");
var ctx3=document.getElementById("canvasOutput3").getContext("2d");
var status_bar = document.getElementById("status");
var drawStatus = document.getElementById("drawStatus");
var showPins = document.getElementById("showPins");
var pinsOutput = document.getElementById("pinsOutput");
var incrementalDrawing = document.getElementById("incrementalDrawing");
var incrementalCurrentStep = document.getElementById("incrementalCurrentStep");
var numberOfPins = document.getElementById("numberOfPins");
var numberOfLines = document.getElementById("numberOfLines");
var lineWeight = document.getElementById("lineWeight");

var length;
var R = {};

//pre initilization
var pin_coords;
var center;
var radius;

var line_cache_y;
var line_cache_x;
var line_cache_length;
var line_cache_weight;

//line variables
var error;
var img_result;    
var result;
var line_mask;
var line_sequence;
var pin;
var thread_length;
var last_pins;

var listenForKeys = false;

//*******************************
//      Line Generation
//*******************************

imgElement.onload = function() {
  listenForKeys = false;
  showStep(1);
  showPins.classList.add('hidden');
  incrementalDrawing.classList.add('hidden');
  // Take uploaded picture, square up and put on canvas
  base_image = new Image();
  base_image.src = imgElement.src;
  ctx.canvas.width = IMG_SIZE;
  ctx.canvas.height = IMG_SIZE;
  ctx2.canvas.weight = IMG_SIZE * 2;
  ctx2.canvas.height = IMG_SIZE * 2;
  ctx.clearRect(0,0, IMG_SIZE, IMG_SIZE);

  var selectedWidth = base_image.width;
  var selectedHeight = base_image.height;
  var xOffset = 0;
  var yOffset = 0;
  // square crop  center of picture
  if(base_image.height > base_image.width){
      selectedWidth = base_image.width;
      selectedHeight = base_image.width;
      yOffset = Math.floor((base_image.height - base_image.width) / 2);
  }else if(base_image.width > base_image.height) {
      selectedWidth = base_image.height;
      selectedHeight = base_image.height;
      xOffset = Math.floor((base_image.width - base_image.height) / 2)
  }

  ctx.drawImage(base_image, xOffset, yOffset, selectedWidth, selectedHeight, 0, 0, IMG_SIZE, IMG_SIZE);
  length = IMG_SIZE;

  // make grayscale by averaging the RGB channels.
  // extract out the R channel because that's all we need and push graysacle image onto canvas
  var imgPixels = ctx.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
  R = img_result = nj.ones([IMG_SIZE, IMG_SIZE ]).multiply(0xff);
  var rdata = [];     
  for(var y = 0; y < imgPixels.height; y++){
      for(var x = 0; x < imgPixels.width; x++){
          var i = (y * 4) * imgPixels.width + x * 4;
          var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
          imgPixels.data[i] = avg; 
          imgPixels.data[i + 1] = avg; 
          imgPixels.data[i + 2] = avg;
          rdata.push(avg);
      }
  }
  R.selection.data = rdata;
  ctx.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);

  //circle crop canvas
  ctx.globalCompositeOperation='destination-in';
  ctx.beginPath();
  ctx.arc(IMG_SIZE/2,IMG_SIZE/2, IMG_SIZE/2, 0, Math.PI*2);
  ctx.closePath();
  ctx.fill();

  // start processing
  NonBlockingCalculatePins();    
}

function NonBlockingCalculatePins(){
  status_bar.textContent = "Calculating pins...";
  pin_coords = [];
  center = length / 2;
  radius = length / 2 - 1/2
  let i = 0;

  (function codeBlock(){
      if(i < N_PINS){
          angle = 2 * Math.PI * i / N_PINS;
          pin_coords.push([Math.floor(center + radius * Math.cos(angle)),
              Math.floor(center + radius * Math.sin(angle))]);
          i++;
          setTimeout(codeBlock, 0);
      } else {
          status_bar.textContent = "Done Calculating pins";
          showStep(2);
          NonBlockingPrecalculateLines();
      }
  })();
}

function NonBlockingPrecalculateLines(){
  status_bar.textContent = "Precalculating all lines...";
  line_cache_y = Array.from({ length: (N_PINS * N_PINS) });
  line_cache_x = Array.from({ length: (N_PINS * N_PINS) });
  line_cache_length = Array.from({ length: (N_PINS * N_PINS) }).map(Function.call, function(){return 0;});
  line_cache_weight = Array.from({ length: (N_PINS * N_PINS) }).map(Function.call, function(){return 1;});
  let a = 0;

  (function codeBlock(){
      if(a < N_PINS){
          for (b = a + MIN_DISTANCE; b < N_PINS; b++) {
              x0 = pin_coords[a][0];
              y0 = pin_coords[a][1];
          
              x1 = pin_coords[b][0];
              y1 = pin_coords[b][1];
              
              d = Math.floor(Number(Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0)*(y1 - y0))));
              xs = linspace(x0, x1, d);
              ys = linspace(y0, y1, d);

              line_cache_y[b*N_PINS + a] = ys;
              line_cache_y[a*N_PINS + b] = ys;
              line_cache_x[b*N_PINS + a] = xs;
              line_cache_x[a*N_PINS + b] = xs;
              line_cache_length[b*N_PINS + a] = d;
              line_cache_length[a*N_PINS + b] = d;
          }
          a++;
          setTimeout(codeBlock, 0);
      } else {
          status_bar.textContent = "Done Precalculating Lines";
          NonBlockingLineCalculator();
          showStep(3);
      }
  })();
}

function NonBlockingLineCalculator(){
  status_bar.textContent = "Drawing Lines...";
  error = nj.ones([IMG_SIZE, IMG_SIZE]).multiply(0xff).subtract(nj.uint8(R.selection.data).reshape(IMG_SIZE, IMG_SIZE));
  img_result = nj.ones([IMG_SIZE, IMG_SIZE ]).multiply(0xff);    
  result = nj.ones([IMG_SIZE * SCALE, IMG_SIZE * SCALE]).multiply(0xff);
  result = new cv.matFromArray(IMG_SIZE * SCALE, IMG_SIZE * SCALE, cv.CV_8UC1, result.selection.data);
  line_mask = nj.zeros([IMG_SIZE, IMG_SIZE], 'float64');
  
  line_sequence = [];
  pin = 0;
  line_sequence.push(pin);
  thread_length = 0;
  last_pins = [];
  let l = 0;

  (function codeBlock(){
      if(l < MAX_LINES){
          if(l%10 == 0){
              draw();
          }

          max_err = -1;
          best_pin = -1;

          for(offset=MIN_DISTANCE; offset < N_PINS - MIN_DISTANCE; offset++){
              test_pin = (pin + offset) % N_PINS;
              if(last_pins.includes(test_pin)){
                  continue;
              }else {

                  xs = line_cache_x[test_pin * N_PINS + pin];
                  ys = line_cache_y[test_pin * N_PINS + pin];

                  line_err = getLineErr(error, ys, xs) * line_cache_weight[test_pin * N_PINS + pin];

                  if( line_err > max_err){
                      max_err = line_err;
                      best_pin = test_pin;
                  }
              }
          }

          line_sequence.push(best_pin);

          xs = line_cache_x[best_pin * N_PINS + pin];
          ys = line_cache_y[best_pin * N_PINS + pin];
          weight = LINE_WEIGHT * line_cache_weight[best_pin * N_PINS + pin];
          
          line_mask = nj.zeros([IMG_SIZE, IMG_SIZE], 'float64');
          line_mask = setLine(line_mask, ys, xs, weight);
          error = subtractArrays(error, line_mask);


          
          p = new cv.Point(pin_coords[pin][0] * SCALE, pin_coords[pin][1] * SCALE);
          p2 = new cv.Point(pin_coords[best_pin][0] * SCALE, pin_coords[best_pin][1] * SCALE);
          cv.line(result, p, p2, new cv.Scalar(0, 0, 0), 2, cv.LINE_AA, 0);

          x0 = pin_coords[pin][0];
          y0 = pin_coords[pin][1];

          x1 = pin_coords[best_pin][0];
          y1 = pin_coords[best_pin][1];

          dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
          thread_length += HOOP_DIAMETER / length * dist;

          last_pins.push(best_pin);
          if(last_pins.length > 20){
              last_pins.shift();
          }
          pin = best_pin;

          //update status
          drawStatus.textContent = l + " Lines drawn | " + Math.round((l / MAX_LINES) * 100) + "% complete";

          l++;
          setTimeout(codeBlock, 0);
      } else {
          Finalize();
      }
  })();
}

function draw(){
  let dsize = new cv.Size(IMG_SIZE * 2, IMG_SIZE * 2);
  let dst = new cv.Mat();
  cv.resize(result, dst, dsize, 0, 0, cv.INTER_AREA);
  cv.imshow('canvasOutput2', dst);
  dst.delete();
}

function Finalize() {
  let dsize = new cv.Size(IMG_SIZE * 2, IMG_SIZE * 2);
  let dst = new cv.Mat();
  cv.resize(result, dst, dsize, 0, 0, cv.INTER_AREA);

  drawStatus.textContent = MAX_LINES + " Lines drawn | 100% complete";

  cv.imshow('canvasOutput2', dst);
  console.log(line_sequence);
  status_bar.textContent = "Complete";
  showPins.classList.remove('hidden');
  dst.delete(); result.delete();
  window.scrollTo({ top: 5000, left: 0, behavior: 'smooth' });
}

function getLineErr(arr, coords1, coords2){
  let result = new Uint8Array(coords1.length);
  for(i=0;i<coords1.length;i++){
      result[i] = arr.get(coords1[i], coords2[i]);
  }
  return getSum(result);
}

function setLine(arr, coords1, coords2, line){
  for(i=0;i<coords1.length;i++){
      arr.set(coords1[i], coords2[i], line);
  }
  return arr;
}

function compareMul(arr1, arr2){
  let result = new Uint8Array(arr1.length);
  for(i=0;i<arr1.length;i++){
      result[i] = (arr1[i] < arr2[i]) * 254 + 1 ;
  }
  return result;
}

function compareAbsdiff(arr1, arr2){
  let rsult = new Uint8Array(arr1.length);
  for(i=0;i<arr1.length;i++){
      rsult[i] = (arr1[i] * arr2[i]);
  }
  return rsult;
}

function subtractArrays(arr1, arr2) {
  for(i=0; i<arr1.selection.data.length;i++){
      arr1.selection.data[i] = arr1.selection.data[i] - arr2.selection.data[i]
      if(arr1.selection.data[i] < 0){
          arr1.selection.data[i] = 0;
      }else if (arr1.selection.data[i] > 255){
          arr1.selection.data[i] = 255;
      }
  }
  return arr1;
}

function subtractArraysSimple(arr1, arr2) {
  for(i=0; i<arr1.length;i++){
      arr1[i] = arr1[i] - arr2[i];
  }
  return arr1;
}

function getSum(arr) {
  let v = 0;
  for(i=0;i<arr.length;i++){
      v = v + arr[i];
  }
return v;
}

function makeArr(startValue, stopValue, cardinality) {
var arr = [];
var currValue = startValue;
var step = (stopValue - startValue) / (cardinality - 1);
for (var i = 0; i < cardinality; i++) {
  arr.push(Math.round(currValue + (step * i)));
}
return arr;
}

function AddRGB(arr1, arr2, arr3){
  for(i=0;i<arr1.data.length;i++){
      var avg = (arr1.data[i] + arr2.data[i] + arr3.data[i]);
      arr1.data[i] = avg;
  }
  return arr1;
}

function linspace(a,b,n) {
  if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
  if(n<2) { return n===1?[a]:[]; }
  var i,ret = Array(n);
  n--;
  for(i=n;i>=0;i--) { ret[i] = Math.floor((i*b+(n-i)*a)/n); }
  return ret;
}