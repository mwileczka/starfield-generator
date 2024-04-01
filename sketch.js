var seedHistory = new Array();
var seedHistoryPtr = 0;

var processingInstance;

var saveParamsFlag = false;

function saveParams() {
  saveParamsFlag = true;
  redraw();
  saveParamsFlag = false;
}

function update() {
  redraw();
}

function newSeed() {
  var seed = parseInt(Math.random() * 99999);
  document.getElementById("seed").value = seed;

  seedHistoryPtr = seedHistory.length;
  seedHistory[seedHistoryPtr] = seed;

  updateSeedHistButtons();
  update();
}
function prevSeed() {
  seedHistoryPtr--;
  document.getElementById("seed").value = seedHistory[seedHistoryPtr];

  updateSeedHistButtons();
  update();
}
function nextSeed() {
  seedHistoryPtr++;
  document.getElementById("seed").value = seedHistory[seedHistoryPtr];

  updateSeedHistButtons();
  update();
}
function updateSeedHistButtons() {
  document.getElementById("prevSeed").disabled = seedHistoryPtr == 0;
  document.getElementById("nextSeed").disabled =
    seedHistoryPtr + 1 == seedHistory.length;
}

var clusterMaskSeedHistory = new Array();
var clusterMaskSeedHistoryPtr = 0;
function newClusterMaskSeed() {
  var clusterMaskSeed = parseInt(Math.random() * 99999);
  document.getElementById("clusterMaskSeed").value = clusterMaskSeed;

  clusterMaskSeedHistoryPtr = clusterMaskSeedHistory.length;
  clusterMaskSeedHistory[clusterMaskSeedHistoryPtr] = clusterMaskSeed;

  updateClusterMaskSeedHistButtons();
  update();
}
function prevClusterMaskSeed() {
  clusterMaskSeedHistoryPtr--;
  document.getElementById("clusterMaskSeed").value =
    clusterMaskSeedHistory[clusterMaskSeedHistoryPtr];

  updateClusterMaskSeedHistButtons();
  update();
}
function nextClusterMaskSeed() {
  clusterMaskSeedHistoryPtr++;
  document.getElementById("clusterMaskSeed").value =
    clusterMaskSeedHistory[clusterMaskSeedHistoryPtr];

  updateClusterMaskSeedHistButtons();
  update();
}
function updateClusterMaskSeedHistButtons() {
  document.getElementById("prevClusterMaskSeed").disabled =
    clusterMaskSeedHistoryPtr == 0;
  document.getElementById("nextClusterMaskSeed").disabled =
    clusterMaskSeedHistoryPtr + 1 == clusterMaskSeedHistory.length;
}

function setup() {
  createCanvas(
    window.initialStarfieldWidth,
    window.initialStarfieldHeight,
    document.getElementById("starfield")
  );
  noLoop();
}

