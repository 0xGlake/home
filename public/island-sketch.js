const TERRAIN_SIZE = 160;
const TILE_WIDTH = 6;
const TILE_HEIGHT = 3;
const BUILDING_GRID = 70;
const MAX_BUILDINGS = 220;
const NUM_CITIES = 5;
const MAX_BUILDINGS_PER_CITY = 50;
const MAX_BUILDING_HEIGHT = 32; // absolute ceiling; generation bonus is capped
const MAX_MONOLITH_HEIGHT = 52; // rare landmark towers exceed the normal cap
const MAX_MONOLITHS = 4;
let monolithCount = 0;

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
let simulationSpeed = 3;

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
let terrainColorsDirty = true;
let lastTerrainDaylight = -1;
let terrainLayer = null;
let waterDrawList = [];
let terrainDaylight = 0;
let cropStage = 0; // 0 tilled, 1 sprout, 2 green, 3 ripe — advances each day
let hamlets = [];
let hamletsDirty = true;
let sortedActors = [];
let cityLinks = []; // completed highway links as [indexA, indexB]
let highwayMST = []; // planned backbone edges {a, b}

// ---- Adaptive quality + ambient effects ----
const FPS_FLOOR = 30;
let quality = {
  level: 3,
  nightlife: true,
  clouds: true,
  aurora: true,
  birds: true,
  weatherFog: true,
  boats: true,
  water: true,
  reflections: true,
  weatherRain: true,
  fireworks: true,
};
let qualityCooldown = 0;

let clouds = [];
let raindrops = [];
let cars = [];
let birds = [];
let boats = [];
let fireworks = [];
let lighthouses = [];
let weatherState = "clear";
let weatherTimer = 0;
let weatherIntensity = 0;
let eventState = "none";
let eventTimer = 0;
let sunMoon = { x: 400, y: 120, isSun: true };

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

  terrainLayer = createGraphics(width, height);
  terrainLayer.noSmooth();

  computeDecorations();

  applyQuality(3);
  initEffects();
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
  hamlets = [];
  hamletsDirty = true;
  cityLinks = [];
  highwayMST = [];
  e_retry = {};
  e_stuck = {};
  monolithCount = 0;
  buildingsDirty = true;
  candidatesDirty = true;
  terrainColorsDirty = true;
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
      terrainColorsDirty = true;
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

  }
  planCityHighways();
}

// ============ INTERCITY HIGHWAYS (guaranteed connectivity) ============
// Build a minimum spanning tree over the cities and seed a high-energy highway
// agent for each backbone edge. Highways steer hard toward their target, cut
// gentle grades through hills, bridge water, and register a link on arrival so
// the whole map ends up connected. growRoads() re-seeds any edge whose agent
// died before completing.

function planCityHighways() {
  highwayMST = [];
  let land = cityCenters.filter((c) => !c.isIsland);
  if (land.length < 2) return;
  let inTree = [land[0].index];
  let remaining = land.slice(1).map((c) => c.index);
  while (remaining.length > 0) {
    let best = null;
    let bestD = Infinity;
    for (let ai of inTree) {
      let a = cityByIndex(ai);
      for (let bi of remaining) {
        let b = cityByIndex(bi);
        let d = dist(a.x, a.y, b.x, b.y);
        if (d < bestD) {
          bestD = d;
          best = { a: ai, b: bi };
        }
      }
    }
    if (!best) break;
    highwayMST.push(best);
    inTree.push(best.b);
    remaining = remaining.filter((i) => i !== best.b);
  }
  for (let e of highwayMST) seedHighway(cityByIndex(e.a), cityByIndex(e.b));
}

function cityByIndex(idx) {
  for (let c of cityCenters) if (c.index === idx) return c;
  return null;
}

function seedHighway(a, b) {
  if (!a || !b) return;
  let d = dist(a.x, a.y, b.x, b.y);
  roadQueue.push({
    x: a.x,
    y: a.y,
    angle: atan2(b.y - a.y, b.x - a.x),
    type: "main",
    energy: d * 2.4 + 30,
    sourceCity: a,
    targetCity: b,
    srcI: a.index,
    dstI: b.index,
    canBridge: true,
    gridAlign: false,
    highway: true,
  });
}

function reseedHighway(ai, bi) {
  let a = cityByIndex(ai);
  let b = cityByIndex(bi);
  if (!a || !b) return;

  // find the road tile nearest the target that belongs to a's network side
  let best = null;
  let bestD = Infinity;
  for (let r of roads) {
    if (terrain[r.x][r.y].isWater) continue;
    let d = dist(r.x, r.y, b.x, b.y);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  let sx = best ? best.x : a.x;
  let sy = best ? best.y : a.y;

  e_retry[ai + "_" + bi] = (e_retry[ai + "_" + bi] || 0) + 1;
  let retry = e_retry[ai + "_" + bi];

  roadQueue.push({
    x: sx,
    y: sy,
    angle: atan2(b.y - sy, b.x - sx),
    type: "main",
    energy: dist(sx, sy, b.x, b.y) * 3 + 40 + retry * 30,
    sourceCity: a,
    targetCity: b,
    srcI: ai,
    dstI: bi,
    canBridge: true,
    gridAlign: false,
    highway: true,
  });
}

let e_retry = {};
let e_stuck = {};

function carveRoadTile(x, y) {
  let tile = terrain[x] && terrain[x][y];
  if (!tile) return;
  if (tile.isWater) {
    addRoad(x, y, "main", true); // forced bridge over any water span
  } else {
    if (tile.elevation > 6) {
      tile.elevation = 5;
      tile.terraforming = true;
      terrainColorsDirty = true;
    }
    addRoad(x, y, "main");
  }
}

// Deterministic last-resort connector. Lays a CONTINUOUS road all the way from
// city A's center to city B's center (both already have local roads), so the two
// road NETWORKS genuinely merge — bridging any water and grading any hills en
// route. The earlier version started next to B and connected nothing; this
// walks the whole span so the link is real and visible.
function carveHighway(ai, bi) {
  let a = cityByIndex(ai);
  let b = cityByIndex(bi);
  if (!a || !b) return;

  let cx = a.x;
  let cy = a.y;
  let guard = 0;
  while ((cx !== b.x || cy !== b.y) && guard < TERRAIN_SIZE * 3) {
    guard++;
    let stepX = b.x > cx ? 1 : b.x < cx ? -1 : 0;
    let stepY = b.y > cy ? 1 : b.y < cy ? -1 : 0;
    if (stepX !== 0) {
      cx += stepX;
      carveRoadTile(cx, cy);
    }
    if (stepY !== 0) {
      cy += stepY;
      carveRoadTile(cx, cy);
    }
  }
  registerLink(a, b);
}

function linkExists(ai, bi) {
  for (let l of cityLinks) {
    if ((l[0] === ai && l[1] === bi) || (l[0] === bi && l[1] === ai)) return true;
  }
  return false;
}

function registerLink(a, b) {
  if (!a || !b || a.index === b.index) return;
  if (!linkExists(a.index, b.index)) cityLinks.push([a.index, b.index]);
}

// Flood fill the real road network from a seed tile; returns a Set of "x,y" keys.
function floodRoadNetwork(sx, sy) {
  let seen = new Set();
  if (!terrain[sx] || !terrain[sx][sy] || !terrain[sx][sy].road) {
    // seed from nearest road tile to the city center
    let best = null;
    let bd = Infinity;
    for (let r of roads) {
      let d = (r.x - sx) * (r.x - sx) + (r.y - sy) * (r.y - sy);
      if (d < bd) {
        bd = d;
        best = r;
      }
    }
    if (!best) return seen;
    sx = best.x;
    sy = best.y;
  }
  let stack = [[sx, sy]];
  seen.add(sx + "," + sy);
  while (stack.length) {
    let cur = stack.pop();
    let x = cur[0];
    let y = cur[1];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        let nx = x + dx;
        let ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= TERRAIN_SIZE || ny >= TERRAIN_SIZE) continue;
        let k = nx + "," + ny;
        if (seen.has(k)) continue;
        if (terrain[nx][ny].road) {
          seen.add(k);
          stack.push([nx, ny]);
        }
      }
    }
  }
  return seen;
}

function cityOnNetwork(city, net) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (net.has(city.x + dx + "," + (city.y + dy))) return true;
    }
  }
  return false;
}

