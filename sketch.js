let occupancyBands = [
  { label: "1–10", max: 10, color: "#bafcba" },
  { label: "11–50", max: 50, color: "#ffff94" },
  { label: "51–100", max: 100, color: "#ffd88f" },
  { label: "101–300", max: 300, color: "#ff9f9f" },
  { label: "300+", max: Infinity, color: "#d7bdff" }
];
let placeShapes = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon"];
let spiralSteps = 1200;
let spiralTurns = 3.25;
let places = [];
let placeNames = [];
let spiral = [];
let markers = [];

async function setup() {
  places = await (await fetch("data.json")).json();
  placeNames = [...new Set(places.map(({ place }) => place))];
  createCanvas(max(320, windowWidth - 16), 590);

  spiral = makeSpiral();
  markers = spaceAlongSpiral(places.length);
  noLoop();
}

function draw() {
  background(255);
  noFill();
  stroke("#000000");
  strokeWeight(2);
  beginShape();
  spiral.forEach(({ x, y }) => vertex(x, y));
  endShape();

  places.forEach((place, i) => {
    const band = occupancyBands.find(({ max }) => place.occupancy <= max);
    drawMarker(markers[i].x, markers[i].y, shapeFor(place.place), band.color, 20);
  });

  drawLegend();
}

function makeSpiral() {
  const points = [];
  const centerX = width / 2;
  const centerY = 215;
  const maxRadius = min(width * 0.42, 190);

  for (let i = 0; i <= spiralSteps; i++) {
    const t = i / spiralSteps;
    const angle = t * spiralTurns * TWO_PI;
    const radius = 8 + t * maxRadius;
    points.push({
      x: centerX + radius * cos(angle),
      y: centerY + radius * sin(angle)
    });
  }
  return points;
}


function spaceAlongSpiral(count) {
  const lengths = [0];
  for (let i = 1; i < spiral.length; i++) {
    lengths.push(lengths[i - 1] + dist(spiral[i - 1].x, spiral[i - 1].y, spiral[i].x, spiral[i].y));
  }

  const total = lengths[lengths.length - 1];
  return Array.from({ length: count }, (_, i) => {
    const target = total * (i + 0.5) / count;
    const end = lengths.findIndex((length, index) => index > 0 && length >= target);
    const next = end < 0 ? lengths.length - 1 : end;
    const amount = (target - lengths[next - 1]) / (lengths[next] - lengths[next - 1]);
    return {
      x: lerp(spiral[next - 1].x, spiral[next].x, amount),
      y: lerp(spiral[next - 1].y, spiral[next].y, amount)
    };
  });
}

function shapeFor(place) {
  return placeShapes[placeNames.indexOf(place) % placeShapes.length];
}

function drawMarker(x, y, shape, color, size) {
  fill(color);
  stroke("#0b0a0a");
  strokeWeight(1);

  if (shape === "circle") return ellipse(x, y, size);
  if (shape === "square") return rect(x, y, size, size);

  const sides = { triangle: 3, diamond: 4, pentagon: 5, hexagon: 6 }[shape];
  beginShape();
  for (let i = 0; i < sides; i++) {
    const angle = -HALF_PI + i * TWO_PI / sides;
    vertex(x + size / 2 * cos(angle), y + size / 2 * sin(angle));
  }
  endShape(CLOSE);
}

function drawLegend() {
  noStroke();
  fill("#070707");
  textSize(13);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("Place", 18, 500);
  text("Occupancy", 18, 430);
  

  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  occupancyBands.forEach((band, i) => {
    const x = width * (i + 0.5) / occupancyBands.length;
    drawMarker(x, 450, "square", band.color, 14);
    noStroke();
    fill("#333");
    text(band.label, x, 473);
  });

  placeNames.forEach((place, i) => {
    const x = width * (i + 0.5) / placeNames.length;
    drawMarker(x, 530, placeShapes[i % placeShapes.length], "#eeeeee", 16);
    noStroke();
    fill("#333");
    text(place, x, 555);
  });
}
// https://editor.p5js.org/miniverse/sketches/8b0d7tQ7C - spiral 
// "explain how to include plot points that fall onto the existing spiral" - prompt used to generate lines for adding points onto the spiral following the data included