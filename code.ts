
let canvas: HTMLCanvasElement|null;
let widget: HTMLElement|null;
let ctx: CanvasRenderingContext2D|null;

let img: HTMLImageElement;
let imgloaded = false;

const canvasSize = 300;
const toggleSpeed = 237;

const widgetStore = {
    active: false
};
this.$api.datastore.import(widgetStore);


run(() => {
    widgetStore.active = !widgetStore.active;
    this.$api.datastore.export(widgetStore);
});

style(() => {
    if (widget) {
        if (widgetStore.active) {
            widget.classList.add('visible');
        } else {
            widget.classList.remove('visible');
        }
    }

    return widgetStore.active ? 'active' : null;
});

html_created((el) => {
    widget = el.querySelector('#ranbogmord-steveo-dash');
    canvas = el.querySelector('#ranbogmord-steveo-dash-canvas') as HTMLCanvasElement | null;

    if (widget) {
        if (widgetStore.active) {
            widget.classList.add('visible');
        } else {
            widget.classList.remove('visible');
        }
    }

    if (!canvas) {
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    img = new Image();
    img.src = "data:image/svg+xml," + encodeURIComponent('<svg width="32" height="35" viewBox="0 0 32 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.6667 5.69358C11.6667 3.61545 13.4288 1.60137e-07 15.5556 1.85498e-07C17.7431 2.11584e-07 19.4444 3.61545 19.4444 5.69358L19.4444 12.7786L30.1328 18.8854C30.7405 19.2318 31.1111 19.8759 31.1111 20.5747L31.1111 23.9896C31.1111 24.6337 30.4913 25.1016 29.8715 24.9253L19.4444 21.9479L19.4444 28.1944L22.9444 30.8194C23.1875 31.0017 23.3333 31.2934 23.3333 31.5972L23.3333 34.1493C23.3333 34.6233 22.9505 35 22.4826 35C22.4036 35 22.3247 34.9878 22.2457 34.9696L15.5556 33.0556L8.86545 34.9696C8.78646 34.9939 8.70747 35 8.62847 35C8.15451 35 7.77778 34.6172 7.77778 34.1493L7.77778 31.5972C7.77778 31.2934 7.92361 31.0017 8.16667 30.8194L11.6667 28.1944L11.6667 21.9418L1.23958 24.9193C0.619792 25.1016 1.23617e-07 24.6337 1.31298e-07 23.9896L1.72021e-07 20.5747C1.80354e-07 19.8759 0.376736 19.2318 0.978299 18.8854L11.6667 12.7786L11.6667 5.69358Z" fill="white"/></svg>');
    img.onload = () => {
        imgloaded = true;
    }

    // render(ctx);
});

loop_30hz(() => {
    if (!widgetStore.active) {
        return;
    }

    if (!ctx) {
        return;
    }

    const speed = this.$api.variables.get('A:AIRSPEED INDICATED', 'Knots') as number;
    let heading = this.$api.variables.get('A:PLANE HEADING DEGREES GYRO', 'radians') as number;
    heading = rad2deg(heading);
    render(ctx, speed, heading);
});

const render = (ctx: CanvasRenderingContext2D, speed: number, heading: number) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Speed tape background
    const speedTapeBgSize = 80 * (canvasSize / 360);
    const speedTapeBgRadius = (canvasSize / 2) - (speedTapeBgSize / 2);
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(-60), deg2rad(120));
    ctx.lineWidth = speedTapeBgSize;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.9)"
    ctx.stroke();
    ctx.closePath();

    // Speed tape
    const speedTapeSize = 60 * (canvasSize / 360);
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(60), speedToRad(speed), true);
    ctx.lineWidth = speedTapeSize;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.stroke();
    ctx.closePath();

    // Speed label
    ctx.textAlign = "center";
    ctx.font = "italic 28px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`${speed.toFixed(0)}`, canvasSize / 2, canvasSize - 40);

    // knots
    ctx.font = "italic 18px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText(`kt`, canvasSize / 2, canvasSize - 20);
    ctx.closePath();


    // Speed ticks
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.fillStyle = "#aaa";
    ctx.rotate(deg2rad(60))

    for (let i = 60; i >= -60; i -= 4.8) {
        ctx.fillRect((canvasSize / 2) - 10, 0, 10, 2);
        ctx.rotate(deg2rad(-4.8))
    }
    ctx.resetTransform();

    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.fillStyle = "#fff";
    ctx.rotate(deg2rad(60))

    for (let i = 60; i >= -60; i -= 24) {
        ctx.fillRect((canvasSize / 2) - 20, 0, 20, 2);
        ctx.rotate(deg2rad(-24))
    }
    ctx.resetTransform();

    // speed labels
    ctx.translate(canvasSize / 2, canvasSize / 2);
    if (speed > toggleSpeed) {
        ctx.fillText("0", 63, 105);
        ctx.fillText("100", 85, 75);
        ctx.fillText("200", 108, 27);
        ctx.fillText("300", 108, -23);
        ctx.fillText("400", 85, -70);
        ctx.fillText("500", 75, -100);
    } else {
        ctx.fillText("0", 63, 105);
        ctx.fillText("50", 90, 75);
        ctx.fillText("100", 108, 27);
        ctx.fillText("150", 108, -23);
        ctx.fillText("200", 90, -70);
        ctx.fillText("250", 75, -100);
    }

    ctx.resetTransform();

    drawCompass(ctx, heading);
};

