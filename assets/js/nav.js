const navLinks = document.querySelectorAll('#navbar li a');
const pages = document.querySelectorAll('.page-content'); // Get all the page content divs

navLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        // Remove 'active' class from all navigation links
        navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
        this.parentElement.classList.add('active'); // Set the clicked link as active

        // Get the page ID based on the link text (replace spaces with underscores)
        const pageId = this.textContent.trim().toLowerCase().replace(/\s+/g, '_') + '_page';

        // Hide all pages
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show the selected page
        const selectedPage = document.getElementById(pageId);
        if (selectedPage) {
            selectedPage.style.display = 'block';
        } else {
            console.error(`Page with ID ${pageId} not found`);
        }

        if (pageId == 'image_cropper_page'){
            initializeCropper();
        }
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

