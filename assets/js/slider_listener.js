function syncSliderAndInput(sliderId, inputId, min, max) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);

  // Update the text input when the slider is moved
  slider.oninput = function() {
      input.value = this.value; // Set text input value to match slider value
  };

  // Update the slider when the text input is changed
  input.addEventListener('input', function() {
      // Ensure the value is a number and within the slider's range
      const value = Math.min(max, Math.max(min, this.value));
      slider.value = value; // Set slider to the updated value
  });
}