// Ensure every land city is physically reachable on roads from the primary
// network. Unreachable cities are first given an organic highway attempt; if
// they have already had a couple of frames to connect, a road is carved.
function healCityConnectivity() {
  let land = cityCenters.filter((c) => !c.isIsland);
  if (land.length < 2) return;
  let hub = land[0];
  let net = floodRoadNetwork(hub.x, hub.y);

  for (let i = 1; i < land.length; i++) {
    let c = land[i];
    let key = "h" + c.index;
    if (cityOnNetwork(c, net)) {
      e_stuck[key] = 0;
      continue;
    }
    e_stuck[key] = (e_stuck[key] || 0) + 1;
    if (e_stuck[key] >= 3) {
      // carve from this city to the nearest city already on the network
      let target = hub;
      let bd = dist(c.x, c.y, hub.x, hub.y);
      for (let j = 0; j < land.length; j++) {
        if (j === i) continue;
        if (cityOnNetwork(land[j], net)) {
          let d = dist(c.x, c.y, land[j].x, land[j].y);
          if (d < bd) {
            bd = d;
            target = land[j];
          }
        }
      }
      carveHighway(c.index, target.index);
      net = floodRoadNetwork(hub.x, hub.y); // refresh after carving
      e_stuck[key] = 0;
    } else if (!hasQueuedHighwayTo(c.index)) {
      seedHighway(hub, c);
    }
  }
}

function hasQueuedHighwayTo(idx) {
  for (let r of roadQueue) {
    if (r.highway && (r.srcI === idx || r.dstI === idx)) return true;
  }
  return false;
}

function citiesConnected(ai, bi) {
  // BFS over cityLinks
  if (ai === bi) return true;
  let seen = { [ai]: true };
  let stack = [ai];
  while (stack.length) {
    let cur = stack.pop();
    for (let l of cityLinks) {
      let nxt = l[0] === cur ? l[1] : l[1] === cur ? l[0] : null;
      if (nxt !== null && !seen[nxt]) {
        if (nxt === bi) return true;
        seen[nxt] = true;
        stack.push(nxt);
      }
    }
  }
  return false;
}

