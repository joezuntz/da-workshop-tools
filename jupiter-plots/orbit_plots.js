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


function make_plot() {

    var moon_radii = [];
    var moon_periods = [];
    var names = ["io", "europa", "ganymede", "callisto"];

    for (var i = 0; i < names.length; i++) {
        var r = document.getElementById(names[i] + "-r").value;
        var T = document.getElementById(names[i] + "-T").value;
        var rn = parseFloat(r);
        var Tn = parseFloat(T);
        if (~(isNaN(rn) | isNaN(rn))){
            moon_radii.push(rn);
            moon_periods.push(Tn);
        }
    }



    var trace1 = {
        name: "Planets",
        type: "scatter",
        x: planet_radii,
        y: planet_periods,
    };
    var trace2 = {
        name: "Gallilean Moons",
        type: "scatter",
        x: moon_radii,
        y: moon_periods,
    };

    var layout = {
        width: 800,
        hovermode: false,
        hwight: 600,
        xaxis: {
            ticks: 'inside',
            showline: true,
            type: 'log',
            tickvals: [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0],
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
            title: {
                text: "Period / days",
                font: {
                    size: 18,
                }
            },
        }
    };

    var data = [trace1, trace2];

    Plotly.newPlot('my_plot', data, layout, width = 800, height = 600);

}
