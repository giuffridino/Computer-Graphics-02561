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
    function displayTitle(hud)
    {
        hud.font = '25px "Century Gothic"'; 
        hud.fillStyle = 'white';
        hud.fillText('Tic-Tac-Toe', 355, 45);
    }
    displayTitle(hud);

    var vertices = [ vec2(-0.6, -0.6), vec2(-0.6, 0.6), vec2(0.6, -0.6), vec2(-0.6, 0.6), vec2(0.6, -0.6), vec2(0.6, 0.6),
        vec2(-0.520 + 0.33, -0.520 + 0.03), vec2(-0.520 + 0.33, 0.5 - 0.03), vec2(0.5 - 0.66, -0.520 + 0.03), vec2(-0.520 + 0.33, 0.5 - 0.03), vec2(0.5 - 0.66, -0.520 + 0.03), vec2(0.5 - 0.66, 0.5 - 0.03),
        vec2(-0.520 + 0.66, -0.520 + 0.03), vec2(-0.520 + 0.66, 0.5 - 0.03), vec2(0.5 - 0.33, -0.520 + 0.03), vec2(-0.520 + 0.66, 0.5 - 0.03), vec2(0.5 - 0.33, -0.520 + 0.03), vec2(0.5 - 0.33, 0.5 - 0.03),
        vec2(-0.520 + 0.03, -0.520 + 0.66), vec2(-0.520 + 0.03, 0.5 - 0.33), vec2(0.5 - 0.03, -0.520 + 0.66), vec2(-0.520 + 0.03, 0.5 - 0.33), vec2(0.5 - 0.03, -0.520 + 0.66), vec2(0.5 - 0.03, 0.5 - 0.33),
        vec2(-0.520 + 0.03, -0.520 + 0.33), vec2(-0.520 + 0.03, 0.5 - 0.66), vec2(0.5 - 0.03, -0.520 + 0.33), vec2(-0.520 + 0.03, 0.5 - 0.66), vec2(0.5 - 0.03, -0.520 + 0.33), vec2(0.5 - 0.03, 0.5 - 0.66)];
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var colors = [ vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0), vec4(0, 0, 0, 1.0)];
    var cBuffer = gl.createBuffer();
    for (let index = 0; index < 24; index++) 
    {
        colors.push(vec4(1.0, 1.0, 1.0, 1.0));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    var playing_positions = ["", "", "", "", "", "", "", "", ""];
    var count = 0;
    var player = "O";
    var two_player_mode = true;

    function drawShape(x, y, in_player)
    {
        hud.font = '70px "Century Gothic"'; 
        hud.fillStyle = 'white';
        if (in_player == "X") 
        {
            x += 8;
            hud.fillText('X', x, y);
        }
        else if (in_player == "O") 
        {
            hud.fillText('O', x, y);
        }
    }

    function displayWin(in_player)
    {
        hud.font = '65px "Century Gothic"'; 
        hud.fillStyle = 'white';
        if (in_player == "X") {
            hud.fillText("X has won!!!", 65, 460);
        }
        else if (in_player == "O") {
            hud.fillText("O has won!!!", 65, 460);
        }
    }

    function displayDraw()
    {
        hud.font = '65px "Century Gothic"'; 
        hud.fillStyle = 'white';
        hud.fillText("Nobody wins", 45, 460);
    }

    function displayPlayer(hud, in_player)
    {
        hud.font = '40px "Century Gothic"'; 
        hud.fillStyle = 'white';
        if (in_player == "X") 
        {
            hud.fillText("X is playing", 150, 450);
        }
        else if(in_player == "O")
        {
            hud.fillText("O is playing", 139.5, 450);
        }
    }

    function findShapeCoords(index)
    {
        if (index == 0) {
            return vec2(141 , 367);
        }
        else if (index == 1) {
            return vec2(223, 367);
        }
        else if (index == 2) {
            return vec2(307, 367);
        }
        else if (index == 3) {
            return vec2(141 , 283);
        }
        else if (index == 4) {
            return vec2(223, 283);
        }
        else if (index == 5) {
            return vec2(307, 283);
        }
        else if (index == 6) {
            return vec2(141 , 200);
        }
        else if (index == 7) {
            return vec2(223, 200);
        }
        else if (index == 8) {
            return vec2(307, 200);
        }
        return vec2(0);
    }

    function redrawMoves()
    {
        for (let i = 0; i < 9; i++) 
        {
            if (playing_positions[i] == "X" || playing_positions[i] == "O") 
            {
                let coords = findShapeCoords(i);
                drawShape(coords[0], coords[1], playing_positions[i]);
            }
        }
    }

    function switchPlayer()
    {
        hud.reset();
        displayTitle(hud);
        redrawMoves(playing_positions);
        player = player == "X" ? "O" : "X";
    }

    function checkWinner()
    {
        let winner = null;

        for (let i = 0; i < 3; i++) 
        {
            if(playing_positions[i * 3] == playing_positions[i * 3 + 1] && playing_positions[i * 3 + 1] == playing_positions[i * 3 + 2] && playing_positions[i * 3] != 0)
            {
                winner = playing_positions[i * 3];
                break;
            }
            if(playing_positions[i] == playing_positions[i + 3] && playing_positions[i + 3] == playing_positions[i + 6] && playing_positions[i] != 0)
            {
                winner = playing_positions[i];
                break;
            }
        }
        if (playing_positions[0] == playing_positions[4] && playing_positions[4] == playing_positions[8] && playing_positions[0] != 0) 
        {
            winner = playing_positions[0];
        }
        if (playing_positions[2] == playing_positions[4] && playing_positions[4] == playing_positions[6] && playing_positions[2] != 0) 
        {
            winner = playing_positions[2];
        }
        if (winner) 
        {
            gameWon = true;
            return winner;
        }

        // Check for tie
        let tie = true;
        for (let i = 0; i < 9; i++) 
        {
            if (playing_positions[i] == 0) 
            {
                tie = false;
                break;
            }
        }
        if (tie && !winner) {
            winner = "tie";
            gameTied = true;
        }

        return winner;
    }

    var gameWon = false;
    var gameTied = false;
    var text_win_count = 0
    var text_draw_count = 0
    
    function handleMousePosClick(mousepos)
    {
        if (mousepos[0] > -0.5 && mousepos[0] < -0.17 && mousepos[1] > -0.5 && mousepos[1] < -0.17) 
        {
            if (playing_positions[0] == "") 
            {
                playing_positions[0] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 

            }
        }
        else if(mousepos[0] > -0.17 && mousepos[0] < 0.17 && mousepos[1] > -0.5 && mousepos[1] < -0.17)
        {
            if (playing_positions[1] == "") 
            {
                playing_positions[1] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > 0.17 && mousepos[0] < 0.5 && mousepos[1] > -0.5 && mousepos[1] < -0.17)
        {
            if (playing_positions[2] == "") 
            {
                playing_positions[2] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > -0.5 && mousepos[0] < -0.17 && mousepos[1] > -0.17 && mousepos[1] < 0.17)
        {
            if (playing_positions[3] == "") 
            {
                playing_positions[3] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > -0.17 && mousepos[0] < 0.17 && mousepos[1] > -0.17 && mousepos[1] < 0.17)
        {
            if (playing_positions[4] == "") 
            {
                playing_positions[4] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > 0.17 && mousepos[0] < 0.5 && mousepos[1] > -0.17 && mousepos[1] < 0.17)
        {
            if (playing_positions[5] == "") 
            {
                playing_positions[5] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > -0.5 && mousepos[0] < -0.17 && mousepos[1] > 0.17 && mousepos[1] < 0.5)
        {
            if (playing_positions[6] == "") 
            {
                playing_positions[6] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > -0.17 && mousepos[0] < 0.17 && mousepos[1] > 0.17 && mousepos[1] < 0.5)
        {
            if (playing_positions[7] == "") 
            {
                playing_positions[7] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
        else if(mousepos[0] > 0.17 && mousepos[0] < 0.5 && mousepos[1] > 0.17 && mousepos[1] < 0.5)
        {
            if (playing_positions[8] == "") 
            {
                playing_positions[8] = player;
                redrawMoves();
                if(two_player_mode)
                {
                    switchPlayer();
                }
                count ++; 
            }
        }
    }

    function checkGameWin()
    {
        checkWinner();
        if (gameWon && text_win_count == 0) 
        {
            // gameWon = true;
            hud.reset();
            displayTitle(hud);
            if(two_player_mode)
            {
                switchPlayer();
            }
            displayWin(checkWinner());
            redrawMoves();
            text_win_count++;
        }
        if (gameTied && gameWon == false && text_draw_count == 0 && text_win_count == 0) 
        {
            hud.reset();
            displayTitle(hud);
            displayDraw();
            redrawMoves();
            text_draw_count++;
        }
    }

    let scores = {
        "X": 1,
        "O": -1,
        "tie": 0,
    }

    function minimax(depth, isMaximizing)
    {
        // return 1;
        let result = checkWinner();
        if (result !== null) 
        {
            return result;
        }

        if (isMaximizing) 
        {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++)
            {
                if (playing_positions[i] == "") 
                {
                    playing_positions[i] = "X";
                    let score = minimax(depth + 1, false);
                    playing_positions[i] = "";
                    bestScore = Math.max(scores[score], bestScore)
                }
            }
            return bestScore;
        }
        else
        {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++)
            {
                if (playing_positions[i] == "") 
                {
                    playing_positions[i] = "O";
                    let score = minimax(depth + 1, true);
                    playing_positions[i] = "";
                    bestScore = Math.min(scores[score], bestScore);
                }
            }
            return bestScore;
        }
    }

    function AIMakeBestMove()
    {
        let bestScore = -Infinity;
        let bestMove;
        for (let i = 0; i < 9; i++)
        {
            if (playing_positions[i] == "") 
            {
                playing_positions[i] = "X";
                let score = minimax(0, false);
                playing_positions[i] = "";
                if (score > bestScore) 
                {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        playing_positions[bestMove] = "X";
        redrawMoves();
    }

    canvas2d.addEventListener("click", function (ev)
    {
        var bbox = ev.target.getBoundingClientRect();
        var mousepos = vec2(2 * (ev.clientX - bbox.left) / canvas.width - 1, 2 * (canvas.height - ev.clientY + bbox.top - 1) / canvas.height - 1);
        if (!gameWon && !gameTied)
        {
            handleMousePosClick(mousepos);
            displayPlayer(hud, player);
        }
        //Check if game has been won by player
        checkGameWin();
        if (!gameWon && !gameTied && !two_player_mode) 
        {
            AIMakeBestMove();
        }
        //Check if game has been won by AI
        checkGameWin();
    });

    startAgainButton = document.getElementById("startAgainButton");
    startAgainButton.addEventListener("click", function(ev)
    {
        hud.reset();
        gameWon = false;
        gameTied = false;
        playing_positions = ["", "", "", "", "", "", "", "", ""];
        player = "O";
        text_draw_count = 0;
        text_win_count = 0;
        count = 0;
        displayTitle(hud);
        displayPlayer(hud, player);
        render();
    });

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 30);
        displayPlayer(hud, player);
    }
    render();
    
}