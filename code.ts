
let canvas: HTMLCanvasElement|null;
let widget: HTMLElement|null;
let ctx: CanvasRenderingContext2D|null;

let img: HTMLImageElement;
let imgloaded = false;

// const canvasSize = 300;
let canvasSize = 450;
let toggleSpeed = 237;
let machSwapSpeed = 0.79;
let scaleRatio = canvasSize / 300;
let lastOpenedByTwitch = 0;

const widgetStore = {
    active: false,
    canvasSize: 300,
    toggleSpeed: 237,
    showAltitude: false,
    indicatedAltitude: false,
    showServer: false,
    enableHighlights: false,
    showWind: false,
    showNrst: false,
    enableTwitch: false,
    enableMach: false,
    machSwapSpeed: 0.79,
    nrstMinRwyLength: 0,
    twitchTimeout: 0,
    twitchStaffOnly: false
};
this.$api.datastore.import(widgetStore);

const ensureNumericSetting = (val: string, defaultValue: number) => {
    val = `${val}`.replace(/[^0-9.]/g, '');
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
    enableMach: {
        label: 'Enable switching to Mach',
        type: 'checkbox',
        description: 'Automatically switch the widget to Mach mode',
        value: widgetStore.enableMach,
        changed: (val) => {
            widgetStore.enableMach = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    machSwapSpeed: {
        label: 'Mach switch speed',
        type: 'text',
        description: 'Mach speed when the widget switches to Mach mode',
        value: `${widgetStore.machSwapSpeed}`,
        changed: (val) => {
            const num = ensureNumericSetting(val, 0.79);
            widgetStore.machSwapSpeed = Math.max(0, num);
            machSwapSpeed = widgetStore.machSwapSpeed;
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
    showNrst: {
        label: 'Show nearest airport',
        type: 'checkbox',
        description: 'Show nearest airport ICAO code',
        value: widgetStore.showNrst,
        changed: (val) => {
            widgetStore.showNrst = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    nrstMinRwyLength: {
        label: 'Nearest min rwy length',
        type: 'text',
        description: 'Minimum runway length to be considered as a "nearest" airport (in meters)',
        value: `${widgetStore.nrstMinRwyLength}`,
        changed: (val) => {
            let num = ensureNumericSetting(val, 0)
            widgetStore.nrstMinRwyLength = Math.max(0, num);
            this.$api.datastore.export(widgetStore)
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
    },
    enableTwitch: {
        label: 'Enable Twitch integration',
        type: 'checkbox',
        description: 'Allows Twitch chat to use the command !dashboard to open the widget',
        value: widgetStore.enableTwitch,
        changed: (val) => {
            widgetStore.enableTwitch = val;
            this.$api.datastore.export(widgetStore);
        }
    },
    twitchTimeout: {
        label: 'Twitch timeout',
        type: 'text',
        description: 'Sets how often chat can open the widget (in seconds). 300s = chat can open the widget every 5 minutes',
        value: `${widgetStore.twitchTimeout}`,
        changed: (val) => {
            widgetStore.twitchTimeout = Math.max(0, ensureNumericSetting(val, 0));
            this.$api.datastore.export(widgetStore);
        }
    },
    twitchStaffOnly: {
        label: 'Twitch Staff only',
        type: 'checkbox',
        description: 'Only Twitch mods and the broadcaster can open the widget',
        value: widgetStore.twitchStaffOnly,
        changed: (val) => {
            widgetStore.twitchStaffOnly = val;
            this.$api.datastore.export(widgetStore);
        }
    },
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


    doRender(ctx);
    resizeWidget();
});

loop_30hz(() => {
    if (!widgetStore.active) {
        return;
    }

    if (!ctx) {
        return;
    }

    doRender(ctx);
});

twitch_message((message) => {
    if (!widgetStore.enableTwitch || widgetStore.active) {
        return
    }

    if (message?.command?.botCommand === "dashboard") {
        if (widgetStore.twitchStaffOnly) {
            if (!message.tags.badges?.broadcaster && message.tags.mod !== "1") {
                return;
            }
        }

        const n = +(new Date());
        if (n - lastOpenedByTwitch > widgetStore.twitchTimeout * 1000) {
            lastOpenedByTwitch = +(new Date());
            widgetStore.active = true;
            this.$api.datastore.export(widgetStore);

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
        }
    }
})

const doRender = (ctx: CanvasRenderingContext2D) => {
    canvasSize = widgetStore.canvasSize;
    toggleSpeed = widgetStore.toggleSpeed;
    machSwapSpeed = widgetStore.machSwapSpeed;
    scaleRatio = canvasSize / 300;

    const speed = this.$api.variables.get('A:AIRSPEED INDICATED', 'Knots') as number;
    const speedMach = this.$api.variables.get('A:AIRSPEED MACH', 'Mach') as number;
    let heading = this.$api.variables.get('A:PLANE HEADING DEGREES GYRO', 'radians') as number;
    const alt = widgetStore.indicatedAltitude
        ? this.$api.variables.get('A:INDICATED ALTITUDE', 'Feet') as number
        : this.$api.variables.get('A:PLANE ALTITUDE', 'Feet') as number;

    const serverId = this.$api.community.get_server();
    const server = this.$api.community.get_servers().find(x => x.ID === serverId);

    heading = rad2deg(heading);
    render(ctx, speed, speedMach, heading, alt, server);
}

const calculateDataPosition = (pos: number) => {
    pos -= 1
    const start = 120 + ((30 + 7.5) * pos) + 7.5;

    return {
        start,
        end: start + 30
    };
};

type DataPositionIndex = 1|2|3;
const dataPositions = {
    1: { ...calculateDataPosition(1), rot: -34 },
    2: { ...calculateDataPosition(2), rot: 2 },
    3: { ...calculateDataPosition(3), rot: 39 },
}

const render = (ctx: CanvasRenderingContext2D, speed: number, speedMach: number, heading: number, alt: number, server?: MsfsServer) => {

    const showMach = widgetStore.enableMach && speedMach >= machSwapSpeed;
    let speedToShow = speed;
    let speedLabelToShow = "kt";
    let speedDecimals = 0;
    if (showMach) {
        speedToShow = speedMach;
        speedLabelToShow = "Mach";
        speedDecimals = 3;
        if (speedMach >= 1) {
            speedDecimals = 2;
        }
    }

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

    let maxSpeed = 250;
    if (showMach) {
        maxSpeed = 1;

        if (speedMach > 0.9) {
            maxSpeed = 2;
        }
        if (speedMach > 1.9) {
            maxSpeed = 3;
        }
        if (speedMach > 2.9) {
            maxSpeed = 5;
        }
    } else if (speed > toggleSpeed) {
        maxSpeed = 500;
    }

    // Speed tape
    speed = Math.min(speedToShow, maxSpeed);
    const pct = speedToShow / maxSpeed;
    const deg = 60 - (120 * pct); // our arc is 120deg long going from 60deg to -60deg
    const rads = deg2rad(deg);


    const speedTapeSize = 60 * (canvasSize / 360);
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(60), rads, true);
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
    let speedDisplay = speedToShow.toFixed(speedDecimals)
    if (speedDecimals === 3) {
        speedDisplay = speedDisplay.replace(/^0\./, '.');
    }

    ctx.fillText(`${speedDisplay}`, canvasSize / 2, canvasSize - (40 * scaleRatio));

    // knots
    const knotsLabelSize = 18 * scaleRatio;
    ctx.font = `italic ${knotsLabelSize}px sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.fillText(`${speedLabelToShow}`, canvasSize / 2, canvasSize - (20 * scaleRatio));
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

    if (showMach) {
        speeds = ["0", "0.20", "0.40", "0.60", "0.80", "1.00"];

        if (speedMach > 0.90) {
            speeds = ["0", "0.40", "0.80", "1.20", "1.60", "2.00"];
        }
        if (speedMach > 1.90) {
            speeds = ["0", "0.60", "1.20", "1.80", "2.40", "3.00"];
        }
        if (speedMach > 2.90) {
            speeds = ["0", "1.00", "2.00", "3.00", "4.00", "5.00"];
        }
    }

    for (const [idx, speed] of speeds.entries()) {
        drawSpeedTickLabel(ctx, speed, 60 - (24 * idx));
    }

    ctx.resetTransform();

    drawCompass(ctx, heading);

    let pos: DataPositionIndex = 1;
    if (widgetStore.showServer && server) {
        drawServer(ctx, server, pos as DataPositionIndex);
        pos += 1;
    }

    if (widgetStore.showWind) {
        drawWind(ctx, pos as DataPositionIndex);
        pos += 1;
    }

    if (widgetStore.showNrst) {
        drawNearest(ctx, pos as DataPositionIndex);
        pos += 1;
    }
};

const drawDataBackground = (ctx: CanvasRenderingContext2D, pos: DataPositionIndex) => {
    ctx.resetTransform();
    // Server background
    const speedTapeBgSize = 80 * (canvasSize / 360);
    const speedTapeBgRadius = (canvasSize / 2) - (speedTapeBgSize / 2);
    ctx.beginPath();

    ctx.arc(canvasSize / 2, canvasSize / 2, speedTapeBgRadius, deg2rad(dataPositions[pos].start), deg2rad(dataPositions[pos].end));
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

    const rot = dataPositions[pos].rot;

    ctx.rotate(deg2rad(rot))
    ctx.translate( (-canvasSize / 2) + (speedTapeBgSize / 2), 0)
    ctx.rotate(deg2rad(-rot))
}

const drawServer = (ctx: CanvasRenderingContext2D, server: MsfsServer, pos: DataPositionIndex) => {
    drawDataBackground(ctx, pos);

    ctx.fillText('Server', 0, -5 * scaleRatio)

    const serverSize = 16 * scaleRatio;
    ctx.font = `italic ${serverSize}px sans-serif`;
    const fmtServerName = getServerName(server.ID as MsfsServerID);

    ctx.fillText(fmtServerName, 5, 10 * scaleRatio)
}

const drawWind = (ctx: CanvasRenderingContext2D, pos: DataPositionIndex) => {
    const windDir = this.$api.variables.get('A:AMBIENT WIND DIRECTION', 'radians') as number;
    const windVel = this.$api.variables.get('A:AMBIENT WIND VELOCITY', 'knots') as number;

    drawDataBackground(ctx, pos);

    ctx.fillText(`${rad2deg(windDir).toFixed(0)} deg`, 0, -5 * scaleRatio)
    ctx.fillText(`@${windVel.toFixed(0)} kt`, 0, 10 * scaleRatio)
}

let nrst = "-";

const updateNearest = () => {
    const lat = this.$api.variables.get('A:PLANE LATITUDE', 'degrees') as number;
    const lon = this.$api.variables.get('A:PLANE LONGITUDE', 'degrees') as number;

    this.$api.airports.find_airports_by_coords(
        'dash_get_nrst',
        lon,
        lat,
        1_000_000,
        300,
        (airports) => {
            if (!airports.length) {
                nrst = '-';
                return;
            }

            airports.sort((a, b) => {
                return getDistance(lat, lon, a.lat, a.lon) < getDistance(lat, lon, b.lat, b.lon) ? -1 : 1;
            });

            airports = airports.filter((apt) => {
                const longest = apt.runways?.reduce((acc, item) => {
                    if (item.length > acc) {
                        acc = item.length;
                    }
                    return acc;
                }, 0) || 0;

                return longest > widgetStore.nrstMinRwyLength;
            });


            const closest = airports.shift();
            if (closest) {
                nrst = closest.icao;
            }
        }, () => {}, () => {}, true);
};
let updateNearestInterval: number|null = null;

loop_1hz(() => {
    if (!updateNearestInterval) {
        updateNearestInterval = setInterval(() => {
            updateNearest();
        }, 30_000);
        if (nrst === "-") {
            updateNearest();
        }
    }
});
exit(() => {
    if (updateNearestInterval) {
        clearInterval(updateNearestInterval);
    }
});

const drawNearest = (ctx: CanvasRenderingContext2D, pos: DataPositionIndex) => {
    drawDataBackground(ctx, pos);

    ctx.fillText('Nearest', 0, -5 * scaleRatio)
    ctx.fillText(`${nrst}`, 0, 10 * scaleRatio)
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

const rad2deg = (rad: number) => {
    return rad * 180 / Math.PI;
}

const deg2rad = (deg: number) => {
    return deg * Math.PI / 180;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}
