/**
 * Lunar Visualization
 */


/* Three conditions:
  regular day
  full moon
  new moon
*/
const halfR = r / 2;

const fmtDayMonth = d3.timeFormat("%d");
const fmtMnthYear = d3.timeFormat("%B");

const xVal = (date) => x(+fmtDayMonth(date));
const yVal = (date) => y(fmtMnthYear(date));



lunarEvts.forEach(evt => {
  var evtX = xVal(evt.date),
      evtY = yVal(evt.date);

  if (evt.type === 'new') {
    g.append('circle')
      .attr('transform', `translate(${evtX}, ${evtY + halfR})`)
      .attr('fill', BG)
      .attr('stroke', FG)
      .attr('r', halfR);
  } else {
    // Dots
    let dots = 10;
    let dotAngle = 360 / dots;
    let dotRadius = 1;

    // Sun circle
    g.append('circle')
      .attr('transform', `translate(${evtX}, ${evtY + halfR})`)
      .attr('fill', FG)
      .attr('stroke', BG)
      .attr('r', halfR);
  
    for (var i=0; i < 360; i+= dotAngle) {
      let radii = i * Math.PI / 180;
      let c = (Math.cos(radii) !== 0) ? Math.cos(radii) * (r * 0.75) : 0;
      let s = (Math.sin(radii) !== 0) ? Math.sin(radii) * (r * 0.75) : 0;

      g.append("circle")
        .attr('transform', `translate(${evtX}, ${evtY + halfR})`)
        .attr("fill", FG)
        .attr('opacity', 0.9)
        .attr("cx", c)
        .attr("cy", s)
        .attr("r", dotRadius);
    };
  }

});




function calcTerminatorArc(ill, radius) {
  let right_of_center = null;
  let lit_from_left = null;
  let L = null;

  if (ill <= 0.25) {
    L = ill;
    right_of_center = true;
    lit_from_left = false;
  } 
  else if (ill <= 0.5) {
    L = 0.5 - ill;
    right_of_center = false;
    lit_from_left = false;
  }
  else if (ill <= 0.75) {
    L = ill - 0.5;
    right_of_center = true;
    lit_from_left = true;
  }
  else {
    L = 1 - ill;
    right_of_center = false;
    lit_from_left = true;
  }

  let arcX = radius * (1 - Math.cos(2 * Math.PI * L));
  let n = radius - arcX;
  let arcRadius = (radius * radius + n * n) / (2 * n);

  return {
    arcRadius,
    right_of_center,
    lit_from_left
  };
}

function makePath(day, radius) {
  let {
    arcRadius,
    right_of_center,
    lit_from_left } = calcTerminatorArc(day.illumination.phase, radius/2);

  let CSS_LIGHT = FG;
  let CSS_DARK  = BG;
  let color_left  = (lit_from_left === true) ? CSS_LIGHT : CSS_DARK;
  let color_right = (lit_from_left === true) ? CSS_DARK  : CSS_LIGHT;


  let move_to_top   = `M ${halfR}, 0`;
  let disc_left_arc = `A ${halfR} ${halfR} 0 0 1 ${halfR} 0`;
  let disc_right_arc= `A ${halfR} ${halfR} 0 0 0 ${halfR} 0`;
  let terminator_arc= `A ${arcRadius} ${arcRadius} 0 0 ${(right_of_center) ? 1 : 0} ${halfR} ${radius}`;


  // Moon position
  let moonX = xVal(day.date) - halfR;
  let moonY = yVal(day.date);

  g.append('path')
    .attr('transform', `translate(${moonX}, ${moonY})`)
    .attr('d', `${move_to_top} ${terminator_arc} ${disc_left_arc}`)
    .attr('fill', color_left);

  g.append('path')
    .attr('transform', `translate(${moonX}, ${moonY})`)
    .attr('d', `${move_to_top} ${terminator_arc} ${disc_right_arc}`)
    .attr('fill', color_right);
}


lunarData.forEach(day => {
  makePath(day, r);
})