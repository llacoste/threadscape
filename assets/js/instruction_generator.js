function onOpenCvReady() {
  // even when this is called, sometimes it's still not ready, adding slight time buffer
  setTimeout(function(){
      document.getElementById('status').innerHTML = 'Generator is ready.';
  }, 1000);
}

function showStep(id){
  let step1 = document.getElementById("step1");
  let step2 = document.getElementById("step2");
  let step3 = document.getElementById("step3");

  switch (id){
      case 1:
          step1.classList.remove('hidden');
          step2.classList.add('hidden');
          step3.classList.add('hidden');
          break;
      case 2:
          step1.classList.add('hidden');
          step2.classList.remove('hidden');
          step3.classList.add('hidden');
          break;
      case 3:
          step1.classList.add('hidden');
          step2.classList.add('hidden');
          step3.classList.remove('hidden');
          break;
      default:
          break;
  }
}

document.getElementById('download_processed_image').addEventListener('click', function () {
  const canvas = document.getElementById('canvasOutput2');
  const imageURL = canvas.toDataURL('image/png');

  const downloadLink = document.createElement('a');
  downloadLink.href = imageURL;
  downloadLink.download = 'processed_image.png';
  downloadLink.click();
});

document.getElementById('download_instructions').addEventListener('click', function () {
  const fileContent = line_sequence.join('\n');
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'instructions.txt';
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
});


setupButtonGroupListeners('instruction_shape_selection');
setupButtonGroupListeners('instruction_quality_selection');
setupButtonGroupListeners('instruction_mode_selection');

syncSliderAndInput('pegs_slider', 'pegs_slider_value', 150, 1200);
syncSliderAndInput('segments_slider', 'segments_slider_value', 0, 10000);
syncSliderAndInput('opacity_slider', 'opacity_slider_value', 1, 5);
syncSliderAndInput('thickness_slider', 'thickness_slider_value', 25, 100);

// const instruction_canvas = document.getElementById('instruction_canvas');
// const instruction_ctx = instruction_canvas.getContext('2d');

document.getElementById('input-file-button').addEventListener('click', function () {
  document.getElementById('input-image').click();
});

// Handles loading the selected image and generating the string art.
document.getElementById('input-image').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function () {
      // Draw here
    };
  };

  reader.readAsDataURL(file);
});