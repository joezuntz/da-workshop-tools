const max_lines = 6;
const line_length = 5; // degrees
window.onload = function() {
    document.getElementById("ra1").value = "15 43 45";
    document.getElementById("dec1").value = "-20 35 00";
    document.getElementById("ang1").value = "10";


};

function parseRightAscension(text) {
    var bits = text.split(" ");
    if (bits.length != 3) {
        return NaN;
    }
    var HH = parseFloat(bits[0]);
    var MM = parseFloat(bits[1]);
    var SS = parseFloat(bits[2])
    var hours = HH + MM / 60.0 + SS / 3600.0;
    return hours * 360.0 / 24.0;
}

function parseDeclination(text) {
    var bits = text.split(" ");
    if (bits.length != 3) {
        return NaN;
    }
    var DD = parseFloat(bits[0]);
    var MM = parseFloat(bits[1]);
    var SS = parseFloat(bits[2]);
    var sgn = Math.sign(DD);
    return DD + (sgn * MM / 60.0) + (sgn * SS / 3600.0);
}

function ecliptic_to_equatorial(ecl) {
    const radeg = 180 / Math.PI;
    const degra = Math.PI / 180;
    var beta = ecl[0] * degra; // lat
    var lambda = ecl[1] * degra; // lon
    const epsilon = 23.4 * degra; // obliquity

    sin_e = Math.sin(epsilon);
    cos_e = Math.cos(epsilon);

    var ra = Math.atan2(cos_e * Math.sin(lambda) - sin_e * Math.tan(beta), Math.cos(lambda));
    var dec = Math.asin(cos_e * Math.sin(beta) + sin_e * Math.cos(beta) * Math.sin(lambda));

    return [ra * radeg, dec * radeg];
}

function get_comet_json() {
    var lines = [];


    var comets = [];

    for (var i = 1; i <= max_lines; i++) {
        var ra = parseRightAscension(document.getElementById(`ra${i}`).value.trim());
        var dec = parseDeclination(document.getElementById(`dec${i}`).value.trim());
        var ang = parseFloat(document.getElementById(`ang${i}`).value.trim());
            console.log(i + "  " + (ra) + "  " + (dec) + "  " + (ang) );

        if (isNaN(ra) || isNaN(dec) || isNaN(ang)) {
            continue;
        }

        ang *= Math.PI / 180.;

        var start = [ra + line_length * Math.cos(ang), dec - line_length * Math.sin(ang)];
        var end = [ra - line_length * Math.cos(ang), dec + line_length * Math.sin(ang)];


        var track = make_single_line(
            start,
            end,
            10,
            "Comet" + i.toString()
        );

        comets.push(track);

    }


    var line_data = {
        "type": "FeatureCollection",
        "features": comets,
    };
    return line_data;

}


function make_single_line(start_point, end_point, n, name) {
    var x0 = start_point[0];
    var y0 = start_point[1];
    var x1 = end_point[0];
    var y1 = end_point[1];

    var dx = (x1 - x0) / (n - 1);
    var dy = (y1 - y0) / (n - 1);

    var coordinates = [];
    for (var i = 0; i < n; i++) {
        var c = [x0 + dx * i, y0 + dy * i]
        coordinates.push(c);
    }

    var obj = {
        "type": "Feature",
        "id": name,
        "properties": {
            // Name
            "n": "",
            // Location of name text on the map
            "loc": start_point,
        },
        "geometry": {
            // the line object as an array of point coordinates, 
            // always as [ra -180..180 degrees, dec -90..90 degrees]
            "type": "MultiLineString",
            "coordinates": [coordinates]
        }
    };
    return obj;
}

function which_projection(){

    if (document.getElementById("aitoff").checked){
        return 'aitoff';
    }
    else if (document.getElementById("mercator").checked){
        return 'mercator';
    }
    else if (document.getElementById("orthographic").checked){
        return 'orthographic';
    }
    else{
        return 'robinson';
    }
}

function plot_comets() {

    Celestial.clear();

    var proj = document.querySelector('input[name="proj"]:checked').value.toLowerCase();

    // Some prettifying styles
    var config = {
        projection: proj,
        transform: "equatorial",
        // Pixel width
        width: 600,
        // path to local data
        datapath: "data/",
        // adjust Milky Way opacity
        mw: {
            style: {
                fill: "#ffffff",
                opacity: 0.3
            }
        },
        // Switch off constellations
        constellations: {
            names: false,
            lines: false,
        },
        stars: {
            show: false,
        },
        // Switch off deep-space objects
        dsos: {
            show: false,
        },
        // Switch off ecliptic plane line
        lines: {
            ecliptic: {
                show: false,
            },
        }

    };

    // Asterisms canvas style properties for lines and text
    var lineStyle = {
            stroke: "#f00",
            fill: "#f00",
            width: 2
        },
        textStyle = {
            fill: "#f00",
            font: "15px Helvetica, Arial, sans-serif",
            align: "center",
            baseline: "middle"
        };


    var jsonLine = get_comet_json();


    if (jsonLine == null) {
        return;
    }



    Celestial.add({
        type: "line",

        callback: function(error, json) {

            if (error) return console.warn(error);
            // Load the geoJSON file and transform to correct coordinate system, if necessary
            var asterism = Celestial.getData(jsonLine, config.transform);

            // Add to celestial objects container in d3
            Celestial.container.selectAll(".asterisms")
                .data(asterism.features)
                .enter().append("path")
                .attr("class", "ast");
            // Trigger redraw to display changes
            Celestial.redraw();
        },

        redraw: function() {

            // Select the added objects by class name as given previously
            Celestial.container.selectAll(".ast").each(function(d) {
                // Set line styles
                Celestial.setStyle(lineStyle);
                // Project objects on map
                Celestial.map(d);
                // draw on canvas
                Celestial.context.fill();
                Celestial.context.stroke();

                // If point is visible (this doesn't work automatically for points)
                if (Celestial.clip(d.properties.loc)) {
                    // get point coordinates
                    pt = Celestial.mapProjection(d.properties.loc);
                    // Set text styles
                    Celestial.setTextStyle(textStyle);
                    // and draw text on canvas
                    Celestial.context.fillText(d.properties.n, pt[0], pt[1]);
                }
            });
        }
    });


    Celestial.display(config);
}