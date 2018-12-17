/**
* Lunar Data
*/

// Formats
const monthFormatter      = d3.timeFormat("%B");
const dayOfMonthFormatter = d3.timeFormat("%d");

// Range + dates
const start = new Date(2019, 0, 0, 0, 0, 0, 0);
const end   = d3.timeYear.offset(start, 1);
const days  = d3.timeDay.range(start, end);


// GPS Location: Chicago
const LAT = 41.8781; 
const LON = 87.6298;



/********************************************************************************/
// Full and New Moons
function findMinimum(f, x0, x1) {
  x0 = +x0, x1 = +x1;
  while (Math.abs(x1 - x0) > 1) {
    var dx = (x1 - x0) / 3;
    if (f(x0 + dx) > f(x1 - dx)) x0 += dx;
    else x1 -= dx;
  }
  return new Date((x0 + x1) / 2);
}

function getLunarEvents() {
	var events = [],
			d0,
			d1 = d3.timeDay.offset(start, -1),
			d2 = d3.timeDay.offset(start, 0),
			x0,
			x1 = SunCalc.getMoonIllumination(d1).fraction,
			x2 = SunCalc.getMoonIllumination(d2).fraction;
	for (var i = 0; i < 365; ++i) {
		d0 = d1, d1 = d2, d2 = d3.timeDay.offset(start, i + 1);
		x0 = x1, x1 = x2, x2 = SunCalc.getMoonIllumination(d2).fraction;
		if (x1 > x0 && x1 > x2) {
			events.push({date: findMinimum(x => 1 - SunCalc.getMoonIllumination(x).fraction, d0, d2), type: "full"});
		} else if (x1 < x0 && x1 < x2) {
			events.push({date: findMinimum(x => SunCalc.getMoonIllumination(x).fraction, d0, d2), type: "new"});
		}
	}
	return events;
}

function buildLunarLookup(lunarEvents) {
  /* Transforms a list of lunar events into a dict mapping date to lunar infor. */
  var lunarDict = lunarEvents.reduce(function(map, obj) {
    // Get the day of the lunar event, instead of the exact datetime
    var dayOf = obj.date.toDateString();
    map[dayOf] = obj;
    return map;
  }, {});
  
  return lunarDict;
}

const lunarEvts = getLunarEvents();
const lunarLook = buildLunarLookup(lunarEvts);


/********************************************************************************/
// Days

function getLunarData(day) {
  const dayOfLunarEvent = day.toDateString() in lunarLook;
  const illumination    = SunCalc.getMoonIllumination(day);
  const position        = SunCalc.getMoonPosition(day, LAT, LON);

  return {
    date: day,
    illumination: illumination,
    dayOfLunarEvent: dayOfLunarEvent
  };
}

const lunarData = days.map(getLunarData).filter(day => day.dayOfLunarEvent === false);