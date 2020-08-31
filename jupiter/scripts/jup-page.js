/* -*- Mode: Javascript; js-indent-level: 2; indent-tabs-mode: nil; -*- */

// Javascript code to display Jupiter, its moons and their shadows.
// Adapted by Joe Zuntz, 2020

var jup = null;
var active_moon = 0;
var active_obs = 0;

// in days
const baselines = [3.0,  5.0, 10.0, 20.0];

const moons = ["Io", "Europa", "Ganymede", "Callisto"];

const observations = [
    "Sep 1 00:00",
    "Sep 1 06:00",
    "Sep 1 12:00",
    "Sep 1 18:00",
    "Sep 2 00:00",
    "Sep 2 06:00",
    "Sep 2 12:00",
    "Sep 2 18:00",
    "Sep 3 00:00",
    "Sep 3 06:00",
    "Sep 3 12:00",
    "Sep 3 18:00",
    "Sep 4 00:00",
    "Sep 5 00:00",
    "Sep 6 00:00",
    "Sep 7 00:00",
    "Sep 8 00:00",
    "Sep 9 00:00",
    "Sep 10 00:00",
    "Sep 12 00:00",
    "Sep 14 00:00",
    "Sep 16 00:00",
    "Sep 18 00:00",
    "Sep 20 00:00",
]

const row1 = observations.length / 3;
const row2 = row1 * 2;

var observation_dates = [];

for (var i = 0; i < observations.length; i++) {
    var d = moment.utc("2020 " + observations[i], "YYYY MMM D HH:mm");
    observation_dates.push(d.toDate());
}




window.onload = function() {

    jup = new Jupiter();

    var row;
    var results_table = document.getElementById("moon_table");
    for (var i = 0; i < observations.length; i++) {
        if (i < row1) row = document.getElementById("button_row1");
        else if (i < row2) row = document.getElementById("button_row2");
        else row = document.getElementById("button_row3");
        var txt = observations[i];
        var html = `<button id="btn-${i}" onclick="click_date_button(this);"> ${txt}</button></TD>`;
        var cell = row.insertCell(-1);
        cell.innerHTML = html;

        // Create an empty <tr> element and add it to the 1st position of the table:
        var results_row = results_table.insertRow(-1);
        // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
        var cell1 = results_row.insertCell(0);
        var i1 = i + 1;

        cell1.innerHTML = i + 1
        for (var j = 0; j < moons.length; j++) {
            results_row.insertCell(-1);
        }

    }
    
    for (var i = 0; i < observations.length; i++) {

    }    
    // Initial date is Sep 1
    set_highlighted_moon(0, 0);

    // draw the initial image
    update_image();

    // Listen for clicks on the main image
    document.getElementById("jupframe").addEventListener("click", click_frame);

    var tab = document.getElementById("moon_table");
    for (var col = 1; col <= 4; col++) {
        for (var row = 1; row <= observations.length; row++) {
            var value = localStorage.getItem(`cell-${row}-${col}`);
            tab.rows[row].cells[col].innerHTML = value;
        }
    }

}


function click_frame(event) {

    var div = document.getElementById("jupframe");
    var x0 = div.offsetLeft;
    var y0 = div.offsetTop;

    var x = event.pageX - x0;
    var y = event.pageY - y0;

    set_active_value(x);

    next_cell();
}


function next_cell(){
    var moon = active_moon;
    var obs = active_obs;



    moon = moon + 1;

    if (moon == moons.length){
        moon = 0;
        obs = obs + 1;
    }
    if (obs == observations.length){
        obs = 0;
        moon = 0;
    }

    set_highlighted_moon(moon, obs);

}

function set_active_value(value) {
    var active_cell = cell_for_moon_obs(active_moon, active_obs) ;
    active_cell.innerHTML = value;

    // save in local storage
    var col = active_cell.cellIndex;
    var row = active_cell.parentElement.rowIndex;
    localStorage.setItem(`cell-${row}-${col}`, value);

}

function click_not_visible() {
    set_active_value(" - ");
    next_cell();
}

function cell_for_moon_obs(moon, obs){
    // skip header row and date column
    var row = obs + 1;
    var col = moon + 1;
    cell = document.getElementById("moon_table").rows[row].cells[col];
    return cell;
}

function set_highlighted_moon(moon, obs) {

    document.getElementById("active_moon").innerHTML = moons[moon];

    var previous_cell = cell_for_moon_obs(active_moon, active_obs);
    previous_cell.style.backgroundColor = null;

    var previous_button = document.getElementById(`btn-${active_obs}`);
    previous_button.style.background = null;

    // set the active values, used elsewhere
    active_moon = moon;
    active_obs = obs;

    // update the paragraph telling them where to click
    document.getElementById("active_moon").innerHTML = moons[moon];

    // highlight the corresponding cell in the 
    var new_cell = cell_for_moon_obs(active_moon, active_obs);
    new_cell.style.backgroundColor = "#aaffaa";

    //  set the new button colour
    var new_button = document.getElementById(`btn-${obs}`)
    new_button.style.background = "#aaffaa";

    update_image();
}

