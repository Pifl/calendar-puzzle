import { Matrix } from "./matrix.js";

export class Piece {
    constructor(shape, tileSize, x, y, pattern) {
        this.shape = shape;
        this.tileSize = tileSize;
    
        this.pattern = pattern;

        this.selected = false;
        this.placed = false;
        this.grabPoint = {x: 0, y: 0};
        this.grabTile = {x: 0, y: 0};
        this.boardLocation = null;
        this.path = new Path2D();

        this.matrix = new Matrix();
        const size = this.size();
        
        for (let i = 0; i < shape.length; i++) {
            const tx = shape[i].x - (size.width/2);
            const ty = shape[i].y - (size.height/2);
            this.path.rect(tx * tileSize, ty * tileSize, tileSize, tileSize);
        }
        this.move(x, y);
    }
    draw(canvas) {
        canvas.transform(...this.matrix.toArray());
        canvas.fillStyle = this.pattern;
        if (this.placed) {
            canvas.globalAlpha = 1;
            canvas.lineWidth = 5;
            canvas.strokeStyle = 'rgba(0,0,0,0.5)';
            canvas.shadowOffsetX = 0;
            canvas.stroke(this.path);
        } else {
            canvas.strokeStyle = 'rgba(0,0,0,1)';
            canvas.globalAlpha = 0.8;
            canvas.shadowOffsetX = 2;
        }
        canvas.fill(this.path);
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        canvas.globalAlpha = 1;
    }
    isPointInPath(canvas, x, y) {
        canvas.transform(...this.matrix.toArray());
        let inPath = canvas.isPointInPath(this.path, x, y);
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        return inPath;
    }
    size() {
        const shape = this.getShape();
        const minX = shape.map((v) => v.x).reduce((p, c) => Math.min(p, c));
        const maxX = shape.map((v) => v.x).reduce((p, c) => Math.max(p, c));

        const maxY = shape.map((v) => v.y).reduce((p, c) => Math.max(p, c));
        const minY = shape.map((v) => v.y).reduce((p, c) => Math.min(p, c));

        return {width: Math.abs(maxX - minX) + 1, height: Math.abs(maxY - minY) + 1};
    }
    lift(x, y) {
        this.setGrab(x, y);
        this.boardLocation = null;
        const wasPlaced = this.placed;
        this.placed = false;
        return wasPlaced;
    }
    grab(x, y) {
        this.setGrab(x, y);
        this.selected = true;
    }
    setGrab(x, y) {
        const size = this.size();
        const shape = this.getShape();
        const pieceWidth = size.width * this.tileSize;
        const pieceHeight = size.height * this.tileSize;
        const originX = this.matrix.e - (pieceWidth/2);
        const originY = this.matrix.f - (pieceHeight/2);

        const tX = Math.floor((x - originX) / this.tileSize);
        const minX = shape.map((v) => v.x).reduce((p, c) => Math.min(p, c));
        const tY = Math.floor((y - originY) / this.tileSize);
        const minY = shape.map((v) => v.y).reduce((p, c) => Math.min(p, c));

        this.grabTile = {x: minX + tX, y: minY + tY};
        this.grabPoint = {x: x - this.matrix.e, y: y - this.matrix.f};
    }
    drag(x, y) {
        this.move(x - this.grabPoint.x, y - this.grabPoint.y);
    }
    place(x, y, bX, bY) {
        
        this.placed = true;
        this.boardLocation = {x: bX, y: bY};

        const shape = this.getShape();

        const minX = shape.map((v) => v.x).reduce((p, c) => Math.min(p, c));
        const maxX = shape.map((v) => v.x).reduce((p, c) => Math.max(p, c));

        const maxY = shape.map((v) => v.y).reduce((p, c) => Math.max(p, c));
        const minY = shape.map((v) => v.y).reduce((p, c) => Math.min(p, c));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        this.move(x + ((centerX) * this.tileSize) + (this.tileSize/2), y + ((centerY) * this.tileSize)  + (this.tileSize/2) );
    }
    move(x, y) {
        this.matrix.translate(x, y);
    }
    rotate() {
        this.matrix.rotate(90);
    }
    flip() {
       this.matrix.flipY();
    }
    setTransform(matrix) {
        this.matrix.a = matrix.a;
        this.matrix.b = matrix.b;
        this.matrix.c = matrix.c;
        this.matrix.d = matrix.d;
    }
    getShape() {
        return this.matrix.transform(this.shape);
    }
    serialise() {
        return {
            matrix: this.matrix.rotationArray(),
            location: this.boardLocation,
            shape: this.shape
        };
    }
}
