/**
 * Lunar Calendar
 */
// Figure dimensions
const margin     = { top: 100, right: 50, bottom: 100, left: 50 };
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

// Locations: Chicago
const LAT = 41.8781; 
const LON = 87.6298;


// Scales
const x = d3.scaleBand()
  .domain(DAYS_MN)
  .range([0, FIG_WIDTH])
  .paddingOuter(0.33)
  .paddingInner(0.33);
const y = d3.scaleBand()
  .domain(MONTHS)
  .range([0, FIG_HEIGHT])
  .paddingOuter(1)
  .paddingInner(0.2);
const phaseScale = d3.scaleLinear()
  .domain([0, 1])
  .range([-1, 1]);

// Find maximum moon size
const xBand = x.bandwidth();
const yBand = y.bandwidth();
const band  = Math.min(xBand, yBand);
const r     = Math.fround(band / 2);





// Viz
var svg = d3.select("body").append("svg")
    .attr("class", "svg-base")
    .attr("width", FIG_WIDTH + margin.left + margin.right)
    .attr("height", FIG_HEIGHT + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var defs = svg.append("defs");


function getLunarInfo(day) {
  const illumination = SunCalc.getMoonIllumination(day);
  const position     = SunCalc.getMoonPosition(day, LAT, LON);
  
  // Date => month+day
  const month = monthFormatter(day);
  const dayOfMonth = +dayOfMonthFormatter(day);

  // Day+month to x+y
  const xVal = x(dayOfMonth);
  const yVal = y(month);

  // Angle
  const zenithAngle = illumination.angle - position.parallacticAngle;

  return { illumination, position, zenithAngle, month, dayOfMonth, xVal, yVal };
}

const addMoon = day => {
  // Append clipping path
  let clipID = `clip-${day.month}-${day.dayOfMonth}`;

  defs.append("clipPath")
    .attr("id", clipID)
    .append("circle")
      .attr("cx", r)
      .attr("cy", r)
      .attr("r", r+5);

  // Group
  let moonG = g.append("g")
    .attr("class", "moon-group")
    .attr("transform", `translate(${day.xVal}, ${day.yVal})`)
   // .attr("clip-path", `url(#${clipID})`);

  // Moon
  moonG.append("circle")
    .attr("class", "moon-shadow")
    .attr("cx", r)
    .attr("cy", r)
    .attr("r",  r);

  // @TODO add clipping to group
  let phase = day.illumination.phase;
  let frac  = day.illumination.fraction;
  let wax   = day.illumination.angle >= 0;

  //console.log(phase, frac);

  // Moon shadow
  addMoonShadow(phase, frac, moonG);
}

const addMoonShadow = (phase, fraction, g) => {
  //const phaseRound = phaseScale(phase);
  const phaseRound = + phase.toFixed(5);
  const fracRound  = +fraction.toFixed(4);

  // Full moon: dots
  if (fracRound >= 0.996) {
    const dotAngle = 360 / 10;

    for (var i=0; i < 360; i+= dotAngle) {
      let radii = i * Math.PI / 180;
      let c = (Math.cos(radii) !== 0) ? Math.cos(radii) * (r+3) : 0;
      let s = (Math.sin(radii) !== 0) ? Math.sin(radii) * (r+3) : 0;

      g.append("circle")
        .attr("class", "moon-shadow")
        .attr("cx", c + r)
        .attr("cy", s + r)
        .attr("r", 1);
    }
    return;
  }

  // New moon: circle
  else if (phase >= 0.964) {
    g.append('circle')
      .attr("class", "moon-shadow")
      .attr("cx", r)
      .attr("cy", r)
      .attr("r", r-1.5);
    return;
  }

  // Other
  //if (true) {
  else {
    //console.log({phase, phaseRound, fraction, fracRound });

    var d = `M0,${-r}A${r}, ${r} 0 1 ${(phaseRound > 0) ? '0' : '1'} 0,${r}`;

    // half moon add Z
    if ((phaseRound > -0.5) && (phaseRound < 0.5)) d += 'Z';

    else {
      var h = 2 * r * ((phaseRound < -0.5) && (phaseRound > 0.5) ? 1-Math.abs(phaseRound) : Math.abs(phaseRound) - 0.5);
      var leg = Math.sqrt(r * r+h * h);
      var bigR = leg * leg / (2* Math.sqrt(leg * leg - r * r));

      d += `A${bigR+0.001},${bigR+0.001} 0 0 ${((phaseRound < -0.5) || ((phaseRound > 0) && (phaseRound < 0.5)) ? "0" : "1")} 0,${-r}`;
    };

    // Add the arc
    g.append("path")
      .attr("class", "moon-moon")
      .attr("d", d)
      .attr("transform", `translate(${r}, ${r})`);
  };
}

DAYS_YR.map(getLunarInfo).forEach(addMoon);







// Axes
const xAxisTop = g => {
  g
    .attr("class", "axis")
    .attr("transform", `translate(0, ${y.step() * y.paddingOuter()})`)
    .call(d3.axisTop(x).tickPadding(10))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove());
}
const xAxisBottom = g => {
  g
    .attr("class", "axis")
    .attr("transform", `translate(0, ${FIG_HEIGHT - y.step() * y.paddingOuter() - y.step() * y.paddingInner()})`)
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
    .attr("class", "axis")
    .attr("transform", `translate(${0}, ${-2*r})`)
    .call(d3.axisLeft(y).tickFormat(ticks))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("line").remove());
}

g.append("g").call(xAxisTop);
g.append("g").call(xAxisBottom);
g.append("g").call(yAxis);