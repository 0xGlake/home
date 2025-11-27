const TERRAIN_SIZE = 160;
const TILE_WIDTH = 6;
const TILE_HEIGHT = 3;
const BUILDING_GRID = 70;
const MAX_BUILDINGS = 220;
const NUM_CITIES = 5;
const MAX_BUILDINGS_PER_CITY = 50;

let terrain = [];
let buildings = [];
let roads = [];
let roadQueue = [];
let cityCenters = [];
let bridgeSegments = [];
let islandProjects = [];
let terraformProjects = []; // NEW: city flattening
let smokeParticles = [];
let time = 0.35;
let timeSpeed = 0.0006;
let simulationSpeed = 2;

// Floating rock parameters
let rockShape = [];
let rockSeed = 0;

// Performance caching
let sortedTerrainOrder = [];
let sortedBuildings = [];
let buildingsDirty = true;
let cachedDaylight = 0;
let cachedIsNight = false;
let buildingCandidates = [];
let candidatesDirty = true;
let lastCandidateUpdate = 0;

// Stars cache
let stars = [];

// Growth tracking
let generation = 1;
let totalBuilt = 0;
const GEN_THRESHOLD = 30;

let islandCenterX, islandCenterY;
let lastFrameTime = 0;
let fps = 60;

const ZONE_TYPES = {
  INDUSTRIAL: {
    buildingWeights: { APARTMENT: 0.05, COMMERCIAL: 0.1, INDUSTRIAL: 0.85 },
    color: { r: 140, g: 110, b: 80 },
    tint: { r: -10, g: -5, b: 5 },
  },
  COMMERCIAL: {
    buildingWeights: { APARTMENT: 0.15, COMMERCIAL: 0.8, INDUSTRIAL: 0.05 },
    color: { r: 150, g: 180, b: 220 },
    tint: { r: 5, g: 12, b: 20 },
  },
  RESIDENTIAL: {
    buildingWeights: { APARTMENT: 0.85, COMMERCIAL: 0.1, INDUSTRIAL: 0.05 },
    color: { r: 170, g: 210, b: 170 },
    tint: { r: 8, g: 12, b: 5 },
  },
  MIXED: {
    buildingWeights: { APARTMENT: 0.45, COMMERCIAL: 0.45, INDUSTRIAL: 0.1 },
    color: { r: 200, g: 180, b: 160 },
    tint: { r: 10, g: 8, b: 5 },
  },
};

const BUILDING_TYPES = {
  APARTMENT: {
    colors: [
      { r: 185, g: 195, b: 190 },
      { r: 195, g: 185, b: 175 },
      { r: 175, g: 185, b: 200 },
      { r: 190, g: 180, b: 170 },
      { r: 180, g: 190, b: 180 },
      { r: 200, g: 190, b: 185 },
      { r: 170, g: 175, b: 185 },
      { r: 188, g: 182, b: 175 },
    ],
    roofColors: [
      { r: 95, g: 100, b: 105 },
      { r: 105, g: 100, b: 95 },
      { r: 90, g: 95, b: 90 },
      { r: 115, g: 85, b: 75 },
    ],
    minHeight: 4,
    maxHeight: 11,
    buildSpeed: 0.05,
    decayAge: 2400,
    maxAge: 3400,
  },
  COMMERCIAL: {
    colors: [
      { r: 140, g: 170, b: 195 },
      { r: 150, g: 165, b: 185 },
      { r: 135, g: 160, b: 180 },
      { r: 185, g: 180, b: 175 },
      { r: 95, g: 105, b: 120 },
      { r: 195, g: 180, b: 160 },
      { r: 160, g: 175, b: 190 },
      { r: 175, g: 170, b: 165 },
    ],
    roofColors: [
      { r: 70, g: 80, b: 95 },
      { r: 85, g: 85, b: 90 },
      { r: 65, g: 75, b: 85 },
    ],
    minHeight: 10,
    maxHeight: 30,
    buildSpeed: 0.03,
    decayAge: 3000,
    maxAge: 4200,
  },
  INDUSTRIAL: {
    colors: [
      { r: 75, g: 70, b: 65 },
      { r: 65, g: 65, b: 70 },
      { r: 85, g: 75, b: 65 },
      { r: 70, g: 65, b: 60 },
      { r: 80, g: 80, b: 75 },
      { r: 60, g: 58, b: 55 },
    ],
    roofColors: [
      { r: 40, g: 40, b: 45 },
      { r: 50, g: 45, b: 40 },
      { r: 55, g: 50, b: 45 },
    ],
    minHeight: 3,
    maxHeight: 6,
    buildSpeed: 0.045,
    decayAge: 2000,
    maxAge: 3000,
    shadowRadius: 6,
  },
};

const COMMERCIAL_STYLES = [
  "glass_tower",
  "setback_deco",
  "brutalist",
  "twisted",
  "tapered",
  "stacked",
  "cantilever",
  "crystal",
  "ziggurat",
  "sail",
  "modern",
];

const INDUSTRIAL_SHAPES = ["warehouse", "factory", "silos", "plant", "mill"];
const APARTMENT_ROOF_TYPES = [
  "flat",
  "garden",
  "watertank",
  "ac_units",
  "pitched",
  "terrace",
  "solar",
];

function setup() {
  createCanvas(800, 600);
  noSmooth();
  islandCenterX = TERRAIN_SIZE / 2;
  islandCenterY = TERRAIN_SIZE / 2;
  rockSeed = floor(random(99999));
  noiseSeed(rockSeed);

  generateStars();
  generateRockShape();
  generateWorld();
  computeTerrainDrawOrder();
}

function generateStars() {
  stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(0.5, 2.5),
      brightness: random(100, 255),
      twinkle: random(1000),
    });
  }
}

function generateRockShape() {
  rockShape = [];
  let basePoints = 24;

  noiseSeed(rockSeed);

  for (let i = 0; i < basePoints; i++) {
    let angle = (i / basePoints) * TWO_PI;
    let baseRadiusX = TERRAIN_SIZE * 0.52;
    let baseRadiusY = TERRAIN_SIZE * 0.38;

    let noiseVal = noise(cos(angle) * 2 + 10, sin(angle) * 2 + 10);
    let radiusMod = 0.85 + noiseVal * 0.35;

    rockShape.push({
      angle: angle,
      radiusX: baseRadiusX * radiusMod,
      radiusY: baseRadiusY * radiusMod,
      depth: 8 + noise(i * 0.5) * 12,
    });
  }
}

function computeTerrainDrawOrder() {
  sortedTerrainOrder = [];
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      sortedTerrainOrder.push({ x, y, depth: x + y });
    }
  }
  sortedTerrainOrder.sort((a, b) => a.depth - b.depth);
}

function generateWorld() {
  terrain = [];
  buildings = [];
  roads = [];
  roadQueue = [];
  cityCenters = [];
  bridgeSegments = [];
  islandProjects = [];
  terraformProjects = [];
  smokeParticles = [];
  buildingsDirty = true;
  candidatesDirty = true;
  generation = 1;
  totalBuilt = 0;

  generateIslandTerrain();
  generateSpreadCities();
  seedAllCityRoads();
}

