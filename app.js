
async function drawScatterPlot() {

    const dataset = await d3.csv('./data.csv', d3.autoType)
    //! how import _ from 'lodash'
// create dimensions
    let dimensions = {
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9,
        margin: {
            top: 10,
            right: 10,
            bottom: 50,
            left: 50,
        },
    }
    dimensions.boundedWidth = dimensions.width -
        dimensions.margin.left -
        dimensions.margin.right
    dimensions.boundedHeight = dimensions.height -
        dimensions.margin.top -
        dimensions.margin.bottom

    // create a container for scales
    const svg = d3.select("#wrapper")
            .append("svg")
                .attr("width", dimensions.width)
                .attr("height", dimensions.height)

    //* https://riccardoscalco.it/textures/
    const t = textures.lines()
        .size(4)
        .strokeWidth(1)
        .stroke("#f5c14d")
    //! what is the thing 
        svg.call(t)
// create scales
    const yClean = d3.scaleLinear()
        .domain([0, 1])
        .range([dimensions.boundedHeight / 2, 0])
    const yFossil = d3.scaleLinear()
        .domain([1, 0])
        .range([dimensions.boundedHeight / 2, 0])


    const yCleanAxis = svg.append('g')
        .attr("transform", `translate(${dimensions.width}, ${dimensions.height*0.1})`)
        //* using call so that we dont break the chain, otherwise we have to do it as Fullstack D3
        //* define the ticks
        .call(
            d3.axisLeft()
            .scale(yClean)
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            // this is in charge of the dashlines 
            .tickSize(dimensions.width)
            // rounded percentage
            .tickFormat(d3.format(".0%"))
        )
        //* get rid of domain lines
        //! g is a random letter, just a function
        .call(g => g.select(".domain")
            .remove())
        //* css selector 
        // below makes lines dashed and ticks on the right and top of the dash lines
        // this is makes the ticks are still outside 
        //* check the dom to find out the selector
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-dasharray", "2,2"))
        //* add ticks to the right of the whole graph
        .call(g => g.selectAll(".tick text")
            .attr("x", -4)
            .attr("dy", -4))
        //* attach text: clean electricity
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", -36)
            .attr("text-anchor", "end")
            .text("clean electricity"))

    const yFossilAxis = svg.append('g')
        .attr("transform", `translate(0,${(dimensions.height * 0.1) + dimensions.boundedHeight /2})`)
        .call(d3.axisRight(yFossil)
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            .tickSize(dimensions.width)
            .tickFormat(d3.format('.0%'))
        )
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("x", 4)
            .attr("dy", -4))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 36)
            .attr("text-anchor", "start")
            .text("conventional thermal energy"))

    const main = svg.append("g")
        .attr('class', 'main')
        .attr('transform', `translate(${dimensions.width * 0.05}, ${dimensions.height * 0.1})`)

    const orderedData = _(dataset)
        .map(d => ({
            ...d,
            proportionFossil: d.conventionalThermal / d.totalNetProduction
        }))
        .sortBy('proportionFossil')
        .value()
    // design width
    const totalEUProduction = d3.sum(orderedData, d => d.totalNetProduction)

    const widthScale = d3.scaleLinear()
        .range([0, dimensions.boundedWidth])
        .domain([0, totalEUProduction])

    const cumulativeSum = orderedData
        .map(d => d.totalNetProduction)
        //! what the heck is this???
        .map((sum => value => sum += value)(0))
// put data into the graph
    const countries = main.append("g")
        .attr('class', "countries")
    const country = countries.selectAll(".country")
        .data(orderedData)
        //! what is join and what is that enter => enter.append
        .join(
            enter => enter.append("g")
            .attr('class', d => `country ${d.country}`)
        )
    // start plotting

    // shape of the fossil rect
    country.append('rect')
        .attr('height', dimensions.boundedHeight / 2)
        .attr('width', d => widthScale(d.totalNetProduction))
        //* ternary operator
        // where does i start
        .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i - 1]))
        .attr('y', d => (dimensions.boundedHeight / 2) * d.proportionFossil)
        .attr('fill', "#f0f0f0")
        //* outline
        .attr('stroke', "grey")
    
    //  
    country
        .append('rect')
        .attr('height', d => (dimensions.boundedHeight / 2) * (1 - d.conventionalThermal / d.totalNetProduction))
        .attr('width', d => widthScale(d.totalNetProduction))
        .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i - 1]))
        .attr('y', d => (dimensions.boundedHeight / 2) * d.proportionFossil)
        .attr('fill', '#fbebbf')
        .attr('stroke', 'grey')

    country
        .append('rect')
        .attr('height', d => (dimensions.boundedHeight / 2) * (1 - (d.conventionalThermal + d.nuclear) / d.totalNetProduction))
        .attr('width', d => widthScale(d.totalNetProduction))
        .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i - 1]))
        .attr('y', d => (dimensions.boundedHeight / 2) * d.proportionFossil)
        .attr('fill', t.url())

    svg.append('circle').style("fill", t.url())
//! interactions
// countries.select("rect")
//       .on("mouseenter", onMouseEnter)
//       .on("mouseleave", onMouseLeave)

//   const tooltip = d3.select("#tooltip")
//   function onMouseEnter(datum) {
//     tooltip.select("#count")
//         .text(yAccessor(datum))

//     const formatHumidity = d3.format(".2f")
//     tooltip.select("#range")
//         .text([
//           formatHumidity(datum.x0),
//           formatHumidity(datum.x1)
//         ].join(" - "))

//     const x = xScale(datum.x0)
//       + (xScale(datum.x1) - xScale(datum.x0)) / 2
//       + dimensions.margin.left
//     const y = yScale(yAccessor(datum))
//       + dimensions.margin.top

//     tooltip.style("transform", `translate(`
//       + `calc( -50% + ${x}px),`
//       + `calc(-100% + ${y}px)`
//       + `)`)

//     tooltip.style("opacity", 1)
//   }

//   function onMouseLeave() {
//     tooltip.style("opacity", 0)
//   }
    
    isoEU28 = [
        "BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY",
        "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI",
        "SE", "UK"
    ]
    country.append('text')
        .attr("text-anchor", "start")
        .attr('font-size', 10)
        .attr('x', (d,i) => (i === 0 ? 0 : widthScale(cumulativeSum[i-1]) + (widthScale(d.totalNetProduction)/2)))
        .attr('y', d => ((dimensions.boundedHeight/2) * d.proportionFossil) - 8)
        .attr('font-family', 'sans-serif')
        .attr('font-weight', d => isoEU28.includes(d.country) ? 'bold' : '')
        .text(d => d.country)

    country.append('text')
        .attr('class', "title")
        .attr('x', dimensions.width * 0.5)
        .attr('y', dimensions.height * 0.05)
        .attr()
        .text('How european countries generated electricity in 2018')

}

drawScatterPlot()