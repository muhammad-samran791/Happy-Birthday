// DOM Elements
const count = document.getElementById("count");
const head = document.getElementById("head");
const giftbox = document.getElementById("merrywrap");
const canvasC = document.getElementById("c");

const config = {
  birthdate: "June 26, 2026",
  firstName: "Armish",
};

function hideEverything() {
  head.style.display = "none";
  count.style.display = "none";
  giftbox.style.display = "none";
  canvasC.style.display = "none";
}
hideEverything();

// Confetti Setup
const confettiSettings = { target: "confetti" };
const confetti = new window.ConfettiGenerator(confettiSettings);
confetti.render();

// Time Calculations Constants
const second = 1000,
  minute = second * 60,
  hour = minute * 60,
  day = hour * 24;

const countDown = new Date(`${config.birthdate} 00:00:00`).getTime();

// Canvas & Animation Global Setup
let w = (canvasC.width = window.innerWidth);
let h = (canvasC.height = window.innerHeight);
let ctx = canvasC.getContext("2d");
let hw = w / 2;
let hh = h / 2;

const opts = {
  strings: ["HAPPY", "BIRTHDAY!", config.firstName],
  charSize: 50,
  charSpacing: 40, // Aap isey jo chahein set karein, text center hi rahega
  lineHeight: 70,
  cx: w / 2,
  cy: h / 2,
  fireworkPrevPoints: 10,
  fireworkBaseLineWidth: 5,
  fireworkAddedLineWidth: 8,
  fireworkSpawnTime: 200,
  fireworkBaseReachTime: 30,
  fireworkAddedReachTime: 30,
  fireworkCircleBaseSize: 20,
  fireworkCircleAddedSize: 10,
  fireworkCircleBaseTime: 30,
  fireworkCircleAddedTime: 30,
  fireworkCircleFadeBaseTime: 10,
  fireworkCircleFadeAddedTime: 5,
  fireworkBaseShards: 5,
  fireworkAddedShards: 5,
  fireworkShardPrevPoints: 3,
  fireworkShardBaseVel: 4,
  fireworkShardAddedVel: 2,
  fireworkShardBaseSize: 3,
  fireworkShardAddedSize: 3,
  gravity: 0.1,
  upFlow: -0.1,
  letterContemplatingWaitTime: 360,
  balloonSpawnTime: 20,
  balloonBaseInflateTime: 10,
  balloonAddedInflateTime: 10,
  balloonBaseSize: 20,
  balloonAddedSize: 20,
  balloonBaseVel: 0.4,
  balloonAddedVel: 0.4,
  balloonBaseRadian: -(Math.PI / 2 - 0.5),
  balloonAddedRadian: -1,
};

const Tau = Math.PI * 2;
const TauQuarter = Tau / 4;
let letters = [];

ctx.font = opts.charSize + "px Verdana";

// Letter Constructor & Prototype
function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;
  this.dx = -ctx.measureText(char).width / 2;
  this.dy = +opts.charSize / 2;
  this.fireworkDy = this.y - hh;

  // DRY Principle applied to color generation
  const baseColorStr = (hue) => `hue,80%,${hue}`;
  let hue =
    (x /
      (opts.charSpacing *
        Math.max(opts.strings[0].length, opts.strings[1].length))) *
    360;

  this.color = `hsl(${hue},80%,50%)`;
  this.lightAlphaColor = `hsla(${hue},80%,light%,alp)`;
  this.lightColor = `hsl(${hue},80%,light%)`;
  this.alphaColor = `hsla(${hue},80%,50%,alp)`;

  this.reset();
}

Letter.prototype.reset = function () {
  this.phase = "firework";
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
  this.reachTime =
    (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) |
    0;
  this.lineWidth =
    opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
};