function generateIslandTerrain() {
  let noiseScale = 0.026;
  let mountainScale = 0.018; // Slightly larger features
  let coastNoise = 0.05;

  // Guaranteed mountain seed area - pick a spot in the back
  let mountainCenterX = TERRAIN_SIZE * random(0.15, 0.35);
  let mountainCenterY = TERRAIN_SIZE * random(0.15, 0.35);

  for (let x = 0; x < TERRAIN_SIZE; x++) {
    terrain[x] = [];
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      // ELLIPTICAL distance
      let dx = (x - islandCenterX) / (TERRAIN_SIZE * 0.52);
      let dy = (y - islandCenterY) / (TERRAIN_SIZE * 0.38);
      let distFromCenter = sqrt(dx * dx + dy * dy);

      // Organic coastline
      let edgeNoise1 = noise(x * coastNoise + 300, y * coastNoise + 300) * 0.22;
      let edgeNoise2 =
        noise(x * coastNoise * 2.5 + 500, y * coastNoise * 2.5 + 500) * 0.15;
      let edgeNoise3 =
        noise(x * coastNoise * 0.4 + 100, y * coastNoise * 0.4 + 100) * 0.2;

      let bayNoise = noise(x * 0.03 + 800, y * 0.03 + 800);
      let bayFactor = bayNoise > 0.6 ? (bayNoise - 0.6) * 0.5 : 0;

      let islandFactor =
        distFromCenter + edgeNoise1 + edgeNoise2 - edgeNoise3 + bayFactor;
      let isWater = islandFactor > 0.92;

      // Lakes
      let lakeNoise = noise(x * 0.06 + 500, y * 0.06 + 500);
      let lakeNoise2 = noise(x * 0.04 + 700, y * 0.04 + 700);
      let isLake =
        !isWater &&
        ((lakeNoise > 0.72 && distFromCenter < 0.5) ||
          (lakeNoise2 > 0.78 && distFromCenter < 0.4));

      // Rivers
      let isRiver = false;
      let riverNoise = noise(x * 0.025 + 100, y * 0.025 + 200);
      let riverNoise2 = noise(x * 0.055 + 400, y * 0.055 + 400) * 0.25;
      if (
        abs(riverNoise + riverNoise2 - 0.62) < 0.02 &&
        distFromCenter > 0.12 &&
        distFromCenter < 0.75
      ) {
        isRiver = true;
      }
      let river2Noise = noise(x * 0.03 + 600, y * 0.03 + 100);
      if (
        abs(river2Noise - 0.5) < 0.015 &&
        distFromCenter > 0.2 &&
        distFromCenter < 0.7
      ) {
        isRiver = true;
      }

      isWater = isWater || isLake || isRiver;

      let elevation = 0;
      if (!isWater) {
        let base = noise(x * noiseScale, y * noiseScale);
        let detail =
          noise(x * noiseScale * 3 + 100, y * noiseScale * 3 + 100) * 0.4;

        elevation = (base + detail) * 2.5;

        // ====== MOUNTAINS - BIASED TO BACK (TOP-LEFT in isometric) ======
        let mountainX = x / TERRAIN_SIZE;
        let mountainY = y / TERRAIN_SIZE;

        // Mountain factor: HIGH in top-left, ZERO in bottom-right
        // This creates a gradient from back to front
        let backness = 1 - (mountainX * 0.6 + mountainY * 0.6); // 0 at front, ~0.8 at back
        let mountainFactor = max(0, backness); // No mountains in front half

        // Distance to guaranteed mountain center
        let distToMtnCenter =
          dist(x, y, mountainCenterX, mountainCenterY) / TERRAIN_SIZE;
        let guaranteedMtn = max(0, 1 - distToMtnCenter * 3); // Strong mountain at center

        let mountain = noise(x * mountainScale + 200, y * mountainScale + 200);

        // Lower threshold (0.35 instead of 0.45) = more mountains
        // Higher power = more dramatic peaks
        if (mountain > 0.35 && mountainFactor > 0.1) {
          let mtnHeight =
            pow((mountain - 0.35) * 2.5, 1.8) * 12 * mountainFactor;
          elevation += mtnHeight;
        }

        // Guaranteed mountain range in back
        if (guaranteedMtn > 0) {
          let peakNoise = noise(x * 0.05 + 999, y * 0.05 + 999);
          elevation += guaranteedMtn * peakNoise * 15;
        }

        // Secondary mountain range (also biased back)
        let mtn2X = TERRAIN_SIZE * 0.25;
        let mtn2Y = TERRAIN_SIZE * 0.4;
        let distToMtn2 = dist(x, y, mtn2X, mtn2Y) / TERRAIN_SIZE;
        let secondaryMtn = max(0, 1 - distToMtn2 * 4) * mountainFactor;
        if (secondaryMtn > 0 && noise(x * 0.04 + 500, y * 0.04 + 500) > 0.4) {
          elevation += secondaryMtn * 8;
        }

        // Hills (can be anywhere but smaller)
        let hills = noise(x * 0.038 + 600, y * 0.038 + 600);
        if (hills > 0.58) {
          elevation += (hills - 0.58) * 6;
        }

        // Reduce elevation near edges
        elevation *= max(0.2, 1 - distFromCenter * 0.7);
        elevation = constrain(floor(elevation), 0, 18);
      }

      terrain[x][y] = {
        elevation,
        originalElevation: elevation, // Store for terraforming reference
        isWater,
        isLake,
        isRiver,
        isArtificial: false,
        occupied: isWater,
        road: null,
        bridge: null,
        distanceToRoad: 999,
        nearestCity: null,
        distanceToCity: 999,
        distanceToWater: 999,
        distanceToCenter: distFromCenter,
        inShadow: false,
        grassType: floor(random(3)),
        onRock: false,
        isCliff: false, // NEW: cliff face flag
        terraforming: false, // NEW: being flattened
      };
    }
  }

  // Mark tiles on rock and calculate water distances
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      terrain[x][y].onRock = isOnRock(x, y);
    }
  }

  // Calculate water distances and cliff status
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      if (!terrain[x][y].isWater) {
        let minDist = 999;
        let nearWaterAndHigh = false;

        for (let dx = -6; dx <= 6; dx++) {
          for (let dy = -6; dy <= 6; dy++) {
            let nx = x + dx,
              ny = y + dy;
            if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
              if (terrain[nx][ny].isWater) {
                let d = dist(x, y, nx, ny);
                minDist = min(minDist, d);

                // Check if this is a cliff (high elevation near water)
                if (d < 2.5 && terrain[x][y].elevation > 3) {
                  nearWaterAndHigh = true;
                }
              }
            }
          }
        }
        terrain[x][y].distanceToWater = minDist;
        terrain[x][y].isCliff = nearWaterAndHigh;
      }
    }
  }
}

function isOnRock(x, y) {
  let dx = x - islandCenterX;
  let dy = y - islandCenterY;
  let angle = atan2(dy, dx);
  if (angle < 0) angle += TWO_PI;

  let idx = (angle / TWO_PI) * rockShape.length;
  let i1 = floor(idx) % rockShape.length;
  let i2 = (i1 + 1) % rockShape.length;
  let t = idx - floor(idx);

  let r1 = rockShape[i1];
  let r2 = rockShape[i2];

  let radiusX = lerp(r1.radiusX, r2.radiusX, t);
  let radiusY = lerp(r1.radiusY, r2.radiusY, t);

  let normalizedDist = sqrt(
    (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY),
  );
  return normalizedDist < 1.05;
}

function generateSpreadCities() {
  let angleOffsets = [0, 72, 144, 216, 288];
  let zoneAssignments = [
    "COMMERCIAL",
    "RESIDENTIAL",
    "INDUSTRIAL",
    "RESIDENTIAL",
    "MIXED",
  ];

  for (let i = zoneAssignments.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [zoneAssignments[i], zoneAssignments[j]] = [
      zoneAssignments[j],
      zoneAssignments[i],
    ];
  }

  for (let i = 0; i < NUM_CITIES; i++) {
    let angleRad = radians(angleOffsets[i] + random(-15, 15));
    let radius = TERRAIN_SIZE * random(0.15, 0.25);

    let targetX = islandCenterX + cos(angleRad) * radius * 1.3;
    let targetY = islandCenterY + sin(angleRad) * radius;

    let bestX = targetX,
      bestY = targetY;
    let bestScore = -999;

    for (let attempt = 0; attempt < 60; attempt++) {
      let x = floor(targetX + random(-18, 18));
      let y = floor(targetY + random(-15, 15));

      x = constrain(x, 15, TERRAIN_SIZE - 15);
      y = constrain(y, 15, TERRAIN_SIZE - 15);

      if (terrain[x][y].isWater) continue;

      let minCityDist = 999;
      for (let c of cityCenters) {
        minCityDist = min(minCityDist, dist(x, y, c.x, c.y));
      }

      if (minCityDist < 18) continue;

      let score = minCityDist * 0.5;
      // Prefer lower elevation but don't completely avoid mountains
      score -= terrain[x][y].elevation * 2;
      if (
        terrain[x][y].distanceToWater < 6 &&
        terrain[x][y].distanceToWater > 2
      )
        score += 3;
      // Prefer front of island (higher x+y)
      score += ((x + y) / TERRAIN_SIZE) * 3;

      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }

    let zoneType = zoneAssignments[i];

    let city = {
      x: floor(bestX),
      y: floor(bestY),
      name: getZoneName(zoneType, i),
      zoneType,
      population: 0,
      maxBuildings: MAX_BUILDINGS_PER_CITY,
      isIsland: false,
      index: i,
    };

    cityCenters.push(city);

    // If city is on high ground, start terraforming project
    if (terrain[floor(bestX)][floor(bestY)].elevation > 4) {
      startTerraformProject(city);
    }
  }

  updateCityDistances();
}

// ============ TERRAFORMING SYSTEM ============

function startTerraformProject(city) {
  terraformProjects.push({
    city: city,
    x: city.x,
    y: city.y,
    radius: 0,
    targetRadius: 12, // How far to flatten
    targetElevation: 2, // Flatten to this level
    progress: 0,
  });
}

function updateTerraformProjects() {
  for (let project of terraformProjects) {
    if (project.radius >= project.targetRadius) continue;

    project.progress += 0.02 * simulationSpeed;

    if (project.progress >= 1) {
      project.progress = 0;
      project.radius += 0.5;

      // Flatten tiles within current radius
      for (let dx = -ceil(project.radius); dx <= ceil(project.radius); dx++) {
        for (let dy = -ceil(project.radius); dy <= ceil(project.radius); dy++) {
          let nx = project.x + dx;
          let ny = project.y + dy;

          if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
            let d = dist(project.x, project.y, nx, ny);
            if (d <= project.radius && !terrain[nx][ny].isWater) {
              let tile = terrain[nx][ny];

              // Gradually reduce elevation
              if (tile.elevation > project.targetElevation) {
                // Smoother transition at edges
                let edgeFactor = 1 - d / project.radius;
                let targetHere = lerp(
                  tile.originalElevation,
                  project.targetElevation,
                  edgeFactor,
                );
                tile.elevation = max(
                  project.targetElevation,
                  floor(targetHere),
                );
                tile.terraforming = true;

                // Update cliff status
                tile.isCliff = false;
              }
            }
          }
        }
      }

      candidatesDirty = true;
    }
  }
}

function getZoneName(zoneType, index) {
  switch (zoneType) {
    case "INDUSTRIAL":
      return "Industrial";
    case "COMMERCIAL":
      return "Downtown";
    case "RESIDENTIAL":
      return `Suburb ${index + 1}`;
    case "MIXED":
      return "Midtown";
    default:
      return `District ${index + 1}`;
  }
}

function updateCityDistances() {
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      let minDist = 999;
      let nearest = null;

      for (let city of cityCenters) {
        let d = dist(x, y, city.x, city.y);
        if (d < minDist) {
          minDist = d;
          nearest = city;
        }
      }

      terrain[x][y].distanceToCity = minDist;
      terrain[x][y].nearestCity = nearest;
    }
  }
}

