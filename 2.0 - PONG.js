window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var canvas2d = document.getElementById("hud");
    var hud = canvas2d.getContext("2d");
    hud.clearRect(0, 0, 512, 512);
    function displayScore(hud)
    {
        hud.font = '20px "Century Gothic"'; 
        hud.fillStyle = 'White';
        hud.textAlign = "right";
        hud.fillText('' + player1Score, 20, 290);
        hud.fillText('' + player2Score, 20, 238);
    }

    function displayPlayerNames(hud)
    {
        // hud.save();
        // hud.rotate( 3 * Math.PI / 2);
        // hud.translate(canvas.width - 1, 0);
        hud.font = '20px "Century Gothic"'; 
        hud.fillStyle = 'White';
        hud.textAlign = "right";
        hud.fillText('Player 1', 500, 290);
        hud.fillText('Player 2', 500, 238);
        // hud.restore();
    }

    function displayControlBars(hud)
    {
        hud.font = '20px "Century Gothic"'; 
        hud.fillStyle = 'White';
        hud.textAlign = "center";
        hud.fillText('<- A Key | D Key ->', 256, 110);
        hud.fillText('<- LeftArrow | RightArrow ->', 256, 412);
    }

    function displayIntroText(hud, TextSize)
    {
        hud.font = `${TextSize}px "Century Gothic"`; 
        hud.fillStyle = 'White';
        hud.textAlign = "center";
        // hud.fillText('Press spacebar to play', 256, 170);
        hud.fillText('Press spacebar to play', 256, 342);
        // hud.font = ` 30px "Century Gothic"`; 
        hud.fillStyle = 'White';
        hud.fillText('Score 7 points to win!', 256, 170);
    }

    function displaySpacebarContinueText(hud, TextSize)
    {
        hud.font = ` 20px "Century Gothic"`; 
        hud.fillStyle = 'White';
        hud.textAlign = "center";
        hud.fillText('Press spacebar to continue', 256, 170);
        hud.fillText('Press spacebar to continue', 256, 342);
    }

    function displayScoringPlayer(hud, player)
    {
        
        hud.textAlign = "center";
        if (winnerPlayer == 1) {
            hud.font = `30px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText("PLAYER 1 WINS!!!", 256, 385);
        }
        else if (winnerPlayer == 2) {
            hud.font = `30px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText("PLAYER 2 WINS!!!", 256, 137);
        }
        else if (player == 1) {
            hud.font = `30px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText("PLAYER 1 SCORES!!!", 256, 385);
            hud.font = `20px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText('Press spacebar to continue', 256, 150);
        }
        else if(player == 2){
            hud.font = `30px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText("PLAYER 2 SCORES!!!", 256, 137);
            hud.font = `20px "Century Gothic"`; 
            hud.fillStyle = 'White';
            hud.fillText('Press spacebar to continue', 256, 362);
        }
        
    }

    function displayFinalWriting(hud)
    {
        hud.font = `30px "Century Gothic"`; 
        hud.fillStyle = 'White';
        hud.fillText("Play again?", 256, 265);
    }
    


    var maxPoints = 2000;

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxPoints * sizeof['vec2'], gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxPoints * sizeof['vec4'], gl.STATIC_DRAW);
    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    //Common vectore operation funcctions
    function lengthVec2(vec)
    {
        return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
    }
    function distVec2(vect1, vect2)
    {
        return vec2(vect1[0] - vect2[0], vect1[1] - vect2[1]);
    }
    function normVec2(vectDist)
    {
        return vec2(vectDist[0] / lengthVec2(vectDist), vectDist[1] / lengthVec2(vectDist));
    }
    function dotVec2(vect1, vect2)
    {
        return vect1[0] * vect2[0] + vect1[1] * vect2[1];
    }
    function multValueVec2(value, vect2)
    {
        return vec2(value * vect2[0], value * vect2[1])
    }

    var index = 0; 
    var numPoints = 0;

    const rectX = 0.4;
    const rectY = 0.20;
    const rectWidth = 0.8;
    const rectHeight = 0.4;

    //Draw the rectangle in which you want to write the text that the game has stopped and you wish to restart
    // function displayStoppedWriting(hud)
    // {
    //     hud.font = '20px "Century Gothic"'; 
    //     hud.fillStyle = 'Black';
    //     let text = `Player ${HitBar} scores`;
    //     hud.fillText(text, 256, 290);
    // }

    function drawFinalRect()
    {
        let rectVertices = [ vec2(rectX, rectY), vec2(rectX, rectY - rectHeight), vec2(rectX - rectWidth, rectY),
                             vec2(rectX - rectWidth, rectY), vec2(rectX - rectWidth, rectY - rectHeight), vec2(rectX, rectY - rectHeight)];
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(rectVertices));

        let rectColors = []
        for (let i = 0; i < rectVertices.length; i++) {
            rectColors.push(vec4(0, 0, 0, 1.0));
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(rectColors));

        index += 6;
        numPoints += 6;
        // displayFinalWriting(hud);
    }

    const lineWidth = 0.1; 
    const lineDispl = 0.25;
    const lineStartXPoint = -0.925
    var linesColor = [vec4(1.0, 1.0, 1.0, 1.0)];
    function drawMiddleLines()
    {
        let middleLinesVertices = [];
        let index_count = 0;
        for (let i = 0; i < 8; i++) {
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl, 0.005));
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl + lineWidth, 0.005));
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl, -0.005));
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl, -0.005));
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl + lineWidth, -0.005));
            middleLinesVertices.push(vec2(lineStartXPoint + i * lineDispl + lineWidth, 0.005));
            linesColor.push(linesColor[0],linesColor[0],linesColor[0],linesColor[0],linesColor[0],linesColor[0]);
            index_count++;
        }
        linesColor.pop();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(middleLinesVertices));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(linesColor));
        index += 6 * (index_count);
        numPoints += 6 * (index_count);
        linesColor = [vec4(1.0, 1.0, 1.0, 1.0)];
    }

    const spikeHeight = 0.10;
    const spikeDispl = 0.1;
    var spikeX = -1.25;
    var spikeX2 = -1.25;
    const spikeY = 1;
    const spikeY2 = -1;
    var spikeColors = [vec4(1.0, 1.0, 1.0, 1.0)];

    function drawSpikes()
    {
        let spikesVertices = [];
        let temp_spikeHeight = spikeHeight;
        for (var i = 0; i < 26; i++) {
            if(i % 2 == 0)
            {
                temp_spikeHeight = spikeHeight / 2;
                // temp_spikeHeight = spikeHeight / 3 + Math.random() / 8;
            }
            else
            {

                temp_spikeHeight = spikeHeight;
                // temp_spikeHeight = spikeHeight / 2 + Math.random() / 8;
            }
            spikesVertices.push(vec2(spikeX + i * spikeDispl, spikeY));
            spikesVertices.push(vec2(spikeX + i * spikeDispl + spikeDispl / 2, spikeY - temp_spikeHeight));
            spikesVertices.push(vec2(spikeX + i * spikeDispl + spikeDispl, spikeY));
            spikeColors.push(spikeColors[0], spikeColors[0], spikeColors[0]);

            spikesVertices.push(vec2(spikeX2 + i * spikeDispl, spikeY2));
            spikesVertices.push(vec2(spikeX2 + i * spikeDispl + spikeDispl / 2, spikeY2 + temp_spikeHeight));
            spikesVertices.push(vec2(spikeX2 + i * spikeDispl + spikeDispl, spikeY2));
            spikeColors.push(spikeColors[0], spikeColors[0], spikeColors[0]);
        }
        spikeColors.pop();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(spikesVertices));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(spikeColors));
        index += 6 * (i);
        numPoints += 6 * (i);
        spikeColors = [vec4(1.0, 1.0, 1.0, 1.0)];
    }

    var barX = 0.25;
    var barY = -0.75;
    var bar2X = 0.25;
    var bar2Y = 0.75;
    const barWidth = 0.5;
    const barHeight = 0.05

    //Reset the bars/paddle default values when restarting the game
    function setBarValuesDefault()
    {
        barX = 0.25;
        barY = -0.75;
        bar2X = 0.25;
        bar2Y = 0.75;
    }

    //Function to draw the two bars/paddles that the players control
    function drawBars()
    {
        let barVertices = [ vec2(barX - barWidth, barY), vec2(barX - barWidth, barY + barHeight), vec2(barX, barY), 
                            vec2(barX, barY), vec2(barX - barWidth, barY + barHeight), vec2(barX, barY + barHeight),
                            vec2(bar2X - barWidth, bar2Y), vec2(bar2X - barWidth, bar2Y - barHeight), vec2(bar2X, bar2Y), 
                            vec2(bar2X, bar2Y), vec2(bar2X - barWidth, bar2Y - barHeight), vec2(bar2X, bar2Y - barHeight)];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(barVertices));
        
        let barColors = []
        for (let i = 0; i < barVertices.length; i++) {
            barColors.push(vec4(1, 1, 1, 1.0));
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(barColors));

        index += 12;
        numPoints += 12;
    }

    var player1Score = 0;
    var player2Score = 0;
    var stopGame = false;
    var HitBar = 1;

    const ballRadius = 0.05;
    const ballNumVertices = 50;
    var ballVertices = [vec2(0.0, 0.0)];
    var center = vec2(0.0, 0.0);
    var random_point = vec2(0.1, -0.3);
    var vectDistance = distVec2(center, random_point);
    var vectDirection = vec2(normVec2(vectDistance));
    var ballColors = [vec4(1.0, 1.0, 1.0, 1.0)];
    const ballSpeed = 0.05;

    // Function to quickly get the new reflected direction. Add in a random
    // x-factor to make the ball be a bit more unpredictable. The direction
    // of randomization depends on the last movement of the bar resembling
    // its inertia transferring to the ball
    function getReflectDirection(normal, HitBar)
    {
        let dot1 = dot(negate(vectDirection), normal);
        let mult_vec = multValueVec2(2 * dot1, normal);
        let rand_dir = Math.random() ; /// 2;
        let return_value = add(mult_vec,vectDirection);
        if (HitBar == 1) 
        {
            if (barMoveRight == 1) 
            {
                return return_value[0] + rand_dir;
            }
            else
            {
                return return_value[0] - rand_dir;
            }
        }
        else if(HitBar == 2)
        {
            if (bar2MoveRight == 1) 
            {
                return return_value[0] + rand_dir;
            }
            else
            {
                return return_value[0] - rand_dir;
            }
        }
        return add(mult_vec,vectDirection);
    }

    var winnerPlayer = 0;
    // Check whether either player has won
    function checkWinCondition()
    {
        if (player1Score == 7) 
        {
            console.log("1 won")
            return 1;
        }
        else if (player2Score == 7)
        {
            console.log("2 won")
            return 2;
        }
        return 0;
    }

    //Obtain the new direction when reflecting the ball 
    var scoringPlayer = 0;
    function reflectBall(ballCenter)
    {
        var normal = vec2(0.0, 0.0);
        if (ballCenter[0] <= -1 + ballRadius) {
            normal = vec2(1,0);
            return getReflectDirection(normal);
        }
        else if (ballCenter[0] >= 1 - ballRadius ) {
            normal = vec2(-1,0);
            return getReflectDirection(normal);
        }
        else if (HitBar == 2 && checkCollisionBar1(ballCenter)) {
            normal = vec2(0,1);
            HitBar = 1;
            return getReflectDirection(normal);
        }
        else if (ballCenter[1] <= (-0.96 + ballRadius)) {
            player2Score++;
            scoringPlayer = 2;
            // displayScoringPlayer(2);
            winnerPlayer = checkWinCondition();
            stopGame = true;
            HitBar = 1;
            console.log(player1Score, player2Score);
            normal = vec2(0,1);
            return getReflectDirection(normal);
        }
        else if (HitBar == 1 && checkCollisionBar2(ballCenter)) {
            normal = vec2(0,-1);
            HitBar = 2;
            return getReflectDirection(normal);
        }
        else if (ballCenter[1] >= (0.96 - ballRadius)) {
            player1Score++;
            scoringPlayer = 1;
            // displayScoringPlayer(1);
            winnerPlayer = checkWinCondition();
            stopGame = true;
            console.log(player1Score, player2Score);
            HitBar = 2;
            normal = vec2(0,1);
            return getReflectDirection(normal);
        }
        return vectDirection;
    }

    //Functions to check the collision with the bars
    function checkCollisionBar1(ballCenter)
    {
        if(ballCenter[1] - ballRadius <= (barY + barHeight) && (ballCenter[1] + ballRadius >= barY) && 
        (ballCenter[0] - ballRadius >= barX - barWidth || ballCenter[0] + ballRadius >= barX - barWidth)&& 
        (ballCenter[0] + ballRadius <= barX || ballCenter[0] - ballRadius <= barX))
        {
            return true;
        }
        return false;
    }

    function checkCollisionBar2(ballCenter)
    {
        if((ballCenter[1] + ballRadius >= (bar2Y - barHeight))  && (ballCenter[1] + ballRadius <= bar2Y) && 
        (ballCenter[0] - ballRadius >= bar2X - barWidth  || ballCenter[0] + ballRadius >= bar2X - barWidth) && 
        (ballCenter[0] + ballRadius <= bar2X || ballCenter[0] - ballRadius <= bar2X))
        {
            return true;
        }
        return false;
    }

    // Function to draw the ball at a particular frame
    function drawBall()
    {
        for (var i = 1; i < ballNumVertices + 2; i++) 
        {
            var angle = (2 * Math.PI * i ) / ballNumVertices;
            var vertex = vec2(center[0] + ballRadius * Math.cos(angle), center[1] + ballRadius * Math.sin(angle));
            ballVertices.push(vertex);
            ballVertices.push(center);
            ballVertices.push(vertex);
            ballColors.push(ballColors[0], ballColors[0], ballColors[0]);
        }
        ballVertices.pop();
        ballColors.pop();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(ballVertices));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec4'], flatten(ballColors));
        index += 3 * (i - 1);
        numPoints += 3 * (i - 1);
        if (gameHasStarted) {
            center[0] += ballSpeed * vectDirection[0];
            center[1] += ballSpeed * vectDirection[1];
        }
        ballVertices = [center];
        ballColors = [vec4(1.0, 1.0, 1.0, 1.0)];
        vectDirection = reflectBall(center);
    }

    var gameHasStarted = false;

    // Adjust the speed of movement
    var barMoveRight = 0;
    var bar2MoveRight = 0;
    const speed = 0.1;
    function handleKeyDown(event) 
    {
        if (event.key === 'ArrowLeft' && barX - barWidth > -1) {
          barX -= speed;  // Move left  bar1
          barMoveRight = 0;
        } 
        else if (event.key === 'ArrowRight' && barX < 1) {
          barX += speed;  // Move right bar1
          barMoveRight = 1;
        }        
        else if ((event.key === 'a' || event.key === 'A') && bar2X - barWidth > -1) {
          bar2X -= speed;  // Move left bar2
          bar2MoveRight = 0;
        } 
        else if ((event.key === 'd' || event.key === 'D') && bar2X < 1) {
          bar2X += speed;  // Move right bar2
          bar2MoveRight = 1;
        }
        else if (event.key == ' ') {
            if(!gameHasStarted){
                gameHasStarted = true;
                delayRestartGame = true
                //tick();
            }
            if (stopGame) {
                stopGame = false;
                center = vec2(0.0, 0.0);
                ballVertices = [center];
                delayRestartGame = true;
                if (winnerPlayer == 0) {
                    tick();
                }
            }
        }    
    }

    window.addEventListener('keydown', handleKeyDown);

    var delayRestartGame = false;
    window.addEventListener("click", function (ev)
    {
        var bbox = ev.target.getBoundingClientRect();
        var mousepos = vec2(2 * (ev.clientX - bbox.left) / canvas.width - 1, 2 * (canvas.height - ev.clientY + bbox.top - 1) / canvas.height - 1);
        if (winnerPlayer != 0 && mousepos[0] <= rectX && mousepos[0] >= rectX - rectWidth && mousepos[1] <= rectY && mousepos[1] >= rectY - rectHeight) {
            player1Score = 0;
            player2Score = 0;
            winnerPlayer = 0;
            stopGame = false;
            center = vec2(0.0, 0.0);
            ballVertices = [center];
            delayRestartGame = true;
            setBarValuesDefault();
            tick();
        }
    });

    function drawScene(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        drawBars();
        if (gameHasStarted) {
            drawSpikes();
        }
        if (winnerPlayer == 0) {
            
            drawBall();
            drawMiddleLines();
        }
        if (winnerPlayer != 0) {
            drawFinalRect();
        }
        gl.drawArrays(gl.TRIANGLES, 0, numPoints);
    }

    function displayWritings(hud)
    {
        hud.clearRect(0, 0, 512, 512);
        if(!gameHasStarted) {
            displayControlBars(hud);
            displayIntroText(hud, pxSize);
        }
        if (stopGame) {
            displayScoringPlayer(hud, scoringPlayer);
        }
        if (winnerPlayer != 0) {
            displayFinalWriting(hud);
        }
        displayScore(hud);
        displayPlayerNames(hud);
    }

    var dir = 1;
    var spikeSpeed = 0.02;
    var pxSize = 25;
    var pxDir = 1;
    function tick()
    {
        setTimeout(function() {
            if (gameHasStarted) {
                if (spikeX >= -1.0 || spikeX <= -1.5) {
                    dir *= -1;
                }
                spikeX += dir * spikeSpeed;
                spikeX2 -= dir* spikeSpeed;

                index = 0;
                numPoints = 0;
                drawScene();
                displayWritings(hud);
                console.log(winnerPlayer);
                if (winnerPlayer != 0) 
                {
                    window.cancelAnimationFrame(requestId);
                    drawScene();
                    displayWritings(hud);
                    console.log("winnerPlayer: ", winnerPlayer);
                }
                else if (!stopGame) {
                    if (delayRestartGame) {
                        console.log("Restarting delayed");
                        setTimeout(function(){requestId = window.requestAnimationFrame(tick);}, 500);
                        delayRestartGame = false;
                    }
                    else
                    {
                        requestId = window.requestAnimationFrame(tick);
                    }
                }
                else
                {
                    index = 0;
                    numPoints = 0;
                    drawScene();
                    displayWritings(hud);
                    setBarValuesDefault();
                    center = vec2(0.0, 0.0);
                }
            }
            else{
                if (pxSize >= 30.0 || pxSize <= 20.0) {
                    pxDir *= -1;
                }
                pxSize += pxDir * 1;
                displayWritings(hud);
                requestId = window.requestAnimationFrame(tick);                 
            }
        }, 76);
    }

    drawScene();
    displayWritings(hud);
    tick();
}