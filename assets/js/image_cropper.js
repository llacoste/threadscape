cropper = null;
image_to_crop = document.getElementById('image_to_crop');

function initializeCropper() {
  if (cropper) {
    cropper.destroy();
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

document.getElementById('upload-image').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image_to_crop.src = e.target.result;
      initializeCropper();
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('custom-file-button').addEventListener('click', function () {
  document.getElementById('upload-image').click();
});

document.getElementById('rotate-left').addEventListener('click', () => {
  cropper.rotate(-45);
});

document.getElementById('rotate-right').addEventListener('click', () => {
  cropper.rotate(45);
});

document.getElementById('zoom-in').addEventListener('click', () => {
  cropper.zoom(0.1);
});

document.getElementById('zoom-out').addEventListener('click', () => {
  cropper.zoom(-0.1);
});

document.getElementById('crop').addEventListener('click', function () {
  const canvas = cropper.getCroppedCanvas();
  const imageURL = canvas.toDataURL('image/png');
  const tempLink = document.createElement('a');
  tempLink.href = imageURL;
  tempLink.download = 'cropped-image.png';
  tempLink.click();
});