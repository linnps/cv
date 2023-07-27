document.addEventListener('DOMContentLoaded', function () {
    const dataURL = 'https://raw.githubusercontent.com/linnps/files/main/Sales_Housing_Home%20Sold.csv';

    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    function createHistogram(data) {
        // Aggregate the "Homes Sold" values for each location
        const aggregatedData = d3.rollup(
            data,
            v => d3.sum(v, d => d['Homes Sold']),
            d => d.Region
        );

        const aggregatedDataArray = Array.from(aggregatedData, ([key, value]) => ({ Region: key, 'Homes Sold': value }));

        // Sort the data by total "Homes Sold" in descending order
        aggregatedDataArray.sort((a, b) => d3.descending(a['Homes Sold'], b['Homes Sold']));

        // Remove any existing SVG elements
        d3.select('#histogram-page3').selectAll('*').remove();

        // Create the SVG element
        const svg = d3.select('#histogram-page3')
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
        const xScale = d3.scaleBand()
            .domain(aggregatedDataArray.map(d => d.Region))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(aggregatedDataArray, d => d['Homes Sold'])])
            .range([height, 0]);

        // Create x and y axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Add x and y axes to the SVG
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45) translate(-10,0)');

        svg.append('text') // Add x-axis label "Location"
            .attr('x', width)
            .attr('y', height + margin.bottom - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px') // Adjust the font size here
            .text('Location');

        svg.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -height / 2)
            .attr('fill', '#000')
            .style('text-anchor', 'middle')
            .text('Homes Sold');

        // Create the histogram bars
        svg.selectAll('.bar')
            .data(aggregatedDataArray)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.Region))
            .attr('y', height) // Start the bars at the bottom of the chart
            .attr('width', xScale.bandwidth())
            .attr('height', 0) // Set the initial height to 0
            .attr('fill', (d, i) => colorScale(i))
            .on('mouseover', function (event, d) {
                const tooltipHTML = `<strong>${d.Region}</strong><br>Homes Sold: ${d['Homes Sold']}`;

                tooltip.html(tooltipHTML)
                    .style('left', (event.clientX + 10) + 'px')
                    .style('top', (event.clientY - 28) + 'px')
                    .style('opacity', 0.9);
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0);
            })
            .transition() // Add transition to make bars appear gradually
            .duration(800) // Set the duration of the transition (in milliseconds)
            .delay((d, i) => i * 100) // Delay each bar's appearance based on its index
            .attr('y', d => yScale(d['Homes Sold']))
            .attr('height', d => height - yScale(d['Homes Sold']));

        // Add an annotation for the trend line
        const annotation = d3.annotation()
            .type(d3.annotationLabel)
            .annotations([
                {
                    note: {
                        label: 'Chicago has the most significant homes sold', // The text you want to display as the explanation

                    },
                    x: 20, // X-coordinate of the arrow tail
                    y: 5, // Y-coordinate of the arrow tail (using the first data point's price)
                    dy: -20, // Adjustment for the vertical position of the annotation
                    dx: -10, // Adjustment for the horizontal position of the annotation
                    connector: {
                        end: 'arrow', // Display an arrow at the end of the connector line
                    },
                    color: 'red',
                },
            ]);

        // Append the annotation to the chart
        svg.append('g')
            .attr('class', 'annotation-group')
            .call(annotation);

        // Add an annotation for the trend line
        const annotation2 = d3.annotation()
            .type(d3.annotationLabel)
            .annotations([
                {
                    note: {
                        label: 'San Francisco has relatively low homes sold', // The text you want to display as the explanation

                    },
                    x: 280, // X-coordinate of the arrow tail
                    y: 250, // Y-coordinate of the arrow tail (using the first data point's price)
                    dy: -200, // Adjustment for the vertical position of the annotation
                    dx: -10, // Adjustment for the horizontal position of the annotation
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
        
    }

    // Fetch the data and create the histogram
    d3.csv(dataURL).then(data => {
        // Convert 'Homes Sold' column to numbers
        data.forEach(d => {
            d['Homes Sold'] = +d['Homes Sold'];
        });

        // Create the histogram
        createHistogram(data);
    }).catch(error => {
        console.error('Error fetching data:', error);
    });
});