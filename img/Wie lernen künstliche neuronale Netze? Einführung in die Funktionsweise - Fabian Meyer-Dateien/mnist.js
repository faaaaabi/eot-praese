/*
 * Canvas Drawing
 */
$(window).bind("load", function() {
    canvas = document.getElementById("digitCanvas");
    var brush = new Image();
    brush.onload = ready;
    brush.src = "img/HsbVA.png";

    function ready() {
        var c = canvas,
            ctx = c.getContext("2d"),
            isDown = false, px, py,
            bw = this.width, bh = this.height;

        c.onmousedown = c.ontouchstart = function(e) {
            isDown = true;
            var pos = getPos(e);
            px = pos.x;
            py = pos.y;
        };

        window.onmousemove = window.ontouchmove = function(e) {
            if (isDown) draw(e);
        };

        window.onmouseup = window.ontouchend = function(e) {
            e.preventDefault();
            isDown = false
        };

        function getPos(e) {
            e.preventDefault();
            if (e.touches) e = e.touches[0];
            return {
                x: (e.clientX - $(c).offset().left)/Reveal.getScale(),
                y: (e.clientY - $(c).offset().top)/Reveal.getScale()
            }
        }

        function draw(e) {
            var pos = getPos(e);
            brushLine(ctx, px, py, pos.x, pos.y);
            px = pos.x;
            py = pos.y;
        }

        function brushLine(ctx, x1, y1, x2, y2) {

            var diffX = Math.abs(x2 - x1),
                diffY = Math.abs(y2 - y1),
                dist = Math.sqrt(diffX * diffX + diffY * diffY),
                step = bw / (dist ? dist : 1),
                i = 0,
                t = 0,
                b, x, y;

            while (i <= dist) {
                t = Math.max(0, Math.min(1, i / dist));
                x = x1 + (x2 - x1) * t;
                y = y1 + (y2 - y1) * t;
                b = (Math.random() * 3) | 0;
                ctx.drawImage(brush, x - bw * 0.5, y - bh * 0.5);
                i += step
            }
        }
    }

})

function predict() {
    var canvas = document.getElementById('digitCanvas');
    var context = canvas.getContext("2d");

    var tempCanvas = document.createElement("canvas");
    tCtx = tempCanvas.getContext("2d");

    // Canvas mit Zielgröße
    tempCanvas.width = 28;
    tempCanvas.height = 28;

    // Inhalt der Ursprungscanvas skaliert in die Zielcanvas malen
    tCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height,
        0, 0,      28,           28);


    // Pixedaten abrufen
    var scaledCanvas = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.width);
    var pixel = scaledCanvas.data
    var ScaledDataOneChannel = new Array(new Array);

    //console.log(pixel)

    // Einen Farbkanal extrahieren
    for (var i = 0, p = 0, n = pixel.length; i < n; i += 4) {
        itemp = i;
        if (i - itemp == 0) {
            itemp = i;
            // Invertieren und Semi-Normalisieren
            if (pixel[i] == 255) {
                pixel[i] = Math.random() * (255 - 200) + 200;
            }
            ScaledDataOneChannel[0][p] = (pixel[i]) / 255;
            p++
        }
    }

    //console.log(ScaledDataOneChannel);

    // Request zum Neuronalen Netz
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(ScaledDataOneChannel),
        dataType: 'json',
        success: function(data){
            console.log("Pixelwerte wurden zum Netz geschickt");
            console.log("Erkannte Zahl: " +indexOfMax(data));
            $('#predictedDigit').text(indexOfMax(data));
            $('#digitPredictions').html(data.join("<br>"))
        },
        error: function(){
            console.log("Fehler beim Versenden der Pixelwerte");
        },
        processData: false,
        type: 'POST',
        url: 'http://localhost:8081'
    });
}

// Funktion um den Index des Array mit dem höchsten WErt zu bekommen
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}