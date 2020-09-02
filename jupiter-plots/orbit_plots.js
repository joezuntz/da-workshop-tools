planets = [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
];

planet_periods = [
    87.97,
    224.70,
    365.26,
    686.98,
    4332.82,
    10755.70,
    30687.15,
    60190.03,
]; // in days

planet_radii = [
    0.3871,
    0.7233,
    1.000,
    1.5273,
    5.2028,
    9.5388,
    19.1914,
    30.0611,
]; // in AU



function make_log_ticks(log_min, log_max) {
    ticks = [];
    tick_labels = [];
    for (var j = log_min; j < log_max; j++) {
        for (var i = 1; i < 10; i++) {
            var v = i * Math.pow(10, j);
            ticks.push(v);
            if (i == 2 || i == 5 || i == 1) {
                tick_labels.push(v);
            } else {
                tick_labels.push("");
            }
        }

    }
    return [ticks, tick_labels];
}

tmp = make_log_ticks(-3, 2);
xticks = tmp[0];
xtick_labels = tmp[1]

tmp = make_log_ticks(0, 5);
yticks = tmp[0];
ytick_labels = tmp[1]


function array_mean(elmt) {
    var sum = 0;
    for (var i = 0; i < elmt.length; i++) {
        sum += elmt[i];
    }

    var avg = sum / elmt.length;
    return avg;
}


// fit y = A x**B
function log_fit_data(x, y) {
    if (x.length < 3) {
        return [NaN, NaN];
    }

    var log_x = [];
    var log_y = [];
    for (var i = 0; i < x.length; i++) {
        log_x.push(Math.log(x[i]));
        log_y.push(Math.log(y[i]));
    }

    xbar = array_mean(log_x);
    ybar = array_mean(log_y);

    var b1 = 0.0;
    var b2 = 0.0;

    for (var i = 0; i < x.length; i++) {
        b1 += (log_x[i] - xbar) * (log_y[i] - ybar);
        b2 += (log_x[i] - xbar) * (log_x[i] - xbar);
    }
    b = b1 / b2;
    a = ybar - b * xbar;

    return [b, Math.exp(a)];
}


function make_plot() {

    var moon_radii = [];
    var moon_periods = [];
    var names = ["io", "europa", "ganymede", "callisto"];

    for (var i = 0; i < names.length; i++) {
        var r = document.getElementById(names[i] + "-r").value;
        var T = document.getElementById(names[i] + "-T").value;
        var rn = parseFloat(r);
        var Tn = parseFloat(T);
        if (~(isNaN(rn) | isNaN(rn))) {
            moon_radii.push(rn);
            moon_periods.push(Tn);
        }
    }

    moons_fit = log_fit_data(moon_radii, moon_periods);
    planets_fit = log_fit_data(planet_radii, planet_periods);

    function fit_moon(x) {
        return moons_fit[1] * Math.pow(x, moons_fit[0]);
    }

    function fit_planet(x) {
        return planets_fit[1] * Math.pow(x, planets_fit[0]);
    }


    var trace1 = {
        name: "Planets",
        type: "scatter",
        x: planet_radii,
        y: planet_periods,
        mode: "markers",
    };
    var trace2 = {
        name: "Gallilean Moons",
        type: "scatter",
        x: moon_radii,
        y: moon_periods,
        mode: "markers",
    };

    var trace3 = {
        name: "Planets Line Fit",
        type: "scatter",
        x: [0.1, 32],
        y: [fit_planet(0.1), fit_planet(32)],
        mode: "lines",
    };

    var data = [trace1, trace2, trace3];

    if (!isNaN(moons_fit[0])) {
        data.push({
            name: "Moons Line Fit",
            type: "scatter",
            x: [0.001, 0.1],
            y: [fit_moon(0.001), fit_moon(0.1)],
            mode: "lines",
        });
    }


    var layout = {
        width: 800,
        hovermode: false,
        hwight: 1000,
        xaxis: {
            ticks: 'inside',
            showline: true,
            type: 'log',
            tickvals: xticks,
            ticktext: xtick_labels,
            title: {
                text: 'Semi-major axis / AU',
                font: {
                    size: 18,
                }
            },
        },
        yaxis: {
            ticks: 'inside',
            showline: true,
            tickvals: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
            // ticktext: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000],
            type: 'log',
            tickvals: yticks,
            ticktext: ytick_labels,
            title: {
                text: "Period / days",
                font: {
                    size: 18,
                }
            },
        }
    };


    Plotly.newPlot('my_plot', data, layout, width = 800, height = 1000);

}