function hasQueuedHighway(ai, bi) {
  for (let r of roadQueue) {
    if (
      r.highway &&
      ((r.srcI === ai && r.dstI === bi) || (r.srcI === bi && r.dstI === ai))
    )
      return true;
  }
  return false;
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
              terrainColorsDirty = true;
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

function drawBridge_unused(bridge, pos, daylight) {
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

function canBridgeTo(x, y, fromX, fromY, maxSpan = 12) {
  if (x < 0 || x >= TERRAIN_SIZE || y < 0 || y >= TERRAIN_SIZE) return false;
  if (!terrain[x][y].isWater) return false;

  let dx = x - fromX,
    dy = y - fromY;
  let len = sqrt(dx * dx + dy * dy);
  if (len === 0) return false;
  dx /= len;
  dy /= len;

  for (let i = 1; i <= maxSpan; i++) {
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
  terrainColorsDirty = true;
  return true;
}

function growRoads() {
  // Connectivity maintenance based on the ACTUAL road network (flood fill over
  // road tiles), not a link registry. Cities are given some time to connect
  // organically; any still physically unreachable get a guaranteed carved road.
  if (frameCount % 120 === 0 && roads.length > 20) {
    healCityConnectivity();
  }

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
      // Arrived? Register the link and retire the agent.
      let dd = dist(road.x, road.y, road.targetCity.x, road.targetCity.y);
      if (dd <= 3) {
        if (road.highway) registerLink(road.sourceCity, road.targetCity);
        continue;
      }
      let toTarget = atan2(
        road.targetCity.y - road.y,
        road.targetCity.x - road.x,
      );
      road.angle = lerp(road.angle, toTarget, road.highway ? 0.45 : 0.15);
    }
    if (road.targetIsland) {
      // Once the connecting road actually reaches the island, stop. Letting it
      // keep wandering/branching fills the small island with road tiles (all
      // marked occupied), leaving no free plots for buildings.
      let onArtificial =
        terrain[road.x] &&
        terrain[road.x][road.y] &&
        terrain[road.x][road.y].isArtificial;
      let dd = dist(road.x, road.y, road.targetIsland.x, road.targetIsland.y);
      if (onArtificial || dd <= 2) {
        continue;
      }
      let toTarget = atan2(
        road.targetIsland.y - road.y,
        road.targetIsland.x - road.x,
      );
      road.angle = lerp(road.angle, toTarget, 0.4);
    }

    road.angle += (random() - 0.5) * 0.2;

    let nx = round(road.x + cos(road.angle));
    let ny = round(road.y + sin(road.angle));

    if (nx >= 0 && nx < TERRAIN_SIZE && ny >= 0 && ny < TERRAIN_SIZE) {
      let tile = terrain[nx][ny];

      let nearEdge = tile.distanceToWater < 2;
      if (nearEdge && !road.targetIsland && !road.targetCity && !tile.isWater) {
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

      if (road.highway && !tile.isWater && tile.elevation > 5) {
        // grade a cut so highways can cross hills instead of dying on them
        tile.elevation = 5;
        tile.terraforming = true;
        terrainColorsDirty = true;
      }
      let maxBuildElev = road.highway ? 7 : 6;
      let canBuild = !tile.road && tile.elevation <= maxBuildElev;
      let needsBridge =
        tile.isWater &&
        road.canBridge &&
        canBridgeTo(nx, ny, road.x, road.y, road.highway ? 30 : 12);

      if (canBuild && (!tile.isWater || needsBridge)) {
        addRoad(nx, ny, road.type, needsBridge);
        road.x = nx;
        road.y = ny;
        road.energy -= needsBridge ? 0.5 : 1;

        if (random() < 0.05 && !terrain[nx][ny].isArtificial) {
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
  terrainColorsDirty = true;
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

function createBuilding(bx, by, type, city, distToCenter, opts) {
  let isMonolith = !!(opts && opts.isMonolith);
  if (isMonolith) type = "COMMERCIAL";
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
  // Cap the generation contribution so towers stop creeping ever taller over
  // long runs (generation increments forever).
  let genBonus = min(generation - 1, 6) * 0.05;
  let heightMult = 0.45 + centerBonus + genBonus;

  if (isOnIsland) heightMult += 0.15;
  if (city.zoneType === "COMMERCIAL") heightMult += 0.1;

  let targetHeight;
  if (isMonolith) {
    targetHeight = floor(random(MAX_BUILDING_HEIGHT + 6, MAX_MONOLITH_HEIGHT));
    config = Object.assign({}, config, { buildSpeed: 0.06 });
  } else {
    targetHeight = floor(
      random(config.minHeight, config.maxHeight * heightMult),
    );
    targetHeight = constrain(
      targetHeight,
      config.minHeight,
      min(config.maxHeight + min(generation, 8), MAX_BUILDING_HEIGHT),
    );
  }

  let layerVariations = [];
  let commercialStyle =
    type === "COMMERCIAL" ? random(COMMERCIAL_STYLES) : null;
  if (isMonolith) commercialStyle = random(["tapered", "setback_deco", "crystal"]);
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
    decayAge: isMonolith ? 1e9 : config.decayAge + random(-250, 250),
    maxAge: isMonolith ? 1e9 : config.maxAge + random(-250, 250),
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
    isMonolith: isMonolith,

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

  // Monolith landmark: once a downtown passes a population milestone it earns a
  // single supertall tower. We look across ALL eligible cities (not just the
  // least-populated spawn pick) and, when one qualifies, target it directly so
  // the landmark reliably appears. Still capped overall and one per city.
  let makeMonolith = false;
  if (monolithCount < MAX_MONOLITHS) {
    // Prefer a downtown/midtown; fall back to the most-populous mainland city so
    // a landmark reliably appears even if zone roles landed awkwardly.
    let monoCity = null;
    let fallback = null;
    for (let c of availableCities) {
      if (c.hasMonolith || c.isIsland || c.population < 4) continue;
      if (c.zoneType === "COMMERCIAL" || c.zoneType === "MIXED") {
        if (!monoCity || c.population > monoCity.population) monoCity = c;
      }
      if (!fallback || c.population > fallback.population) fallback = c;
    }
    let chosen =
      monoCity || (fallback && fallback.population >= 8 ? fallback : null);
    if (chosen) {
      // Only commit if that city actually has a free plot, so the opportunity
      // isn't wasted on a saturated core.
      let hasPlot = buildingCandidates.some(
        (cc) =>
          cc.nearestCity === chosen && !terrain[cc.x * 2][cc.y * 2].occupied,
      );
      if (hasPlot) {
        city = chosen;
        makeMonolith = true;
      }
    }
  }

  let zoneWeights = ZONE_TYPES[city.zoneType].buildingWeights;
  let type = makeMonolith ? "COMMERCIAL" : weightedRandomType(zoneWeights);

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

  let building = createBuilding(spot.x, spot.y, type, city, spot.distToCenter, {
    isMonolith: makeMonolith,
  });
  if (makeMonolith) {
    monolithCount++;
    city.hasMonolith = true;
  }

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
          if (b.isMonolith) {
            if (b.city) b.city.hasMonolith = false;
            monolithCount = max(0, monolithCount - 1);
          }
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

// ============ ADAPTIVE QUALITY ============

function applyQuality(lvl) {
  quality.level = lvl;
  quality.nightlife = lvl >= 1;
  quality.clouds = lvl >= 2;
  quality.aurora = lvl >= 2;
  quality.birds = lvl >= 2;
  quality.weatherFog = lvl >= 2;
  quality.boats = lvl >= 2;
  quality.water = lvl >= 2;
  quality.reflections = lvl >= 3;
  quality.weatherRain = lvl >= 3;
  quality.fireworks = lvl >= 3;
}

function updateQuality() {
  if (qualityCooldown > 0) {
    qualityCooldown--;
    return;
  }
  if (fps < FPS_FLOOR - 3 && quality.level > 0) {
    applyQuality(quality.level - 1);
    qualityCooldown = 45;
  } else if (fps > FPS_FLOOR + 18 && quality.level < 3) {
    applyQuality(quality.level + 1);
    qualityCooldown = 60;
  }
}

// ============ EFFECTS: SETUP + HELPERS ============

function initEffects() {
  initClouds();
  cars = [];
  birds = [];
  boats = [];
  fireworks = [];
  raindrops = [];
  initLighthouses();
  weatherState = "clear";
  weatherTimer = random(300, 600);
  weatherIntensity = 0;
  eventState = "none";
  eventTimer = random(400, 800);

  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      let t = terrain[x][y];
      t.coastalWater = false;
      if (t.isWater && t.onRock) {
        if (
          (x > 0 && !terrain[x - 1][y].isWater) ||
          (x < TERRAIN_SIZE - 1 && !terrain[x + 1][y].isWater) ||
          (y > 0 && !terrain[x][y - 1].isWater) ||
          (y < TERRAIN_SIZE - 1 && !terrain[x][y + 1].isWater)
        ) {
          t.coastalWater = true;
        }
      }
    }
  }
}

function roadNeighbors(x, y) {
  let out = [];
  if (x > 0 && terrain[x - 1][y].road) out.push({ x: x - 1, y: y });
  if (x < TERRAIN_SIZE - 1 && terrain[x + 1][y].road) out.push({ x: x + 1, y: y });
  if (y > 0 && terrain[x][y - 1].road) out.push({ x: x, y: y - 1 });
  if (y < TERRAIN_SIZE - 1 && terrain[x][y + 1].road) out.push({ x: x, y: y + 1 });
  return out;
}

function randomWaterTileOnRock() {
  for (let i = 0; i < 20; i++) {
    let x = floor(random(TERRAIN_SIZE));
    let y = floor(random(TERRAIN_SIZE));
    if (terrain[x][y].isWater && terrain[x][y].onRock) return { x: x, y: y };
  }
  return null;
}

function festColor() {
  const cols = [
    [255, 80, 80],
    [255, 200, 90],
    [120, 255, 120],
    [120, 200, 255],
    [220, 120, 255],
    [255, 255, 255],
  ];
  let c = cols[floor(random(cols.length))];
  return { r: c[0], g: c[1], b: c[2] };
}

// ============ EFFECTS: SKY (sun/moon, aurora) ============

function drawSkyBody() {
  let isSun = time >= 0.18 && time <= 0.82;
  let p;
  if (isSun) {
    p = (time - 0.18) / 0.64;
  } else {
    let nt = time < 0.18 ? time + (1 - 0.82) : time - 0.82;
    p = nt / 0.36;
  }
  let bx = lerp(width * 0.1, width * 0.9, p);
  let by = height * 0.44 - sin(p * PI) * height * 0.32;
  sunMoon.x = bx;
  sunMoon.y = by;
  sunMoon.isSun = isSun;

  noStroke();
  if (isSun) {
    for (let r = 30; r > 0; r -= 7) {
      fill(255, 220, 150, map(r, 0, 30, 70, 0));
      ellipse(bx, by, r * 2.4, r * 2.4);
    }
    fill(255, 240, 200);
    ellipse(bx, by, 16, 16);
  } else {
    for (let r = 22; r > 0; r -= 6) {
      fill(200, 210, 235, map(r, 0, 22, 45, 0));
      ellipse(bx, by, r * 2.4, r * 2.4);
    }
    fill(228, 232, 246);
    ellipse(bx, by, 12, 12);
    fill(205, 210, 228);
    ellipse(bx + 3, by - 2, 4, 4);
    ellipse(bx - 2, by + 2, 2.5, 2.5);
  }
}

function drawAurora() {
  if (!quality.aurora || cachedDaylight > 0.35) return;
  let a = (0.35 - cachedDaylight) / 0.35;
  noStroke();
  for (let i = 0; i < 3; i++) {
    let yy = height * 0.1 + i * 13;
    for (let x = 0; x <= width; x += 30) {
      let h = sin(x * 0.01 + frameCount * 0.01 + i) * 10;
      fill(60 + i * 30, 180 - i * 30, 150, 11 * a);
      ellipse(x, yy + h, 30, 42);
    }
  }
}

// ============ EFFECTS: CLOUDS ============

function initClouds() {
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(height * 0.35, height * 0.78),
      w: random(60, 140),
      h: random(28, 56),
      spd: random(0.1, 0.35),
      op: random(8, 20),
    });
  }
}

function updateClouds() {
  for (let c of clouds) {
    c.x += c.spd * simulationSpeed * 0.4;
    if (c.x - c.w > width) c.x = -c.w;
  }
}

function drawCloudShadows() {
  noStroke();
  let a = cachedDaylight;
  if (a < 0.05) return;
  for (let c of clouds) {
    fill(18, 22, 38, c.op * a);
    ellipse(c.x, c.y, c.w, c.h);
    ellipse(c.x + c.w * 0.3, c.y + 5, c.w * 0.6, c.h * 0.7);
  }
}

// ============ EFFECTS: WEATHER ============

function updateWeather() {
  weatherTimer -= simulationSpeed;
  if (weatherTimer <= 0) {
    if (weatherState === "clear") {
      let r = random();
      weatherState = r < 0.18 ? "fog" : r < 0.32 ? "rain" : "clear";
      weatherTimer = random(300, 600);
    } else {
      weatherState = "clear";
      weatherTimer = random(1400, 2600);
    }
  }
  let target = weatherState === "clear" ? 0 : 1;
  weatherIntensity = lerp(weatherIntensity, target, 0.02);

  if (weatherState === "rain" && quality.weatherRain && raindrops.length < 120) {
    for (let i = 0; i < 6; i++) {
      raindrops.push({
        x: random(width),
        y: random(-20, 0),
        len: random(6, 12),
        spd: random(8, 14),
      });
    }
  }
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let d = raindrops[i];
    d.y += d.spd;
    d.x += 2;
    if (d.y > height) raindrops.splice(i, 1);
  }
}

function drawWeather() {
  if (weatherIntensity > 0.01) {
    noStroke();
    fill(150, 160, 175, weatherIntensity * 22 * max(cachedDaylight, 0.3));
    rect(0, 0, width, height);
  }
  if (quality.weatherRain && raindrops.length > 0) {
    stroke(170, 190, 210, weatherIntensity * 120);
    strokeWeight(1);
    for (let d of raindrops) line(d.x, d.y, d.x - 2, d.y + d.len);
    noStroke();
  }
}

// ============ EFFECTS: NIGHT TRAFFIC ============

function updateCars() {
  if (!cachedIsNight) {
    if (cars.length) cars.length = 0;
    return;
  }
  let target = min(14, floor(roads.length / 8));
  while (cars.length < target && roads.length > 2) {
    let r = random(roads);
    cars.push({
      px: r.x,
      py: r.y,
      tx: r.x,
      ty: r.y,
      t: 1,
      warm: random() < 0.55,
    });
  }
  for (let c of cars) {
    c.t += 0.05 * simulationSpeed;
    if (c.t >= 1) {
      c.px = c.tx;
      c.py = c.ty;
      let nbrs = roadNeighbors(c.tx, c.ty);
      if (nbrs.length) {
        let nn = random(nbrs);
        c.tx = nn.x;
        c.ty = nn.y;
        c.t = 0;
      } else {
        c.t = 1;
      }
    }
  }
}

function drawCars() {
  noStroke();
  for (let c of cars) {
    let gx = lerp(c.px, c.tx, c.t);
    let gy = lerp(c.py, c.ty, c.t);
    let rx = round(gx);
    let ry = round(gy);
    if (rx < 0 || ry < 0 || rx >= TERRAIN_SIZE || ry >= TERRAIN_SIZE) continue;
    let p = toIso(gx, gy, terrain[rx][ry].elevation);
    if (c.warm) fill(255, 240, 180, 230);
    else fill(255, 95, 75, 230);
    ellipse(p.x, p.y + TILE_HEIGHT / 2, 1.7, 1.7);
  }
}

// ============ EFFECTS: LIGHTHOUSES ============

function initLighthouses() {
  lighthouses = [];
  let cand = [];
  for (let x = 2; x < TERRAIN_SIZE - 2; x += 3) {
    for (let y = 2; y < TERRAIN_SIZE - 2; y += 3) {
      let t = terrain[x][y];
      if (
        !t.isWater &&
        t.onRock &&
        t.distanceToWater < 2.5 &&
        t.elevation >= 2 &&
        t.elevation <= 7
      ) {
        cand.push({ x: x, y: y });
      }
    }
  }
  for (let i = 0; i < 2 && cand.length > 0; i++) {
    let c = cand.splice(floor(random(cand.length)), 1)[0];
    lighthouses.push({ x: c.x, y: c.y, angle: random(TWO_PI) });
  }
}

function drawLighthouses() {
  for (let lh of lighthouses) {
    lh.angle += 0.03 * simulationSpeed;
    let base = toIso(lh.x, lh.y, terrain[lh.x][lh.y].elevation);
    let topY = base.y - TILE_HEIGHT * 3;

    noStroke();
    fill(200, 200, 210, 210);
    rect(base.x - 1.5, topY, 3, TILE_HEIGHT * 3);

    let beamLen = 64;
    let bx = cos(lh.angle);
    let by = sin(lh.angle) * 0.5;
    fill(255, 245, 200, 24);
    triangle(
      base.x,
      topY,
      base.x + bx * beamLen - by * 9,
      topY + by * beamLen + bx * 9,
      base.x + bx * beamLen + by * 9,
      topY + by * beamLen - bx * 9,
    );
    fill(255, 250, 210, 230);
    ellipse(base.x, topY, 3, 3);
  }
}

// ============ EFFECTS: BIRDS ============

function spawnFlock() {
  let dir = random() < 0.5 ? 1 : -1;
  return {
    x: dir > 0 ? -40 : width + 40,
    y: random(height * 0.14, height * 0.45),
    vx: dir * random(0.6, 1.2),
    vy: random(-0.1, 0.1),
    n: floor(random(4, 8)),
    ph: random(10),
  };
}

function updateBirds() {
  if (random() < 0.006 && birds.length < 3) birds.push(spawnFlock());
  for (let i = birds.length - 1; i >= 0; i--) {
    let f = birds[i];
    f.x += f.vx * simulationSpeed;
    f.y += f.vy * simulationSpeed + sin(frameCount * 0.05 + f.ph) * 0.1;
    if (f.x < -60 || f.x > width + 60) birds.splice(i, 1);
  }
}

function drawBirds() {
  stroke(20, 20, 30, 160 * cachedDaylight + 40);
  strokeWeight(0.8);
  noFill();
  for (let f of birds) {
    for (let i = 0; i < f.n; i++) {
      let ox = (i - f.n / 2) * 5;
      let oy = (i % 2) * 3 + sin(frameCount * 0.2 + i) * 0.6;
      let bx = f.x + ox;
      let by = f.y + oy;
      let sz = 1.7;
      line(bx - sz, by, bx, by - sz * 0.6);
      line(bx, by - sz * 0.6, bx + sz, by);
    }
  }
  noStroke();
}

// ============ EFFECTS: BOATS ============

function updateBoats() {
  if (boats.length < 3 && random() < 0.012) {
    let wt = randomWaterTileOnRock();
    if (wt) {
      boats.push({
        x: wt.x,
        y: wt.y,
        ang: random(TWO_PI),
        turn: random(-0.02, 0.02),
        life: random(400, 800),
      });
    }
  }
  for (let i = boats.length - 1; i >= 0; i--) {
    let b = boats[i];
    b.ang += b.turn;
    let nx = b.x + cos(b.ang) * 0.3 * simulationSpeed;
    let ny = b.y + sin(b.ang) * 0.3 * simulationSpeed;
    let cx = round(nx);
    let cy = round(ny);
    if (
      cx < 0 ||
      cy < 0 ||
      cx >= TERRAIN_SIZE ||
      cy >= TERRAIN_SIZE ||
      !terrain[cx][cy].isWater ||
      !terrain[cx][cy].onRock
    ) {
      b.ang += PI * 0.5 + random(-0.3, 0.3);
      b.life -= 20;
    } else {
      b.x = nx;
      b.y = ny;
    }
    b.life -= simulationSpeed;
    if (b.life <= 0) boats.splice(i, 1);
  }
}

function drawBoats() {
  noStroke();
  for (let b of boats) {
    let p = toIso(b.x, b.y, -0.1);
    fill(255, 255, 255, 35);
    ellipse(p.x, p.y + TILE_HEIGHT + 1, 5, 2.2);
    fill(45, 45, 55, 230);
    ellipse(p.x, p.y + TILE_HEIGHT, 3.2, 1.7);
    fill(225, 225, 215, 230);
    rect(p.x - 0.5, p.y + TILE_HEIGHT - 2.4, 1, 2.4);
  }
}

// ============ EFFECTS: EVENTS (festival / blackout / fireworks) ============

function updateEvents() {
  eventTimer -= simulationSpeed;
  if (eventTimer <= 0) {
    if (eventState === "none") {
      let r = random();
      if (cachedIsNight && r < 0.5) {
        eventState = "festival";
        eventTimer = random(300, 600);
      } else if (r < 0.65) {
        eventState = "blackout";
        eventTimer = random(150, 300);
      } else {
        eventTimer = random(500, 1000);
      }
    } else {
      eventState = "none";
      eventTimer = random(800, 1600);
    }
  }

  if (
    eventState === "festival" &&
    quality.fireworks &&
    cachedIsNight &&
    frameCount % 12 === 0
  ) {
    spawnFirework();
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    updateFirework(fireworks[i]);
    if (fireworks[i].dead) fireworks.splice(i, 1);
  }
}

function spawnFirework() {
  fireworks.push({
    stage: 0,
    x: random(width * 0.2, width * 0.8),
    y: height * 0.75,
    vy: -random(4, 6),
    ty: random(height * 0.12, height * 0.4),
    parts: [],
    color: festColor(),
    dead: false,
  });
}

function updateFirework(f) {
  if (f.stage === 0) {
    f.y += f.vy;
    if (f.y <= f.ty) {
      f.stage = 1;
      for (let i = 0; i < 26; i++) {
        let a = random(TWO_PI);
        let sp = random(1, 3.2);
        f.parts.push({
          x: f.x,
          y: f.y,
          vx: cos(a) * sp,
          vy: sin(a) * sp,
          life: 1,
        });
      }
    }
  } else {
    let alive = false;
    for (let p of f.parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.vx *= 0.98;
      p.life -= 0.02;
      if (p.life > 0) alive = true;
    }
    if (!alive) f.dead = true;
  }
}

function drawFireworks() {
  noStroke();
  for (let f of fireworks) {
    if (f.stage === 0) {
      fill(255, 230, 180, 220);
      ellipse(f.x, f.y, 2, 2);
    } else {
      for (let p of f.parts) {
        if (p.life > 0) {
          fill(f.color.r, f.color.g, f.color.b, p.life * 255);
          ellipse(p.x, p.y, 2, 2);
        }
      }
    }
  }
}

// ============ EFFECTS: COLOR GRADING (golden hour + era) ============

const ERA_TINTS = [
  { r: 0, g: 0, b: 0, a: 0 },
  { r: 120, g: 90, b: 40, a: 9 },
  { r: 60, g: 80, b: 120, a: 9 },
  { r: 120, g: 60, b: 120, a: 11 },
  { r: 40, g: 120, b: 120, a: 9 },
  { r: 140, g: 120, b: 60, a: 9 },
];

function drawGrading() {
  noStroke();
  let warm = 0;
  if (time > 0.08 && time < 0.28) warm = sin(((time - 0.08) / 0.2) * PI);
  else if (time > 0.78 && time < 0.92) warm = sin(((time - 0.78) / 0.14) * PI);
  if (warm > 0.01) {
    fill(255, 150, 60, warm * 32);
    rect(0, 0, width, height);
  }
  let er = ERA_TINTS[generation % ERA_TINTS.length];
  if (er && er.a > 0) {
    fill(er.r, er.g, er.b, er.a);
    rect(0, 0, width, height);
  }
}

// ============ EFFECTS: WATER SHIMMER + REFLECTIONS ============

function drawWaterShimmer(x, y, pos) {
  let lum = sunMoon.isSun ? cachedDaylight : 0.55;
  let ph = sin(frameCount * 0.05 + (x + y) * 0.7) * 0.5 + 0.5;
  let glint =
    max(0, 1 - abs(pos.x - sunMoon.x) / 45) *
    max(0, 1 - abs(pos.y - sunMoon.y) / 220);
  let a = (ph * 0.1 + glint * 0.7) * lum;
  if (quality.reflections && terrain[x][y].coastalWater) a += 0.05 * lum;
  if (a <= 0.02) return;

  noStroke();
  if (sunMoon.isSun) fill(255, 245, 210, a * 255);
  else fill(205, 215, 245, a * 255);
  beginShape();
  vertex(pos.x, pos.y + TILE_HEIGHT * 0.18);
  vertex(pos.x + TILE_WIDTH * 0.32, pos.y + TILE_HEIGHT * 0.5);
  vertex(pos.x, pos.y + TILE_HEIGHT * 0.82);
  vertex(pos.x - TILE_WIDTH * 0.32, pos.y + TILE_HEIGHT * 0.5);
  endShape(CLOSE);
}

// ============ MAIN LOOP ============

function draw() {
  let currentTime = millis();
  fps = lerp(fps, 1000 / (currentTime - lastFrameTime), 0.1);
  lastFrameTime = currentTime;

  updateQuality();

  time += timeSpeed * simulationSpeed;
  if (time > 1) {
    time -= 1;
    cropStage = (cropStage + 1) % 4; // farms grow & get harvested over days
    terrainColorsDirty = true;
  }

  cachedDaylight = getDaylightFactor();
  cachedIsNight = time < 0.16 || time > 0.78;

  // ---- simulation ----
  if (frameCount % 2 === 0) growRoads();
  if (frameCount % 6 === 0) updateShadows();
  if (frameCount % 10 === 0) {
    updateIslandProjects();
    tryStartIslandProject();
  }
  if (frameCount % 8 === 0) {
    updateTerraformProjects();
  }

  updateBuildings();
  updateSmoke();

  if (frameCount % 4 === 0) {
    let activeBuildings = 0;
    for (let i = 0; i < buildings.length; i++) {
      if (!buildings[i].collapsing) activeBuildings++;
    }
    if (activeBuildings < MAX_BUILDINGS) trySpawnBuilding();
  }

  // ---- ambient effect state (cheap; quality-gated) ----
  if (quality.clouds) updateClouds();
  if (quality.weatherFog || quality.weatherRain) updateWeather();
  if (quality.nightlife) updateCars();
  if (quality.birds) updateBirds();
  if (quality.boats) updateBoats();
  updateEvents();
  updateHamlets();
  if (frameCount % 20 === 0 && hamlets.length < 70) trySpawnHamlet();

  // ---- render ----
  drawSpace();
  // Quantize daylight so the static terrain buffer rebuilds only a handful of
  // times across a sunrise/sunset sweep instead of every frame. The per-step
  // color delta is imperceptible (and the grading overlay sits on top anyway).
  let tq = round(cachedDaylight * 8) / 8;
  if (terrainColorsDirty || tq !== lastTerrainDaylight) {
    terrainDaylight = tq;
    renderTerrainLayer();
    lastTerrainDaylight = tq;
    terrainColorsDirty = false;
  }
  image(terrainLayer, 0, 0);
  drawWaterShimmerPass();
  drawScene();
  drawSmoke();

  if (quality.boats) drawBoats();
  if (cachedIsNight && quality.nightlife) {
    drawCars();
    drawLighthouses();
  }
  if (quality.clouds) drawCloudShadows();
  if (quality.weatherFog || quality.weatherRain) drawWeather();
  if (quality.birds) drawBirds();
  if (quality.fireworks) drawFireworks();
  drawGrading();
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

  drawAurora();

  fill(60, 55, 70, 40);
  ellipse(width * 0.85, height * 0.15, 80, 80);
  fill(80, 75, 90, 30);
  ellipse(width * 0.12, height * 0.25, 40, 40);

  drawSkyBody();
}

function drawFloatingRock_unused() {
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
  if (buildingsDirty || hamletsDirty) {
    sortedActors = buildings.concat(hamlets).sort((a, b) => a.depth - b.depth);
    buildingsDirty = false;
    hamletsDirty = false;
  }

  // Terrain + floating rock are pre-rendered to an off-screen buffer
  // (renderTerrainLayer) and blitted once per frame in draw(). Here we draw the
  // dynamic actors layered on top — buildings and roadside hamlet houses sorted
  // back-to-front together — then in-progress project markers.
  for (let i = 0; i < sortedActors.length; i++) {
    let a = sortedActors[i];
    if (a.isHamlet) drawHamletHouse(a);
    else drawBuilding(a);
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

function computeTerrainColors(tile) {
  let elev = tile.elevation;
  let daylight = terrainDaylight;
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

  tile.cachedTop = topColor;
  tile.cachedSide = sideColor;
  tile.cachedSideDark = lerpColor(sideColor, color(0), 0.12);
}

function drawTerrainTile_unused(x, y, tile, pos, recolor) {
  let elev = tile.elevation;
  if (recolor || tile.cachedTop === undefined) computeTerrainColors(tile);

  fill(tile.cachedTop);
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

    fill(tile.cachedSide);
    beginShape();
    vertex(pos.x, pos.y + TILE_HEIGHT);
    vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    endShape(CLOSE);

    fill(tile.cachedSideDark);
    beginShape();
    vertex(pos.x, pos.y + TILE_HEIGHT);
    vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    endShape(CLOSE);
  }

  if (tile.isWater && quality.water) drawWaterShimmer(x, y, pos);
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
  if (b.isMonolith) {
    bw *= 1.4;
    bh *= 1.4;
  }

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
      // Windows light up gradually as it gets darker, with occasional flicker.
      let base = noise(b.gridX * 0.15 + layer * 0.3);
      let depth = 1 - cachedDaylight;
      let lit = base > 0.62 - depth * 0.42;
      if (eventState === "blackout") {
        lit = lit && noise(b.gridX + layer + frameCount * 0.01) > 0.8;
      }
      if (lit) {
        let warmth = noise(b.gridX + layer) * 50;
        let flick =
          noise(b.gridX * 2 + layer + frameCount * 0.02) > 0.95 ? 0.35 : 1;
        let festBoost = eventState === "festival" ? 1.15 : 1;
        windowCol = color(
          255,
          235 - warmth,
          170 - warmth,
          min(220, 170 * flick * festBoost),
        );
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
      let blink = 90 + (sin(frameCount * 0.12 + b.gridX) * 0.5 + 0.5) * 150;
      fill(255, 70, 70, blink);
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
      if (cachedIsNight) {
        let blink = 80 + (sin(frameCount * 0.1 + b.gridX * 2) * 0.5 + 0.5) * 160;
        fill(255, 80, 80, blink);
        circle(pos.x, topY - TILE_HEIGHT * 0.55, 1.4);
      }
    }

    if (b.hasHelipad) {
      fill(lerpColor(color(55, 55, 60), color(26, 26, 30), 1 - daylight));
      ellipse(pos.x, topY + h / 2, w * 0.38, h * 0.26);
    }
  }
}

function getDaylightFactor() {
  // Night is intentionally long: full daylight occupies only ~0.30-0.62 of the
  // cycle, with extended dark on either side.
  if (time < 0.12) return 0.1;
  if (time < 0.22) return map(time, 0.12, 0.22, 0.1, 0.52);
  if (time < 0.3) return map(time, 0.22, 0.3, 0.52, 1);
  if (time < 0.62) return 1;
  if (time < 0.7) return map(time, 0.62, 0.7, 1, 0.52);
  if (time < 0.8) return map(time, 0.7, 0.8, 0.52, 0.1);
  return 0.1;
}

function drawUI() {
  // Only the FPS readout is rendered; the per-type building tallies that used
  // to be computed here every frame were never drawn, so they were removed.
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);

  fill(
    fps > 18
      ? color(100, 255, 100)
      : fps > 8
        ? color(255, 180, 80)
        : color(255, 80, 80),
  );
  text(`FPS: ${floor(fps)}`, 12, 11);
}

function getTimeString() {
  let hours = floor(time * 24);
  let minutes = floor((time * 24 - hours) * 60);
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}


// ============ OFF-SCREEN TERRAIN BUFFER ============
// The terrain grid (up to ~25k tiles) and the floating rock are static between
// terrain edits and daylight changes. Rendering them to a cached graphics layer
// and blitting once per frame replaces tens of thousands of canvas draw calls
// with a single image() call. Rebuild happens only when terrainColorsDirty is
// set (roads/shadows/terraforming/islands) or the daylight value moves.

function drawRockInto(g) {
  let rockDark = lerpColor(
    color(25, 22, 30),
    color(50, 45, 55),
    terrainDaylight * 0.5,
  );
  let rockMid = lerpColor(
    color(35, 32, 40),
    color(70, 65, 75),
    terrainDaylight * 0.5,
  );

  g.noStroke();
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
      g.fill(rockMid);
    } else {
      g.fill(rockDark);
    }

    g.beginShape();
    g.vertex(pos1.x, pos1.y + TILE_HEIGHT);
    g.vertex(pos2.x, pos2.y + TILE_HEIGHT);
    g.vertex(pos2Bottom.x, pos2Bottom.y + TILE_HEIGHT);
    g.vertex(pos1Bottom.x, pos1Bottom.y + TILE_HEIGHT);
    g.endShape(CLOSE);
  }

  g.fill(rockDark);
  g.beginShape();
  for (let i = 0; i < rockShape.length; i++) {
    let r = rockShape[i];
    let x = islandCenterX + cos(r.angle) * r.radiusX * 0.7;
    let y = islandCenterY + sin(r.angle) * r.radiusY * 0.7;
    let pos = toIso(x, y, -r.depth - 5);
    g.vertex(pos.x, pos.y + TILE_HEIGHT);
  }
  g.endShape(CLOSE);
}

