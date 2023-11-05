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

    function initObject(gl, fileName, scale)
    {
        program.a_Position = gl.getAttribLocation(program, 'a_Position');
        program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
        program.a_Color = gl.getAttribLocation(program, 'a_Color');

        var model = initVertexBuffers(gl, program);
        readOBJFile(fileName, gl, model, scale, true);

        return model;
    }
    
    var model = initObject(gl, '3D_Meshes/red_suzanne.obj', 1);
    
    // draw(gl, gl.program, currentAngle, viewProjMatrix, model);

    function initVertexBuffers(gl, program)
    {
        var o = new Object();

        o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT);
        o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
        o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
        o.indexBuffer = gl.createBuffer();

        return o;
    }

    function createEmptyArrayBuffer(gl, a_attribute, num, type)
    {
        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);

        return buffer;
    }

    //Read a file
    function readOBJFile(fileName, gl, model, scale, reverse)
    {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if (request.readyState === 4 && request.status !== 404 ) {
                onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
            }
        }
        request.open('GET', fileName, true); //Create a request to get file
        request.send()                       //Send request
    }

    var g_objDoc = null;
    var g_drawingInfo = null;

    function onReadOBJFile(fileString, fileName, gl, o, scale, reverse)
    {
        var objDoc = new OBJDoc(fileName);
        var result = objDoc.parse(fileString, scale, reverse);
        if(!result){
            g_objDoc = null; g_drawingInfo = null;
            console.log("OBJ file parsing error.");
            return;
        }
        g_objDoc = objDoc;
    }

    function onReadComplete(gl, model, objDoc)
    {
        var drawingInfo = objDoc.getDrawingInfo();

        gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

        return drawingInfo;
    }

    const radius = 3.0;
    var alpha = 0;

    var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0));
    var VLoc = gl.getUniformLocation(program, "view_matrix");
    gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

    var projection_matrix = perspective(90, canvas.width / canvas.height, 0.1, 20.0);
    var PLoc = gl.getUniformLocation(program, "projection_matrix");
    gl.uniformMatrix4fv(PLoc, false, flatten(projection_matrix));

    var model_matrix = mat4();
    var MLoc = gl.getUniformLocation(program, "model_matrix");
    gl.uniformMatrix4fv(MLoc, false, flatten(model_matrix));

    var normal_matrix = normalMatrix(view_matrix, true);
    var NLoc = gl.getUniformLocation(program, "normal_matrix");
    gl.uniformMatrix3fv(NLoc, false, flatten(normal_matrix));

    // var EyeLoc = gl.getUniformLocation(program, "eye_pos");
    // gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));
    // function render()
    // {
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // alpha = alpha + 0.01;
        // var eye_pos = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        // gl.uniform3fv(EyeLoc, flatten(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha))));
        // view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        // gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        // if (!stopRotation) 
        // {
        //     requestAnimationFrame(render);
        // }
    // }
    // function animate()
    // {
    //     render(gl, model);
    // }
    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        alpha = alpha + 0.01;
        var eye_pos = vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha));
        view_matrix = lookAt(eye_pos, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));

        if(!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete())
        {
            g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        }
        if(!g_drawingInfo) {requestAnimationFrame(render); return;}

        requestAnimationFrame(render);
        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
    }
    render();
}