function seedAllCityRoads() {
  for (let city of cityCenters) {
    addRoad(city.x, city.y, "main");

    let quadrantAngles = [
      random(0, HALF_PI),
      random(HALF_PI, PI),
      random(PI, PI + HALF_PI),
      random(PI + HALF_PI, TWO_PI),
    ];

    for (let angle of quadrantAngles) {
      roadQueue.push({
        x: city.x,
        y: city.y,
        angle: angle,
        type: "main",
        energy: random(12, 20),
        sourceCity: city,
        canBridge: true,
        gridAlign: random() < 0.4,
      });
    }

    for (let other of cityCenters) {
      if (other !== city && random() < 0.35) {
        let toOther = atan2(other.y - city.y, other.x - city.x);
        roadQueue.push({
          x: city.x,
          y: city.y,
          angle: toOther,
          type: "main",
          energy: random(18, 30),
          sourceCity: city,
          targetCity: other,
          canBridge: true,
          gridAlign: false,
        });
      }
    }
  }
}

// ============ SMOKE SYSTEM ============

const MAX_SMOKE = 40;

function updateSmoke() {
  if (frameCount % 3 !== 0) return;

  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    let p = smokeParticles[i];
    p.y -= p.speed;
    p.x += p.drift;
    p.life -= 0.03;
    p.size += 0.1;

    if (p.life <= 0) {
      smokeParticles.splice(i, 1);
    }
  }

  if (smokeParticles.length < MAX_SMOKE) {
    let industrials = buildings.filter(
      (b) =>
        b.type === "INDUSTRIAL" &&
        b.completed &&
        !b.collapsing &&
        b.hasSmokestack,
    );

    let toSpawn = min(2, industrials.length);
    for (let i = 0; i < toSpawn; i++) {
      let b = industrials[floor(random(industrials.length))];
      if (b && random() < 0.3) {
        let t = buildingToTerrain(b.gridX, b.gridY);
        let terrainElev = getBuildingTerrainHeight(b.gridX, b.gridY);
        let pos = toIso(t.x + 0.5, t.y + 0.5, terrainElev);

        smokeParticles.push({
          x: pos.x + random(-2, 2),
          y: pos.y - b.currentLayer * TILE_HEIGHT - TILE_HEIGHT,
          size: random(2, 4),
          life: 1,
          speed: random(0.3, 0.6),
          drift: random(-0.15, 0.15),
        });
      }
    }
  }
}

function drawSmoke() {
  noStroke();
  for (let p of smokeParticles) {
    let alpha = p.life * 60 * cachedDaylight;
    fill(80, 75, 70, alpha);
    ellipse(p.x, p.y, p.size, p.size * 0.7);
  }
}

// ============ ISLAND SYSTEM ============

function tryStartIslandProject() {
  if (islandProjects.length >= 2) return;
  if (random() > 0.007) return;
  if (roads.length < 30) return;

  for (let attempt = 0; attempt < 35; attempt++) {
    let angle = random(TWO_PI);
    let radius = TERRAIN_SIZE * random(0.52, 0.65);
    let x = floor(islandCenterX + cos(angle) * radius * 1.2);
    let y = floor(islandCenterY + sin(angle) * radius * 0.9);

    x = constrain(x, 12, TERRAIN_SIZE - 12);
    y = constrain(y, 12, TERRAIN_SIZE - 12);

    if (!terrain[x][y].isWater || terrain[x][y].isRiver) continue;

    let tooClose = islandProjects.some((p) => dist(x, y, p.x, p.y) < 15);
    if (tooClose) continue;

    let nearLand = false;
    let tooCloseToLand = false;
    for (let dx = -12; dx <= 12 && !tooCloseToLand; dx++) {
      for (let dy = -12; dy <= 12 && !tooCloseToLand; dy++) {
        let nx = x + dx,
          ny = y + dy;
        if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
          if (!terrain[nx][ny].isWater) {
            let d = dist(x, y, nx, ny);
            if (d < 6) tooCloseToLand = true;
            else if (d < 12) nearLand = true;
          }
        }
      }
    }

    if (nearLand && !tooCloseToLand) {
      islandProjects.push({
        x,
        y,
        targetSize: floor(random(3, 6)),
        currentSize: 0,
        progress: 0,
        completed: false,
        connected: false,
        shapeSeed: random(1000),
      });
      break;
    }
  }
}

function updateIslandProjects() {
  for (let project of islandProjects) {
    if (project.completed) {
      if (!project.connected && frameCount % 35 === 0) {
        tryConnectIsland(project);
      }
      continue;
    }

    project.progress += 0.018 * simulationSpeed;

    if (project.progress >= 1) {
      project.progress = 0;
      project.currentSize++;

      noiseSeed(project.shapeSeed);
      for (
        let dx = -project.currentSize - 2;
        dx <= project.currentSize + 2;
        dx++
      ) {
        for (
          let dy = -project.currentSize - 2;
          dy <= project.currentSize + 2;
          dy++
        ) {
          let nx = project.x + dx,
            ny = project.y + dy;
          if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
            let baseDist = dist(project.x, project.y, nx, ny);
            let angle = atan2(dy, dx);
            let radiusVariation =
              noise(angle * 2 + project.shapeSeed) * 1.5 + 0.5;
            let effectiveRadius = project.currentSize * radiusVariation;

            if (
              baseDist <= effectiveRadius &&
              terrain[nx][ny].isWater &&
              !terrain[nx][ny].isArtificial
            ) {
              terrain[nx][ny].isWater = false;
              terrain[nx][ny].isArtificial = true;
              let elevNoise = noise(nx * 0.2, ny * 0.2);
              terrain[nx][ny].elevation = elevNoise > 0.6 ? 2 : 1;
              terrain[nx][ny].originalElevation = terrain[nx][ny].elevation;
              terrain[nx][ny].occupied = false;
              terrain[nx][ny].distanceToWater = 1;
              candidatesDirty = true;
            }
          }
        }
      }
      noiseSeed(frameCount);

      if (project.currentSize >= project.targetSize) {
        project.completed = true;

        let newCity = {
          x: project.x,
          y: project.y,
          name: `Island ${cityCenters.length - NUM_CITIES + 1}`,
          zoneType: "COMMERCIAL",
          population: 0,
          maxBuildings: 15,
          isIsland: true,
          index: cityCenters.length,
        };
        cityCenters.push(newCity);
        updateCityDistances();
        addRoad(project.x, project.y, "main");
        tryConnectIsland(project);
      }
    }
  }
}

function tryConnectIsland(island) {
  let nearestRoad = null;
  let nearestDist = 999;

  for (let r of roads) {
    if (terrain[r.x][r.y].isArtificial) continue;
    let d = dist(island.x, island.y, r.x, r.y);
    if (d < nearestDist && d < 45) {
      nearestDist = d;
      nearestRoad = r;
    }
  }

  if (nearestRoad) {
    roadQueue.push({
      x: nearestRoad.x,
      y: nearestRoad.y,
      angle: atan2(island.y - nearestRoad.y, island.x - nearestRoad.x),
      type: "main",
      energy: 50,
      targetIsland: island,
      canBridge: true,
      gridAlign: false,
    });
    island.connected = true;
  }
}

// ============ BRIDGE SYSTEM ============

function createBridge(x, y) {
  let bridge = { x, y, height: 2 };
  bridgeSegments.push(bridge);
  terrain[x][y].bridge = bridge;
  return bridge;
}

function drawBridge(bridge, pos, daylight) {
  let deckColor = lerpColor(color(50, 50, 55), color(110, 105, 100), daylight);
  let pillarColor = lerpColor(color(40, 40, 45), color(80, 80, 85), daylight);

  let deckY = pos.y - bridge.height * TILE_HEIGHT;

  fill(pillarColor);
  noStroke();
  rect(pos.x - 1.5, deckY + TILE_HEIGHT, 3, pos.y - deckY + TILE_HEIGHT);

  fill(deckColor);
  beginShape();
  vertex(pos.x, deckY);
  vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  vertex(pos.x, deckY + TILE_HEIGHT);
  vertex(pos.x - TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  endShape(CLOSE);

  fill(lerpColor(deckColor, color(0), 0.18));
  beginShape();
  vertex(pos.x, deckY + TILE_HEIGHT);
  vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT);
  vertex(pos.x, deckY + TILE_HEIGHT * 1.3);
  endShape(CLOSE);
}

// ============ ROAD SYSTEM ============

function canBridgeTo(x, y, fromX, fromY) {
  if (x < 0 || x >= TERRAIN_SIZE || y < 0 || y >= TERRAIN_SIZE) return false;
  if (!terrain[x][y].isWater) return false;

  let dx = x - fromX,
    dy = y - fromY;
  let len = sqrt(dx * dx + dy * dy);
  if (len === 0) return false;
  dx /= len;
  dy /= len;

  for (let i = 1; i <= 12; i++) {
    let cx = round(x + dx * i),
      cy = round(y + dy * i);
    if (cx >= 0 && cx < TERRAIN_SIZE && cy >= 0 && cy < TERRAIN_SIZE) {
      if (!terrain[cx][cy].isWater) return true;
    }
  }
  return false;
}

function addRoad(x, y, type, isBridge = false) {
  if (x < 0 || x >= TERRAIN_SIZE || y < 0 || y >= TERRAIN_SIZE) return false;
  if (terrain[x][y].road) return false;

  // Don't build roads on very high terrain (unless terraforming)
  if (terrain[x][y].elevation > 6 && !terrain[x][y].terraforming) return false;

  roads.push({ x, y, type, isBridge });
  terrain[x][y].road = { x, y, type };

  if (isBridge && terrain[x][y].isWater) {
    createBridge(x, y);
  }

  if (!terrain[x][y].isWater) {
    terrain[x][y].occupied = true;
  }

  for (let dx = -6; dx <= 6; dx++) {
    for (let dy = -6; dy <= 6; dy++) {
      let nx = x + dx,
        ny = y + dy;
      if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
        let d = dist(x, y, nx, ny);
        if (d < terrain[nx][ny].distanceToRoad) {
          terrain[nx][ny].distanceToRoad = d;
        }
      }
    }
  }

  candidatesDirty = true;
  return true;
}

