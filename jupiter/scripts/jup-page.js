/* -*- Mode: Javascript; js-indent-level: 2; indent-tabs-mode: nil; -*- */

// Javascript code to display Jupiter, its moons and their shadows.
// Adapted by Joe Zuntz, 2020

var jup = null;
var active_date = null;
var active_button = null;
var active_moon = null;
var active_cell = null;
const num_days = 14;

const moons = ["Io", "Europa", "Ganymede", "Callisto"]

window.onload = function() {

    jup = new Jupiter();
    active_button = document.getElementById("Sep1");
    active_button.style.background = "#aaffaa";

    // Initial date is Sep 1
    active_date = new Date(1598918400000);
    set_highlighted_moon(0);

    // draw the initial image
    update_image();

    // Listen for clicks on the main image
    document.getElementById("jupframe").addEventListener("click", click_frame);

    var tab = document.getElementById("moon_table");
    for (var col = 1; col <= 4; col++) {
        for (var row = 1; row <= 14; row++) {
            var value = localStorage.getItem(`cell-${row}-${col}`);
            tab.rows[row].cells[col].innerHTML = value;
        }
    }


    //
    // var sliders = document.getElementsByClassName("slider");
    // console.log(sliders);
    // for (var slider of sliders) {
    //     console.log(slider.id);
    // }    
}


function click_frame(event) {

    var div = document.getElementById("jupframe");
    var x0 = div.offsetLeft;
    var y0 = div.offsetTop;

    var x = event.pageX - x0;
    var y = event.pageY - y0;


    // save the coordinates
    if (active_cell) {
        active_cell.innerHTML = x;
    }


    // Jump to the next moon
    set_highlighted_moon((active_moon + 1) % moons.length);
}

function set_active_cell_value(value) {
    if (!active_cell) {
        return;
    }

    active_cell.innerHTML = value;
    var col = active_cell.cellIndex;
    var row = active_cell.parentElement.rowIndex;
    localStorage.setItem(`cell-${row}-${col}`, value);

}

function click_not_visible() {

    if (active_cell) {
        active_cell.innerHTML = "-";
    }

    set_highlighted_moon((active_moon + 1) % moons.length);

}

function set_highlighted_moon(moon) {
    active_moon = moon;
    document.getElementById("active_moon").innerHTML = moons[moon];
    var day = parseInt(active_button.id.substring(3)) - 1;

    if (active_cell) {
        active_cell.style.backgroundColor = "";
    }

    // highlight the corresponding cell in the 
    var row = parseInt(active_button.id.substring(3));
    var col = active_moon + 1;
    active_cell = document.getElementById("moon_table").rows[row].cells[col];
    active_cell.style.backgroundColor = "#aaffaa";



}

function click_date_button(button) {

    // Unset the previous button colour
    if (active_button) {
        active_button.style.background = null;
    }
    // Set the new button colour
    active_button = button;
    active_button.style.background = "#aaffaa";

    // Set the date to use
    var d = new Date(1598918400000);
    var day = parseInt(button.id.substring(3)) - 1;
    d.setDate(d.getDate() + day);
    active_date = d;

    // Redraw the image
    update_image();

    // Set the text

    // Highlight Io
    set_highlighted_moon(0);
}


function set_date() {
    active_date = new Date();

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
    if (!active_date) {
        return;
    }

    drawJupiter(jup, active_date);
}

window.onresize = update_image;


// Animate:
var animating = false;
var animateTime = 100; // default msec delay between steps
var stepMinutes = 10; // default time to advance in each step



function drawJupiter(jup, date) {
    jup.setDate(date);

    var width = screenWidth();
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


    for (var moon = 0; moon < moons.length; moon++) {
        var x = [];
        var y = [];
        for (var day = 1; day <= num_days; day++) {
            var cell = document.getElementById("moon_table").rows[day].cells[moon + 1];
            var v = parseFloat(cell.innerHTML);
            if (!isNaN(v)) {
                x.push(day - 1);
                y.push(v);
            }
        }

        // if (moon == 0) {
        //     var A_guess = 0.25 * (array_max(y) - array_min(y))
        //     var B_guess = A_guess;
        //     var C_guess = array_mean(y);
        //     var w_guess = 5.0
        //     var scale = A_guess
        //     var offset = C_guess;
        //     var y_tmp = [];
        //     for (var i = 0; i < y.size; i++){
        //         y_tmp.push((y[i] - offset) / scale);
        //     }
        //     fit_sine(x, y, A_guess, B_guess, C_guess, w_guess);
        // }

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
                range: [0, 15],
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
        console.log(hr);
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
    console.log(beta);
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