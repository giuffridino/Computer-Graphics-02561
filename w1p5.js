window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.1, 0.3, 0.6, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    const n = 50;
    const r = 0.5;
    const positions = [vec2(0.0, 0.0)];
    const colors = [vec4(1.0, 0.0, 0.0, 1.0)];

    for (let i = 0; i < n+2; i++) {
        var angle = (2 * Math.PI * i ) / n;
        var vertices = vec2(r * Math.cos(angle), r * Math.sin(angle));
        positions.push(vertices);
        colors.push(vec4(1.0, 0.0, 0.0, 1.0));
    }

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    var displ = 0.0;
    var displLoc = gl.getUniformLocation(program, "displ");
    gl.uniform1f(displLoc, displ);

    var dir = 1.0;
    function render()
    {
        setTimeout(function() {
            requestAnimFrame(render);
            gl.clear(gl.COLOR_BUFFER_BIT);
            if (displ > 0.4 || displ < -0.4) 
            {
                dir *= -1;
                
            }
            displ += dir * 0.1;
            gl.uniform1f(displLoc, displ);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, n+2);
        }, 90);
    }
    render(); 

}