function growRoads() {
  if (roadQueue.length < 12 && roads.length > 8 && frameCount % 35 === 0) {
    let city = random(
      cityCenters.filter((c) => c.population > 0 || !c.isIsland),
    );
    if (city) {
      let cityRoads = roads.filter((r) => {
        let t = terrain[r.x][r.y];
        return (
          t.nearestCity === city &&
          !t.isWater &&
          t.distanceToWater > 3 &&
          t.elevation <= 5
        );
      });

      if (cityRoads.length > 0 && random() < 0.4) {
        let source = random(cityRoads);
        let quadrant = floor(random(4));
        let angle = quadrant * HALF_PI + random(HALF_PI);

        roadQueue.push({
          x: source.x,
          y: source.y,
          angle: angle,
          type: "street",
          energy: random(4, 10),
          sourceCity: city,
          canBridge: random() < 0.1,
          gridAlign: random() < 0.4,
        });
      }
    }
  }

  if (roadQueue.length === 0) return;

  let toProcess = min(3, roadQueue.length);

  for (let i = 0; i < toProcess; i++) {
    let road = roadQueue.shift();
    if (!road || road.energy <= 0) continue;

    if (road.gridAlign && random() < 0.25) {
      let snapped = round(road.angle / HALF_PI) * HALF_PI;
      road.angle = lerp(road.angle, snapped, 0.2);
    }

    if (road.targetCity) {
      let toTarget = atan2(
        road.targetCity.y - road.y,
        road.targetCity.x - road.x,
      );
      road.angle = lerp(road.angle, toTarget, 0.15);
    }
    if (road.targetIsland) {
      let toTarget = atan2(
        road.targetIsland.y - road.y,
        road.targetIsland.x - road.x,
      );
      road.angle = lerp(road.angle, toTarget, 0.25);
    }

    road.angle += (random() - 0.5) * 0.2;

    let nx = round(road.x + cos(road.angle));
    let ny = round(road.y + sin(road.angle));

    if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
      let tile = terrain[nx][ny];

      let nearEdge = tile.distanceToWater < 2;
      if (nearEdge && !road.targetIsland && !tile.isWater) {
        road.energy = 0;
        continue;
      }

      // Avoid steep terrain unless terraformed
      if (tile.elevation > 5 && !tile.terraforming && !road.targetCity) {
        road.energy -= 2;
        road.angle += (random() - 0.5) * PI * 0.5;
        if (road.energy > 0) roadQueue.push(road);
        continue;
      }

      let tooManyRoadsNearby = 0;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          let cx = nx + dx,
            cy = ny + dy;
          if (cx >= 0 && cx < TERRAIN_SIZE && cy >= 0 && cy < TERRAIN_SIZE) {
            if (terrain[cx][cy].road) tooManyRoadsNearby++;
          }
        }
      }
      if (tooManyRoadsNearby > 6 && !road.targetCity && !road.targetIsland) {
        road.energy -= 3;
        road.angle += (random() - 0.5) * PI * 0.5;
        if (road.energy > 0) roadQueue.push(road);
        continue;
      }

      let canBuild = !tile.road && tile.elevation <= 6;
      let needsBridge =
        tile.isWater && road.canBridge && canBridgeTo(nx, ny, road.x, road.y);

      if (canBuild && (!tile.isWater || needsBridge)) {
        addRoad(nx, ny, road.type, needsBridge);
        road.x = nx;
        road.y = ny;
        road.energy -= needsBridge ? 0.5 : 1;

        if (random() < 0.05) {
          let branchAngle =
            road.angle +
            (random() > 0.5 ? 1 : -1) * (HALF_PI + random(-0.3, 0.3));
          roadQueue.push({
            x: nx,
            y: ny,
            angle: branchAngle,
            type: "street",
            energy: random(3, 7),
            canBridge: false,
            gridAlign: random() < 0.3,
          });
        }

        if (road.energy > 0) roadQueue.push(road);
      } else {
        road.angle += (random() - 0.5) * PI;
        road.energy -= 1.5;
        if (road.energy > 0) roadQueue.push(road);
      }
    }
  }
}

// ============ SHADOW SYSTEM ============

function updateShadows() {
  if (frameCount % 80 !== 0) return;

  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      terrain[x][y].inShadow = false;
    }
  }

  for (let b of buildings) {
    if (b.type === "INDUSTRIAL" && !b.collapsing) {
      let t = { x: b.gridX * 2, y: b.gridY * 2 };
      let radius = BUILDING_TYPES.INDUSTRIAL.shadowRadius;

      for (let dx = 0; dx <= radius; dx++) {
        for (let dy = 0; dy <= radius; dy++) {
          let nx = t.x + dx,
            ny = t.y + dy;
          if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
            if (dist(t.x, t.y, nx, ny) <= radius) {
              terrain[nx][ny].inShadow = true;
            }
          }
        }
      }
    }
  }

  candidatesDirty = true;
}

// ============ BUILDING CANDIDATES ============

function updateBuildingCandidates() {
  if (!candidatesDirty && frameCount - lastCandidateUpdate < 70) return;

  buildingCandidates = [];

  for (let bx = 1; bx < BUILDING_GRID - 1; bx++) {
    for (let by = 1; by < BUILDING_GRID - 1; by++) {
      let t = { x: bx * 2, y: by * 2 };

      let valid = true;
      let maxElev = 0;
      let minRoadDist = 999;
      let isArtificial = false;
      let nearestCity = null;
      let distToCenter = 999;

      for (let dx = 0; dx < 2 && valid; dx++) {
        for (let dy = 0; dy < 2 && valid; dy++) {
          let tx = t.x + dx,
            ty = t.y + dy;
          if (tx >= TERRAIN_SIZE || ty >= TERRAIN_SIZE) {
            valid = false;
            continue;
          }
          let tile = terrain[tx][ty];
          if (tile.occupied || tile.isWater) valid = false;
          // Allow building on terraformed high ground
          if (tile.elevation > 4 && !tile.terraforming) valid = false;
          maxElev = max(maxElev, tile.elevation);
          minRoadDist = min(minRoadDist, tile.distanceToRoad);
          if (tile.isArtificial) isArtificial = true;
          if (!nearestCity) nearestCity = tile.nearestCity;
          distToCenter = min(distToCenter, tile.distanceToCenter);
        }
      }

      if (!valid || minRoadDist > 4 || !nearestCity) continue;

      buildingCandidates.push({
        x: bx,
        y: by,
        roadDist: minRoadDist,
        nearestCity,
        isArtificial,
        elevation: maxElev,
        distToCenter,
      });
    }
  }

  candidatesDirty = false;
  lastCandidateUpdate = frameCount;
}

// ============ BUILDING SYSTEM ============

function buildingToTerrain(bx, by) {
  return { x: bx * 2, y: by * 2 };
}

function toIso(x, y, z = 0) {
  return {
    x: ((x - y) * TILE_WIDTH) / 2 + width / 2,
    y: ((x + y) * TILE_HEIGHT) / 2 - z * TILE_HEIGHT + height / 6,
  };
}

function getBuildingTerrainHeight(bx, by) {
  let t = buildingToTerrain(bx, by);
  let maxElev = 0;
  for (let dx = 0; dx < 2; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      let tx = t.x + dx,
        ty = t.y + dy;
      if (tx < TERRAIN_SIZE && ty < TERRAIN_SIZE) {
        maxElev = max(maxElev, terrain[tx][ty].elevation);
      }
    }
  }
  return maxElev;
}

function createBuilding(bx, by, type, city, distToCenter) {
  let config = BUILDING_TYPES[type];
  let baseColor = random(config.colors);
  let roofColor = random(config.roofColors);

  let zoneTint = ZONE_TYPES[city.zoneType].tint;
  baseColor = {
    r: constrain(baseColor.r + zoneTint.r, 0, 255),
    g: constrain(baseColor.g + zoneTint.g, 0, 255),
    b: constrain(baseColor.b + zoneTint.b, 0, 255),
  };

  let isOnIsland = terrain[bx * 2][by * 2].isArtificial;

  let centerBonus = (1 - distToCenter) * 0.7;
  let genBonus = (generation - 1) * 0.08;
  let heightMult = 0.45 + centerBonus + genBonus;

  if (isOnIsland) heightMult += 0.15;
  if (city.zoneType === "COMMERCIAL") heightMult += 0.1;

  let targetHeight = floor(
    random(config.minHeight, config.maxHeight * heightMult),
  );
  targetHeight = constrain(
    targetHeight,
    config.minHeight,
    config.maxHeight + floor(generation * 0.5),
  );

  let layerVariations = [];
  let commercialStyle =
    type === "COMMERCIAL" ? random(COMMERCIAL_STYLES) : null;
  let industrialShape =
    type === "INDUSTRIAL" ? random(INDUSTRIAL_SHAPES) : null;
  let baseWidthMod = type === "COMMERCIAL" ? random(0.85, 1.15) : 1.0;

  for (let i = 0; i < targetHeight; i++) {
    let widthMod = baseWidthMod;
    if (type === "COMMERCIAL") {
      widthMod = calculateCommercialWidth(
        commercialStyle,
        i,
        targetHeight,
        baseWidthMod,
      );
    }

    layerVariations.push({
      colorShift: random(-8, 8),
      widthMod: widthMod,
      hasWindow: random() < 0.8,
      windowStyle: floor(random(3)),
      glassPanel: type === "COMMERCIAL" && random() > 0.45,
    });
  }

  buildingsDirty = true;
  totalBuilt++;

  if (totalBuilt % GEN_THRESHOLD === 0) {
    generation++;
  }

  return {
    gridX: bx,
    gridY: by,
    type,
    targetHeight,
    commercialStyle,
    industrialShape,
    baseWidthMod,
    currentLayer: 0,
    layerProgress: 0,
    buildSpeed: config.buildSpeed * random(0.9, 1.1),
    completed: false,
    city: city,

    age: 0,
    decayAge: config.decayAge + random(-250, 250),
    maxAge: config.maxAge + random(-250, 250),
    decaying: false,
    collapsing: false,
    collapseProgress: 0,
    collapseLayer: 0,

    baseColor,
    roofColor,
    layerVariations,

    hasSmokestack: type === "INDUSTRIAL" && random() > 0.35,
    hasAntenna: type === "COMMERCIAL" && random() > 0.55,
    hasHelipad: type === "COMMERCIAL" && targetHeight > 14 && random() > 0.6,
    roofType: getRoofType(type, commercialStyle, industrialShape),

    hasCrane: !isOnIsland && targetHeight > 6 && random() > 0.35,
    craneAngle: random(TWO_PI),

    scaffolding: true,
    scaffoldingAlpha: 255,
    generation: generation,

    depth: bx * 2 + by * 2 + 1,
  };
}

