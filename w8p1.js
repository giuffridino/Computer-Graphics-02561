    window.onload = function init()
{
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var ext = gl.getExtension('OES_element_index_uint');
    if(!ext){
        console.log('Warning: Unable to use an extension');
    }

    var vertices = [     
        //Ground
        vec3(-2.0, -1.0, -1.0),     
        vec3(2.0, -1.0, -1.0),  
        vec3(2.0, -1.0, -5.0),     
        vec3(-2.0, -1.0, -5.0),
        vec3(-2.0, -1.0, -1.0),
        vec3(2.0, -1.0, -5.0), 
        // Quad parallel
        vec3(0.25, -0.5, -1.25),     
        vec3(0.75, -0.5, -1.25),  
        vec3(0.75, -0.5, -1.75),     
        vec3(0.25, -0.5, -1.75),
        vec3(0.25, -0.5, -1.25),
        vec3(0.75, -0.5, -1.75),
        // Quad perpendicular
        vec3(-1.0, 0.0, -2.5),  
        vec3(-1.0, -1.0, -2.5),     
        vec3(-1.0, 0.0, -3.0),     
        vec3(-1.0, -1.0, -3.0),
        vec3(-1.0, 0.0, -3.0), 
        vec3(-1.0, -1.0, -2.5),
    ];
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var texCoords = [     
        vec2(0.0, 0.0),     
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),   
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),     
        vec2(1.0, 1.0),

        vec2(0.0, 0.0),     
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),   
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),     
        vec2(1.0, 1.0),

        vec2(0.0, 0.0),     
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),   
        vec2(1.0, 0.0),  
        vec2(0.0, 1.0),     
        vec2(1.0, 1.0),
    ];
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);
    var tPosition = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(tPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tPosition);

    // var indices = new Uint32Array([
    //     0, 1, 2, 1, 2, 3
    // ]);

    // var iBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    var colors = [
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

    var image = document.createElement("img");
    image.crossorigin = "anonymous";
    image.src = "2D_Textures/xamp23.png";
    // image.onload = function(){
    //     var texture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // };
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);
    gl.texImage2D(gl.TEXTURE_2D, 0 , gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    var texMapLoc = gl.getUniformLocation(program, "texMap");
    gl.uniform1i(texMapLoc, 0);

    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0]));

    // const radius = 3.0;
    // var alpha = 0;

    // var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    var view_matrix = mat4();
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));

    var model_matrix = mat4();
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    // var normal_matrix = normalMatrix(view_matrix, true);
    // var NLoc = gl.getUniformLocation(program, "normal_matrix");
    // gl.uniformMatrix3fv(NLoc, false, flatten(normal_matrix));

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // alpha = alpha + 0.01;
        // var eye_pos = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        // view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        // gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

        // requestAnimationFrame(render);
        // gl.drawElements(gl.TRIANGLES, vertices.length, gl.UNSIGNED_INT, 0);
        // gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(texMapLoc, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(texMapLoc, 1);
        gl.drawArrays(gl.TRIANGLES, 6, 12);
    }
    render();
}