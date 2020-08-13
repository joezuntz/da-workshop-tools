window.onload = function() {
    // Pre-fill wth example
    var prefill = `-24.61  -94.48  -24.67  -90.66
24.49  92.10  24.39  95.93
-14.02  -140.51  -15.27  -136.37
-18.40  -110.94  -18.95  -106.38
17.78  35.82  18.90  39.38
-18.24  -78.20  -17.81  -73.54
28.10  90.71  27.97  96.55
-10.51  -29.84  -8.41  -24.21
18.26  103.92  17.54  110.32
-19.03  -57.27  -17.85  -51.98
3.22  13.89  5.00  18.21
-22.35  -75.16  -21.90  -70.98
22.64  96.50  22.36  101.36
25.45  96.96  25.14  102.16
-10.52  -15.84  -8.27  -10.40
16.73  49.89  17.92  54.88
21.50  52.59  22.41  56.74
-12.48  -28.30  -10.84  -23.90
-5.19  0.10  -3.10  4.93
-12.39  -156.06  -13.64  -152.71


`;
    document.getElementById("comet-box").value = prefill;

};


function ecliptic_to_equatorial(ecl){
    const radeg =  180 / Math.PI;
    const degra = Math.PI / 180;
    var beta = ecl[ 0] * degra; // lat
    var lambda = ecl[1] * degra; // lon
    const epsilon = 23.4 * degra;// obliquity

    sin_e = Math.sin(epsilon);
    cos_e = Math.cos(epsilon);

    var ra = Math.atan2(cos_e * Math.sin(lambda) - sin_e * Math.tan(beta), Math.cos(lambda));
    var dec = Math.asin(cos_e * Math.sin(beta) + sin_e * Math.cos(beta) * Math.sin(lambda));

    return [ra * radeg, dec * radeg];
}

function get_comet_json(){
    var lines = [];

    var text = document.getElementById('comet-box').value;

    // split into lines
    var lines = text.split(/\r?\n/);

    var comets = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line){
            continue;
        }
        // split into items
        var elements = line.split(/\s+/);

        // Check three are four elements on the line
        if (elements.length != 4){
            alert("Line " + (i + 1) + " does not have four space-separated numbers (wrong size)");
            return null;
        }

        // convert to floats. I miss python.
        var coords = [];
        for (var j = 0; j < elements.length; j++) {
            var a = parseFloat(elements[j]);
            if (isNaN(a)){
                alert("Line " + (j + 1) + " does not have four space-separated numbers (not numbers)");
                return null;
            }
            coords.push(a);
        }


        var track = make_single_line(
            [coords[1], coords[0]],
            [coords[3], coords[2]], 
            10, 
            "Comet"+i.toString());
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
        datapath: "d3-celestial/data/",
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


    if (jsonLine == null){
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