function drawTerrainTileInto(g, tile, pos) {
  let elev = tile.elevation;
  computeTerrainColors(tile);

  g.fill(tile.cachedTop);
  g.noStroke();
  g.beginShape();
  g.vertex(pos.x, pos.y);
  g.vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
  g.vertex(pos.x, pos.y + TILE_HEIGHT);
  g.vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
  g.endShape(CLOSE);

  let drawHeight = tile.isWater ? 0.15 : elev;
  if (drawHeight > 0) {
    let sideH = drawHeight * TILE_HEIGHT;

    g.fill(tile.cachedSide);
    g.beginShape();
    g.vertex(pos.x, pos.y + TILE_HEIGHT);
    g.vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    g.vertex(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    g.vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    g.endShape(CLOSE);

    g.fill(tile.cachedSideDark);
    g.beginShape();
    g.vertex(pos.x, pos.y + TILE_HEIGHT);
    g.vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
    g.vertex(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 + sideH);
    g.vertex(pos.x, pos.y + TILE_HEIGHT + sideH);
    g.endShape(CLOSE);
  }
}

// Group contiguous bridge tiles into spans; long spans become "mega" bridges
// with raised decks and suspension pylons. Cheap: bridgeSegments is small and
// this only runs on terrain-buffer rebuilds.
function computeBridgeSpans() {
  for (let b of bridgeSegments) {
    b.mega = false;
    b.pylon = false;
    b.pier = false;
    b.deckH = b.height;
  }
  let map = {};
  const key = (x, y) => x + "," + y;
  for (let b of bridgeSegments) map[key(b.x, b.y)] = b;
  let visited = new Set();
  for (let b of bridgeSegments) {
    let k0 = key(b.x, b.y);
    if (visited.has(k0)) continue;
    let comp = [];
    let stack = [b];
    visited.add(k0);
    while (stack.length) {
      let cur = stack.pop();
      comp.push(cur);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (!dx && !dy) continue;
          let nb = map[key(cur.x + dx, cur.y + dy)];
          if (nb) {
            let nk = key(nb.x, nb.y);
            if (!visited.has(nk)) {
              visited.add(nk);
              stack.push(nb);
            }
          }
        }
      }
    }
    comp.sort((p, q) => p.x + p.y - (q.x + q.y));
    // Piers (full-height supports) only at the ends and every 3rd tile, so the
    // deck spans open water/land between them instead of forming a continuous
    // grey wall under straight (axis-aligned) bridges.
    for (let i = 0; i < comp.length; i++) {
      if (i === 0 || i === comp.length - 1 || i % 3 === 1) comp[i].pier = true;
    }
    if (comp.length >= 5) {
      let deckH = min(5, 2 + floor(comp.length / 4));
      for (let i = 0; i < comp.length; i++) {
        comp[i].mega = true;
        comp[i].deckH = deckH;
        if (i === 0 || i === comp.length - 1 || i % 4 === 2) comp[i].pylon = true;
      }
    }
  }
}