function calculateCommercialWidth(style, layer, totalHeight, baseWidth) {
  let progress = layer / totalHeight;
  let width = baseWidth;

  switch (style) {
    case "glass_tower":
      width *= 1 - progress * 0.12;
      break;
    case "setback_deco":
      if (progress > 0.3) width *= 0.86;
      if (progress > 0.6) width *= 0.86;
      if (progress > 0.85) width *= 0.82;
      break;
    case "brutalist":
      if (progress < 0.2) width *= 0.9;
      else if (progress < 0.4) width *= 1.12;
      else width *= 1 - (progress - 0.4) * 0.25;
      break;
    case "twisted":
      width *= 0.9 + sin(progress * PI * 3) * 0.12;
      break;
    case "tapered":
      width *= 1 - progress * 0.42;
      break;
    case "stacked":
      width *= 0.72 + noise(layer * 0.5) * 0.5;
      break;
    case "cantilever":
      width *= layer % 4 < 2 ? 1.08 : 0.88;
      break;
    case "crystal":
      width *= 0.82 + abs(sin(progress * PI * 2)) * 0.32;
      break;
    case "ziggurat":
      width *= 1 - floor(progress * 5) * 0.11;
      break;
    case "sail":
      width *= 0.7 + sin(progress * PI) * 0.42;
      break;
    case "modern":
      width *= 1 - progress * 0.08;
      break;
  }

  return max(0.42, width);
}

function getRoofType(type, commercialStyle, industrialShape) {
  if (type === "INDUSTRIAL") {
    if (industrialShape === "silos") return "silos";
    if (industrialShape === "factory") return "sawtooth";
    if (industrialShape === "plant") return "tanks";
    if (industrialShape === "mill") return "chimney";
    return random(["sawtooth", "flat", "tanks", "silos"]);
  }
  if (type === "APARTMENT") {
    return random(APARTMENT_ROOF_TYPES);
  }
  if (type === "COMMERCIAL") {
    if (commercialStyle === "tapered" || commercialStyle === "crystal")
      return "spire";
    if (commercialStyle === "setback_deco") return "crown";
    if (commercialStyle === "brutalist") return "mechanical";
    return random(["flat", "spire", "crown", "mechanical", "garden"]);
  }
  return "flat";
}

function trySpawnBuilding() {
  updateBuildingCandidates();
  if (buildingCandidates.length === 0) return false;

  let availableCities = cityCenters.filter(
    (c) => c.population < c.maxBuildings,
  );
  if (availableCities.length === 0) return false;

  availableCities.sort((a, b) => a.population - b.population);
  let city = random(availableCities.slice(0, min(2, availableCities.length)));

  let zoneWeights = ZONE_TYPES[city.zoneType].buildingWeights;
  let type = weightedRandomType(zoneWeights);

  let cityCandidates = buildingCandidates.filter((c) => {
    if (terrain[c.x * 2][c.y * 2].occupied) return false;
    if (c.nearestCity !== city) return false;
    return true;
  });

  if (cityCandidates.length === 0) return false;

  for (let c of cityCandidates) {
    c.score = (1 - c.roadDist / 4) * 1.5;
    c.score += (1 - c.distToCenter) * 0.6;
    if (c.isArtificial && type === "COMMERCIAL") c.score += 1;
  }

  cityCandidates.sort((a, b) => b.score - a.score);
  let spot = random(cityCandidates.slice(0, min(5, cityCandidates.length)));

  let building = createBuilding(spot.x, spot.y, type, city, spot.distToCenter);

  let t = buildingToTerrain(spot.x, spot.y);
  for (let dx = 0; dx < 2; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      let tx = t.x + dx,
        ty = t.y + dy;
      if (tx < TERRAIN_SIZE && ty < TERRAIN_SIZE) {
        terrain[tx][ty].occupied = true;
      }
    }
  }

  buildings.push(building);
  city.population++;
  candidatesDirty = true;

  return true;
}

function weightedRandomType(weights) {
  let roll = random();
  let cumulative = 0;
  for (let type in weights) {
    cumulative += weights[type];
    if (roll < cumulative) return type;
  }
  return "COMMERCIAL";
}

function updateBuildings() {
  for (let i = buildings.length - 1; i >= 0; i--) {
    let b = buildings[i];

    if (b.collapsing) {
      b.collapseProgress += 0.07 * simulationSpeed;

      if (b.collapseProgress >= 1) {
        b.collapseProgress = 0;
        b.collapseLayer--;

        if (b.collapseLayer < 0) {
          let t = buildingToTerrain(b.gridX, b.gridY);
          for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
              let tx = t.x + dx,
                ty = t.y + dy;
              if (
                tx < TERRAIN_SIZE &&
                ty < TERRAIN_SIZE &&
                !terrain[tx][ty].isWater
              ) {
                terrain[tx][ty].occupied = false;
              }
            }
          }

          if (b.city) b.city.population = max(0, b.city.population - 1);
          buildings.splice(i, 1);
          buildingsDirty = true;
          candidatesDirty = true;
        }
      }
      continue;
    }

    b.age += simulationSpeed;

    if (b.age > b.decayAge && !b.decaying && b.completed) {
      b.decaying = true;
    }

    if (b.decaying && b.age > b.maxAge) {
      b.collapsing = true;
      b.collapseLayer = b.currentLayer;
      continue;
    }

    if (!b.completed) {
      b.layerProgress += b.buildSpeed * simulationSpeed;

      if (b.layerProgress >= 1) {
        b.layerProgress = 0;
        b.currentLayer++;

        if (b.currentLayer >= b.targetHeight) {
          b.completed = true;
          b.currentLayer = b.targetHeight;
        }
      }
    } else if (b.scaffolding) {
      b.scaffoldingAlpha -= 8 * simulationSpeed;
      if (b.scaffoldingAlpha <= 0) b.scaffolding = false;
    }
  }
}

// ============ MAIN LOOP ============

function draw() {
  let currentTime = millis();
  fps = lerp(fps, 1000 / (currentTime - lastFrameTime), 0.1);
  lastFrameTime = currentTime;

  time += timeSpeed * simulationSpeed;
  if (time > 1) time -= 1;

  cachedDaylight = getDaylightFactor();
  cachedIsNight = time < 0.12 || time > 0.88;

  drawSpace();
  drawFloatingRock();

  if (frameCount % 3 === 0) growRoads();
  if (frameCount % 6 === 0) updateShadows();
  if (frameCount % 10 === 0) {
    updateIslandProjects();
    tryStartIslandProject();
  }
  if (frameCount % 8 === 0) {
    updateTerraformProjects(); // NEW: update city flattening
  }

  updateBuildings();
  updateSmoke();

  let activeBuildings = buildings.filter((b) => !b.collapsing).length;
  if (activeBuildings < MAX_BUILDINGS && frameCount % 6 === 0) {
    trySpawnBuilding();
  }

  drawScene();
  drawSmoke();
  drawUI();
}

function drawSpace() {
  let spaceTop = color(5, 8, 18);
  let spaceBottom = color(15, 12, 25);

  let nebulaHue = (frameCount * 0.0002) % 1;
  let nebula1 = color(20 + sin(nebulaHue * TWO_PI) * 10, 15, 35);

  noStroke();
  let bands = 15;
  let bandHeight = ceil(height / bands) + 1;
  for (let i = 0; i < bands; i++) {
    let t = i / (bands - 1);
    let baseColor = lerpColor(spaceTop, spaceBottom, t);
    if (t > 0.3 && t < 0.7) {
      baseColor = lerpColor(
        baseColor,
        nebula1,
        0.15 * sin(((t - 0.3) * PI) / 0.4),
      );
    }
    fill(baseColor);
    rect(0, floor((i * height) / bands), width, bandHeight);
  }

  for (let star of stars) {
    let twinkle = sin(frameCount * 0.02 + star.twinkle) * 0.3 + 0.7;
    fill(255, 255, 255, star.brightness * twinkle);
    circle(star.x, star.y, star.size);
  }

  fill(60, 55, 70, 40);
  ellipse(width * 0.85, height * 0.15, 80, 80);
  fill(80, 75, 90, 30);
  ellipse(width * 0.12, height * 0.25, 40, 40);
}

