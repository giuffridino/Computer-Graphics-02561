window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(1, 0.5843, 0.9294, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ext = gl.getExtension('OES_element_index_uint');
    if(!ext){
        console.log('Warning: Unable to use an extension');
    }

    var pointsArray = [];
    var colorArray = [];
    const initColor = vec4(1.0, 0.0, 1.0, 1.0);
    var va = vec4(0.0, 0.0, 1.0, 1);
    var vb = vec4(0.0, 0.942809, -0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    var Subdivis = 0;

    tetrahedron(va, vb, vc, vd, Subdivis);

    function tetrahedron(a, b, c, d, n)
    {
        divideTriangle(a, b, c, n);
        divideTriangle(d, c, b, n);
        divideTriangle(a, d, b, n);
        divideTriangle(a, c, d, n);
    }
    function divideTriangle(a, b, c, count)
    {
        if (count > 0) 
        {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        }
        else 
        {
            triangle(a, b, c);
        }
    }
    function triangle(a, b, c)
    {
        pointsArray.push(a);
        pointsArray.push(b);
        pointsArray.push(c);
        colorArray.push(initColor);
        colorArray.push(initColor);
        colorArray.push(initColor);
    }
    console.log("completed tetrahedron")
    gl.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    function initSphere(gl, numSubdivis)
    {
        pointsArray = [];
        colorArray = [];
        tetrahedron(va, vb, vc, vd, numSubdivis);
        gl.deleteBuffer(gl.vBuffer);
        gl.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        // var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        // gl.deleteBuffer(cBuffer);
        // var cBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);
        // // var vColors = gl.getAttribLocation(program, "a_Color");
        // gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(vColors);
    }

    var increaseButton = document.getElementById("IncreaseSubdivisions");
    increaseButton.addEventListener("click", function()
    {
        Subdivis ++;
        initSphere(gl, Subdivis);
        console.log(Subdivis, pointsArray.length);
        render();
    });
    var decreaseButton = document.getElementById("DecreaseSubdivisions");
    decreaseButton.addEventListener("click", function()
    {
        if(Subdivis > 0)
        {
            Subdivis --;
        }
        initSphere(gl, Subdivis);
        console.log(Subdivis, pointsArray.length);
        render();
    });

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);
    // var vColors = gl.getAttribLocation(program, "a_Color");
    // gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColors);

    var view_matrix = lookAt(vec3(0.0, 0.0, 2.0), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    // console.log(canvas.width, canvas.height, canvas.width / canvas.height);
    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));
    // console.log(projection_matrix[0], projection_matrix[1], projection_matrix[2], projection_matrix[3]);

    var model_matrix = mat4();
    // var Sx = 0.5, Sy = 0.5, Sz = 0.5;
    // var xformMatrix = new Float32Array([
    //     Sx,   0.0,  0.0,  0.0,
    //     0.0,  Sy,   0.0,  0.0,
    //     0.0,  0.0,  Sz,   0.0,
    //     0.0,  0.0,  0.0,  1.0  
    // ]);
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length)
    }
    render();
    
}