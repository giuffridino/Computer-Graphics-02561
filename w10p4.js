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

    var sLoc = gl.getUniformLocation(program, "s");
    gl.uniform1f(sLoc, 100.0);
    var sSlider = document.getElementById("s")
    sSlider.addEventListener("input", function(ev)
    {
        gl.uniform1f(sLoc, ev.srcElement.value);
        // if (stopRotation) 
        // {
        //     render();
        // }
    });

    var currentAngle = [0.0, 0.0];
    var q_rot = new Quaternion();
    q_rot.setIdentity();
    var q_inc = new Quaternion();
    var eye_pos = vec3(0.0, 0.0, 3.0);
    var at = vec3(0.0, 0.0, 0.0);
    var up = vec3(0.0, 1.0, 0.0);
    var pan_vec = vec2(-1, -1);
    var c = vec3(0, 0, 0);
    var stopSpinning = true;
    var u;
    var v;
    // var u = vec3(0, 0, 0);
    // var v = vec3(0, 0, 0);
    var startTime = 0;
    initEventHandlers(canvas, currentAngle);

    function initEventHandlers(canvas, currentAngle)
    {
        var dragging_left = false;
        var dragging_right = false;
        // var lastX = -1, lastY = -1;
        var mousepos = vec2(0, 0);
        var lastMousepos = vec2(-1, -1);
        var firstMousepos = vec2(-1, -1);
        var lastlastMousepos = vec2(-1, -1);
        canvas.onmousedown = function(ev)
        {
            // console.log(ev.button);
            var x = ev.clientX, y = ev.clientY;
            var rect = ev.target.getBoundingClientRect();
            mousepos = vec2(((ev.clientX - rect.left) / rect.width) * 2 - 1, ((ev.clientY - rect.top) / rect.height) * 2 - 1);
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom)
            {
                if (ev.button == 0) 
                {
                    dragging_left = true;
                    stopSpinning = false;
                }
                else if(ev.button == 2)
                {
                    dragging_right = true;
                }
                lastMousepos = mousepos;
                firstMousepos = mousepos;
                // startTime = Date.getMilliseconds();
            }
        }
        canvas.onmouseup = function(ev)
        {
            console.log(mousepos);
            var rect = ev.target.getBoundingClientRect();
            mousepos = vec2(((ev.clientX - rect.left) / rect.width) * 2 - 1, ((ev.clientY - rect.top) / rect.height) * 2 - 1);
            console.log(mousepos, firstMousepos);
            // if ((equal(mousepos, firstMousepos)) | (Date.getMilliseconds() - startTime > 20)) 
            if ((equal(mousepos, firstMousepos))) 
            {
                console.log("stopping spin");
                stopSpinning = true;
                q_inc.setIdentity();
            }
            if (ev.button == 0) 
            {
                console.log("setting left drag to false");
                dragging_left = false;
            }
            else if(ev.button == 2)
            {
                dragging_right = false;
            }
        }
        canvas.onmousemove = function(ev)
        {
            var x = ev.clientX, y = ev.clientY;
            // console.log(ev.button);
            var rect = ev.target.getBoundingClientRect();
            mousepos = vec2(((ev.clientX - rect.left) / rect.width) * 2 - 1, ((ev.clientY - rect.top) / rect.height) * 2 - 1);
            if (dragging_left)
            {
                var d_u = Math.sqrt(lastMousepos[0]*lastMousepos[0] + lastMousepos[1]*lastMousepos[1]);
                if (d_u <= 1/Math.sqrt(2)) 
                {
                    u = vec3(-lastMousepos[0], lastMousepos[1], Math.sqrt(1-d_u*d_u));
                }
                else
                {
                    u = vec3(-lastMousepos[0], lastMousepos[1], 1/(2*d_u));
                }
                var d_v = Math.sqrt(mousepos[0]*mousepos[0] + mousepos[1]*mousepos[1]);
                if (d_v <= 1/Math.sqrt(2)) 
                {
                    v = vec3(-mousepos[0], mousepos[1], Math.sqrt(1-d_v*d_v));
                }
                else
                {
                    v = vec3(-mousepos[0], mousepos[1], 1/(2*d_v));
                }
                // q_inc = q_inc.make_rot_vec2vec(normalize(u), normalize(v));
                // q_rot = q_rot.multiply(q_inc);
            }
            else if(dragging_right)
            {
                pan_vec = vec2(mousepos[0] - lastMousepos[0], mousepos[1] - lastMousepos[1]);
                console.log(pan_vec);
                var temp_c = add(scale(pan_vec[0], q_rot.apply(vec3(1, 0, 0))), scale(-pan_vec[1], q_rot.apply(up)));
                c = add(c, negate(temp_c));
                console.log("inner", c);
            }
            lastMousepos = mousepos;
            lastlastMousepos = lastMousepos;
        }

        canvas.addEventListener("wheel", function(ev){
            // console.log("wheel", ev.button);
            if (ev.button == 0) 
            {
                var deltaY = ev.deltaY;
                // console.log("Middle button scrolled: ", deltaY); 
                var eye_delta = vec3(0.0, 0.0, 20/deltaY);
                eye_pos = add(eye_pos, eye_delta);
                // console.log(eye_pos);
            }
        })
    }

    const radius = 3.0;
    var alpha = 0;

    var view_matrix = lookAt(vec3(radius * Math.sin(alpha), 0.0, radius * Math.cos(alpha)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    view_matrix = lookAt(q_rot.apply(eye_pos), at, q_rot.apply(up));
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

    function render()
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        if(!g_drawingInfo && g_objDoc && g_objDoc.isMTLComplete())
        {
            g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        }
        if(!g_drawingInfo) {requestAnimationFrame(render); return;}

        // q_inc.setIdentity();
        if (!stopSpinning) 
        {
            console.log(u, v);
            q_inc = q_inc.make_rot_vec2vec(normalize(u), normalize(v));
        }
        // else
        // {
        //     console.log("setting q_inc to identity");
        //     q_inc.setIdentity();
        // }
        q_rot = q_rot.multiply(q_inc);
        console.log(q_rot, q_inc);
        view_matrix = lookAt(add(q_rot.apply(eye_pos), c), c, q_rot.apply(up));
        gl.uniformMatrix4fv(VLoc, false, flatten(view_matrix));
        gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_INT, 0);
        requestAnimationFrame(render);
    }
    setTimeout(() => {
        render();
    }, 300);
    
}