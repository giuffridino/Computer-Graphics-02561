window.onload = function init()
{
    // Create a cube   
    //    v5----- v6   
    //   /|      /|   
    //  v1------v2|   
    //  | |     | |   
    //  | |v4---|-|v7   
    //  |/      |/   
    //  v0------v3

    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ext = gl.getExtension('OES_element_index_uint');
    if(!ext){
        console.log('Warning: Unable to use an extension');
    }

    var vertices = [     
        vec3(0.0, 0.0, 0.25),     
        vec3(0.0, 0.25, 0.25),     
        vec3(0.25, 0.25, 0.25),     
        vec3(0.25, 0.0, 0.25),     
        vec3(0.0, 0.0, 0.0),     
        vec3(0.0, 0.25, 0.0),     
        vec3(0.25, 0.25, 0.0),     
        vec3(0.25, 0.0, 0.0),   
    ]; 

    var wire_indices = new Uint32Array([
        0, 1, 1, 2, 2, 3, 3, 0, // front     
        2, 3, 3, 7, 7, 6, 6, 2, // right     
        0, 3, 3, 7, 7, 4, 4, 0, // down     
        1, 2, 2, 6, 6, 5, 5, 1, // up     
        4, 5, 5, 6, 6, 7, 7, 4, // back     
        0, 1, 1, 5, 5, 4, 4, 0  // left   
    ]);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(wire_indices), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    

    var colors = [
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0), 
        vec4(1.0, 1.0, 1.0, 1.0),
    ];


    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vColors = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(vColors, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColors);

    var view_matrix = lookAt(vec3(1.0, 0.125, 0.125), vec3(0.0, 0.125, 0.125), vec3(0.0, 0.0, 1.0));
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    // console.log(canvas.width, canvas.height, canvas.width / canvas.height);
    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));
    // console.log(projection_matrix[0], projection_matrix[1], projection_matrix[2], projection_matrix[3]);

    var model_matrix = mat4();
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
        model_matrix = translate(0.0, 0.0, 0.5);
        model_matrix = mult(mult(model_matrix,rotateX(25)), rotateZ(10));
        gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
        gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
        model_matrix = translate(0.0, 0.0, -0.5);
        gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));
        gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
    }
    render();
    
}