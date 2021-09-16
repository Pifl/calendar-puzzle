export class Matrix {
    /*
        a 	c 	e
        b 	d 	f
        0 	0 	1
    */
    constructor() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    }

    toArray() {
        return [this.a, this.b, this.c, this.d, this.e, this.f];
    }

    rotationArray() {
        return {a: this.a, 
                b: this.b,
                c: this.c,
                d: this.d};
    }

    rotate(angle) {
        let rotationMatrix = new Matrix();
        const rad = angle * (Math.PI / 180);
        rotationMatrix.a = Math.cos(rad);
        rotationMatrix.b = -Math.sin(rad);
        rotationMatrix.c = Math.sin(rad);
        rotationMatrix.d = Math.cos(rad);

        this.multiply(rotationMatrix);
    }

    translate(x, y) {
        this.e = x;
        this.f = y;
    }

    flipX() {
        let flipMatrix = new Matrix();
        flipMatrix.d = -1;
        this.multiply(flipMatrix);
    }

    flipY() {
        let flipMatrix = new Matrix();
        flipMatrix.a = -1;
        this.multiply(flipMatrix);
    }

    /*
        a 	c 	e       a   c   e       (a * a) + (c * b) + (e * 0)     (a * c) + (c * d) + (e * 0)     (a * e) + (c * f) + (e * 1)
        b 	d 	f   x   b   d   f   =   (b * a) + (d * b) + (f * 0)     (b * c) + (d * d) + (f * 0)     (b * e) + (d * f) + (f * 1)
        0 	0 	1       0   0   1       (0 * a) + (0 * b) + (1 * 0)     (0 * c) + (0 * d) + (1 * 0)     (0 * e) + (0 * f) + (1 * 1)
    */
    multiply(other) {
        const a = (this.a * other.a) + (this.c * other.b) + (this.e * 0);
        const b = (this.b * other.a) + (this.d * other.b) + (this.f * 0);
        const c = (this.a * other.c) + (this.c * other.d) + (this.e * 0);
        const d = (this.b * other.c) + (this.d * other.d) + (this.f * 0);
        const e = (this.a * other.e) + (this.c * other.f) + (this.e * 1);
        const f = (this.b * other.e) + (this.d * other.f) + (this.f * 1);

        this.a = Math.round(a);
        this.b = Math.round(b);
        this.c = Math.round(c);
        this.d = Math.round(d);
        this.e = Math.round(e);
        this.f = Math.round(f);
    }
    
    transform(shape) {
        let newShape = [];
        for (let i = 0; i < shape.length; i++) {
            let x = shape[i].x;
            let y = shape[i].y;

            let xbar = Math.round((this.a * x) + (this.c * y));
            let ybar = Math.round((this.b * x) + (this.d * y));
            newShape.push({x: xbar, y: ybar});
        }
        return newShape;
    }
}
