const navLinks = document.querySelectorAll('#navbar li a');
const mainDiv = document.getElementById('main'); // Get the main div

navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
        this.parentElement.classList.add('active');
        const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, '_') + '.html';
        fetch(`${pageName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${pageName}`);
                }
                return response.text();
            })
            .then(data => {
                mainDiv.innerHTML = data;
                const scripts = mainDiv.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                });
            })
            .catch(error => {
                console.error(error);
                mainDiv.innerHTML = `<p>Error loading content. Please try again later.</p>`;
            });
    });
});

document.getElementById('main').addEventListener('click', function (event) {
    if (event.target && event.target.id === 'get_started') {
        event.preventDefault(); // Prevent default behavior if necessary

        // Scroll the nav element into view before simulating the navigation click
        const navElement = document.getElementById('nav');
        navElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add a slight delay to allow scrolling before simulating the click
        setTimeout(function() {
            const imageCropperLink = document.getElementById('image_cropper');
            imageCropperLink.click();
        }, 250); // Adjust the delay as necessary
    }
});