function drawFloatingRock() {
  let centerPos = toIso(islandCenterX, islandCenterY, 0);

  noStroke();

  let rockDark = lerpColor(
    color(25, 22, 30),
    color(50, 45, 55),
    cachedDaylight * 0.5,
  );
  let rockMid = lerpColor(
    color(35, 32, 40),
    color(70, 65, 75),
    cachedDaylight * 0.5,
  );
  let rockLight = lerpColor(
    color(45, 42, 50),
    color(90, 85, 95),
    cachedDaylight * 0.5,
  );

  for (let i = 0; i < rockShape.length; i++) {
    let r1 = rockShape[i];
    let r2 = rockShape[(i + 1) % rockShape.length];

    let x1 = islandCenterX + cos(r1.angle) * r1.radiusX;
    let y1 = islandCenterY + sin(r1.angle) * r1.radiusY;
    let x2 = islandCenterX + cos(r2.angle) * r2.radiusX;
    let y2 = islandCenterY + sin(r2.angle) * r2.radiusY;

    let pos1 = toIso(x1, y1, 0);
    let pos2 = toIso(x2, y2, 0);
    let pos1Bottom = toIso(x1, y1, -r1.depth);
    let pos2Bottom = toIso(x2, y2, -r2.depth);

    let angle = (r1.angle + r2.angle) / 2;
    if (angle > PI * 0.25 && angle < PI * 1.25) {
      fill(rockMid);
    } else {
      fill(rockDark);
    }

    beginShape();
    vertex(pos1.x, pos1.y + TILE_HEIGHT);
    vertex(pos2.x, pos2.y + TILE_HEIGHT);
    vertex(pos2Bottom.x, pos2Bottom.y + TILE_HEIGHT);
    vertex(pos1Bottom.x, pos1Bottom.y + TILE_HEIGHT);
    endShape(CLOSE);
  }

  fill(rockDark);
  beginShape();
  for (let i = 0; i < rockShape.length; i++) {
    let r = rockShape[i];
    let x = islandCenterX + cos(r.angle) * r.radiusX * 0.7;
    let y = islandCenterY + sin(r.angle) * r.radiusY * 0.7;
    let pos = toIso(x, y, -r.depth - 5);
    vertex(pos.x, pos.y + TILE_HEIGHT);
  }
  endShape(CLOSE);
}

function isVisible(sx, sy, margin = 18) {
  return (
    sx > -margin && sx < width + margin && sy > -margin && sy < height + margin
  );
}

function drawScene() {
  if (buildingsDirty) {
    sortedBuildings = buildings.slice().sort((a, b) => a.depth - b.depth);
    buildingsDirty = false;
  }

  let bIdx = 0;
  let numB = sortedBuildings.length;

  for (let i = 0; i < sortedTerrainOrder.length; i++) {
    let t = sortedTerrainOrder[i];

    while (bIdx < numB && sortedBuildings[bIdx].depth <= t.depth) {
      drawBuilding(sortedBuildings[bIdx]);
      bIdx++;
    }

    let tile = terrain[t.x][t.y];

    if (!tile.onRock && tile.isWater) continue;

    let pos = toIso(t.x, t.y, tile.isWater ? -0.15 : tile.elevation);

    if (isVisible(pos.x, pos.y, 25)) {
      drawTerrainTile(t.x, t.y, tile, pos);
      if (tile.bridge) drawBridge(tile.bridge, pos, cachedDaylight);
    }
  }

  while (bIdx < numB) {
    drawBuilding(sortedBuildings[bIdx]);
    bIdx++;
  }

  for (let p of islandProjects) {
    if (!p.completed) {
      let pos = toIso(p.x, p.y, 0);
      if (isVisible(pos.x, pos.y)) {
        let size = max(3, p.currentSize) * TILE_WIDTH * 0.6;
        fill(lerpColor(color(65, 60, 55), color(120, 110, 95), cachedDaylight));
        noStroke();
        beginShape();
        for (let a = 0; a < TWO_PI; a += 0.5) {
          let r = size * (0.8 + noise(a + p.shapeSeed) * 0.4);
          vertex(pos.x + cos(a) * r, pos.y + TILE_HEIGHT + sin(a) * r * 0.4);
        }
        endShape(CLOSE);
      }
    }
  }

  // Draw terraforming indicators
  for (let p of terraformProjects) {
    if (p.radius < p.targetRadius) {
      let pos = toIso(p.x, p.y, terrain[p.x][p.y].elevation);
      if (isVisible(pos.x, pos.y)) {
        noFill();
        stroke(255, 200, 100, 50 + sin(frameCount * 0.1) * 30);
        strokeWeight(1);
        ellipse(
          pos.x,
          pos.y + TILE_HEIGHT / 2,
          p.radius * TILE_WIDTH * 0.8,
          p.radius * TILE_HEIGHT * 0.8,
        );
        noStroke();
      }
    }
  }
}

function drawTerrainTile(x, y, tile, pos) {
  let elev = tile.elevation;
  let daylight = cachedDaylight;
  let topColor, sideColor;

  if (tile.isWater) {
    let waterBase = tile.isRiver ? color(45, 75, 115) : color(35, 85, 135);
    topColor = lerpColor(color(15, 30, 50), waterBase, daylight);
    sideColor = lerpColor(topColor, color(0), 0.22);
  } else if (tile.road && !tile.bridge) {
    topColor = lerpColor(color(25, 25, 30), color(65, 60, 55), daylight);
    sideColor = lerpColor(topColor, color(0), 0.22);
  } else if (tile.isArtificial) {
    topColor = lerpColor(color(50, 50, 55), color(145, 145, 140), daylight);
    sideColor = lerpColor(color(40, 40, 45), color(110, 110, 105), daylight);
  } else if (tile.terraforming) {
    // Terraformed ground - slightly different color
    topColor = lerpColor(color(45, 42, 38), color(140, 130, 110), daylight);
    sideColor = lerpColor(color(35, 32, 28), color(100, 90, 70), daylight);
  } else if (tile.isCliff) {
    // CLIFF FACE - grey rock instead of sand
    topColor = lerpColor(color(40, 42, 48), color(95, 100, 110), daylight);
    sideColor = lerpColor(color(30, 32, 38), color(70, 75, 85), daylight);
  } else if (tile.distanceToWater < 2.2 && elev <= 2) {
    // BEACH - only on LOW elevation near water
    topColor = lerpColor(color(55, 50, 40), color(200, 185, 150), daylight);
    sideColor = lerpColor(color(45, 40, 30), color(170, 155, 120), daylight);
  } else if (tile.distanceToWater < 2.2 && elev > 2) {
    // High terrain near water but not marked as cliff - still make it rocky
    topColor = lerpColor(color(42, 44, 50), color(100, 105, 115), daylight);
    sideColor = lerpColor(color(32, 34, 40), color(75, 80, 90), daylight);
  } else if (elev > 9) {
    // Snow caps
    topColor = lerpColor(color(80, 85, 95), color(240, 245, 250), daylight);
    sideColor = lerpColor(color(60, 65, 75), color(200, 210, 220), daylight);
  } else if (elev > 6) {
    // Rocky mountains
    topColor = lerpColor(color(45, 45, 50), color(120, 115, 110), daylight);
    sideColor = lerpColor(color(35, 35, 40), color(90, 85, 80), daylight);
  } else if (elev > 3) {
    // Hills - darker grass
    let grass = color(50 + tile.grassType * 3, 85 + tile.grassType * 4, 45);
    topColor = lerpColor(color(22, 32, 36), grass, daylight);
    sideColor = lerpColor(color(16, 24, 30), color(35, 62, 30), daylight);
  } else {
    // Lowlands - bright grass
    let grass = color(65 + tile.grassType * 5, 130 + tile.grassType * 6, 55);
    topColor = lerpColor(color(24, 40, 44), grass, daylight);
    sideColor = lerpColor(color(20, 30, 34), color(45, 95, 40), daylight);
  }

  if (tile.inShadow && !tile.isWater) {
    topColor = lerpColor(topColor, color(30, 30, 35), 0.2);
  }

  fill(topColor);
  noStroke();
  beginShape();
  vertex(pos.x, pos.y);
  vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
  vertex(pos.x, pos.y + TILE_HEIGHT);
  vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
  endShape(CLOSE);

  let drawHeight = tile.isWater ? 0.15 : elev;
  if (drawHeight > 0) {
    let sideH = drawHeight * TILE_HEIGHT;

    fill(sideColor);
    beginShape();
    vertex(pos.x, pos.y + TILE_HEIGHT);
    vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    endShape(CLOSE);

    fill(lerpColor(sideColor, color(0), 0.12));
    beginShape();
    vertex(pos.x, pos.y + TILE_HEIGHT);
    vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    endShape(CLOSE);
  }
}

function drawBuilding(b) {
  let t = buildingToTerrain(b.gridX, b.gridY);
  let terrainElev = getBuildingTerrainHeight(b.gridX, b.gridY);
  let pos = toIso(t.x + 0.5, t.y + 0.5, terrainElev);

  if (!isVisible(pos.x, pos.y - b.currentLayer * TILE_HEIGHT, 70)) return;

  let daylight = cachedDaylight;
  let isNight = cachedIsNight;
  let decayFactor = b.decaying ? map(b.age, b.decayAge, b.maxAge, 0, 0.3) : 0;

  let layersToDraw = b.collapsing ? b.collapseLayer : b.currentLayer;
  let bw = TILE_WIDTH * 1.7;
  let bh = TILE_HEIGHT * 1.7;

  for (let layer = 0; layer < layersToDraw; layer++) {
    drawBuildingLayer(b, pos, layer, daylight, decayFactor, isNight, bw, bh);
  }

  if (!b.completed && !b.collapsing && b.currentLayer < b.targetHeight) {
    drawPartialLayer(b, pos, b.currentLayer, b.layerProgress, daylight, bw, bh);
  }

  if (b.collapsing && b.collapseLayer >= 0) {
    drawCollapsingLayer(
      b,
      pos,
      b.collapseLayer,
      b.collapseProgress,
      daylight,
      bw,
      bh,
    );
  }

  if (b.completed && !b.collapsing) {
    drawRoof(b, pos, daylight, decayFactor, bw, bh);
  }

  if (b.scaffolding && b.scaffoldingAlpha > 0 && !b.collapsing) {
    drawScaffolding(b, pos, b.scaffoldingAlpha, bw, bh);
  }

  if (!b.completed && !b.collapsing && b.hasCrane && b.currentLayer > 2) {
    drawStaticCrane(b, pos, daylight, bw);
  }
}

