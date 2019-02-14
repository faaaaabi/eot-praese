var pongCanvas;
var pongCanvasContext;
var ballX = 70;
var ballY = 70;
var ballSpeedX = 10;
var ballSpeedY = 8;
var NetActivate = false;
var mouseY_save;
var record = false;
var TrainRecords = [];
var net;

var paddle1Y = 250;
const PADDLE_HEIGHT = 100;

function calculateMousePos(evt) {
    var rect = pongCanvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = (evt.clientX - rect.left)/Reveal.getScale() - root.scrollLeft;
    var mouseY = (evt.clientY - rect.top)/Reveal.getScale() - root.scrollTop;
    mouseY_save = mouseY;
    return {
        x: mouseX,
        y: mouseY
    };
}


window.onload = function () {

        pongCanvas = document.getElementById('pongCanvas');
        pongCanvasContext = pongCanvas.getContext('2d');

        $(document).bind('keypress', function(e) {var code = e.keyCode || e.which;
            if(code == 13) {
                if (!record) {
                    record = true;
                    $('#trainIndicator').html("AN");
                }else {
                    record = false;
                    $('#trainIndicator').html("AUS");
                    trainNetWork();
                }
                console.log("train");
            }
            if(code == 8) {
                if (!NetActivate){
                    console.log('backslash');
                    NetActivate = true;
                    $('#activeIndicator').html("AN");
                } else {
                    NetActivate = false;
                    $('#activeIndicator').html("AUS");
                }
            }
        });

        drawEverything();
        var interval;

        var framesPerSecond = 30;
        $('#pongStart').bind('click', function () {
        interval= setInterval(function () {
            moveEverything();
            drawEverything();
            if (NetActivate) {
                ActivateNetWork();
            }
        }, 1000 / framesPerSecond);
        });

        $('#pongStop').bind('click', function () {
            clearInterval(interval);
        })

        setInterval(function () {
            if (record) {
                collectTrainingData()
            }

        }, 50);

        pongCanvas.addEventListener('mousemove',
            function (evt) {
                var mousePos = calculateMousePos(evt);
                paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2);
            });

}

function moveEverything() {
    ballX = ballX + ballSpeedX;
    ballY = ballY + ballSpeedY;

    if (ballX < 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballX > pongCanvas.width) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }
    if (ballY > pongCanvas.height) {
        ballSpeedY = -ballSpeedY;
    }
}

function drawEverything() {
    // next line blanks out the screen with black
    colorRect(0, 0, pongCanvas.width, pongCanvas.height, '#3a5b63');

    if (NetActivate) {
        colorRect(0, Math.round(ActivateNetWork()) , 10, PADDLE_HEIGHT, 'white');
    }else {
        colorRect(0, paddle1Y , 10, PADDLE_HEIGHT, 'white');
    }
    // this is left player paddle

    //console.log(paddle1Y);

    // next line draws the ball
    colorCircle(ballX, ballY, 10, 'white');
}

function colorCircle(centerX, centerY, radius, drawColor) {
    pongCanvasContext.fillStyle = drawColor;
    pongCanvasContext.beginPath();
    pongCanvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    pongCanvasContext.fill();
}

function colorRect(leftX, topY, width, height, drawColor) {
    pongCanvasContext.fillStyle = drawColor;
    pongCanvasContext.fillRect(leftX, topY, width, height);
}

net = new brain.NeuralNetwork({
    hiddenLayers: [3,2],
    learningRate: 0.6 // global learning rate, useful when training using streams
});

net.train({input: [400/600,200/400], output: [100/400]});

function collectTrainingData() {
    console.log("cllecting data");
    TrainRecords.push({input: [ballX/600,ballY/400], output: [mouseY_save/400]});
    $('#trainIndicator').html("AN <p>Trainings-<br>Samples:</p> "+ TrainRecords.length);
}

function trainNetWork() {
    console.log("training net");
    net.train(TrainRecords);
}

function ActivateNetWork() {
    var activation = net.run([ballX/600,ballY/400])*400;
    $('#activeIndicator').html("y-Pos: "+Math.round(activation.toString()));
    return activation;
}