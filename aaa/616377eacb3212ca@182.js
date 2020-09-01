export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["EUEnergyProduction@1.png",new URL("./files/a1173b5c6df3779c9d37da9a80f07221d52e1025b70154bf52158ddd56874739e974e81cb1069eec0defba53aed27fed55a6b3a568fba44ba97cbdb2896f0dbd",import.meta.url)],["Twitter_Bird.svg (2) (1).png",new URL("./files/ca7faa6ed58ddec89cfb70c25bb355ef7099071b8984682aa49f1b77d65cc2519b4cb806566a2d1e55afde57ab9bed1b3ce80c696ac56993667bcdf6c48d9b86",import.meta.url)],["EUEnergyProduction@1.csv",new URL("./files/9a2a3e16683210dd807548e0cdde1d55639046884b11093e22b5220410074a961d1ec1b58ba8906dea1e92dc2a8cb7a166fca3f4a3de9947109d4e50bb0ffe40",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Europe Electricity Production

This chart showing the Europe electricity production is an adaptation of the "How each state generated electricity in 2019" dataviz published in an article by [The Washington Post](https://twitter.com/PostGraphics/status/1288935359800397838/photo/1) and created by [John Muyskens](https://twitter.com/JohnMuyskens)

The following rendering has been finished in Sketch. Code and data to generate the marimekko chart are just below.`
)});
  main.variable(observer()).define(["FileAttachment"], function(FileAttachment){return(
FileAttachment("EUEnergyProduction@1.png").image()
)});
  main.variable(observer()).define(["d3","width","height","textures","_","data","isoEU28","twitterLogo"], function(d3,width,height,textures,_,data,isoEU28,twitterLogo)
{
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);
  
  const t = textures.lines()
    .size(4)
    .strokeWidth(1)
    .stroke('#f5c14d');
  
  svg.call(t);
  
  const w = width * 0.9;
  const h = height * 0.8;
  
  const yClean = d3.scaleLinear()
    .domain([0, 1])
    .range([h/2, 0])
  
  const yFossil = d3.scaleLinear()
    .domain([1, 0])
    .range([h/2, 0])
  
  const yCleanAxis = svg.append('g')
    .attr("transform", `translate(${width},${height * 0.1})`)
    .call(d3.axisLeft(yClean)
        .tickValues([0, 0.25, 0.5, 0.75, 1])
        .tickSize(width)
        .tickFormat(d3.format('.0%'))
         )
    .call(g => g.select(".domain")
        .remove())
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
    .attr("transform", `translate(0,${(height * 0.1) + h /2})`)
    .call(d3.axisRight(yFossil)
        .tickValues([0, 0.25, 0.5, 0.75, 1])
        .tickSize(width)
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
  
  const main = svg.append('g')
    .attr('class', 'main')
    .attr('transform', `translate(${width * 0.05}, ${height * 0.1})`)
  
  const orderedData = _(data)
    //.filter(d => isoEU28.includes(d.country))
    .map(d => ({...d, proportionFossil: d.conventionalThermal/d.totalNetProduction}))
    .orderBy('proportionFossil')
    .value()
  
  const totalEUProduction = d3.sum(orderedData, d => d.totalNetProduction)
  const widthScale = d3.scaleLinear()
    .range([0,w])
    .domain([0, totalEUProduction])
    
  const cumulativeSum = orderedData.map(d => d.totalNetProduction).map((sum => value => sum += value)(0))
  
  const countries = main.append('g')
    .attr('class', 'countries')
  
  const country = countries.selectAll('.country')
    .data(orderedData)
    .join(
      enter => enter.append('g')
        .attr('class', d => `country ${d.country}`)
    )
  
  country
    .append('rect')
      .attr('height', h/2)
      .attr('width', d => widthScale(d.totalNetProduction))
      .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i-1]))
      .attr('y', d => (h/2) * d.proportionFossil)
      .attr('fill', '#f0f0f0')
      .attr('stroke', 'grey')
  
  country
    .append('rect')
      .attr('height', d => (h/2) * (1 - d.conventionalThermal/d.totalNetProduction))
      .attr('width', d => widthScale(d.totalNetProduction))
      .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i-1]))
      .attr('y', d => (h/2) * d.proportionFossil)
      .attr('fill', '#fbebbf')
      .attr('stroke', 'grey')
  
  country
    .append('rect')
      .attr('height', d => (h/2) * (1 - (d.conventionalThermal + d.nuclear)/d.totalNetProduction))
      .attr('width', d => widthScale(d.totalNetProduction))
      .attr('x', (d, i) => i === 0 ? 0 : widthScale(cumulativeSum[i-1]))
      .attr('y', d => (h/2) * d.proportionFossil)
      .attr('fill', t.url())
  
  svg.append("circle")
	.style("fill", t.url())
  
  country  
    .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('x', (d, i) => (i === 0 ? 0 : widthScale(cumulativeSum[i-1])) + (widthScale(d.totalNetProduction) / 2))
      .attr('y', d => ((h/2) * d.proportionFossil) - 8)
      .attr('font-family', 'sans-serif')
      .attr('font-weight', d => isoEU28.includes(d.country) ? 'bold' : '')
      .text(d => d.country)
  
  svg.append("text")
    .attr('class', 'title')
    .attr('x', width * 0.5)
    .attr('y', height * 0.05)
    .attr('font-size', 20)
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .text('How european countries generated electricity in 2018')
  
  const twitter = svg.append('a')
    .attr('href', 'https://twitter.com/karim_douieb')
    .attr('target', '_blank')
    .style('pointer-events', 'initial')
    
  twitter.append("image")
    .attr("xlink:href", twitterLogo)
    .attr("x",width - 170)
    .attr("y", height - 25)
    .attr("width", 20)
  
  twitter.append("text")
    .attr('x', width - 145)
    .attr('y', height - 12)
    .attr('font-size', 14)
    .attr('text-anchor', 'start')
    .text('@karim_douieb')
 
  svg.append('a')
    .attr('href', 'https://ec.europa.eu/eurostat/statistics-explained/index.php/Electricity_generation_statistics_%E2%80%93_first_results#Electricity_supplied_to_the_market')
    .attr('target', '_blank')
    .style('pointer-events', 'initial')
    .append("text")
      .attr('x', width*0.03)
      .attr('y', height - 12)
      .attr('font-size', 14)
      .attr('text-anchor', 'start')
      .text('Data: Eurostat')
  
  return Object.assign(svg.node());
}
);
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width * 0.6
)});
  main.variable(observer("twitterLogo")).define("twitterLogo", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("Twitter_Bird.svg (2) (1).png").url()
)});
  main.variable(observer("isoEU28")).define("isoEU28", function(){return(
[
    "BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY",
    "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI",
    "SE", "UK"
]
)});
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.dsvFormat(';').parse((await FileAttachment("EUEnergyProduction@1.csv").text()).split('.').join(''), d3.autoType)
)});
  main.variable(observer("topProducers")).define("topProducers", ["_","data"], function(_,data){return(
_(data)
  .orderBy('totalNetProduction', 'desc')
  .value()
)});
  main.variable(observer("topNuclearProducers")).define("topNuclearProducers", ["_","data"], function(_,data){return(
_(data)
  .orderBy('nuclear', 'desc')
  .map(d => ({
    ...d,
    nuclearProp: d.nuclear/d.totalNetProduction
  }))
  .value()
)});
  main.variable(observer("topRenualProducers")).define("topRenualProducers", ["_","data"], function(_,data){return(
_(data)
  .map(d => ({
    ...d,
    renewal: d.totalNetProduction - (d.nuclear + d.conventionalThermal),
    renewalProp: 1 - (d.nuclear + d.conventionalThermal)/d.totalNetProduction
  }))
  .orderBy('renewal', 'desc')
  .value()
)});
  main.variable(observer("topConventionalProducers")).define("topConventionalProducers", ["_","data"], function(_,data){return(
_(data)
  .orderBy('conventionalThermal', 'desc')
  .value()
)});
  main.variable(observer("topRenualPropProducers")).define("topRenualPropProducers", ["_","data"], function(_,data){return(
_(data)
  .map(d => ({
    ...d,
    renewal: d.totalNetProduction - (d.nuclear + d.conventionalThermal),
    renewalProp: 1 - (d.nuclear + d.conventionalThermal)/d.totalNetProduction
  }))
  .orderBy('renewalProp', 'desc')
  .value()
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer("_")).define("_", ["require"], function(require){return(
require('lodash')
)});
  main.variable(observer("textures")).define("textures", ["require"], function(require){return(
require('textures')
)});
  return main;
}