function drawBridgeInto(g, bridge, pos, daylight) {
  // The deck always sits at the normal bridge height so the roadway rests just
  // over the water (no tall grey support box). "Mega" character comes purely
  // from suspension PYLONS that rise ABOVE the deck plus cable stays + a steel
  // tint — nothing is drawn in the transparent gap beneath the deck.
  let h = bridge.height;
  let steel = bridge.mega ? 0.4 : 0;
  let deckColor = lerpColor(
    lerpColor(color(50, 50, 55), color(110, 105, 100), daylight),
    lerpColor(color(70, 72, 80), color(150, 152, 165), daylight),
    steel,
  );
  let pillarColor = lerpColor(color(40, 40, 45), color(80, 80, 85), daylight);

  let deckY = pos.y - h * TILE_HEIGHT;

  // Support pier down to the waterline — drawn only on designated pier tiles so
  // the deck reads as a span floating over open water between supports rather
  // than a solid grey wall. Two iso faces keep it correct in both orientations.
  if (bridge.pier) {
    let baseY = pos.y + TILE_HEIGHT;
    let pierW = TILE_WIDTH * 0.16;
    g.noStroke();
    g.fill(pillarColor);
    g.beginShape();
    g.vertex(pos.x, deckY + TILE_HEIGHT);
    g.vertex(pos.x + pierW, deckY + TILE_HEIGHT + TILE_HEIGHT * 0.2);
    g.vertex(pos.x + pierW, baseY);
    g.vertex(pos.x, baseY + TILE_HEIGHT * 0.2);
    g.endShape(CLOSE);
    g.fill(lerpColor(pillarColor, color(0), 0.22));
    g.beginShape();
    g.vertex(pos.x, deckY + TILE_HEIGHT);
    g.vertex(pos.x - pierW, deckY + TILE_HEIGHT + TILE_HEIGHT * 0.2);
    g.vertex(pos.x - pierW, baseY);
    g.vertex(pos.x, baseY + TILE_HEIGHT * 0.2);
    g.endShape(CLOSE);
  }

  // deck top
  g.fill(deckColor);
  g.beginShape();
  g.vertex(pos.x, deckY);
  g.vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  g.vertex(pos.x, deckY + TILE_HEIGHT);
  g.vertex(pos.x - TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  g.endShape(CLOSE);

  // deck side shading
  g.fill(lerpColor(deckColor, color(0), 0.18));
  g.beginShape();
  g.vertex(pos.x, deckY + TILE_HEIGHT);
  g.vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT / 2);
  g.vertex(pos.x + TILE_WIDTH / 2, deckY + TILE_HEIGHT);
  g.vertex(pos.x, deckY + TILE_HEIGHT * 1.3);
  g.endShape(CLOSE);

  // tall suspension pylon + fanned cable stays rising above the deck
  if (bridge.mega && bridge.pylon) {
    let deckMid = deckY + TILE_HEIGHT * 0.5;
    let towerTop = deckMid - TILE_HEIGHT * (3 + bridge.deckH);
    let cableCol = lerpColor(color(55, 58, 66), color(170, 173, 185), daylight);
    // cable stays first (behind tower)
    g.stroke(cableCol);
    g.strokeWeight(0.5);
    for (let s2 = 1; s2 <= 3; s2++) {
      let off = (TILE_WIDTH * 0.55) * s2 * 0.55;
      g.line(pos.x, towerTop, pos.x + off, deckMid);
      g.line(pos.x, towerTop, pos.x - off, deckMid);
    }
    // tower
    g.stroke(cableCol);
    g.strokeWeight(1.6);
    g.line(pos.x, deckMid, pos.x, towerTop);
    g.noStroke();
    // beacon at night
    if (daylight < 0.4) {
      g.fill(255, 90, 80, 230);
      g.ellipse(pos.x, towerTop, 2, 2);
    }
  }
}

