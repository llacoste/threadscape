syncSliderAndInput('pegs_slider', 'pegs_slider_value', 150, 1200);
syncSliderAndInput('segments_slider', 'segments_slider_value', 0, 10000);
syncSliderAndInput('opacity_slider', 'opacity_slider_value', 1, 5);
syncSliderAndInput('thickness_slider', 'thickness_slider_value', 25, 100);

setupButtonGroupListeners('instruction_shape_selection');
setupButtonGroupListeners('instruction_quality_selection');
setupButtonGroupListeners('instruction_mode_selection');

instruction_canvas = document.getElementById('instruction_canvas');
instruction_ctx = instruction_canvas.getContext('2d');

document.getElementById('input-file-button').addEventListener('click', function () {
  document.getElementById('input-image').click();
});

// Step 1: Load the image from the input
document.getElementById('input-image').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function () {
      // Draw the uploaded image onto the canvas
      instruction_canvas.width = img.width;
      instruction_canvas.height = img.height;
      instruction_ctx.drawImage(img, 0, 0, img.width, img.height);

      // Step 2: Apply Radon transform and generate string art
      const radonData = applyRadonTransform(instruction_ctx, img.width, img.height);

      // Step 3: Generate and draw string art based on the Radon transform
      generateStringArt(radonData);
    };
  };

  reader.readAsDataURL(file);
});

// Step 2: Radon Transform function (can use an external library or a custom one)
function applyRadonTransform(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Your Radon Transform logic here, processing the pixel data
  // Example: process each pixel row by row, sum the values along lines to simulate a Radon transform.

  const radonData = []; // This will store the Radon-transformed data
  // Fill radonData with your logic
  return radonData;
}

// Step 3: Generate String Art
function generateStringArt(radonData) {
  const numPegs = parseInt(document.getElementById('pegs_slider_value').value);
  const numSegments = parseInt(document.getElementById('segments_slider_value').value);
  const thickness = parseInt(document.getElementById('thickness_slider_value').value);
  const opacity = parseInt(document.getElementById('opacity_slider_value').value) / 5;

  // Peg positions around a circle (assuming circular shape)
  const pegPositions = getPegPositions(numPegs, instruction_canvas.width, instruction_canvas.height);

  // Use Radon data to generate connections between pegs (simplified)
  instruction_ctx.clearRect(0, 0, instruction_canvas.width, instruction_canvas.height); // Clear canvas

  instruction_ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`; // Set stroke opacity
  instruction_ctx.lineWidth = thickness; // Set line thickness

  for (let i = 0; i < numSegments; i++) {
    const fromPeg = Math.floor(Math.random() * numPegs);
    const toPeg = Math.floor(Math.random() * numPegs);

    instruction_ctx.beginPath();
    instruction_ctx.moveTo(pegPositions[fromPeg].x, pegPositions[fromPeg].y);
    instruction_ctx.lineTo(pegPositions[toPeg].x, pegPositions[toPeg].y);
    instruction_ctx.stroke();

    // Step 4: Record the instruction
    generateInstructions(fromPeg, toPeg);
  }
}

// Helper function to get peg positions around a circle
function getPegPositions(numPegs, width, height) {
  const pegPositions = [];
  const radius = Math.min(width, height) / 2 - 20; // Leave margin
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = 0; i < numPegs; i++) {
    const angle = (i / numPegs) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    pegPositions.push({ x, y });
  }

  return pegPositions;
}

// Step 4: Generate Instructions
function generateInstructions(fromPeg, toPeg) {
  const instructionsDiv = document.getElementById('instructions');
  const instructionText = `String from peg ${fromPeg + 1} to peg ${toPeg + 1}<br>`;
  instructionsDiv.innerHTML += instructionText; // Add to the instructions output
}