var IMG_SIZE = 500;
var R = {};
var pin_coords;
var center;
var radius;
var line_cache_y;
var line_cache_x;
var line_cache_length;
var line_cache_weight;
var error;
var img_result;    
var result;
var line_mask;
var line_sequence;
var pin;
var thread_length;
var last_pins;

function start_generator(){
  reset_all_variables();
  showStep(1);
  square_crop_image()
  convert_image_to_grayscale();
  cirle_crop_canvas();
  NonBlockingCalculatePins();
}

function square_crop_image(){
  base_image = new Image();
  base_image.src = source_image_element.src;
  original_img_preview_canvas.canvas.width = IMG_SIZE;
  original_img_preview_canvas.canvas.height = IMG_SIZE;
  string_art_canvas.canvas.weight = IMG_SIZE * 2;
  string_art_canvas.canvas.height = IMG_SIZE * 2;
  original_img_preview_canvas.clearRect(0,0, IMG_SIZE, IMG_SIZE);

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

  original_img_preview_canvas.drawImage(base_image, xOffset, yOffset, selectedWidth, selectedHeight, 0, 0, IMG_SIZE, IMG_SIZE);
}

function convert_image_to_grayscale(){
  var imgPixels = original_img_preview_canvas.getImageData(0, 0, IMG_SIZE, IMG_SIZE);
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
  original_img_preview_canvas.putImageData(imgPixels, 0, 0, 0, 0, IMG_SIZE, IMG_SIZE);
}

function cirle_crop_canvas(){
  original_img_preview_canvas.globalCompositeOperation='destination-in';
  original_img_preview_canvas.beginPath();
  original_img_preview_canvas.arc(IMG_SIZE/2,IMG_SIZE/2, IMG_SIZE/2, 0, Math.PI*2);
  original_img_preview_canvas.closePath();
  original_img_preview_canvas.fill();
}

