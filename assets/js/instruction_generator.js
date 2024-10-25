var source_image_element = document.getElementById("source_image")
var original_img_preview_canvas=document.getElementById("original_img_preview").getContext("2d");
var string_art_canvas=document.getElementById("string_art_canvas").getContext("2d");
var status_bar = document.getElementById("status");
var draw_status = document.getElementById("draw_status");
var instruction_generator_has_run = false;

function onOpenCvReady() {
  setTimeout(function () {
    document.getElementById('status').innerHTML = 'Generator is ready.';
  }, 1000);
}

function showStep(id) {
  let step1 = document.getElementById("step1");
  let step2 = document.getElementById("step2");
  let step3 = document.getElementById("step3");
  let step4 = document.getElementById("step4");

  switch (id) {
    case 1:
      step1.classList.remove('hidden');
      step2.classList.add('hidden');
      step3.classList.add('hidden');
      step4.classList.add('hidden');
      break;
    case 2:
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      step3.classList.add('hidden');
      step4.classList.add('hidden');
      break;
    case 3:
      step1.classList.add('hidden');
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      break;
    case 4:
      step1.classList.add('hidden');
      step2.classList.add('hidden');
      step3.classList.remove('hidden');
      step4.classList.remove('hidden');
      document.getElementById('instruction_generator_page').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
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

function addUpdateListener(sliderId, inputId) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);

  // Add event listener for slider to trigger only on release (when user lets go of the slider)
  slider.addEventListener('change', () => {
    if (instruction_generator_has_run) {
      console.log("Slider released, triggering start_generator.");
      start_generator();
    }
  });

  // Add event listener for input to trigger only when the user clicks out (blur event)
  input.addEventListener('blur', () => {
    if (instruction_generator_has_run) {
      console.log("Input blurred, triggering start_generator.");
      start_generator();
    }
  });
}

setupButtonGroupListeners('instruction_shape_selection');
setupButtonGroupListeners('instruction_quality_selection');
setupButtonGroupListeners('instruction_mode_selection');

syncSliderAndInput('instruction_diameter_slider', 'instruction_diameter_slider_value', 12, 48);
addUpdateListener('instruction_diameter_slider', 'instruction_diameter_slider_value');

syncSliderAndInput('pegs_slider', 'pegs_slider_value', 150, 1200);
addUpdateListener('pegs_slider', 'pegs_slider_value');

syncSliderAndInput('segments_slider', 'segments_slider_value', 0, 10000);
addUpdateListener('segments_slider', 'segments_slider_value');

syncSliderAndInput('weight_slider', 'weight_slider_value', 1, 100);
addUpdateListener('weight_slider', 'weight_slider_value');

syncSliderAndInput('minimum_peg_distance_slider', 'minimum_peg_distance_slider_value', 1, 100);
addUpdateListener('minimum_peg_distance_slider', 'minimum_peg_distance_slider_value');

syncSliderAndInput('scale_slider', 'scale_slider_value', 1, 100);
addUpdateListener('scale_slider', 'scale_slider_value');

syncSliderAndInput('opacity_slider', 'opacity_slider_value', 1, 5);
addUpdateListener('opacity_slider', 'opacity_slider_value');

syncSliderAndInput('thickness_slider', 'thickness_slider_value', 25, 100);
addUpdateListener('thickness_slider', 'thickness_slider_value');

document.getElementById('input-file-button').addEventListener('click', function () {
  document.getElementById('image_input').click();
});

document.getElementById('image_input').addEventListener('change', function (event) {
  source_image_element.src = URL.createObjectURL(event.target.files[0]);
});

source_image_element.onload = function() {
  start_generator();
}