function draw() {
  var starfieldWidth = parseInt(
    document.getElementById("starfieldwidth").value
  );
  var starfieldHeight = parseInt(
    document.getElementById("starfieldheight").value
  );

  if (starfieldHeight < 100) starfieldHeight = 100;
  if (starfieldWidth < 100) starfieldWidth = 100;

  resizeCanvas(starfieldWidth, starfieldHeight);

  var fadeout = parseInt(document.getElementById("fadeout").value);

  var border = parseInt(document.getElementById("border").value);
  document.getElementById("starfield").style.borderWidth = border + "px";

  var seed = parseInt(document.getElementById("seed").value);
  if (isNaN(seed) || seed == 0) {
    newSeed();
    seed = parseInt(document.getElementById("seed").value);
  }
  randomSeed(seed);

  background(0, 0, 0);

  var cc = document.getElementById("cc").checked;
  var size1count = parseInt(document.getElementById("size1").value);
  var size2count = parseInt(document.getElementById("size2").value);
  var size3count = parseInt(document.getElementById("size3").value);
  var size4count = parseInt(document.getElementById("size4").value);
  var toScale = !document.getElementById("enlarge").checked;
  var useSymbols = document.getElementById("usesymbols").checked;
  var stars = [
    {
      size: toScale ? 1 : 1,
      count: size1count,
      color: cc ? document.getElementById("color1").value : "white",
    },
    {
      size: toScale ? 2 : 3,
      count: size2count,
      color: cc ? document.getElementById("color2").value : "white",
    },
    {
      size: toScale ? 3 : 6,
      count: size3count,
      color: cc ? document.getElementById("color3").value : "white",
    },
    {
      size: toScale ? 4 : 9,
      count: size4count,
      color: cc ? document.getElementById("color4").value : "white",
    },
  ];
  var showsize = [
    document.getElementById("showsize1").checked,
    document.getElementById("showsize2").checked,
    document.getElementById("showsize3").checked,
    document.getElementById("showsize4").checked,
  ];

  var clusterMaskSeed = parseInt(
    document.getElementById("clusterMaskSeed").value
  );
  if (isNaN(clusterMaskSeed) || clusterMaskSeed == 0) {
    newClusterMaskSeed();
    clusterMaskSeed = parseInt(
      document.getElementById("clusterMaskSeed").value
    );
  }

  // spaceAmount 0->100  clusterMaskThreshold 1.0->0.3
  var spaceAmount = parseInt(document.getElementById("spaceAmount").value);
  if (spaceAmount < 0) {
    spaceAmount = 0;
  }
  if (spaceAmount > 100) {
    spaceAmount = 100;
  }
  var clusterMaskThreshold = (100 - spaceAmount) * 0.006 + 0.4;

  var clusterAmount = parseInt(document.getElementById("clusterAmount").value);
  if (clusterAmount < 0) {
    clusterAmount = 0;
  }
  if (clusterAmount > 100) {
    clusterAmount = 100;
  }

  var clusterMaskScale = parseInt(
    document.getElementById("clusterMaskScale").value
  );
  if (isNaN(clusterMaskScale) || clusterMaskScale < 1) {
    clusterMaskScale = 1;
  }
  clusterMaskScale /= 100;

  for (var i = 0; i < stars.length; i++) {
    if (useSymbols) {
      strokeWeight(1);
    } else {
      strokeWeight(stars[i].size);
    }
    stroke(stars[i].color);

    for (var c = 0; c < stars[i].count; c++) {
      do {
        do {
          x = Math.floor(random(0, width));
          y = Math.floor(random(0, height));

          var xn = x / width;
          var yn = y / height;
          n = PerlinNoise.noise(
            xn / clusterMaskScale,
            yn / clusterMaskScale,
            clusterMaskSeed
          );
        } while (n > clusterMaskThreshold);

        var bTryAgain = false;

        // Fade out cluster edges?
        if (
          clusterAmount > 0 &&
          random(0, clusterAmount) > Math.abs(n - clusterMaskThreshold) * 100
        ) {
          bTryAgain = true;
        }

        // Fade out borders?
        if (fadeout > 0) {
          var xEdgeDistance = x < width / 2 ? x : width - x;
          var yEdgeDistance = y < height / 2 ? y : height - y;
          var edgeDistance =
            xEdgeDistance < yEdgeDistance ? xEdgeDistance : yEdgeDistance;
          if (edgeDistance < fadeout) {
            var fadeChance = edgeDistance / fadeout;
            if (random(0, fadeout) > edgeDistance) {
              bTryAgain = true;
            }
          }
        }
      } while (bTryAgain);

      if (showsize[i]) {
        if (useSymbols) {
          line(x - 4, y, x + 4, y);
          line(x, y - 4, x, y + 4);
        } else {
          point(x, y);
        }
      }
    }
  }

  if (window.saveParamsFlag) {
    var currentParams = "";
    currentParams += "Width: " + starfieldWidth + "<br>";
    currentParams += "Height: " + starfieldHeight + "<br>";
    currentParams += "Random seed: " + seed + "<br>";
    currentParams += "0.50mm fibres: " + size1count + "<br>";
    currentParams += "0.75mm fibres: " + size2count + "<br>";
    currentParams += "1.00mm fibres: " + size3count + "<br>";
    currentParams += "1.50mm fibres: " + size4count + "<br>";
    currentParams +=
      "Colour code fibre sizes: " + (cc ? "yes" : "no") + "<br><br>";
    currentParams += "Sparser towards edges: " + fadeout + "<br>";
    currentParams += "Black border: " + border + "<br><br>";
    currentParams += "Space/cluster seed: " + clusterMaskSeed + "<br>";
    currentParams += "Space/cluster scale: " + clusterMaskScale * 100 + "<br>";
    currentParams += "Space amount: " + spaceAmount + "<br>";
    currentParams += "Cluster amount: " + clusterAmount + "<br>";
    document.getElementById("currentParams").innerHTML = currentParams;
    document.getElementById("currentParams").style.display = "block";
  } else {
    document.getElementById("currentParams").style.display = "none";
  }
}

function generatePNG() {
  saveCanvas("starfield.png");
}