function click_date_button(button) {
    // Highlight Io
    obs = parseInt(button.id.substring(4));
    set_highlighted_moon(0, obs);
}



// A place to store the last width and height we measured.
var gfxWidth, gfxHeight;

// Are we reversing left and right?
var reverseX = false;

// Are we reversing top and bottom?
var reverseY = false;

function screenWidth() {
    // clientWidth, scrollWidth and offsetWidth all give the same result
    // in this case.
    gfxWidth = document.getElementById("jupframe").clientWidth;
    if (gfxWidth != null) {
        gfxWidth = +gfxWidth;
        gfxHeight = +document.getElementById("jupframe").clientHeight;
        return gfxWidth;
    }
    gfxWidth = window.innerWidth;
    if (gfxWidth != null) {
        gfxWidth = +gfxWidth;
        gfxHeight = +window.innerHeight;
        return gfxWidth;
    }
    gfxWidth = document.documentElement.clientWidth;
    if (gfxWidth != null) {
        gfxWidth = +gfxWidth;
        gfxHeight = +document.documentElement.clientHeight;
        return gfxWidth;
    }
    gfxWidth = document.body.clientWidth; // For IE8
    if (gfxWidth != null) {
        gfxWidth = +gfxWidth;
        gfxHeight = +document.body.clientHeight; // For IE8
        return gfxWidth;
    }
    gfxWidth = 800;
    gfxHeight = 300;
    return gfxWidth;
}


// Place an image or other element: could be a text label, etc.
// as long as it's an element with position: absolute.
// left must be provided but the other arguments can be omitted,
// in which case they won't be changed.
// If width and height are supplied, set the image's width and height
// (so it will scale if necessary), and place the image
// so that it's centered on the given coordinates.
function placeImage(im, left, top, width, height) {
    if (!width)
        width = 0;
    if (!height) {
        if (width)
            height = width;
        else
            height = 0;
    }

    if (reverseX)
        leftpx = gfxWidth - left - width / 2;
    else
        leftpx = left - width / 2;

    if (top) {
        if (reverseY)
            toppx = gfxHeight - top - height / 2;
        else
            toppx = top - height / 2;
    }

    im.style.left = leftpx;
    if (top)
        im.style.top = toppx;

    if (width) {
        im.width = width;
        if (height) {
            im.height = height;
        } else {
            im.height = width; // assume square if width but not height specified
        }
    } else { // no width or height specified
        im.style.left = leftpx;
        if (top)
            im.style.top = toppx;
    }

    im.style.visibility = "visible";
    return [leftpx, toppx];
}


// Update Jupiter and predict upcoming events based on whatever
// date is in the date field of the page.
function update_image() {
    var d = observation_dates[active_obs];
    drawJupiter(jup, d);
}

window.onresize = update_image;


// Animate:
var animating = false;
var animateTime = 100; // default msec delay between steps
var stepMinutes = 10; // default time to advance in each step



function drawJupiter(jup, date) {
    jup.setDate(date);

    var width = 0.8 * screenWidth();
    var halfwidth = width / 2;
    var height = 100;
    var halfheight = height / 2;

    // smalljup.png is 60x60, so jupiter's radius in the image is 30px.
    // Adjust its size according to the width of the display.
    // If we want to be able to show Callisto in its farthest position,
    // Callisto's orbit is jupRadius * 1,883,000 km / 71492 km or 26.3.
    //var jupRadius = 19;
    var jupRadius = halfwidth / 26.3;
    var spotWidth = 26 * jupRadius / 30;
    var spotHeight = 13 * jupRadius / 30;

    var size_info = document.getElementById("size_info");
    var size_display = jupRadius.toFixed(1);
    size_info.innerHTML = `Jupiter is now shown with radius ${size_display} pixels`

    // Make sure Jupiter is properly centered:
    var jupimg = document.getElementById("jupiter");
    if (jupimg) {
        jupimg.width = jupimg.height = 2 * jupRadius;
        placeImage(jupimg, halfwidth, halfheight, jupRadius * 2);
    }

    reverseX = false;
    reverseY = false;


    for (var whichmoon = 0; whichmoon < 4; ++whichmoon) {
        // First handle the shadow
        var moondata = jup.getMoonXYData(whichmoon);

        img = document.getElementById("shadow" + whichmoon);
        label = document.getElementById("slabel" + whichmoon);
        if (img && !isNaN(moondata.shadowx) && !isNaN(moondata.shadowy)) {
            img.setAttribute("src", "images/moonshadow.png");
            var x = moondata.shadowx * jupRadius + halfwidth;
            placeImage(img, x, moondata.shadowy * jupRadius + halfheight);

        } else if (img) {
            img.style.visibility = "hidden";
            if (label) {
                label.style.visibility = "hidden";
            }
        }

        // Now, with the shadow done, handle the moon itself:
        img = document.getElementById("moon" + whichmoon);
        label = document.getElementById("label" + whichmoon);
        var eclipselabel = document.getElementById("elabel" + whichmoon);
        var x = moondata.moonx * jupRadius + halfwidth;
        if (moondata.eclipse) {
            placeImage(eclipselabel, x);
            if (img)
                img.style.visibility = "hidden";
            if (label)
                label.style.visibility = "hidden";
        } else if (img && !isNaN(moondata.moonx) && !isNaN(moondata.moony)) {
            img.setAttribute("src", "images/borderedmoon.png");
            placeImage(img, x, moondata.moony * jupRadius + halfheight);
            if (moondata.farside)
                img.style.zIndex = 1;
            else
                img.style.zIndex = 100;

            // Place the label too:
            if (label)
                placeImage(label, x);

            if (eclipselabel)
                eclipselabel.style.visibility = "hidden";
        } else {
            if (img)
                img.style.visibility = "hidden";
            if (label)
                label.style.visibility = "hidden";
            if (eclipselabel)
                eclipselabel.style.visibility = "hidden";
        }
    }

}