function drawStaticCrane(b, pos, daylight, bw) {
  let craneHeight = b.currentLayer * TILE_HEIGHT + TILE_HEIGHT * 2.5;
  let mastX = pos.x + bw * 0.15;
  let baseY = pos.y;

  let craneColor = lerpColor(
    color(200, 160, 50),
    color(80, 65, 30),
    1 - daylight,
  );

  stroke(craneColor);
  strokeWeight(1.2);
  line(mastX, baseY, mastX, baseY - craneHeight);

  let jibLen = bw * 1.1;
  let rot = b.craneAngle;
  let jibEndX = mastX + cos(rot) * jibLen;
  let jibEndY = baseY - craneHeight + sin(rot) * jibLen * 0.2;
  line(mastX, baseY - craneHeight, jibEndX, jibEndY);

  let counterX = mastX - cos(rot) * jibLen * 0.3;
  let counterY = baseY - craneHeight - sin(rot) * jibLen * 0.08;
  line(mastX, baseY - craneHeight, counterX, counterY);

  fill(lerpColor(color(65, 65, 70), color(35, 35, 40), 1 - daylight));
  noStroke();
  rect(counterX - 2, counterY - 2, 4, 3);

  stroke(craneColor);
  strokeWeight(0.5);
  let hookX = mastX + cos(rot) * jibLen * 0.6;
  let hookBaseY = baseY - craneHeight + sin(rot) * jibLen * 0.12;
  let hookY = hookBaseY + TILE_HEIGHT * 2;
  line(hookX, hookBaseY, hookX, hookY);

  fill(lerpColor(color(90, 90, 95), color(45, 45, 50), 1 - daylight));
  noStroke();
  ellipse(hookX, hookY, 2.5, 3);

  noStroke();
}

function drawScaffolding(b, pos, alpha, bw, bh) {
  let totalHeight = b.currentLayer * TILE_HEIGHT;
  if (!b.completed) totalHeight += b.layerProgress * TILE_HEIGHT;
  if (totalHeight < TILE_HEIGHT * 0.3) return;

  stroke(135, 105, 55, alpha);
  strokeWeight(0.6);

  let poles = [
    { x: pos.x - bw / 2 - 1.2, y: pos.y + bh / 2 },
    { x: pos.x + bw / 2 + 1.2, y: pos.y + bh / 2 },
    { x: pos.x, y: pos.y + bh + 1.2 },
  ];

  for (let pole of poles) {
    line(pole.x, pole.y, pole.x, pole.y - totalHeight - 3);
  }

  for (let h = TILE_HEIGHT * 0.5; h < totalHeight; h += TILE_HEIGHT * 1.3) {
    line(poles[0].x, poles[0].y - h, poles[2].x, poles[2].y - h);
    line(poles[1].x, poles[1].y - h, poles[2].x, poles[2].y - h);
    line(poles[0].x, poles[0].y - h, poles[1].x, poles[1].y - h);
  }

  noStroke();
}

function drawBuildingLayer(
  b,
  pos,
  layer,
  daylight,
  decayFactor,
  isNight,
  bw,
  bh,
) {
  let layerHeight = TILE_HEIGHT;
  let y = pos.y - layer * layerHeight;

  let variation = b.layerVariations[layer] || {
    colorShift: 0,
    widthMod: 1,
    hasWindow: true,
    windowStyle: 0,
  };

  let baseCol = color(
    b.baseColor.r + variation.colorShift,
    b.baseColor.g + variation.colorShift * 0.6,
    b.baseColor.b + variation.colorShift * 0.4,
  );

  if (decayFactor > 0)
    baseCol = lerpColor(baseCol, color(50, 45, 40), decayFactor);
  baseCol = lerpColor(color(18, 18, 24), baseCol, daylight);
  let shadedCol = lerpColor(baseCol, color(0), 0.2);

  let w = bw * variation.widthMod;
  let h = bh * variation.widthMod;

  fill(baseCol);
  noStroke();
  beginShape();
  vertex(pos.x, y - layerHeight);
  vertex(pos.x + w / 2, y - layerHeight + h / 2);
  vertex(pos.x, y - layerHeight + h);
  vertex(pos.x - w / 2, y - layerHeight + h / 2);
  endShape(CLOSE);

  fill(shadedCol);
  beginShape();
  vertex(pos.x, y - layerHeight + h);
  vertex(pos.x + w / 2, y - layerHeight + h / 2);
  vertex(pos.x + w / 2, y + (bh / 2) * variation.widthMod);
  vertex(pos.x, y + bh * variation.widthMod);
  endShape(CLOSE);

  fill(lerpColor(shadedCol, color(0), 0.1));
  beginShape();
  vertex(pos.x, y - layerHeight + h);
  vertex(pos.x - w / 2, y - layerHeight + h / 2);
  vertex(pos.x - w / 2, y + (bh / 2) * variation.widthMod);
  vertex(pos.x, y + bh * variation.widthMod);
  endShape(CLOSE);

  if (variation.hasWindow && !b.decaying) {
    let windowCol;
    if (isNight) {
      let litChance = noise(b.gridX * 0.15 + layer * 0.3) > 0.3;
      if (litChance) {
        let warmth = noise(b.gridX + layer) * 50;
        windowCol = color(255, 235 - warmth, 170 - warmth, 170);
      } else {
        windowCol = color(35, 45, 60, 70);
      }
    } else {
      windowCol = color(160, 200, 245, 120);
    }

    fill(windowCol);

    if (b.type === "APARTMENT") {
      let style = variation.windowStyle;
      if (style === 0) {
        rect(pos.x - w * 0.08, y - layerHeight * 0.5, 1.8, 2.4);
        rect(pos.x + w * 0.1, y - layerHeight * 0.5, 1.8, 2.4);
      } else if (style === 1) {
        rect(pos.x, y - layerHeight * 0.5, 3, 2);
      } else {
        rect(pos.x - w * 0.12, y - layerHeight * 0.45, 1.2, 1.8);
        rect(pos.x + w * 0.02, y - layerHeight * 0.45, 1.2, 1.8);
        rect(pos.x + w * 0.16, y - layerHeight * 0.45, 1.2, 1.8);
      }

      if (layer % 3 === 0 && layer > 0) {
        fill(lerpColor(color(60, 60, 65), color(120, 115, 110), daylight));
        rect(pos.x + w * 0.2, y - layerHeight * 0.15, 2, 0.8);
      }
    } else {
      rect(pos.x + w * 0.05, y - layerHeight * 0.48, 1.5, 2.2);
      if (w > bw * 0.5) {
        rect(pos.x - w * 0.12, y - layerHeight * 0.48, 1.5, 2.2);
      }
      if (b.type === "COMMERCIAL" && w > bw * 0.7) {
        rect(pos.x + w * 0.18, y - layerHeight * 0.48, 1.5, 2.2);
      }
    }
  }

  if (variation.glassPanel && b.type === "COMMERCIAL") {
    fill(160, 210, 255, isNight ? 25 : 18);
    beginShape();
    vertex(pos.x, y - layerHeight * 0.85);
    vertex(pos.x + (w / 2) * 0.85, y - layerHeight + (h / 2) * 0.85);
    vertex(pos.x, y - layerHeight + h * 0.85);
    vertex(pos.x - (w / 2) * 0.85, y - layerHeight + (h / 2) * 0.85);
    endShape(CLOSE);
  }
}

function drawPartialLayer(b, pos, layer, progress, daylight, bw, bh) {
  let layerHeight = TILE_HEIGHT * progress;
  let fullHeight = TILE_HEIGHT;
  let y = pos.y - layer * fullHeight;

  let variation = b.layerVariations[layer] || { widthMod: 1 };
  let w = bw * variation.widthMod;
  let h = bh * variation.widthMod;

  let constructionCol = lerpColor(
    color(150, 140, 120),
    color(22, 22, 26),
    1 - daylight,
  );

  fill(constructionCol);
  noStroke();
  beginShape();
  vertex(pos.x, y - layerHeight);
  vertex(pos.x + w / 2, y - layerHeight + h / 2);
  vertex(pos.x, y - layerHeight + h);
  vertex(pos.x - w / 2, y - layerHeight + h / 2);
  endShape(CLOSE);

  fill(lerpColor(constructionCol, color(0), 0.18));
  beginShape();
  vertex(pos.x, y - layerHeight + h);
  vertex(pos.x + w / 2, y - layerHeight + h / 2);
  vertex(pos.x + w / 2, y + h / 2);
  vertex(pos.x, y + h);
  endShape(CLOSE);
}