function renderTerrainLayer() {
  const g = terrainLayer;
  if (!g) return;
  g.clear();
  computeBridgeSpans();
  drawRockInto(g);

  waterDrawList = [];
  for (let i = 0; i < sortedTerrainOrder.length; i++) {
    let t = sortedTerrainOrder[i];
    let tile = terrain[t.x][t.y];
    if (!tile.onRock && tile.isWater) continue;

    let pos = toIso(t.x, t.y, tile.isWater ? -0.15 : tile.elevation);
    if (!isVisible(pos.x, pos.y, 25)) continue;

    drawTerrainTileInto(g, tile, pos);
    if (tile.bridge) drawBridgeInto(g, tile.bridge, pos, terrainDaylight);
    if (tile.isWater) waterDrawList.push({ x: t.x, y: t.y, sx: pos.x, sy: pos.y });
    else if (
      tile.decor &&
      !tile.road &&
      !tile.occupied &&
      !tile.isArtificial &&
      !tile.terraforming
    ) {
      drawDecorInto(g, tile, pos);
    }
  }
}

function drawWaterShimmerPass() {
  if (!quality.water) return;
  for (let i = 0; i < waterDrawList.length; i++) {
    let w = waterDrawList[i];
    drawWaterShimmer(w.x, w.y, { x: w.sx, y: w.sy });
  }
}


