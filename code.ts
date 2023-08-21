
let canvas: HTMLCanvasElement|null;
let widget: HTMLElement|null;
let ctx: CanvasRenderingContext2D|null;

let img: HTMLImageElement;
let imgloaded = false;

// const canvasSize = 300;
let canvasSize = 450;
let toggleSpeed = 237;
let scaleRatio = canvasSize / 300;

const widgetStore = {
    active: false,
    canvasSize: 300,
    toggleSpeed: 237,
    showAltitude: false,
    indicatedAltitude: false,
    showServer: false,
    enableHighlights: false,
    showWind: false
};
this.$api.datastore.import(widgetStore);

const ensureNumericSetting = (val: string, defaultValue: number) => {
    val = `${val}`.replace(/[^0-9]/g, '');
    if (!val) {
        return defaultValue;
    }

    const num = Number(val);
    if (isNaN(num)) {
        return defaultValue;
    }

    return num;
};

settings_define({
    canvasSize: {
        label: "Widget size",
        type: "text",
        description: "Widget size expressed in pixels, default and minimum is 300px",
        value: `${widgetStore.canvasSize}`,
        changed: (val) => {
            const num = ensureNumericSetting(val, 300);
            widgetStore.canvasSize = Math.max(num, 300);
            canvasSize = widgetStore.canvasSize;
            this.$api.datastore.export(widgetStore);
            resizeWidget();
        }
    },
    toggleSpeed: {
        label: 'Toggle speed',
        type: 'text',
        description: 'Speed above which the speed tape will switch from 250 to 500kt',
        value: `${widgetStore.toggleSpeed}`,
        changed: (val) => {
            const num = ensureNumericSetting(val, 237);
            widgetStore.toggleSpeed = Math.max(0, num);
            toggleSpeed = widgetStore.toggleSpeed;
            this.$api.datastore.export(widgetStore);
        }
    },
    showAltitude: {
        label: 'Show altitude',
        type: 'checkbox',
        description: 'Show altitude on top of the widget',
        value: widgetStore.showAltitude,
        changed: (val) => {
            widgetStore.showAltitude = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    indicatedAltitude: {
        label: 'Use indicated altitude',
        type: 'checkbox',
        description: 'Use indicated altitude instead of true altitude',
        value: widgetStore.indicatedAltitude,
        changed: (val) => {
            widgetStore.indicatedAltitude = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    showServer: {
        label: 'Show MSFS server',
        type: 'checkbox',
        description: 'Show which MSFS server currently being used',
        value: widgetStore.showServer,
        changed: (val) => {
            widgetStore.showServer = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    showWind: {
        label: 'Show wind indication',
        type: 'checkbox',
        description: 'Show wind direction and speed',
        value: widgetStore.showWind,
        changed: (val) => {
            widgetStore.showWind = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    enableHighlights: {
        label: 'Highlight data fields',
        type: 'checkbox',
        description: 'Highlight certain data fields, for example server',
        value: widgetStore.enableHighlights,
        changed: (val) => {
            widgetStore.enableHighlights = val;
            this.$api.datastore.export(widgetStore);
        }
    }
});

const resizeWidget = () => {
    if (widget && canvas) {
        widget.style.width = `${canvasSize}px`;
        widget.style.height = `${canvasSize}px`;

        canvas.width = canvasSize;
        canvas.height = canvasSize;
    }
}

run(() => {
    widgetStore.active = !widgetStore.active;
    this.$api.datastore.export(widgetStore);

    resizeWidget();

});

style(() => {
    if (widget) {
        if (widgetStore.active) {
            widget.classList.add('visible');
        } else {
            widget.classList.remove('visible');
        }
    }

    if (canvas && (canvas.width !== canvasSize || canvas.height !== canvasSize)) {
        resizeWidget();
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

    resizeWidget();
    const svgWidth = 32;
    const svgHeight = 35;

    img = new Image();
    img.src = "data:image/svg+xml," + encodeURIComponent(`<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.6667 5.69358C11.6667 3.61545 13.4288 1.60137e-07 15.5556 1.85498e-07C17.7431 2.11584e-07 19.4444 3.61545 19.4444 5.69358L19.4444 12.7786L30.1328 18.8854C30.7405 19.2318 31.1111 19.8759 31.1111 20.5747L31.1111 23.9896C31.1111 24.6337 30.4913 25.1016 29.8715 24.9253L19.4444 21.9479L19.4444 28.1944L22.9444 30.8194C23.1875 31.0017 23.3333 31.2934 23.3333 31.5972L23.3333 34.1493C23.3333 34.6233 22.9505 35 22.4826 35C22.4036 35 22.3247 34.9878 22.2457 34.9696L15.5556 33.0556L8.86545 34.9696C8.78646 34.9939 8.70747 35 8.62847 35C8.15451 35 7.77778 34.6172 7.77778 34.1493L7.77778 31.5972C7.77778 31.2934 7.92361 31.0017 8.16667 30.8194L11.6667 28.1944L11.6667 21.9418L1.23958 24.9193C0.619792 25.1016 1.23617e-07 24.6337 1.31298e-07 23.9896L1.72021e-07 20.5747C1.80354e-07 19.8759 0.376736 19.2318 0.978299 18.8854L11.6667 12.7786L11.6667 5.69358Z" fill="white"/></svg>`);
    img.onload = () => {
        imgloaded = true;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
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

    canvasSize = widgetStore.canvasSize;
    toggleSpeed = widgetStore.toggleSpeed;
    scaleRatio = canvasSize / 300;

    const speed = this.$api.variables.get('A:AIRSPEED INDICATED', 'Knots') as number;
    let heading = this.$api.variables.get('A:PLANE HEADING DEGREES GYRO', 'radians') as number;
    const alt = widgetStore.indicatedAltitude
        ? this.$api.variables.get('A:INDICATED ALTITUDE', 'Feet') as number
        : this.$api.variables.get('A:PLANE ALTITUDE', 'Feet') as number;

    const serverId = this.$api.community.get_server();
    const server = this.$api.community.get_servers().find(x => x.ID === serverId);

    heading = rad2deg(heading);
    render(ctx, speed, heading, alt, server);
});

const render = (ctx: CanvasRenderingContext2D, speed: number, heading: number, alt: number, server?: MsfsServer) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.filter = 'none';

    // Speed tape background
    const speedTapeBgSize = 80 * (canvasSize / 360);
    const speedTapeBgRadius = (canvasSize / 2) - (speedTapeBgSize / 2);
    ctx.beginPath();

    let startDegrees = -60;
    if (widgetStore.showAltitude) {
        startDegrees = -120;
    }

    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(startDegrees), deg2rad(120));
    ctx.lineWidth = speedTapeBgSize;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
    ctx.stroke();
    ctx.closePath();

    // Speed tape
    const speedTapeSize = 60 * (canvasSize / 360);
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(60), speedToRad(speed), true);
    ctx.lineWidth = speedTapeSize;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
    ctx.stroke();
    ctx.closePath();

    // Altitude indicator
    if (widgetStore.showAltitude) {
        ctx.textAlign = "center";
        const altitudeSize = 24 * scaleRatio;
        ctx.font = `italic ${altitudeSize}px sans-serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(`${alt.toFixed(0)}`, canvasSize / 2, 25 * scaleRatio)

        const altLabelSize = 18 * scaleRatio;
        ctx.font = `italic ${altLabelSize}px sans-serif`;
        ctx.fillText('ft', canvasSize / 2, 45 * scaleRatio);
    }

    // Speed label
    const speedLabelSize = 28 * scaleRatio;
    ctx.textAlign = "center";
    ctx.font = `italic ${speedLabelSize}px sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.fillText(`${speed.toFixed(0)}`, canvasSize / 2, canvasSize - (40 * scaleRatio));

    // knots
    const knotsLabelSize = 18 * scaleRatio;
    ctx.font = `italic ${knotsLabelSize}px sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.fillText(`kt`, canvasSize / 2, canvasSize - (20 * scaleRatio));
    ctx.closePath();


    // Speed ticks
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.fillStyle = "#aaa";
    ctx.rotate(deg2rad(60))

    for (let i = 60; i >= -60; i -= 4.8) {
        ctx.fillRect((canvasSize / 2) - (10 * scaleRatio), 0, 10 * scaleRatio, 2 * scaleRatio);
        ctx.rotate(deg2rad(-4.8))
    }
    ctx.resetTransform();

    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.fillStyle = "#fff";
    ctx.rotate(deg2rad(60))

    for (let i = 60; i >= -60; i -= 24) {
        ctx.fillRect((canvasSize / 2) - (20 * scaleRatio), 0, 20 * scaleRatio, 2 * scaleRatio);
        ctx.rotate(deg2rad(-24))
    }
    ctx.resetTransform();

    // speed labels
    ctx.fillStyle = '#fff';
    const speedTickLabelSize = 18 * scaleRatio;
    ctx.font = `${speedTickLabelSize}px sans-serif`;

    let speeds = ["0", "50", "100", "150", "200", "250"];
    if (speed > toggleSpeed) {
        speeds = ["0", "100", "200", "300", "400", "500"];
    }

    for (const [idx, speed] of speeds.entries()) {
        drawSpeedTickLabel(ctx, speed, 60 - (24 * idx));
    }

    ctx.resetTransform();

    drawCompass(ctx, heading);

    if (widgetStore.showServer && server) {
        drawServer(ctx, server);
    }

    if (widgetStore.showWind) {
        drawWind(ctx)
    }
};

const drawServer = (ctx: CanvasRenderingContext2D, server: MsfsServer) => {
    ctx.resetTransform();
    // Server background
    const speedTapeBgSize = 80 * (canvasSize / 360);
    const speedTapeBgRadius = (canvasSize / 2) - (speedTapeBgSize / 2);
    ctx.beginPath();

    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(130), deg2rad(160));
    ctx.lineWidth = speedTapeBgSize;
    if (widgetStore.enableHighlights) {
        ctx.strokeStyle = "rgba(6, 78, 9, 0.7)"
    } else {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
    }

    ctx.stroke();
    ctx.closePath();

    ctx.textAlign = "center";
    const serverLabelSize = 14 * scaleRatio;
    ctx.font = `italic ${serverLabelSize}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.translate(canvasSize / 2, canvasSize / 2);

    const rot = -34;

    ctx.rotate(deg2rad(rot))
    ctx.translate( (-canvasSize / 2) + (speedTapeBgSize / 2), 0)
    ctx.rotate(deg2rad(-rot))

    ctx.fillText('Server', 0, -5 * scaleRatio)

    const serverSize = 16 * scaleRatio;
    ctx.font = `italic ${serverSize}px sans-serif`;
    const fmtServerName = getServerName(server.ID as MsfsServerID);

    ctx.fillText(fmtServerName, 5, 10 * scaleRatio)
}

const drawWind = (ctx: CanvasRenderingContext2D) => {

    const windDir = this.$api.variables.get('A:AMBIENT WIND DIRECTION', 'radians') as number;
    const windVel = this.$api.variables.get('A:AMBIENT WIND VELOCITY', 'knots') as number;

    ctx.resetTransform();
    // Server background
    const speedTapeBgSize = 80 * (canvasSize / 360);
    const speedTapeBgRadius = (canvasSize / 2) - (speedTapeBgSize / 2);
    ctx.beginPath();

    if (widgetStore.showServer) {
        ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(170), deg2rad(200));
    } else {
        ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(130), deg2rad(160));
    }
    ctx.lineWidth = speedTapeBgSize;
    if (widgetStore.enableHighlights) {
        ctx.strokeStyle = "rgba(6, 78, 9, 0.7)"
    } else {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)"
    }

    ctx.stroke();
    ctx.closePath();

    ctx.textAlign = "center";
    const serverLabelSize = 14 * scaleRatio;
    ctx.font = `italic ${serverLabelSize}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.translate(canvasSize / 2, canvasSize / 2);

    let rot = 7;
    if (!widgetStore.showServer) {
        rot = -34;
    }

    ctx.rotate(deg2rad(rot))
    ctx.translate( (-canvasSize / 2) + (speedTapeBgSize / 2), 0)
    ctx.rotate(deg2rad(-rot))

    ctx.fillText(`${rad2deg(windDir).toFixed(0)} deg`, 0, -5 * scaleRatio)
    ctx.fillText(`@${windVel.toFixed(0)} kt`, 0, 10 * scaleRatio)

    // const serverSize = 16 * scaleRatio;
    // ctx.font = `italic ${serverSize}px sans-serif`;
    // const fmtServerName = getServerName(server.ID as MsfsServerID);
    //
}

const getServerName = (id: MsfsServerID) => {
    if (id === 'WestEurope') {
        return 'W EU'
    } else if (id === 'EastUs') {
        return 'E USA'
    } else if (id === 'NorthEurope') {
        return 'N EU'
    } else if (id === 'WestUs') {
        return 'W USA'
    } else if (id === 'SoutheastAsia') {
        return 'SE A'
    } else {
        return '-'
    }
};

const drawSpeedTickLabel = (ctx: CanvasRenderingContext2D, speed: string, degOffset: number) => {
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate(deg2rad(degOffset));
    ctx.textAlign = "end";
    ctx.translate((canvasSize / 2) - (23 * scaleRatio), 0);
    ctx.rotate(-deg2rad(degOffset));

    if (degOffset === -60) {
        ctx.fillText(`${speed}`, 27 * scaleRatio, 10 * scaleRatio);
    } else if (degOffset === 60) {
        ctx.fillText(`${speed}`, 3 * scaleRatio, -8 * scaleRatio);
    } else {
        ctx.fillText(`${speed}`, 0, 0);
    }
    ctx.resetTransform();
}

const drawCompass = (ctx: CanvasRenderingContext2D, deg: number) => {
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.textAlign = "center";

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
    ctx.arc(0, 0, centerCircleSize - (10 * scaleRatio), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
    ctx.fill();
    ctx.closePath();

    if (imgloaded) {
        ctx.drawImage(img, -15 * scaleRatio, -30 * scaleRatio, 32 * scaleRatio, 35 * scaleRatio);
    }

    // Degrees display
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle"
    const compassTextSize = 16 * scaleRatio;
    ctx.font = `${compassTextSize}px sans-serif`
    // @ts-ignore
    const paddedText = `${deg.toFixed(0)}`.padStart(3, '0');
    const degText = `${paddedText}`;
    ctx.fillText(degText, 0, 15 * scaleRatio);

    // Top arc
    ctx.beginPath();
    ctx.arc(0, 0, centerCircleSize - (5 * scaleRatio), deg2rad(-120), deg2rad(-60));
    ctx.lineWidth = 12 * scaleRatio;
    ctx.stroke();

    // triangle
    const triangleX = 0;
    const triangleY = -(centerCircleSize - (10 * scaleRatio));
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = "#fff"
    ctx.moveTo(triangleX - (5 * scaleRatio), triangleY);
    ctx.lineTo(triangleX + (5 * scaleRatio), triangleY);
    ctx.lineTo(triangleX, triangleY + (15 * scaleRatio));
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

    const textOffset = -(centerCircleSize - (35 * scaleRatio));
    const textSizeLarge = 18 * scaleRatio;
    const textSizeSmall= 14 * scaleRatio;

    for (const direction of directions) {
        if (direction.length === 2) {
            ctx.font = `${textSizeSmall}px sans-serif`
        } else {
            ctx.font = `${textSizeLarge}px sans-serif`
        }
        ctx.fillText(direction, 0, textOffset);
        ctx.rotate(deg2rad(45));
    }
};

const speedToRad = (speed: number) => {
    let maxSpeed = 250;
    if (speed > toggleSpeed) {
        maxSpeed = 500;
    }

    speed = Math.min(speed, maxSpeed);
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
