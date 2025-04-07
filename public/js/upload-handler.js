// Client-side JavaScript for handling image uploads
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('image-upload-form');
  const imageInput = document.getElementById('image');
  const dropZone = document.getElementById('drop-zone');
  const imagePreview = document.getElementById('image-preview');
  const imageGallery = document.getElementById('image-gallery');

  // Handle file selection
  if (imageInput) {
    imageInput.addEventListener('change', function() {
      previewImage(this.files[0]);
    });
  }

  // Handle drag and drop
  if (dropZone) {
    dropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropZone.classList.add('highlight');
    });

    dropZone.addEventListener('dragleave', function() {
      dropZone.classList.remove('highlight');
    });

    dropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropZone.classList.remove('highlight');
      
      if (e.dataTransfer.files.length) {
        imageInput.files = e.dataTransfer.files;
        previewImage(e.dataTransfer.files[0]);
      }
    });
  }

  // Preview the selected image
  function previewImage(file) {
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      imagePreview.innerHTML = `
        <div class="card mt-3">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <img src="${e.target.result}" class="img-fluid rounded" alt="Image preview">
              </div>
              <div class="col-md-8">
                <h5 class="card-title">${file.name}</h5>
                <p class="card-text">Size: ${formatFileSize(file.size)}</p>
                <p class="card-text">Type: ${file.type}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    };
    
    reader.readAsDataURL(file);
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Load gallery images
  function loadGallery() {
    fetch('/api/uploads/list')
      .then(response => response.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          let html = '';
          
          data.images.forEach(image => {
            html += `
              <div class="col-md-3 mb-4">
                <div class="card h-100">
                  <img src="${image.path}" class="card-img-top" alt="${image.name}" style="height: 200px; object-fit: cover;">
                  <div class="card-body">
                    <h5 class="card-title text-truncate">${image.name}</h5>
                    <div class="d-flex justify-content-between">
                      <button class="btn btn-sm btn-outline-danger delete-image" data-image-path="${image.path}">
                        <i class="bi bi-trash"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary copy-path" data-image-path="${image.path}">
                        <i class="bi bi-clipboard"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          });
          
          imageGallery.innerHTML = html;
          
          // Add event listeners to delete buttons
          document.querySelectorAll('.delete-image').forEach(button => {
            button.addEventListener('click', function() {
              const imagePath = this.getAttribute('data-image-path');
              if (confirm('Are you sure you want to delete this image?')) {
                deleteImage(imagePath);
              }
            });
          });
          
          // Add event listeners to copy buttons
          document.querySelectorAll('.copy-path').forEach(button => {
            button.addEventListener('click', function() {
              const imagePath = this.getAttribute('data-image-path');
              navigator.clipboard.writeText(imagePath).then(() => {
                alert('Image path copied to clipboard!');
              });
            });
          });
        } else {
          imageGallery.innerHTML = '<div class="col-12 text-center"><p>No images found in gallery. Upload some images first.</p></div>';
        }
      })
      .catch(error => {
        console.error('Error loading gallery images:', error);
        imageGallery.innerHTML = '<div class="col-12 text-center"><p>Error loading gallery images. Please try again.</p></div>';
      });
  }

  // Delete image
  function deleteImage(imagePath) {
    fetch('/api/uploads/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: imagePath })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadGallery(); // Reload gallery
        } else {
          alert('Error deleting image: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error deleting image:', error);
        alert('Error deleting image. Please try again.');
      });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      if (!imageInput.files.length) {
        e.preventDefault();
        alert('Please select an image to upload');
      }
    });
  }

  // Load gallery on page load
  if (imageGallery) {
    loadGallery();
  }
});