Letter.prototype.step = function () {
  if (this.phase === "firework") {
    if (!this.spawned) {
      if (++this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;
      let linearProportion = this.tick / this.reachTime,
        armonicProportion = Math.sin(linearProportion * TauQuarter),
        x = linearProportion * this.x,
        y = hh + armonicProportion * this.fireworkDy;

      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();
      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

      let lineWidthProportion = 1 / (this.prevPoints.length - 1);
      for (let i = 1; i < this.prevPoints.length; ++i) {
        let point = this.prevPoints[i],
          point2 = this.prevPoints[i - 1];

        ctx.strokeStyle = this.alphaColor.replace(
          "alp",
          i / this.prevPoints.length,
        );
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }

      if (this.tick >= this.reachTime) {
        this.phase = "contemplate";
        this.circleFinalSize =
          opts.fireworkCircleBaseSize +
          opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime =
          (opts.fireworkCircleBaseTime +
            opts.fireworkCircleAddedTime * Math.random()) |
          0;
        this.circleCreating = true;
        this.circleFading = false;
        this.circleFadeTime =
          (opts.fireworkCircleFadeBaseTime +
            opts.fireworkCircleFadeAddedTime * Math.random()) |
          0;
        this.tick = 0;
        this.tick2 = 0;
        this.shards = [];

        let shardCount =
            (opts.fireworkBaseShards +
              opts.fireworkAddedShards * Math.random()) |
            0,
          angle = Tau / shardCount,
          cos = Math.cos(angle),
          sin = Math.sin(angle),
          sx = 1,
          sy = 0;

        for (let i = 0; i < shardCount; ++i) {
          let x1 = sx;
          sx = sx * cos - sy * sin;
          sy = sy * cos + x1 * sin;
          this.shards.push(new Shard(this.x, this.y, sx, sy, this.alphaColor));
        }
      }
    }
  } else if (this.phase === "contemplate") {
    ++this.tick;
    if (this.circleCreating) {
      ++this.tick2;
      let proportion = this.tick2 / this.circleCompleteTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 50 + 50 * proportion)
        .replace("alp", proportion);
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      ++this.tick2;
      let proportion = this.tick2 / this.circleFadeTime,
        armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor
        .replace("light", 100)
        .replace("alp", 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();

      if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }

    for (let i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();
      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }

    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = "balloon";
      this.tick = 0;
      this.spawning = true;
      this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
      this.inflating = false;
      this.inflateTime =
        (opts.balloonBaseInflateTime +
          opts.balloonAddedInflateTime * Math.random()) |
        0;
      this.size =
        (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

      let rad =
          opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
        vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

      this.vx = Math.cos(rad) * vel;
      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === "balloon") {
    ctx.strokeStyle = this.lightColor.replace("light", 80);

    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;
      let proportion = this.tick / this.inflateTime,
        bx = (this.cx = this.x),
        by = (this.cy = this.y - this.size * proportion);

      ctx.fillStyle = this.alphaColor.replace("alp", proportion);
      ctx.beginPath();
      generateBalloonPath(bx, by, this.size * proportion);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, this.y);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();

      ctx.fillStyle = this.lightColor.replace("light", 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

      if (this.cy + this.size < -hh || this.cx < -hw || this.cx > hw)
        this.phase = "done";
    }
  }
};

function Shard(x, y, vx, vy, color) {
  let vel =
    opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
  this.vx = vx * vel;
  this.vy = vy * vel;
  this.x = x;
  this.y = y;
  this.prevPoints = [[x, y]];
  this.color = color;
  this.alive = true;
  this.size =
    opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}

Shard.prototype.step = function () {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;

  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();
  this.prevPoints.push([this.x, this.y]);

  let lineWidthProportion = this.size / this.prevPoints.length;
  for (let k = 0; k < this.prevPoints.length - 1; ++k) {
    let point = this.prevPoints[k],
      point2 = this.prevPoints[k + 1];

    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }
  if (this.prevPoints[0][1] > hh) this.alive = false;
};

function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - size / 2,
    y - size / 2,
    x - size / 4,
    y - size,
    x,
    y - size,
  );
  ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
}

// Fixed Centering Initialization Logic
function initLetters() {
  letters = [];
  for (let i = 0; i < opts.strings.length; ++i) {
    const stringLength = opts.strings[i].length;
    // Perfect Math Formula for Absolute Centering with dynamic character spacing
    const totalRowWidth = (stringLength - 1) * opts.charSpacing;

    for (let j = 0; j < stringLength; ++j) {
      const charX = j * opts.charSpacing - totalRowWidth / 2;
      const charY =
        i * opts.lineHeight +
        opts.lineHeight / 2 -
        (opts.strings.length * opts.lineHeight) / 2;
      letters.push(new Letter(opts.strings[i][j], charX, charY));
    }
  }
}
initLetters();

function anim() {
  window.requestAnimationFrame(anim);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.translate(hw, hh);

  let done = true;
  for (let l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== "done") done = false;
  }
  ctx.translate(-hw, -hh);
  if (done) {
    for (let l = 0; l < letters.length; ++l) letters[l].reset();
  }
}

// Window Resize Observer
window.addEventListener("resize", function () {
  w = canvasC.width = window.innerWidth;
  h = canvasC.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
  ctx.font = opts.charSize + "px Verdana";
  initLetters(); // Dynamic center recalculation on screen scale
});

// Countdown Loop (Optimized without inner logic recreation)
const x = setInterval(function () {
  let now = new Date().getTime(),
    distance = countDown - now;

  if (distance > 0) {
    head.style.display = "initial";
    count.style.display = "initial";
    document.getElementById("day").innerText = Math.floor(distance / day);
    document.getElementById("hour").innerText = Math.floor(
      (distance % day) / hour,
    );
    document.getElementById("minute").innerText = Math.floor(
      (distance % hour) / minute,
    );
    document.getElementById("second").innerText = Math.floor(
      (distance % minute) / second,
    );
  } else {
    head.style.display = "none";
    count.style.display = "none";
    giftbox.style.display = "initial";
    clearInterval(x);

    let merrywrap = document.getElementById("merrywrap");
    let box = merrywrap.getElementsByClassName("giftbox")[0];
    let step = 1;
    let stepMinutes = [2000, 2000, 1000, 1000];

    function init() {
      box.addEventListener("click", openBox, false);
      box.addEventListener("click", showfireworks, false);
    }

    function stepClass(s) {
      merrywrap.className = "merrywrap step-" + s;
    }

    function openBox() {
      if (step === 1) box.removeEventListener("click", openBox, false);
      stepClass(step);
      if (step === 4) return;
      setTimeout(openBox, stepMinutes[step - 1]);
      step++;
    }

    function showfireworks() {
      canvasC.style.display = "initial";
      setTimeout(anim, 1500);
    }
    init();
  }
}, 1000); // 1000ms is perfectly fine for text-based time tracking
