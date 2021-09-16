export class Solutions {

    constructor() {
        this.months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

        this.month = 6;
        this.day = 5;


        const upArrow = arrow(true, 35, 10);
        const downArrow = arrow(false, 35, 10);
        const arrowHitBox = new Path2D();
        arrowHitBox.rect(0, 0, 35, 10)

        this.buttons = [];
        this.buttons.push(new Button(385, 65, upArrow, arrowHitBox, ()=>{this.day = this.boundedAdd(this.day, 1, 31)}));
        this.buttons.push(new Button(385, 125, downArrow, arrowHitBox, ()=>{this.day = this.boundedAdd(this.day, -1, 31)}));
        this.buttons.push(new Button(505, 65, upArrow, arrowHitBox, ()=>{this.month = this.boundedAdd(this.month, 1, 12)}));
        this.buttons.push(new Button(505, 125, downArrow, arrowHitBox, ()=>{this.month = this.boundedAdd(this.month, -1, 12)}));

        this.solutions = [];
    }

    boundedAdd(value, delta, bound) {
        let v = value + delta;
        v = v % bound;
        if (v < 0) {
            v = bound + v;
        }
        return v;
    }

    date() {
        return {month: this.months[this.month], day: this.day + 1}
    }

    draw(canvas) {
        

        const dayOfMonth = this.day + 1;
        const dayMod = dayOfMonth % 10;
        let daySuffix = "th";
        if (dayOfMonth < 10 || dayOfMonth > 14) {
            daySuffix = dayMod == 1 ? "st" : dayMod == 2 ? "nd" : dayMod == 3 ? "rd" : "th";
        }
        const dayText = dayOfMonth + daySuffix;
        const monthText = this.months[this.month];
        canvas.globalAlpha = 1;
        canvas.shadowOffsetX = 0;
        // canvas.shadowBlur = 0;
        canvas.strokeStyle = 'rgba(0,0,0,1)';
        canvas.fillStyle = 'black';
        this.buttons.forEach((b) => b.draw(canvas));

        if (this.solutions[this.months[this.month]][this.day]) {
            canvas.fillStyle = 'green';
        }
        
        canvas.font = '30px Verdana'
        const width = canvas.measureText(dayOfMonth).width;

        canvas.fillText(dayOfMonth, 400 - (width / 2), 110);
        canvas.fillText('of', 450, 110);
        canvas.fillText(monthText, 500, 110);

        canvas.font = '15px Verdana'
        canvas.fillText(daySuffix, 400 + (width/2), 110);
    }

    press(canvas, x, y) {
        if (this.buttons.filter((b) => b.press(canvas, x, y)).length > 0) {
            return this.solutions[this.months[this.month]][this.day];
        }
        return false;
    }

    release() {
        this.buttons.forEach((b) => b.release());
    }

    load(data) {
        this.solutions = data;
    }

    add(month, day) {
        this.month = month;
        this.day = day;
        if (this.solutions[this.months[month]][day]) return null;
        this.solutions[this.months[month]][day] = true;
        return {month: this.months[month], day: this.day + 1};
    }
}

function arrow(up, width, height) {
    let arrowPath = new Path2D();
    if (up) {
        arrowPath.moveTo(0,height);
        arrowPath.lineTo(width/2, 0);
        arrowPath.lineTo(width, height);    
    } else {
        arrowPath.moveTo(0,0);
        arrowPath.lineTo(width/2,height);
        arrowPath.lineTo(width, 0);
    }
    return arrowPath;
}
class Button {
    constructor(x, y, graphic, hitbox, action) {
        this.x = x;
        this.y = y;
        this.graphic = graphic;
        this.hitbox = hitbox;    
        this.action = action;

        this.down = false;
    }

    draw(canvas) {
        canvas.lineWidth = 2;
        canvas.translate(this.x, this.y)
        canvas.stroke(this.graphic);
        canvas.setTransform(1, 0, 0, 1, 0, 0);
    }

    press(canvas, x, y) {
        let inPath = true;
        canvas.translate(this.x, this.y)
        inPath = canvas.isPointInPath(this.hitbox, x, y)
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        if (inPath && !this.down) {
            this.down = true
            this.action();
            return true;
        } 
        return false;
    }

    release() {
        this.down = false;
    }
}