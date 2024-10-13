const navLinks = document.querySelectorAll('#navbar li a');
const mainDiv = document.getElementById('main'); // Get the main div

navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior

        // Remove the 'active' class from all <li> elements
        navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
        
        // Add the 'active' class to the clicked <li> element
        this.parentElement.classList.add('active');
        
        // Get the text of the clicked link (e.g., "Image Cropper") and format it
        const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, '_') + '.html';

        console.log(`Loading content from: ${pageName}`);

        // Fetch the corresponding HTML file and replace the contents of <div id="main">
        fetch(`${pageName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${pageName}`);
                }
                return response.text();
            })
            .then(data => {
                mainDiv.innerHTML = data; // Replace the content of <div id="main">

                // After injecting the HTML, find and execute script tags
                const scripts = mainDiv.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        // If it's an external script, load the src
                        newScript.src = script.src;
                    } else {
                        // If it's an inline script, set the content
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript); // Append and execute the script
                    document.body.removeChild(newScript); // Optionally remove the script after execution
                });
            })
            .catch(error => {
                console.error(error);
                mainDiv.innerHTML = `<p>Error loading content. Please try again later.</p>`;
            });
    });
});

document.getElementById('main').addEventListener('click', function(event) {
    if (event.target && event.target.id === 'get_started') {
        event.preventDefault();
        console.log("Let's get started button clicked!");

        // Simulate a click on the "Image Cropper" navigation link
        const imageCropperLink = document.getElementById('image_cropper');
        imageCropperLink.click(); // Trigger a click event
    }
});