function drawCollapsingLayer(b, pos, layer, progress, daylight, bw, bh) {
  let fullHeight = TILE_HEIGHT;
  let y = pos.y - layer * fullHeight;
  let fallOffset = progress * TILE_HEIGHT * 2.2;
  let shrink = 1 - progress * 0.55;

  let debrisCol = lerpColor(
    color(b.baseColor.r, b.baseColor.g, b.baseColor.b),
    color(22, 22, 26),
    1 - daylight,
  );

  fill(red(debrisCol), green(debrisCol), blue(debrisCol), (1 - progress) * 255);
  noStroke();
  let w = bw * shrink,
    h = bh * shrink;

  beginShape();
  vertex(pos.x, y - fullHeight * (1 - progress) + fallOffset);
  vertex(pos.x + w / 2, y - fullHeight * (1 - progress) + fallOffset + h / 2);
  vertex(pos.x, y + fallOffset + h);
  vertex(pos.x - w / 2, y - fullHeight * (1 - progress) + fallOffset + h / 2);
  endShape(CLOSE);
}

function drawRoof(b, pos, daylight, decayFactor, bw, bh) {
  let topY = pos.y - b.currentLayer * TILE_HEIGHT;
  let topVar = b.layerVariations[b.currentLayer - 1] || { widthMod: 1 };
  let widthMod = topVar.widthMod;

  let roofCol = color(b.roofColor.r, b.roofColor.g, b.roofColor.b);
  if (decayFactor > 0)
    roofCol = lerpColor(roofCol, color(40, 35, 30), decayFactor);
  roofCol = lerpColor(color(14, 14, 20), roofCol, daylight);

  fill(roofCol);
  noStroke();

  let w = bw * widthMod,
    h = bh * widthMod;

  if (b.roofType === "spire") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(roofCol, color(255), 0.12));
    beginShape();
    vertex(pos.x, topY - TILE_HEIGHT * 2.8);
    vertex(pos.x + 2.5, topY + 2);
    vertex(pos.x - 2.5, topY + 2);
    endShape(CLOSE);

    if (cachedIsNight) {
      fill(255, 70, 70, 175);
      circle(pos.x, topY - TILE_HEIGHT * 2.8, 2);
    }
  } else if (b.roofType === "crown") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(roofCol, color(255, 215, 145), 0.15));
    for (let i = 0; i < 3; i++) {
      let sx = pos.x + (i - 1) * (w / 4);
      let sh = TILE_HEIGHT * 1.2 * (1 - abs(i - 1) * 0.25);
      beginShape();
      vertex(sx, topY - sh);
      vertex(sx + 1.6, topY);
      vertex(sx - 1.6, topY);
      endShape(CLOSE);
    }
  } else if (b.roofType === "sawtooth") {
    let teeth = 2;
    let tw = w / teeth;
    for (let i = 0; i < teeth; i++) {
      fill(i % 2 === 0 ? roofCol : lerpColor(roofCol, color(0), 0.14));
      beginShape();
      vertex(pos.x - w / 2 + i * tw, topY + h / 2);
      vertex(pos.x - w / 2 + (i + 0.5) * tw, topY - 2);
      vertex(pos.x - w / 2 + (i + 1) * tw, topY + h / 2);
      endShape(CLOSE);
    }

    if (b.hasSmokestack) {
      fill(lerpColor(color(45, 40, 40), color(18, 18, 24), 1 - daylight));
      rect(pos.x + w * 0.08, topY - TILE_HEIGHT * 0.9, 3.5, TILE_HEIGHT * 0.9);
    }
  } else if (b.roofType === "silos") {
    fill(lerpColor(color(80, 85, 90), color(36, 36, 40), 1 - daylight));
    ellipse(pos.x - w * 0.15, topY + h * 0.25, w * 0.35, h * 0.25);
    ellipse(pos.x + w * 0.15, topY + h * 0.25, w * 0.35, h * 0.25);

    fill(lerpColor(roofCol, color(0), 0.1));
    ellipse(pos.x - w * 0.15, topY + h * 0.15, w * 0.3, h * 0.15);
    ellipse(pos.x + w * 0.15, topY + h * 0.15, w * 0.3, h * 0.15);
  } else if (b.roofType === "tanks") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(80, 85, 90), color(35, 35, 40), 1 - daylight));
    ellipse(pos.x - w * 0.1, topY + h * 0.28, w * 0.28, h * 0.2);
    ellipse(pos.x + w * 0.12, topY + h * 0.28, w * 0.22, h * 0.16);
  } else if (b.roofType === "chimney") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(65, 55, 50), color(28, 24, 22), 1 - daylight));
    rect(pos.x + w * 0.1, topY - TILE_HEIGHT * 1.2, 4, TILE_HEIGHT * 1.2);
    rect(pos.x - w * 0.2, topY - TILE_HEIGHT * 0.8, 3, TILE_HEIGHT * 0.8);
  } else if (b.roofType === "garden") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(25, 40, 30), color(60, 110, 52), daylight));
    ellipse(pos.x, topY + h / 2, w * 0.5, h * 0.32);
  } else if (b.roofType === "mechanical") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(55, 60, 65), color(28, 28, 32), 1 - daylight));
    rect(pos.x - w * 0.15, topY + h * 0.15, w * 0.3, h * 0.25);
    rect(pos.x + w * 0.05, topY + h * 0.2, w * 0.2, h * 0.2);
  } else if (b.roofType === "pitched") {
    fill(lerpColor(roofCol, color(0), 0.08));
    beginShape();
    vertex(pos.x, topY - TILE_HEIGHT * 0.7);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(roofCol, color(0), 0.22));
    beginShape();
    vertex(pos.x, topY - TILE_HEIGHT * 0.7);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h * 0.6);
    endShape(CLOSE);
  } else if (b.roofType === "watertank") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(70, 75, 80), color(30, 30, 35), 1 - daylight));
    ellipse(pos.x + w * 0.1, topY + h * 0.3, w * 0.35, h * 0.22);
    fill(lerpColor(color(85, 90, 95), color(40, 40, 45), 1 - daylight));
    ellipse(pos.x + w * 0.1, topY + h * 0.2, w * 0.3, h * 0.12);
  } else if (b.roofType === "ac_units") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(75, 80, 85), color(35, 35, 40), 1 - daylight));
    rect(pos.x - w * 0.2, topY + h * 0.2, w * 0.18, h * 0.15);
    rect(pos.x + w * 0.05, topY + h * 0.25, w * 0.15, h * 0.12);
    rect(pos.x + w * 0.15, topY + h * 0.15, w * 0.12, h * 0.1);
  } else if (b.roofType === "terrace") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    stroke(lerpColor(color(100, 95, 90), color(45, 42, 40), 1 - daylight));
    strokeWeight(0.5);
    line(pos.x - w * 0.35, topY + h * 0.3, pos.x + w * 0.35, topY + h * 0.3);
    line(pos.x - w * 0.35, topY + h * 0.3, pos.x - w * 0.35, topY + h * 0.45);
    line(pos.x + w * 0.35, topY + h * 0.3, pos.x + w * 0.35, topY + h * 0.45);
    noStroke();
  } else if (b.roofType === "solar") {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    fill(lerpColor(color(35, 40, 60), color(20, 25, 40), 1 - daylight));
    beginShape();
    vertex(pos.x, topY + h * 0.15);
    vertex(pos.x + w * 0.3, topY + h * 0.35);
    vertex(pos.x, topY + h * 0.55);
    vertex(pos.x - w * 0.3, topY + h * 0.35);
    endShape(CLOSE);

    stroke(lerpColor(color(50, 55, 75), color(30, 35, 55), 1 - daylight));
    strokeWeight(0.3);
    line(pos.x - w * 0.15, topY + h * 0.25, pos.x + w * 0.15, topY + h * 0.45);
    line(pos.x, topY + h * 0.2, pos.x, topY + h * 0.5);
    noStroke();
  } else {
    beginShape();
    vertex(pos.x, topY);
    vertex(pos.x + w / 2, topY + h / 2);
    vertex(pos.x, topY + h);
    vertex(pos.x - w / 2, topY + h / 2);
    endShape(CLOSE);

    if (b.hasAntenna && !b.decaying) {
      stroke(62, 62, 72);
      strokeWeight(0.55);
      line(pos.x, topY, pos.x, topY - TILE_HEIGHT * 0.55);
      noStroke();
    }

    if (b.hasHelipad) {
      fill(lerpColor(color(55, 55, 60), color(26, 26, 30), 1 - daylight));
      ellipse(pos.x, topY + h / 2, w * 0.38, h * 0.26);
    }
  }
}

function getDaylightFactor() {
  if (time < 0.08) return 0.1;
  if (time < 0.18) return map(time, 0.08, 0.18, 0.1, 0.52);
  if (time < 0.28) return map(time, 0.18, 0.28, 0.52, 1);
  if (time < 0.78) return 1;
  if (time < 0.85) return map(time, 0.78, 0.85, 1, 0.52);
  if (time < 0.92) return map(time, 0.85, 0.92, 0.52, 0.1);
  return 0.1;
}

function drawUI() {
  let apartments = buildings.filter(
    (b) => b.type === "APARTMENT" && !b.collapsing,
  ).length;
  let commercial = buildings.filter(
    (b) => b.type === "COMMERCIAL" && !b.collapsing,
  ).length;
  let industrial = buildings.filter(
    (b) => b.type === "INDUSTRIAL" && !b.collapsing,
  ).length;
  let underConstruction = buildings.filter(
    (b) => !b.completed && !b.collapsing,
  ).length;
  let decaying = buildings.filter((b) => b.decaying && !b.collapsing).length;

  fill(0, 0, 0, 165);
  noStroke();

  fill(255);
  textSize(10);
  textAlign(LEFT, TOP);

  let y = 11;
  let lh = 11;

  fill(
    fps > 18
      ? color(100, 255, 100)
      : fps > 8
        ? color(255, 180, 80)
        : color(255, 80, 80),
  );
  text(`FPS: ${floor(fps)}`, 12, y);
  y += lh;
}

function getTimeString() {
  let hours = floor(time * 24);
  let minutes = floor((time * 24 - hours) * 60);
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}
