window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.1, 0.3, 0.6, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    // var vertices = [ vec2(0.0, 0.5), vec2(0, -0.5), vec2(0.5, 0), vec2(0.0, 0.5), vec2(0, -0.5), vec2(-0.5, 0) ];
    var vertices = [ vec2(0.0, 0.5), vec2(0.5, 0.0), vec2(-0.5, 0),  vec2(0.0, -0.5) ];
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var colors = [ vec4(1, 1, 1, 1.0), vec4(1, 1, 1, 1.0), vec4(1, 1, 1, 1.0), vec4(1, 1, 1, 1.0), vec4(1, 1, 1, 1.0), vec4(1, 1, 1, 1.0)];
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    var theta = 0.0;
    var thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform1f(thetaLoc, theta);


    function render()
    {
        setTimeout(function() {
            requestAnimFrame(render);
            gl.clear(gl.COLOR_BUFFER_BIT);
            theta += 0.1;
            gl.uniform1f(thetaLoc, theta);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }, 40);
    }
    render(); 
}