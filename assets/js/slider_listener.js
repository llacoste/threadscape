function syncSliderAndInput(sliderId, inputId, min, max) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);

  // Set initial min and max values
  slider.min = min;
  slider.max = max;

  slider.oninput = function() {
      input.value = this.value;
  };

  input.addEventListener('input', function() {
      const value = Math.min(max, Math.max(min, this.value));
      slider.value = value;
  });
}
