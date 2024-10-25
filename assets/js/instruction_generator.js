function onOpenCvReady() {
  // even when this is called, sometimes it's still not ready, adding slight time buffer
  setTimeout(function () {
    document.getElementById('status').innerHTML = 'Generator is ready.';
  }, 1000);
}

function showStep(id) {
  let step1 = document.getElementById("step1");
  let step2 = document.getElementById("step2");
  let step3 = document.getElementById("step3");

  switch (id) {
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
  const canvas = document.getElementById('string_art_canvas');
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

syncSliderAndInput('instruction_diameter_slider', 'instruction_diameter_slider_value', 12, 48);
syncSliderAndInput('pegs_slider', 'pegs_slider_value', 150, 1200);
syncSliderAndInput('segments_slider', 'segments_slider_value', 0, 10000);
syncSliderAndInput('weight_slider', 'weight_slider_value', 1, 100);
syncSliderAndInput('minimum_peg_distance_slider', 'minimum_peg_distance_slider_value', 1, 100);
syncSliderAndInput('scale_slider', 'scale_slider_value', 1, 100);
syncSliderAndInput('opacity_slider', 'opacity_slider_value', 1, 5);
syncSliderAndInput('thickness_slider', 'thickness_slider_value', 25, 100);

document.getElementById('input-file-button').addEventListener('click', function () {
  document.getElementById('image_input').click();
});

document.getElementById('image_input').addEventListener('change', function (event) {
  source_image_element.src = URL.createObjectURL(event.target.files[0]);
});