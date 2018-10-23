/**
 * Lunar Calendar
 */
// Figure dimensions
const margin     = { top: 0, right: 50, bottom: 0, left: 50 };
const FIG_WIDTH  = 1080 - margin.left - margin.right;
const FIG_HEIGHT = 1080 - margin.top - margin.bottom;

// Colors
const BG = '#222222';
const FG = '#F8F8F8';

// Dates
const monthFormatter = d3.timeFormat("%B");
const dayOfMonthFormatter = d3.timeFormat("%d");
const START          = new Date(2019, 0, 0, 0, 0, 0, 0);
const END            = new Date(2020, 0, 0, 0, 0, 0, 0);

const DAYS_MN = d3.range(1, 32, 1);
const DAYS_YR = d3.timeDays(START, END, 1);
const MONTHS  = d3.timeMonth.range(START, END, 1).map(monthFormatter);



// Scales
const x = d3.scaleBand()
  .domain(DAYS_MN)
  .range([0, FIG_WIDTH])
  .paddingOuter(0.2)
  .paddingInner(0.2);
const y = d3.scaleBand()
  .domain(MONTHS)
  .range([0, FIG_HEIGHT])
  .paddingOuter(0.5)
  .paddingInner(0);

// Find maximum moon size
const xBand = x.bandwidth();
const yBand = y.bandwidth();
const band  = Math.min(xBand, yBand);
const r     = Math.fround(band / 2);





// Viz
var svg = d3.select("body").append("svg")
    .attr("class", "svg-base")
    .attr("width", FIG_WIDTH + margin.left + margin.right)
    .attr("height", FIG_HEIGHT + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



function getLunarInfo(day) {
  const illumination = SunCalc.getMoonIllumination(day);
  
  const month = monthFormatter(day);
  const dayOfMonth = +dayOfMonthFormatter(day);

  const xVal = x(dayOfMonth);
  const yVal = y(month);

  return { illumination, month, dayOfMonth, xVal, yVal };
}



const moonGroups = svg.append("g")
    .attr("class", "moon-group")
  .selectAll("circle")
  .data(DAYS_YR.map(getLunarInfo))
  .enter().append("circle")
    .attr("class", "moon-moon")
    .attr("cx", d => d.xVal + r)
    .attr("cy", d => d.yVal + r)
    .attr("r", r);