const drawCompass = (ctx: CanvasRenderingContext2D, deg: number) => {
    ctx.translate(canvasSize / 2, canvasSize / 2);

    // center circle background
    ctx.beginPath();
    ctx.strokeStyle = "#f4f4f4";
    ctx.lineWidth = 5;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    const centerCircleSize = 90 * (canvasSize / 360);
    ctx.arc(0, 0, centerCircleSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // center circle inner background
    ctx.arc(0, 0, centerCircleSize - 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fill();
    ctx.closePath();

    if (imgloaded) {
        ctx.drawImage(img, -15, -30);
    }

    // Degrees display
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle"
    ctx.font = "16px sans-serif"
    // @ts-ignore
    const paddedText = `${deg.toFixed(0)}`.padStart(3, '0');
    const degText = `${paddedText}`;
    ctx.fillText(degText, 0, 15);

    // Top arc
    ctx.beginPath();
    ctx.arc(0, 0, centerCircleSize - 5, deg2rad(-120), deg2rad(-60));
    ctx.lineWidth = 12;
    ctx.stroke();

    // triangle
    const triangleX = 0;
    const triangleY = -(centerCircleSize - 10);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#fff"
    ctx.moveTo(triangleX - 5, triangleY);
    ctx.lineTo(triangleX + 5, triangleY);
    ctx.lineTo(triangleX, triangleY + 15);
    ctx.fill();
    ctx.closePath();

    // directions
    if ([45, 135, 225, 315].includes(deg)) {
        deg += 0.2;
    }

    ctx.rotate(deg2rad(360 - deg));
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff"
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    for (const direction of directions) {
        if (direction.length === 2) {
            ctx.font = "14px sans-serif"
        } else {
            ctx.font = "18px sans-serif"
        }
        ctx.fillText(direction, 0, -40);
        ctx.rotate(deg2rad(45));
    }
};

const speedToRad = (speed: number) => {
    let maxSpeed = 250;
    if (speed > toggleSpeed) {
        maxSpeed = 500;
    }

    speed = Math.min(speed, maxSpeed); // Max out at 250kts for now
    const pct = speed / maxSpeed;
    const deg = 60 - (120 * pct); // our arc is 120deg long going from 60deg to -60deg
    return deg2rad(deg);
}

const rad2deg = (rad: number) => {
    return rad * 180 / Math.PI;
}

const deg2rad = (deg: number) => {
    return deg * Math.PI / 180;
}
