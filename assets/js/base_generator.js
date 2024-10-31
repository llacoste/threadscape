function drawDots() {
  const canvas = document.getElementById('base_canvas');
  const ctx = canvas.getContext('2d');
  const shape = document.querySelector('#base_shape_selection .primary').textContent.trim();
  const unit = document.querySelector('#base_unit_selection .primary').textContent.trim();
  const numDots = parseInt(document.getElementById('base_pegs_slider_value').value);
  let diameter = parseFloat(document.getElementById('base_diameter_slider_value').value);

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

  const text_padding = 20;
  const dot_radius = 1;
  const fontSize = 7;//Math.min(10, diameterInPixels / 50); // Scale down for smaller diameters
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
      ctx.arc(x, y, dot_radius, 0, 2 * Math.PI);
      ctx.fill();

      // Position the labels further out from the circle
      const labelX = centerX + (radius + text_padding) * Math.cos(angle); // Increase the distance from the edge
      const labelY = centerY + (radius + text_padding) * Math.sin(angle);
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
        labelY = y - text_padding; // Position the label above the dot, with more space
      } else if (distance < 2 * sideLength) {
        // Right side
        distance -= sideLength;
        x = centerX + radius;
        y = centerY - radius + distance;
        labelX = x + text_padding; // Label to the right of the dot, with more space
        labelY = y;
      } else if (distance < 3 * sideLength) {
        // Bottom side
        distance -= 2 * sideLength;
        x = centerX + radius - distance;
        y = centerY + radius;
        labelX = x;
        labelY = y + text_padding; // Label below the dot, with more space
      } else {
        // Left side
        distance -= 3 * sideLength;
        x = centerX - radius;
        y = centerY + radius - distance;
        labelX = x - text_padding; // Label to the left of the dot, with more space
        labelY = y;
      }

      // Draw the dot
      ctx.beginPath();
      ctx.arc(x, y, dot_radius, 0, 2 * Math.PI);
      ctx.fill();

      // Label the dot with more space outside the square
      ctx.fillText(counter++, labelX, labelY);
    }
  }
}

function convertToUnits(value, fromUnit, toUnit) {
  if (fromUnit === 'Inches' && toUnit === 'Centimeters') {
    return parseInt(Math.round(value * 2.54), 10); // Convert Inches to Centimeters and round to nearest whole number
  }
  if (fromUnit === 'Centimeters' && toUnit === 'Inches') {
    return parseInt(Math.round(value / 2.54), 10); // Convert Centimeters to Inches and round to nearest whole number
  }
  return parseInt(Math.round(value), 10);
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
      let min, max;

      if (newUnit === 'Inches') {
        min = 12;
        max = 48;
      } else if (newUnit === 'Centimeters') {
        min = 30; // 12 inches to cm
        max = 122; // 48 inches to cm
      }

      syncSliderAndInput('diameter_slider', 'diameter_slider_value', min, max);

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

function generatePDF() {
  const canvas = document.getElementById('base_canvas');

  // Check if the canvas exists and has content
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }

  // Retrieve the diameter value from the slider
  const diameterValue = parseFloat(document.getElementById('base_diameter_slider_value').value);

  // Retrieve the selected unit (Inches or Centimeters)
  const selectedUnitElement = document.querySelector('#base_unit_selection .primary');
  const selectedUnit = selectedUnitElement.textContent.trim(); // Get the selected unit text

  // Convert diameter to inches if the unit is in centimeters
  let diameterInInches = diameterValue;
  if (selectedUnit === 'Centimeters') {
    diameterInInches = diameterValue / 2.54; // Convert cm to inches
  }

  // Define the canvas dimensions based on the selected diameter in inches
  const dpi = 96; // assuming 96 DPI for the canvas
  const canvasWidthInPixels = diameterInInches * dpi;
  const canvasHeightInPixels = diameterInInches * dpi;

  // Scale canvas content to fit standard letter pages (8.5x11 inches)
  const pageWidthInInches = 8.5;
  const pageHeightInInches = 11;
  const pageWidthInPixels = pageWidthInInches * dpi;
  const pageHeightInPixels = pageHeightInInches * dpi;

  // Calculate how many pages are needed
  const pagesAcross = Math.ceil(canvasWidthInPixels / pageWidthInPixels);
  const pagesDown = Math.ceil(canvasHeightInPixels / pageHeightInPixels);

  // Create a new jsPDF instance for a portrait-oriented letter page
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in', // Use inches for easier scaling
    format: 'letter' // 8.5 x 11 inches (letter size)
  });

  // Loop through each page section and add to the PDF
  for (let row = 0; row < pagesDown; row++) {
    for (let col = 0; col < pagesAcross; col++) {
      const xOffset = col * pageWidthInPixels;
      const yOffset = row * pageHeightInPixels;

      // Create a temporary canvas to capture part of the base_canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = pageWidthInPixels;
      tempCanvas.height = pageHeightInPixels;
      const tempContext = tempCanvas.getContext('2d');

      // Copy the section of the main canvas into the temp canvas
      tempContext.drawImage(
        canvas,
        xOffset, yOffset, // Source x and y (starting point)
        pageWidthInPixels, pageHeightInPixels, // Source width and height (size of the page)
        0, 0, // Destination x and y (in the temp canvas)
        pageWidthInPixels, pageHeightInPixels // Destination width and height (size of the page)
      );

      // Convert the temp canvas to a data URL (image)
      const canvasImage = tempCanvas.toDataURL('image/png');

      // Add the image to the PDF
      if (row !== 0 || col !== 0) {
        pdf.addPage(); // Add a new page for every tile except the first
      }
      pdf.addImage(canvasImage, 'PNG', 0, 0, pageWidthInInches, pageHeightInInches);
    }
  }

  // Save the generated PDF
  pdf.save('string_art_base.pdf');
}

// Attach event listeners to update canvas when parameters change
function initBaseCanvas() {
  // Call drawDots when any parameter is updated
  document.getElementById('base_pegs_slider').addEventListener('input', drawDots);
  document.getElementById('base_diameter_slider').addEventListener('input', drawDots);
  document.querySelectorAll('#base_shape_selection a').forEach(btn => {
    btn.addEventListener('click', drawDots);
  });
  document.querySelectorAll('#base_unit_selection a').forEach(btn => {
    btn.addEventListener('click', drawDots);
  });

  // Initial drawing
  drawDots();
}

syncSliderAndInput('base_diameter_slider', 'base_diameter_slider_value', 12, 48);
syncSliderAndInput('base_pegs_slider', 'base_pegs_slider_value', 150, 720);

setupButtonGroupListeners('base_shape_selection');
setupButtonGroupListeners('base_unit_selection');
setupUnitChangeListener();

initBaseCanvas();