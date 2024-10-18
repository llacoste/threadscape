setupButtonGroupListeners('instruction_shape_selection');
setupButtonGroupListeners('instruction_quality_selection');
setupButtonGroupListeners('instruction_mode_selection');

syncSliderAndInput('pegs_slider', 'pegs_slider_value', 150, 1200);
syncSliderAndInput('segments_slider', 'segments_slider_value', 0, 10000);
syncSliderAndInput('opacity_slider', 'opacity_slider_value', 1, 5);
syncSliderAndInput('thickness_slider', 'thickness_slider_value', 25, 100);

const instruction_canvas = document.getElementById('instruction_canvas');
const instruction_ctx = instruction_canvas.getContext('2d');

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