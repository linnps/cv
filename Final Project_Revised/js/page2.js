document.addEventListener('DOMContentLoaded', function () {
    const dataURL = 'https://raw.githubusercontent.com/linnps/files/main/Prices_Housing.csv';

    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Define selectedCities outside the function to make it accessible within the page2.js file
    let selectedCities = [];

    function createLineChart2(data, selectedCities, startDate, endDate) {
        // Filter the data for the selected cities and date range
        const cityData = data
            .map(d => ({
                PeriodBegin: new Date(d.PeriodBegin),
                Boston: +d.Boston || 0,
                'San Francisco': +d['San Francisco'] || 0,
                'San Diego': +d['San Diego'] || 0,
                Chicago: +d.Chicago || 0,
                'San Jose': +d['San Jose'] || 0,
                'Washington DC': +d['Washington DC'] || 0,
                'Los Angeles': +d['Los Angeles'] || 0,
                Seattle: +d.Seattle || 0,
            }))
            .filter(d => d.PeriodBegin >= startDate && d.PeriodBegin <= endDate);

        // Remove any existing SVG elements
        d3.select('#histogram-slide2').selectAll('*').remove();

        // Create the SVG element
        const svg = d3.select('#histogram-slide2')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .style("display", "block")
            .style('margin', "auto");

        // Add tooltip elements
        const tooltip = d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        // Create scales for x and y axes
        const xScale = d3.scaleTime()
            .domain(d3.extent(cityData, d => d.PeriodBegin))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(cityData, d => d3.max(selectedCities, city => d[city])) * 1.1])
            .range([height, 0]);

        // Create x and y axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Add x and y axes to the SVG
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .append('text')
            .attr('x', width / 2)
            .attr('y', 40)
            .attr('fill', '#000')
            .style('text-anchor', 'middle')
            .text('Date');

        svg.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .attr('fill', '#000')
            .style('text-anchor', 'middle')
            .text('Housing Price');

        // Create a line generator for each city
        const line = d3.line()
            .x(d => xScale(d.PeriodBegin))
            .y(d => yScale(d.value))
            .defined(d => !isNaN(d.value));

        // Draw the line chart for each selected city
        selectedCities.forEach(city => {
            const cityLine = cityData.map(d => ({ PeriodBegin: d.PeriodBegin, value: d[city] }));
            svg.append('path')
                .datum(cityLine)
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', colorScale(city))
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add annotations to the line chart
            const annotations = [{
                type: d3.annotationCalloutCircle,
                note: {
                    label: city,
                    wrap: 100,
                },
                subject: {
                    radius: 5,
                },
                x: xScale(cityData[cityData.length - 1].PeriodBegin),
                y: yScale(cityData[cityData.length - 1][city]),
                dx: 50,
                dy: -20,
                color: colorScale(city),
            }];

            const makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations);

            svg.append('g')
                .attr('class', 'annotation-group')
                .call(makeAnnotations);

            // Add an annotation for the trend line
            const annotation2 = d3.annotation()
                .type(d3.annotationLabel)
                .annotations([
                    {
                        note: {
                            label: 'San Francisco Bay Area has the most significant growth', // The text you want to display as the explanation
                            
                        },
                        x: width - 400, // X-coordinate of the arrow tail
                        y: 120, // Y-coordinate of the arrow tail (using the first data point's price)
                        dy: -20, // Adjustment for the vertical position of the annotation
                        dx: -50, // Adjustment for the horizontal position of the annotation
                        connector: {
                            end: 'arrow', // Display an arrow at the end of the connector line
                        },
                        color: 'red',
                    },
                ]);

            // Append the annotation to the chart
            svg.append('g')
                .attr('class', 'annotation-group')
                .call(annotation2);
        });

        
        
        // Add circles for data points
        const circleGroup = svg.selectAll('.circle-group')
            .data(selectedCities)
            .enter()
            .append('g')
            .attr('class', 'circle-group');

        circleGroup.selectAll('circle')
            .data(d => cityData.map(c => ({ city: d, data: c })))
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.data.PeriodBegin))
            .attr('cy', d => yScale(d.data[d.city]))
            .attr('r', 5)
            .attr('fill', d => colorScale(d.city))
            .on('mouseover', function (event, d) {
                const tooltipHTML = `<strong>${d.city}</strong><br>Date: ${d.data.PeriodBegin.toDateString()}<br>Housing Price: ${d.data[d.city]}`;

                tooltip.html(tooltipHTML)
                    .style('left', (event.clientX + 10) + 'px')
                    .style('top', (event.clientY - 28) + 'px')
                    .style('opacity', 0.9);
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0);
            });

        // Add city names as labels
        circleGroup.append('text')
            .attr('x', width + 5)
            .attr('y', d => yScale(cityData[0][d]))
            .attr('fill', d => colorScale(d))
            .attr('text-anchor', 'start')
            .text(d => d);
    }

    // Fetch the data and create the initial line chart
    d3.csv(dataURL)
        .then(data => {
            const cities = ['Boston', 'San Francisco', 'San Diego', 'Chicago', 'San Jose', 'Washington DC', 'Los Angeles', 'Seattle'];
            const cityCheckboxes = document.getElementById('cityCheckboxes');

            // Add checkboxes for each city
            cities.forEach(city => {
                const checkItemDiv = document.createElement('div');
                checkItemDiv.className = 'checkItem';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'city';
                checkbox.value = city;
                checkbox.checked = false;
                checkbox.addEventListener('change', updateLineChart);
                checkItemDiv.appendChild(checkbox);

                const label = document.createElement('label');
                label.textContent = city;
                checkItemDiv.appendChild(label);

                cityCheckboxes.appendChild(checkItemDiv);
            });

            // Add event listener for date range input changes
            const startDateInput = document.getElementById('startDate2');
            const endDateInput = document.getElementById('endDate2');
            startDateInput.addEventListener('change', updateLineChart);
            endDateInput.addEventListener('change', updateLineChart);

            function updateLineChart() {
                // Get selected cities and date range from checkboxes and input fields
                selectedCities = Array.from(cityCheckboxes.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);

                // Call createLineChart2 with the updated data
                createLineChart2(data, selectedCities, startDate, endDate);
            }

            // Set initial data for the line chart
            const initialStartDate = new Date(startDateInput.value);
            const initialEndDate = new Date(endDateInput.value);

            // Create the initial line chart
            createLineChart2(data, selectedCities, initialStartDate, initialEndDate);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});