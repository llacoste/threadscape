var incrementalDrawing = document.getElementById("incrementalDrawing");
var incrementalCurrentStep = document.getElementById("incrementalCurrentStep");
var ctx3=document.getElementById("canvasOutput3").getContext("2d");

var pointIndex = 0;
var lastStepImage;
var listenForKeys = false;
var lines = [];

function startCreating(){
  window.speechSynthesis.getVoices();
  incrementalDrawing.classList.remove('hidden');

  base_image2 = new Image();
  ctx3.canvas.width = IMG_SIZE * 2;
  ctx3.canvas.height = IMG_SIZE * 2;
  ctx3.clearRect(0,0, IMG_SIZE * 2, IMG_SIZE * 2);
  ctx3.drawImage(base_image2, 0, 0, IMG_SIZE * 2, IMG_SIZE * 2);

  incrementalCurrentStep.textContent = "";
  pointIndex = 0;
  if(pin_coords == null){
      CalculatePins();
  }
  nextStep(lines);
  listenForKeys = true;
}

function startDrawing(){
  incrementalDrawing.classList.remove('hidden');
  listenForKeys = false;

  base_image2 = new Image();
  ctx3.canvas.width = IMG_SIZE * 2;
  ctx3.canvas.height = IMG_SIZE * 2;
  ctx3.clearRect(0,0, IMG_SIZE * 2, IMG_SIZE * 2);
  ctx3.drawImage(base_image2, 0, 0, IMG_SIZE * 2, IMG_SIZE * 2);

  lines = pinsOutput.value.split(",").map(V => { return parseInt(V)});

  window.scrollTo({ top: 5000, left: 0, behavior: 'smooth' });

  incrementalCurrentStep.textContent = "";
  pointIndex = 0;
  if(pin_coords == null){
      CalculatePins();
  }

  let j = 0;
  (function codeBlock(){
      if(j < num_segements() - 1){
          incrementalCurrentStep.textContent = "Current Line: " + (pointIndex + 1) + " |  Pin " + lines[pointIndex] + " to " + lines[pointIndex + 1];
          pointIndex++;
          ctx3.beginPath();
          ctx3.moveTo(pin_coords[lines[pointIndex - 1]][0] * 2, pin_coords[lines[pointIndex - 1]][1] * 2);
          ctx3.lineTo(pin_coords[lines[pointIndex]][0] * 2, pin_coords[lines[pointIndex]][1] * 2);
          ctx3.strokeStyle = "black";
          ctx3.lineWidth = 0.3;
          ctx3.stroke();
          j++;
          setTimeout(codeBlock, 0);
      } else {
      }
  })();
}

function nextStep(){
  if(pointIndex > num_segements() - 1){ return;}
  incrementalCurrentStep.textContent = "Current Line: " + (pointIndex + 1) + " |  Pin " + lines[pointIndex] + " to " + lines[pointIndex + 1];

  if(pointIndex > 0){
      //ctx3.clearRect(0,0, IMG_SIZE * 2, IMG_SIZE * 2);
      ctx3.putImageData(lastStepImage, 0, 0);
      ctx3.beginPath();
      ctx3.moveTo(pin_coords[lines[pointIndex - 1]][0] * 2, pin_coords[lines[pointIndex - 1]][1] * 2);
      ctx3.lineTo(pin_coords[lines[pointIndex]][0] * 2, pin_coords[lines[pointIndex]][1] * 2);
      ctx3.strokeStyle = "black";
      ctx3.lineWidth = 0.3;
      ctx3.stroke();
  }
  
  lastStepImage = ctx3.getImageData(0, 0, IMG_SIZE * 2, IMG_SIZE * 2);

  pointIndex++;
  ctx3.beginPath();
  ctx3.moveTo(pin_coords[lines[pointIndex - 1]][0] * 2, pin_coords[lines[pointIndex - 1]][1] * 2);
  ctx3.lineTo(pin_coords[lines[pointIndex]][0] * 2, pin_coords[lines[pointIndex]][1] * 2);
  ctx3.strokeStyle = "#FF0000";
  ctx3.lineWidth = 1;
  ctx3.stroke();

  //window.speechSynthesis.speak(new SpeechSynthesisUtterance(lines[pointIndex + 1]));
}

function lastStep(){
  if(pointIndex < 2){ return;}
  pointIndex--;
  pointIndex--;
  ctx3.clearRect(0,0, IMG_SIZE * 2, IMG_SIZE * 2);
  incrementalCurrentStep.textContent = "Current Line: " + (pointIndex + 1) + " |  Pin " + lines[pointIndex] + " to " + lines[pointIndex + 1];
  
  for(i=0; i < pointIndex; i++){
      ctx3.beginPath();
      ctx3.moveTo(pin_coords[lines[i]][0] * 2, pin_coords[lines[i]][1] * 2);
      ctx3.lineTo(pin_coords[lines[i + 1]][0] * 2, pin_coords[lines[i + 1]][1] * 2);
      ctx3.strokeStyle = "black";
      ctx3.lineWidth = 0.3;
      ctx3.stroke();
  }
  lastStepImage = ctx3.getImageData(0, 0, IMG_SIZE * 2, IMG_SIZE * 2);
  pointIndex++;
  ctx3.beginPath();
  ctx3.moveTo(pin_coords[lines[pointIndex - 1]][0] * 2, pin_coords[lines[pointIndex - 1]][1] * 2);
  ctx3.lineTo(pin_coords[lines[pointIndex]][0] * 2, pin_coords[lines[pointIndex]][1] * 2);
  ctx3.strokeStyle = "#FF0000";
  ctx3.lineWidth = 1;
  ctx3.stroke();
}

function CalculatePins(){
  pin_coords = [];
  center = IMG_SIZE / 2;
  radius = IMG_SIZE / 2 - 1/2

  for(i=0; i < num_pegs(); i++){
      angle = 2 * Math.PI * i / num_pegs();
      pin_coords.push([Math.floor(center + radius * Math.cos(angle)),
          Math.floor(center + radius * Math.sin(angle))]);
  }
}

function handleFileContent(content) {
  lines = content.split('\n').map(V => { return parseInt(V)});
  startCreating();
}

document.getElementById('upload-instructions-button').addEventListener('click', function () {
  document.getElementById('upload-instructions-input').click();
});

document.getElementById('upload-instructions-input').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      handleFileContent(content);
    };
    reader.readAsText(file);
  }
});