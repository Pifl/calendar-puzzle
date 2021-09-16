
function create(parent, id, width, height, mouse) {
    let div = document.createElement('div');
    let canvas = document.createElement('canvas');

    parent.appendChild(div);
    div.appendChild(canvas);

    div.id = id;

    canvas.width = width;
    canvas.height = height;

    let ctx = canvas.getContext('2d');

    if (mouse !== undefined) {
        canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    
        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.x;
            mouse.y = e.clientY - rect.y;
            if (mouse.down) {
                mouse.dragging = true;
            }
            e.preventDefault();
        });
    
        canvas.addEventListener('mousedown', function(e) {
            if (e.button == 0) {
                mouse.main = true;
            } else {
                mouse.main = false;
            }
            mouse.down = true;
            if (Date.now() - mouse.lastDown < 300) {
                mouse.double = true;
            } else {
                mouse.double = false;
            }
            mouse.lastDown = Date.now();
            e.preventDefault();
        });
    
        canvas.addEventListener('mouseup', function(e) {
            mouse.down = false;
            mouse.double = false;
            mouse.dragging = false;
            e.preventDefault();
        });
    }

    ctx.lineJoin = 'bevel';
    ctx.shadowColor = 'grey';
    return ctx;
}

export {create}