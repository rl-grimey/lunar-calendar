/**
 * Lunar SVG
 */

// Dimensions
const margin     = { top: (1080 / 5), right: 50, bottom: 10, left: 60 };
const FIG_WIDTH  = 1080 - margin.left - margin.right;
const FIG_HEIGHT = 1080 - margin.top - margin.bottom;

// Dates + Ranges
const START   = new Date(2019, 0, 0, 0, 0, 0, 0);
const END     = new Date(2020, 0, 0, 0, 0, 0, 0);
const DAYS_MN = d3.range(1, 32, 1);
const MNS_YR  = d3.timeMonths(START, END).map(d3.timeFormat("%B"));

// Colors
const BG = '#f8f8f8';
const FG = '#111111';


// SCALES
const x = d3.scalePoint()
  .domain(DAYS_MN)
  .range([10, FIG_WIDTH])
  .padding(0.25)
  //.paddingInner();

const y = d3.scaleBand()
  .domain(MNS_YR)
  .range([0, FIG_HEIGHT])
  //.align(0)
  .paddingOuter(0.25)
  //.paddingInner();

// Find maximum moon size
const xBand = x.step();
const yBand = y.step();
const band  = Math.min(xBand, yBand);
const r     = Math.fround(band / 2);


// SVG
var svg = d3.select("body").append("svg")
    .attr("class", "svg-base")
    .attr("text-rendering", "optimizeLegibility")
    .attr("background", BG)
    .attr("width",  FIG_WIDTH  + margin.left + margin.right)
    .attr("height", FIG_HEIGHT + margin.top  + margin.bottom);

svg.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', 1080)
  .attr('height', 1080)
  .attr('fill', BG);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// SVG Definitions
var defs = svg.append("defs");
defs.append('style')
  .attr('type', 'text/css')
  .text("@import url('https://fonts.googleapis.com/css?family=Pacifico|Roboto:400,500,700');");


// Axes
const xAxisTop = g => {
  g
    .attr("class", "axis")
    .attr("font-size", "11px")
    .call(d3.axisTop(x).tickPadding(3))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove());
}
const xAxisBottom = g => {
  g
    .attr("class", "axis")
    .attr("transform", "translate(0, " + (FIG_HEIGHT - 50) + ")")
    .attr("font-size", "11px")
    .call(d3.axisBottom(x))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove());
}
const yAxis = g => {
  const ticks = month => {
    if (month.length <= 4) return month;
    else return month.slice(0, 3);
  };

  g
    .attr("class", "axis axis--y")
    .attr("font-size", "11px")
    .attr("letter-spacing", "0.2em")
    .attr("transform", `translate(${0}, ${-1.7 * r})`)
    .call(d3.axisLeft(y).tickFormat(ticks))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove());
}

g.append("g").call(xAxisTop);
g.append("g").call(xAxisBottom);
g.append("g").call(yAxis);


// Title
svg.append('text')
  //.attr('class', 'calendar--title')
  //.attr('id', 'supratitle')
  .attr('x', 1080 / 2)
  .attr('y', (1080 / 5) * 0.4)
  .attr('text-anchor', 'middle')
  //.attr('letter-spacing', '0.1rem')
  .attr('white-space', 'pre')
  .attr('font-family', "'Pacifico', cursive")
  .attr('font-size', '54px')
  .attr('fill', FG)
  .text('• phases  of  the  moon •');

svg.append('text')
  .attr('class', 'calendar--title')
  .attr('id', 'subtitle')
  .attr('x', 1080 / 2)
  .attr('y', (1080 / 5) * 0.625)
  .attr('text-anchor', 'middle')
  .attr('white-space', 'pre')
  .attr('letter-spacing', '0.2em')
  .attr('font-family', "'Roboto', sans-serif")
  .attr('font-size', '16px')
  .attr('font-weight', '500')
  .attr('fill', FG)
  .text('LUNAR CALENDAR • 2019 • NORTHERN HEMISHPERE ');


