function syncSliderAndInput(sliderId, inputId, min, max) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);

  slider.oninput = function() {
      input.value = this.value;
  };

  input.addEventListener('input', function() {
      const value = Math.min(max, Math.max(min, this.value));
      slider.value = value;
  });
}