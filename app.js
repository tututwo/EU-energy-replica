
async function drawScatterPlot() {

    const dataset = await d3.csv('./data.csv', d3.autoType)
    //! how import _ from 'lodash'
    // // Accessor
    // const xAccessor = d => d.dewPoint
    // const yAccessor = d => d.humidity
    // // color scale
    // const colorAccessor = d => d.cloudCover

    // define dimensions


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

    // create scales
    const svg = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

    //! What is textures doing here and what is call t
    const t = textures.lines()
        .size(4)
        .strokeWidth(1)
        .stroke("#f5c14d")
    svg.call(t)

    const yClean = d3.scaleLinear()
        .domain([0, 1])
        .range([dimensions.boundedHeight / 2, 0])
    const yFossil = d3.scaleLinear()
        .domain([1, 0])
        .range([dimensions.boundedHeight / 2, 0])

    const yCleanAxis = svg.append('g')
        .attr("transform", `translate(${dimensions.width}, ${dimensions.height * 0.1})`)
        .call(
            d3.axisLeft(yClean)
            .tickValues([0, 0.25, 0.5, 0.75, 1])
            .tickSize(dimensions.width)
            .tickFormat(d3.format(".0%"))
        )
        //* get rid of domain lines
        .call(g => g.select(".domain")
            .remove())
        //* css selector 
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("x", -4)
            .attr("dy", -4))
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
        // spread operator. 基本上就是让这个数据里的array,变成可以传递给function做运算的argument
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
    country.append('rect')
        //! why another height here since there is a y below
        .attr('height', dimensions.boundedHeight / 2)
        .attr('width', d => widthScale(d.totalNetProduction))
        //* ternary operator
        // where does i start
        .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i - 1]))
        .attr('y', d => (dimensions.boundedHeight / 2) * d.proportionFossil)
        .attr('fill', "#f0f0f0")
        //! what is stroke
        .attr('stroke', "grey")

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





}

drawScatterPlot()