// ============ GREENERY (forests, parks, farms — baked into terrain buffer) ============
// Decoration is computed once per tile with a deterministic hash (independent of
// p5's runtime noise seed) so trees never flicker between buffer rebuilds and
// cost nothing per frame. Drawing is gated dynamically: a tile that becomes a
// road or gets a building simply stops drawing its trees.

function hash2(x, y, salt) {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 100000) / 100000;
}

// Biome is decided per coarse BLOCK so farmland forms big square fields and
// forests form coherent stands, instead of a single-tile checkerboard.
const DECOR_BLOCK = 6;

function blockBiome(bx, by) {
  let h = hash2(bx, by, 101);
  if (h < 0.22) return "farm";
  if (h < 0.62) return "forest";
  return "wild"; // sparse scatter — keeps open nature
}

function computeDecorations() {
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let y = 0; y < TERRAIN_SIZE; y++) {
      let tile = terrain[x][y];
      tile.decor = null;
      if (tile.isWater || tile.isArtificial || tile.isCliff) continue;
      let elev = tile.elevation;
      if (elev > 9) continue; // snow caps stay bare

      let bx = floor(x / DECOR_BLOCK);
      let by = floor(y / DECOR_BLOCK);
      let biome = blockBiome(bx, by);
      let local = hash2(x, y, 7);

      // Farmland: only on gentle low ground. Fill the WHOLE block so fields read
      // as solid squares. Furrow direction is per-block for a tidy look.
      if (biome === "farm" && elev <= 3) {
        let dir = hash2(bx, by, 303) < 0.5 ? 0 : 1; // furrow orientation
        let off = floor(hash2(bx, by, 404) * 4); // per-field growth phase offset
        tile.decor = { kind: "farm", dir: dir, off: off };
        continue;
      }

      // Forest / wild scatter. Density varies by elevation; species + look vary
      // per tile for diversity.
      let density;
      if (biome === "forest") density = elev > 6 ? 0.45 : 0.8;
      else density = elev > 6 ? 0.08 : 0.18; // wild
      if (local > density) continue;

      let count = 1 + (hash2(x, y, 5) > 0.55 ? 1 : 0) + (biome === "forest" && hash2(x, y, 9) > 0.75 ? 1 : 0);
      let trees = [];
      for (let i = 0; i < count; i++) {
        // species selection, biased by elevation (more conifers up high)
        let sp = hash2(x, y, 70 + i);
        let species;
        if (elev > 6) species = sp < 0.85 ? "pine" : "snowpine";
        else if (elev > 3) species = sp < 0.55 ? "pine" : sp < 0.85 ? "round" : "poplar";
        else species = sp < 0.45 ? "round" : sp < 0.7 ? "poplar" : sp < 0.9 ? "pine" : "bush";

        // color variety: a few green tones plus occasional autumn / deep pine
        let cv = hash2(x, y, 90 + i);

        trees.push({
          ox: (hash2(x, y, 20 + i) - 0.5) * TILE_WIDTH * 0.55,
          oy: (hash2(x, y, 40 + i) - 0.5) * TILE_HEIGHT * 0.45,
          size: 1.5 + hash2(x, y, 60 + i) * 3.4, // wider height range
          h: 0.8 + hash2(x, y, 80 + i) * 1.0, // trunk/canopy height multiplier
          species: species,
          cv: cv,
        });
      }
      // draw bigger trees last (front) for a touch of depth
      trees.sort((a, b) => a.size - b.size);
      tile.decor = { kind: "tree", trees: trees };
    }
  }
}

// Palette helper: returns a {dark, light} canopy pair given species + variant.
function canopyPalette(species, cv) {
  if (species === "snowpine")
    return { d: color(180, 195, 205), l: color(225, 235, 245) };
  if (species === "pine") {
    if (cv < 0.15) return { d: color(20, 40, 30), l: color(45, 70, 50) }; // deep
    return { d: color(16, 46, 28), l: color(38, 86, 52) };
  }
  // broadleaf: round/poplar/bush
  if (cv < 0.1) return { d: color(70, 50, 18), l: color(160, 110, 40) }; // autumn gold
  if (cv < 0.18) return { d: color(80, 35, 25), l: color(170, 70, 45) }; // autumn red
  if (cv < 0.55) return { d: color(20, 38, 22), l: color(70, 120, 58) }; // green
  if (cv < 0.8) return { d: color(28, 46, 24), l: color(96, 140, 60) }; // light green
  return { d: color(18, 44, 30), l: color(60, 115, 80) }; // blue-green
}