function array_mean(elmt){
    var sum = 0;
    for( var i = 0; i < elmt.length; i++ ){
        sum += elmt[i];
    }

    var avg = sum / elmt.length;
    return avg;
}

function array_max(elmt){
    var amax = -1e30;
    for( var i = 0; i < elmt.length; i++ ){
        if(elmt[i] > amax) amax = elmt[i];
    }
    if (amax==-1e30) amax = NaN;
    return amax;
}
function array_min(elmt){
    var amin = 1e30;
    for( var i = 0; i < elmt.length; i++ ){
        if(elmt[i] < amin) amin = elmt[i];
    }
    if (amin==1e30) amin = NaN;
    return amin;
}

function make_plot() {

    var start_time = observation_dates[0].getTime();
    for (var moon = 0; moon < moons.length; moon++) {
        var x = [];
        var y = [];
        for (var i = 0; i < observations.length; i++) {
            var cell = cell_for_moon_obs(moon, i);
            var v = parseFloat(cell.innerHTML);
            if (!isNaN(v)) {
                var dt = observation_dates[i].getTime() - start_time; // milliseconds
                dt /= (1000 * 60 * 60 * 24);
                x.push(dt);
                y.push(v);
            }
        }


        var layout = {
            title: moons[moon],
            font: {
                size: 16
            },
            legend: {
                font: {
                    size: 16
                }
            },
            hovermode: false,
            width: 800,
            hwight: 600,
            xaxis: {
                title: 'Time / days',
                range: [0, baselines[moon]],
                ticks: 'inside',
                showline: true,
            },
            yaxis: {
                title: 'Distance / pixels',
                ticks: 'inside',
                range: [0, null]
            },
        };
        var m = {
            x: x,
            y: y,
            mode: 'markers',
            type: 'scatter'
        }
        Plotly.newPlot(moons[moon] + "-plot", [m], layout, width = 800, height = 600);
    }

    for (hr of document.getElementsByClassName("plotsep")){
        hr.style.display = "block";
    }

}

function fit_sine(t, y_obs, A_0, B_0, C_0, w_0){

    var n = t.length;

    function residuals(beta){
        var r = [];
        for (var i = 0; i < n; i++){
            var r_i = (beta[0] * Math.sin(beta[3] * t[i]) 
                     + beta[1] * Math.cos(beta[3] * t[i]) 
                     + beta[2] 
                     - y_obs[i]);
            r.push(r_i);
        }
        return math.matrix(r);
    }

    function jacobian(beta){
        var J = [];
        for (var i = 0; i < n; i++){
            s = Math.sin(beta[3] * t[i]);
            c = Math.cos(beta[3] * t[i]);
            var j = [c, s, 1, -beta[0] * t[i] * s + beta[1] * t[i] * beta[2]];
            J.push(j);
        }     
        return math.matrix(J);   
    }

    var iterations = 20;
    var beta = [A_0, B_0, C_0, w_0];

    for (var i = 0; i < iterations; i++) {
        var r = residuals(beta); // 13
        var J = jacobian(beta);  // 13 x 4
        var JT = math.transpose(J);
        var P = math.multiply(
            math.inv(math.multiply(JT, J)),
                JT);
        // console.log(P);
        beta = math.multiply(P, r);
        console.log(beta);
    }


}