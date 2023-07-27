// JavaScript for slideshow functionality
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

const width = 600; // Define the width here
const height = 400; // Define the height here
let data; // Variable to store the fetched data

function showSlide(index) {
    slides.forEach((slide) => {
        slide.style.display = 'none';
    });

    slides[index].style.display = 'block';

    // Run page1.js for slide 1
    if (index === 0) {
        const slide1 = document.getElementById('slide1');
        const svgContainer = slide1.querySelector('svg#histogram');

        // Check if the histogram is already generated
        if (!svgContainer.childElementCount) {
            // Generate the histogram
            const svg = d3.select(svgContainer)
                .attr('width', width)
                .attr('height', height);

            // Load the data and generate the histogram here...
            // Your code from page1.js goes here...
        }
    }
    if (index === 1) {
        const slide2 = document.getElementById('slide2');
        const svgContainer = slide2.querySelector('svg#histogram-slide2');

        // Check if the line chart is already generated
        if (!svgContainer.childElementCount) {
            // Generate the line chart
            const svg = d3.select(svgContainer)
                .attr('width', width)
                .attr('height', height);

            // Call the createLineChart2 function with the fetched data and initial date range
            createLineChart2(data, initialStartDate, initialEndDate);
        }
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Display the first slide
showSlide(currentSlide);

// Attach click event listeners to navigation buttons
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