function NonBlockingCalculatePins(){
  status_bar.textContent = "Calculating pins...";
  pin_coords = [];
  center = diameter() / 2;
  radius = diameter() / 2 - 1/2
  let i = 0;

  (function codeBlock(){
      if(i < num_pegs()){
          angle = 2 * Math.PI * i / num_pegs();
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
  line_cache_y = Array.from({ length: (num_pegs() * num_pegs()) });
  line_cache_x = Array.from({ length: (num_pegs() * num_pegs()) });
  line_cache_length = Array.from({ length: (num_pegs() * num_pegs()) }).map(Function.call, function(){return 0;});
  line_cache_weight = Array.from({ length: (num_pegs() * num_pegs()) }).map(Function.call, function(){return 1;});
  let a = 0;

  (function codeBlock(){
      if(a < num_pegs()){
          for (b = a + minimum_peg_distance(); b < num_pegs(); b++) {
              x0 = pin_coords[a][0];
              y0 = pin_coords[a][1];
          
              x1 = pin_coords[b][0];
              y1 = pin_coords[b][1];
              
              d = Math.floor(Number(Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0)*(y1 - y0))));
              xs = linspace(x0, x1, d);
              ys = linspace(y0, y1, d);

              line_cache_y[b*num_pegs() + a] = ys;
              line_cache_y[a*num_pegs() + b] = ys;
              line_cache_x[b*num_pegs() + a] = xs;
              line_cache_x[a*num_pegs() + b] = xs;
              line_cache_length[b*num_pegs() + a] = d;
              line_cache_length[a*num_pegs() + b] = d;
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
  result = nj.ones([IMG_SIZE * scale(), IMG_SIZE * scale()]).multiply(0xff);
  result = new cv.matFromArray(IMG_SIZE * scale(), IMG_SIZE * scale(), cv.CV_8UC1, result.selection.data);
  line_mask = nj.zeros([IMG_SIZE, IMG_SIZE], 'float64');
  
  line_sequence = [];
  pin = 0;
  line_sequence.push(pin);
  thread_length = 0;
  last_pins = [];
  let l = 0;

  (function codeBlock(){
      if(l < num_segements()){
          if(l%10 == 0){
              draw();
          }

          max_err = -1;
          best_pin = -1;

          for(offset=minimum_peg_distance(); offset < num_pegs() - minimum_peg_distance(); offset++){
              test_pin = (pin + offset) % num_pegs();
              if(last_pins.includes(test_pin)){
                  continue;
              }else {

                  xs = line_cache_x[test_pin * num_pegs() + pin];
                  ys = line_cache_y[test_pin * num_pegs() + pin];

                  line_err = getLineErr(error, ys, xs) * line_cache_weight[test_pin * num_pegs() + pin];

                  if( line_err > max_err){
                      max_err = line_err;
                      best_pin = test_pin;
                  }
              }
          }

          line_sequence.push(best_pin);

          xs = line_cache_x[best_pin * num_pegs() + pin];
          ys = line_cache_y[best_pin * num_pegs() + pin];
          weight = line_weight() * line_cache_weight[best_pin * num_pegs() + pin];
          
          line_mask = nj.zeros([IMG_SIZE, IMG_SIZE], 'float64');
          line_mask = setLine(line_mask, ys, xs, weight);
          error = subtractArrays(error, line_mask);


          
          p = new cv.Point(pin_coords[pin][0] * scale(), pin_coords[pin][1] * scale());
          p2 = new cv.Point(pin_coords[best_pin][0] * scale(), pin_coords[best_pin][1] * scale());
          cv.line(result, p, p2, new cv.Scalar(0, 0, 0), 2, cv.LINE_AA, 0);

          x0 = pin_coords[pin][0];
          y0 = pin_coords[pin][1];

          x1 = pin_coords[best_pin][0];
          y1 = pin_coords[best_pin][1];

          dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
          thread_length += base_diameter() * (dist / diameter());

          last_pins.push(best_pin);
          if(last_pins.length > 20){
              last_pins.shift();
          }
          pin = best_pin;

          //update status
          draw_status.textContent = l + " Lines drawn | " + Math.round((l / num_segements()) * 100) + "% complete";

          l++;
          setTimeout(codeBlock, 0);
      } else {
          finalize();
      }
  })();
}

function draw(){
  let dsize = new cv.Size(IMG_SIZE * 2, IMG_SIZE * 2);
  let dst = new cv.Mat();
  cv.resize(result, dst, dsize, 0, 0, cv.INTER_AREA);
  cv.imshow('string_art_canvas', dst);
  dst.delete();
}

function finalize() {
  let dsize = new cv.Size(IMG_SIZE * 2, IMG_SIZE * 2);
  let dst = new cv.Mat();
  cv.resize(result, dst, dsize, 0, 0, cv.INTER_AREA);
  draw_status.textContent = num_segements() + " Lines drawn | 100% complete";
  cv.imshow('string_art_canvas', dst);
  status_bar.textContent = "Complete";
  showStep(4);
  instruction_generator_has_run = true;
  dst.delete(); result.delete();
  cleanup_variables();
}

function cleanup_variables(){
  var R = {};
  pin_coords = null;
  center = null;
  radius = null;
  line_cache_y = null;
  line_cache_x = null;
  line_cache_length = null;
  line_cache_weight = null;
  img_result = null;
  result = null;
  line_mask = null;
  pin = null;
  last_pins = null;
}

function reset_all_variables(){
  error = null;
  line_sequence = null;
  thread_length = null;
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

// Helper functions for interacting with UI:
function num_segements() {
  segments_slider_value = document.getElementById('segments_slider_value');
  return parseInt(segments_slider_value.value, 10);
}

function num_pegs() {
  pegs_slider_value = document.getElementById('pegs_slider_value');
  return parseInt(pegs_slider_value.value, 10);
}

function line_weight() {
  line_weight_slider_value = document.getElementById('weight_slider_value');
  return parseInt(line_weight_slider_value.value, 10);
}

function minimum_peg_distance() {
  minimum_peg_distance_slider_value = document.getElementById('minimum_peg_distance_slider_value');
  return parseInt(minimum_peg_distance_slider_value.value, 10);
}

function scale() {
  scale_slider_value = document.getElementById('scale_slider_value');
  return parseInt(scale_slider_value.value, 10);
}

function base_diameter() {
  instruction_diameter_slider_value = document.getElementById('instruction_diameter_slider_value');
  return parseInt(instruction_diameter_slider_value.value, 10);
}

function diameter(){
  return 500
}