
export class Board {

    constructor(cx, cy, tileSize) {
        this.path = new Path2D();

        this.location = {x: cx, y: cy};
        this.tileSize = tileSize;
        this.gaps = [];
        this.width = 7;
        this.height = 7;

        this.months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

        for (let y = 0; y < this.height; y++) {
            this.gaps[y] = []
            for (let x = 0; x < this.width; x++) {
                if (y < 2 && x > 5) {
                    this.gaps[y][x] = 1;
                } else if (y == 6 && x > 2) {
                    this.gaps[y][x] = 1;
                }else {
                    this.gaps[y][x] = 0;
                    this.path.rect(tileSize*x, tileSize*y, tileSize, tileSize);
                }
            }
        }

    }

    draw(canvas) {
        if (!this.boardImage) {
            this.boardImage = this.#createBoardImage(canvas);
        }
        canvas.putImageData(this.boardImage, this.location.x, this.location.y);
    }

    #createBoardImage(canvas) {
        
        canvas.lineWidth = 1;
        canvas.strokeStyle = 'black';
        canvas.lineJoin = 'bevel';
        canvas.stroke(this.path);
        canvas.fillStyle = 'black';
        canvas.font = '12px Verdana'
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let text = "";
                if (y < 2 && x > 5) {
                    continue;
                } else if (y == 6 && x > 2) {
                    continue;
                } else if ( y == 0 && x < 6) {
                    text = this.months[x];
                } else if (y == 1 && x < 6) {
                    text = this.months[x+6];
                } else {
                    text = ((y * 7 + x)- 13) + "";
                }
                const width = canvas.measureText(text).width;
                canvas.fillText(text, this.tileSize*x + (this.tileSize/2) - (width /2), this.tileSize*y + (this.tileSize/2));
            }
        }
        let boardImage = canvas.getImageData(0, 0, this.width * this.tileSize, this.height * this.tileSize);
        canvas.clearRect(0, 0, this.width * this.tileSize, this.height * this.tileSize + 1);
        return boardImage;
    }

    drop(piece, x, y) {
        // Mouse Board Coords
        const mBX = Math.floor((x - this.location.x) / this.tileSize);
        const mBY = Math.floor((y - this.location.y) / this.tileSize);

        // Piece Board Coords
        const pBX = mBX - piece.grabTile.x;
        const pBY = mBY - piece.grabTile.y;

        const shape = piece.getShape();

        // If Piece outside the board
        if (!this.#doesPieceFit(shape, pBX, pBY)) {
            return 0;
        }

        // Update Board where the piece has been placed
        this.placePiece(shape, pBX, pBY, 1);

        // Piece Canvas Coords
        const pCX = this.location.x + (pBX * this.tileSize);
        const pCY = this.location.y + (pBY * this.tileSize); 
        
        return {x: pCX, y: pCY, bX: pBX, bY: pBY};
    }

    clear() {
        for (let y = 0; y < this.height; y++) {
            this.gaps[y] = []
            for (let x = 0; x < this.width; x++) {
                if (y < 2 && x > 5) {
                    this.gaps[y][x] = 1;
                } else if (y == 6 && x > 2) {
                    this.gaps[y][x] = 1;
                }else {
                    this.gaps[y][x] = 0;
                }
            }
        }
    }

    toCanvasCoords(x, y) {
        return {x: this.location.x + (x * this.tileSize), y: this.location.y + (y * this.tileSize)};
    }

    lift(piece, x, y) {
         // Mouse Board Coords
         const mBX = Math.floor((x - this.location.x) / this.tileSize);
         const mBY = Math.floor((y - this.location.y) / this.tileSize);
 
         // Piece Board Coords
         const pBX = mBX - piece.grabTile.x;
         const pBY = mBY - piece.grabTile.y;
 
         const shape = piece.getShape();
        
         // Update Board where the piece was placed
         this.placePiece(shape, pBX, pBY, 0);
    }

    solution() {
        let month = null;
        let day = null;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (y < 2 && x < 6) {
                    if (this.gaps[y][x] == 0) {
                        if (!month) {
                            month = (y * 6) + x;
                        } else {
                            return null;
                        }
                    }
                } else {
                    if (this.gaps[y][x] == 0) {
                        if (!day) {
                            day = ((y - 2) * 7) + x;
                        } else {
                            return null;
                        }
                    }
                }
            }
        }
        return {month: month, day: day};
    }

    placePiece(shape, pBX, pBY, place) {
        for (let i = 0; i < shape.length; i++) {
            const tX = shape[i].x + pBX;
            const tY = shape[i].y + pBY;
            this.gaps[tY][tX] = place;
        }
    }

    #doesPieceFit(shape, pBX, pBY) {
        for (let i = 0; i < shape.length; i++) {
            const tX = shape[i].x + pBX;
            const tY = shape[i].y + pBY;
            if (tX < 0 || tY < 0) return false;
            if (tX >= this.width || tY >= this.height) return false;
            if (this.gaps[tY][tX] == 1) return false;
        }
        return true;
    }
}