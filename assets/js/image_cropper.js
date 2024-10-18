// Initialize Cropper.js
cropper = null;
image_to_crop = document.getElementById('image_to_crop');

// Function to initialize or reinitialize Cropper.js
function initializeCropper() {
  if (cropper) {
    cropper.destroy(); // Destroy the previous cropper instance if it exists
  }
  cropper = new Cropper(image_to_crop, {
    aspectRatio: 1 / 1,
    viewMode: 1,
    zoomable: true,
    scalable: true,
    rotatable: true,
    movable: true,
  });
}

// Handle file upload and change the image source
document.getElementById('upload-image').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.src = e.target.result; // Set the new image source
      initializeCropper(); // Reinitialize Cropper.js with the new image
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }
});

// Custom button click to trigger the hidden file input
document.getElementById('custom-file-button').addEventListener('click', function () {
  document.getElementById('upload-image').click();
});

// Rotate Left
document.getElementById('rotate-left').addEventListener('click', () => {
  cropper.rotate(-45); // Rotate image 45 degrees counterclockwise
});

// Rotate Right
document.getElementById('rotate-right').addEventListener('click', () => {
  cropper.rotate(45); // Rotate image 45 degrees clockwise
});

// Zoom In
document.getElementById('zoom-in').addEventListener('click', () => {
  cropper.zoom(0.1); // Zoom in by 10%
});

// Zoom Out
document.getElementById('zoom-out').addEventListener('click', () => {
  cropper.zoom(-0.1); // Zoom out by 10%
});

// Crop
document.getElementById('crop').addEventListener('click', () => {
  const canvas = cropper.getCroppedCanvas();
  const croppedImage = document.getElementById('cropped-image');
  croppedImage.src = canvas.toDataURL('image/png'); // Display the cropped image
});

document.getElementById('crop').addEventListener('click', function () {
  const croppedImage = document.getElementById('cropped-image');

  // Assuming you have the canvas of the cropped image
  const canvas = cropper.getCroppedCanvas(); // Your Cropper.js instance

  // Set the src of the cropped image to the canvas content (base64 data)
  croppedImage.src = canvas.toDataURL('image/png');

  // Update the download button's href with the image data URL
  const downloadButton = document.getElementById('download-button');
  downloadButton.href = croppedImage.src; // Set the image data URL as the href
});