function drawDecorInto(g, tile, pos) {
  let dl = terrainDaylight;
  let cx = pos.x;
  let cy = pos.y + TILE_HEIGHT / 2;

  if (tile.decor.kind === "farm") {
    // Whole tile-top diamond so adjacent farm tiles merge into a square field.
    // Color reflects the current growth stage; a per-field offset means the
    // landscape shows soil/sprout/green/ripe patches simultaneously and they
    // visibly cycle day to day.
    let stage = (cropStage + tile.decor.off) % 4;
    let lo, hi;
    if (stage === 0) { lo = color(46, 34, 24); hi = color(122, 92, 64); }       // tilled soil
    else if (stage === 1) { lo = color(30, 40, 22); hi = color(92, 128, 60); }  // sprouts
    else if (stage === 2) { lo = color(34, 50, 22); hi = color(120, 162, 66); } // green
    else { lo = color(64, 50, 18); hi = color(196, 168, 78); }                  // ripe gold
    let fieldCol = lerpColor(lo, hi, dl);

    g.noStroke();
    g.fill(fieldCol);
    g.beginShape();
    g.vertex(cx, cy - TILE_HEIGHT * 0.5);
    g.vertex(cx + TILE_WIDTH * 0.5, cy);
    g.vertex(cx, cy + TILE_HEIGHT * 0.5);
    g.vertex(cx - TILE_WIDTH * 0.5, cy);
    g.endShape(CLOSE);

    let rowCol;
    if (stage === 0) rowCol = lerpColor(color(30, 22, 16), color(96, 72, 50), dl);
    else if (stage === 3) rowCol = lerpColor(color(70, 56, 20), color(225, 200, 110), dl);
    else rowCol = lerpColor(color(24, 40, 18), color(70, 130, 50), dl);

    g.stroke(rowCol);
    g.strokeWeight(stage === 3 ? 0.55 : 0.4);
    if (tile.decor.dir === 0) {
      for (let k = -2; k <= 2; k++) {
        let fx = k * (TILE_WIDTH * 0.18);
        g.line(cx + fx, cy - TILE_HEIGHT * 0.5 + Math.abs(fx) * (TILE_HEIGHT / TILE_WIDTH),
               cx + fx, cy + TILE_HEIGHT * 0.5 - Math.abs(fx) * (TILE_HEIGHT / TILE_WIDTH));
      }
    } else {
      for (let k = -2; k <= 2; k++) {
        let fy = k * (TILE_HEIGHT * 0.18);
        g.line(cx - TILE_WIDTH * 0.5 + Math.abs(fy) * (TILE_WIDTH / TILE_HEIGHT), cy + fy,
               cx + TILE_WIDTH * 0.5 - Math.abs(fy) * (TILE_WIDTH / TILE_HEIGHT), cy + fy);
      }
    }
    g.noStroke();
    return;
  }

  for (let tr of tile.decor.trees) {
    let tx = cx + tr.ox;
    let ty = cy + tr.oy;
    let sz = tr.size;
    let hh = tr.h;
    let pal = canopyPalette(tr.species, tr.cv);
    let canDark = lerpColor(color(12, 16, 14), pal.d, dl);
    let canLight = lerpColor(color(20, 26, 22), pal.l, dl);
    let trunkCol = lerpColor(color(18, 14, 12), color(74, 52, 34), dl);

    g.noStroke();

    if (tr.species === "pine" || tr.species === "snowpine") {
      // tapered conifer: 2-3 stacked tiers, height-varied
      g.fill(trunkCol);
      g.rect(tx - 0.3, ty - sz * 0.3, 0.6, sz * 0.5);
      let tiers = sz > 3 ? 3 : 2;
      let top = ty - sz * (1.2 + hh * 0.9);
      for (let t = 0; t < tiers; t++) {
        let f = t / tiers;
        let tierY = lerp(top, ty, f);
        let tierW = lerp(sz * 0.35, sz * 0.85, f);
        let tierH = sz * (0.7 + hh * 0.3);
        g.fill(t % 2 === 0 ? canDark : canLight);
        g.triangle(tx, tierY - tierH, tx + tierW, tierY, tx - tierW, tierY);
      }
    } else if (tr.species === "poplar") {
      // tall slim tree
      g.fill(trunkCol);
      g.rect(tx - 0.3, ty - sz * 0.5, 0.6, sz * 0.7);
      g.fill(canDark);
      g.ellipse(tx, ty - sz * (1.0 + hh * 0.5), sz * 0.9, sz * (1.9 + hh));
      g.fill(canLight);
      g.ellipse(tx - sz * 0.12, ty - sz * (1.15 + hh * 0.5), sz * 0.5, sz * (1.2 + hh * 0.6));
    } else if (tr.species === "bush") {
      // low shrub, no trunk
      g.fill(canDark);
      g.ellipse(tx, ty - sz * 0.2, sz * 1.3, sz * 0.9);
      g.fill(canLight);
      g.ellipse(tx + sz * 0.2, ty - sz * 0.35, sz * 0.7, sz * 0.5);
    } else {
      // round broadleaf, height-varied
      g.fill(trunkCol);
      g.rect(tx - 0.35, ty - sz * 0.4, 0.7, sz * 0.6);
      let canopyY = ty - sz * (0.7 + hh * 0.4);
      g.fill(canDark);
      g.ellipse(tx, canopyY, sz * 1.6, sz * (1.4 + hh * 0.4));
      g.fill(canLight);
      g.ellipse(tx + sz * 0.28, canopyY - sz * 0.2, sz * 0.95, sz * 0.9);
    }
  }
  g.noStroke();
}


// ============ ROADSIDE HAMLETS (sparse clusters between cities) ============
// Small houses that settle on free land beside intercity roads (far from any
// city center). They draw merged with the building list by depth, animate in
// with a quick grow, and light their windows at night. Kept deliberately sparse
// so the wilderness still dominates and skylines don't homogenize.

const HAMLET_COLORS = [
  { r: 200, g: 180, b: 150 },
  { r: 185, g: 170, b: 155 },
  { r: 170, g: 160, b: 150 },
  { r: 205, g: 190, b: 165 },
  { r: 160, g: 165, b: 170 },
];
const HAMLET_ROOFS = [
  { r: 120, g: 70, b: 55 },
  { r: 95, g: 80, b: 70 },
  { r: 80, g: 85, b: 90 },
  { r: 110, g: 95, b: 60 },
];

function updateHamlets() {
  for (let h of hamlets) {
    if (h.grow < 1) {
      h.grow += 0.04 * simulationSpeed;
      if (h.grow > 1) h.grow = 1;
    }
  }
}

function trySpawnHamlet() {
  if (roads.length < 40) return;
  if (random() > 0.55) return;

  for (let attempt = 0; attempt < 12; attempt++) {
    let r = random(roads);
    let rt = terrain[r.x][r.y];
    if (rt.isWater) continue;
    if (rt.distanceToCity < 16) continue; // only the empty land between cities

    let tooClose = false;
    for (let h of hamlets) {
      if (dist(r.x, r.y, h.tx, h.ty) < 8) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    let count = floor(random(2, 5));
    let placed = 0;
    for (let k = 0; k < count * 4 && placed < count; k++) {
      let nx = r.x + floor(random(-3, 4));
      let ny = r.y + floor(random(-3, 4));
      if (nx < 1 || ny < 1 || nx >= TERRAIN_SIZE - 1 || ny >= TERRAIN_SIZE - 1)
        continue;
      let nt = terrain[nx][ny];
      if (nt.isWater || nt.occupied || nt.road || nt.hamlet) continue;
      if (nt.elevation > 5) continue;
      if (nt.distanceToRoad > 3) continue;

      nt.hamlet = true;
      nt.occupied = true;
      hamlets.push({
        isHamlet: true,
        tx: nx,
        ty: ny,
        depth: nx + ny + 0.5,
        height: random() < 0.3 ? 2 : 1,
        grow: 0,
        baseColor: random(HAMLET_COLORS),
        roofColor: random(HAMLET_ROOFS),
        hasLight: random() < 0.7,
      });
      placed++;
    }
    if (placed > 0) {
      hamletsDirty = true;
      break;
    }
  }
}

function drawHamletHouse(h) {
  let elev = terrain[h.tx][h.ty].elevation;
  let pos = toIso(h.tx + 0.5, h.ty + 0.5, elev);
  if (!isVisible(pos.x, pos.y, 40)) return;

  let dl = cachedDaylight;
  let grow = h.grow < 1 ? h.grow : 1;
  let bw = TILE_WIDTH * 0.92;
  let bh = TILE_HEIGHT * 0.92;
  let wallH = h.height * TILE_HEIGHT * grow;
  if (wallH < 0.4) return;

  let baseCol = lerpColor(
    color(18, 18, 24),
    color(h.baseColor.r, h.baseColor.g, h.baseColor.b),
    dl,
  );
  let shade = lerpColor(baseCol, color(0), 0.2);
  let topY = pos.y - wallH;

  // right wall
  noStroke();
  fill(shade);
  beginShape();
  vertex(pos.x, topY + bh);
  vertex(pos.x + bw / 2, topY + bh / 2);
  vertex(pos.x + bw / 2, pos.y + bh / 2);
  vertex(pos.x, pos.y + bh);
  endShape(CLOSE);

  // left wall
  fill(lerpColor(shade, color(0), 0.1));
  beginShape();
  vertex(pos.x, topY + bh);
  vertex(pos.x - bw / 2, topY + bh / 2);
  vertex(pos.x - bw / 2, pos.y + bh / 2);
  vertex(pos.x, pos.y + bh);
  endShape(CLOSE);

  // pitched roof
  let roofCol = lerpColor(
    color(14, 14, 20),
    color(h.roofColor.r, h.roofColor.g, h.roofColor.b),
    dl,
  );
  fill(roofCol);
  beginShape();
  vertex(pos.x, topY - bh * 0.7);
  vertex(pos.x + bw / 2, topY + bh / 2);
  vertex(pos.x, topY + bh);
  vertex(pos.x - bw / 2, topY + bh / 2);
  endShape(CLOSE);
  fill(lerpColor(roofCol, color(0), 0.18));
  beginShape();
  vertex(pos.x, topY - bh * 0.7);
  vertex(pos.x + bw / 2, topY + bh / 2);
  vertex(pos.x, topY + bh);
  endShape(CLOSE);

  // window glow at night
  if (grow >= 1 && cachedIsNight) {
    if (h.hasLight) fill(255, 225, 150, 200);
    else fill(40, 45, 60, 90);
    rect(pos.x - 0.5, pos.y - wallH * 0.55, 1.1, 1.3);
  }
}
