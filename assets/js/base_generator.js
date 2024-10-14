function drawDots() {
  const canvas = document.getElementById('base_canvas');
  const ctx = canvas.getContext('2d');
  const shape = document.querySelector('#base_shape_selection .primary').textContent.trim();
  const unit = document.querySelector('#base_unit_selection .primary').textContent.trim();
  const numDots = parseInt(document.getElementById('pegs_slider_value').value);
  let diameter = parseFloat(document.getElementById('diameter_slider_value').value);

  // Convert the diameter to centimeters if necessary
  diameter = convertToUnits(diameter, unit, 'Centimeters');

  // Set up the DPI for converting real-world sizes to canvas pixels
  const dpi = 96; // Standard DPI for screens
  const diameterInPixels = diameter * dpi / 2.54; // Convert diameter from centimeters to pixels

  // Set canvas size based on the calculated dimensions
  canvas.width = diameterInPixels + 100; // Add padding for labels
  canvas.height = diameterInPixels + 100; // Add padding for labels

  // Calculate the center and radius of the shape
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = (diameterInPixels / 2) - 30; // Leave space for labels around the shape

  // Clear the canvas before drawing
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Adjust the font size based on the number of dots and the diameter
  const fontSize = Math.min(12, diameterInPixels / 50); // Scale down for smaller diameters
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw dots around a circle
  if (shape === 'Circle') {
    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * 2 * Math.PI; // Angle in radians
      const x = centerX + (radius - 10) * Math.cos(angle); // Dot position
      const y = centerY + (radius - 10) * Math.sin(angle);

      // Draw the dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Position the labels further out from the circle
      const labelX = centerX + (radius + 25) * Math.cos(angle); // Increase the distance from the edge
      const labelY = centerY + (radius + 25) * Math.sin(angle);
      ctx.fillText(i, labelX, labelY);
    }
  }

  // Draw dots around a square
  if (shape === 'Square') {
    const sideLength = 2 * radius; // Length of each side of the square
    const perimeter = 4 * sideLength; // Total perimeter of the square
    const step = perimeter / numDots; // Distance between each dot along the perimeter

    let counter = 0;
    for (let i = 0; i < numDots; i++) {
      let distance = i * step; // Total distance traveled along the perimeter
      let x, y, labelX, labelY;

      if (distance < sideLength) {
        // Top side
        x = centerX - radius + distance;
        y = centerY - radius;
        labelX = x;
        labelY = y - 20; // Position the label above the dot, with more space
      } else if (distance < 2 * sideLength) {
        // Right side
        distance -= sideLength;
        x = centerX + radius;
        y = centerY - radius + distance;
        labelX = x + 20; // Label to the right of the dot, with more space
        labelY = y;
      } else if (distance < 3 * sideLength) {
        // Bottom side
        distance -= 2 * sideLength;
        x = centerX + radius - distance;
        y = centerY + radius;
        labelX = x;
        labelY = y + 20; // Label below the dot, with more space
      } else {
        // Left side
        distance -= 3 * sideLength;
        x = centerX - radius;
        y = centerY + radius - distance;
        labelX = x - 20; // Label to the left of the dot, with more space
        labelY = y;
      }

      // Draw the dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Label the dot with more space outside the square
      ctx.fillText(counter++, labelX, labelY);
    }
  }
}

function convertToUnits(value, fromUnit, toUnit) {
  // Handle conversion between Inches and Centimeters
  if (fromUnit === 'Inches' && toUnit === 'Centimeters') {
    return parseInt(Math.round(value * 2.54), 10); // Convert Inches to Centimeters and round to nearest whole number
  }
  if (fromUnit === 'Centimeters' && toUnit === 'Inches') {
    return parseInt(Math.round(value / 2.54), 10); // Convert Centimeters to Inches and round to nearest whole number
  }
  return parseInt(Math.round(value), 10); // Round to nearest whole number if no conversion is needed and cast to integer
}


// Listen for unit change and adjust the diameter slider and input accordingly
function setupUnitChangeListener() {
  const diameterSlider = document.getElementById('diameter_slider');
  const diameterInput = document.getElementById('diameter_slider_value');

  document.querySelectorAll('#base_unit_selection a').forEach(button => {
    button.addEventListener('click', function () {
      const currentUnitButton = document.querySelector('#base_unit_selection .primary'); // Current active unit button
      const newUnit = this.textContent.trim()
      const currentUnit = newUnit === 'Inches' ? 'Centimeters' : 'Inches';
      

      // Get the current diameter value
      let diameterValue = parseFloat(diameterInput.value);

      // Convert the current diameter value based on the new unit
      diameterValue = convertToUnits(diameterValue, currentUnit, newUnit);

      // Update the slider and input field
      diameterSlider.value = diameterValue;
      diameterInput.value = diameterValue;

      // Remove 'primary' class from the old unit and add to the new one
      currentUnitButton.classList.remove('primary');
      this.classList.add('primary');
    });
  });
}

// Attach event listeners to update canvas when parameters change
function initCanvas() {
  // Call drawDots when any parameter is updated
  document.getElementById('pegs_slider').addEventListener('input', drawDots);
  document.getElementById('diameter_slider').addEventListener('input', drawDots);
  document.querySelectorAll('#base_shape_selection a').forEach(btn => {
    btn.addEventListener('click', drawDots);
  });
  document.querySelectorAll('#base_unit_selection a').forEach(btn => {
    btn.addEventListener('click', drawDots);
  });

  // Initial drawing
  drawDots();
}
