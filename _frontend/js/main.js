import { Board } from "./modules/board.js";
import { create as createCanvas } from './modules/canvas.js'
import { Piece } from "./modules/piece.js";
import { Solutions } from "./modules/solutions.js";


let canvas;
let boardCanvas;
const canvas_width = 800;
const canvas_height = 600;
const tileSize = 50;
const board = new Board(50, 50, tileSize);
const solutions = new Solutions();
const mouse = {x: 0, y: 0, down: false, double: false, main: false, dragging: false};

let woodPattern;
let pieces = [];

function load_canvas(next) {
    const stage = document.getElementById("stage");
    stage.style.width = canvas_width + 'px';
    stage.style.height = canvas_height + 'px';
    return () => {
        boardCanvas = createCanvas(stage, "board-layer", canvas_width, canvas_height);
        board.draw(boardCanvas);
        canvas = createCanvas(stage, "game-layer", canvas_width, canvas_height, mouse);
        next();
    }
}

function load_user(next) {
    return () => {

        const path = window.location.pathname;
        const uiSpan = document.getElementById("unique_id");
        uiSpan.innerText = path.substring(1);

        fetch("/api/v1/summary").then((r) => r.json()).then(data => {
            solutions.load(data);
        }).then(()=> next());
    }
}

function load_texture(next) {
    return () => {
        const pattern = new Image();
        pattern.src = "images/repeating_wood.jpg";
        pattern.onload = () => {woodPattern = canvas.createPattern(pattern, 'repeat'); next()};    
    }
}

function setup_pieces(next) {
    return () => {
        pieces.push(new Piece([{x: 0, y: 0}, {x: 1, y: 0}, {x:2,y:0}, {x:0,y:1}, {x:2,y:1}], tileSize, 550, 220, woodPattern)); // U 
        pieces.push(new Piece([{x: 0, y: 0}, {x: 0, y: 1}, {x:1,y:1}, {x:2,y:1}, {x:2,y:2}], tileSize, 500, 310, woodPattern)); // Z
        pieces.push(new Piece([{x: 0, y: 0}, {x: 1, y: 0}, {x:2,y:0}, {x:0,y:1}, {x:1,y:1}], tileSize, 300, 420, woodPattern)); // Q
        pieces.push(new Piece([{x: 0, y: 0}, {x: 0, y: 1}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}], tileSize, 700, 190, woodPattern)); // h
        pieces.push(new Piece([{x: 0, y: 0}, {x: 1, y: 0}, {x:2,y:0}, {x:0,y:1}, {x:1,y:1}, {x:2,y:1}], tileSize, 460, 420, woodPattern)); // O
        pieces.push(new Piece([{x: 0, y: 0}, {x: 0, y: 1}, {x:0,y:2}, {x:1,y:0}, {x:2,y:0}], tileSize, 650, 100, woodPattern)); // L
        pieces.push(new Piece([{x: 1, y: 0}, {x: 0, y: 1}, {x:1,y:1}, {x:1,y:2}, {x:1,y:3}], tileSize, 650, 300, woodPattern)); // 1
        pieces.push(new Piece([{x: 0, y: 0}, {x: 0, y: 1}, {x:0,y:2}, {x:0,y:3}, {x:1,y:3}], tileSize, 600, 400, woodPattern)); // l
        next();
    };
}

load_canvas(
    load_user(
        load_texture(
            setup_pieces(
                loop
            )
        )
    )
)();

// game loop
function loop() {
    // Capture Current Mouse Location
    const mX = mouse.x;
    const mY = mouse.y;
    const mDo = mouse.down;
    const mMa = mouse.main;
    const mDb = mouse.double;
    const mDr = mouse.dragging;
    mouse.double = false;

    // Logic
    // If mouse is dragging and a piece is selected
    if (mDr && mMa) {
        const selected = pieces.filter(piece => piece.selected);
        if (selected.length > 0) {
            selected[0].drag(mX, mY);
        }
    }

    // If mouse has double clicked
    if (mDb && mMa) {
        const clicked = pieces.filter(piece => piece.isPointInPath(canvas, mX, mY));
        if (clicked.length > 0) {
            if (clicked[0].lift(mX, mY)) {
                board.lift(clicked[0], mX, mY);
            }
            clicked[0].rotate();
        }
    }

    // If non main mouse is down but not dragging flip a piece
    if (!mMa && mDo && !mDr) {
        const clicked = pieces.filter(piece => piece.isPointInPath(canvas, mX, mY));
        if (clicked.length > 0) {
            if (clicked[0].lift(mX, mY)) {
                board.lift(clicked[0], mX, mY);
            }
            clicked[0].flip();
            mouse.down = false;
        }
    }

    // If mouse is down but not dragging select a piece
    if (mDo && mMa) {
        const selected = pieces.filter(piece => piece.selected);
        if (selected.length == 0) {
            const clicked = pieces.filter(piece => piece.isPointInPath(canvas, mX, mY));
            if (clicked.length > 0) {
                if (clicked[0].lift(mX, mY)) {
                    board.lift(clicked[0], mX, mY);
                }
                clicked[0].grab(mX, mY)
            } else {
                // If selected date has been solved load the board state
                if (solutions.press(canvas, mX, mY)) {
                    load(solutions.date().month, solutions.date().day)
                }
            }
        } 
    }

    // If mouse goes up, drop selected piece (if there is one)
    if (!mDo) {
        const selected = pieces.filter(piece => piece.selected);
        // drop on board
        if (selected.length > 0) {
            selected[0].selected = false;
            const position = board.drop(selected[0], mX, mY);
            if (position) {
                selected[0].place(position.x, position.y, position.bX, position.bY);
                const solution = board.solution();
                if (solution) {
                    const newS = solutions.add(solution.month, solution.day)
                    if (newS) {
                        save(newS.month, newS.day)
                    }
                }
            } 
        } else {
            solutions.release(canvas, mX, mY);
        }
    }

    // Rendering
    canvas.clearRect(0,0,canvas_width, canvas_height);
    pieces.forEach(piece => piece.draw(canvas));
    solutions.draw(canvas);
    requestAnimationFrame(loop);
}

async function save(month, day) {
    let message = JSON.stringify(pieces.map((p) => p.serialise()))
    await fetch("/api/v1/"+month+"/"+day, {method: 'POST', body: message})
}
async function load(month, day) {
    const r = await fetch("/api/v1/" + month + "/" + day);
    const data = await r.json();
    board.clear()
    pieces = data.pieces.map(p => loadPiece(p));
}
function loadPiece(pieceData) {
    const location = board.toCanvasCoords(pieceData.location.x, pieceData.location.y);
    const piece = new Piece(pieceData.shape, tileSize, 0, 0, woodPattern);
    piece.setTransform(pieceData.matrix);
    piece.place(location.x, location.y, pieceData.location.x, pieceData.location.y);
    board.placePiece(piece.getShape(), pieceData.location.x, pieceData.location.y, 1);
    return piece
}