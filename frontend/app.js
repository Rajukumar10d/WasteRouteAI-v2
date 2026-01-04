/**************************************************
 * MAP INITIALIZATION
 **************************************************/
const map = L.map("map").setView([17.385, 78.4867], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

/**************************************************
 * DATA
 **************************************************/
const sctps = [
  { id: "SCTP-1", lat: 17.4139, lng: 78.4797 },
  { id: "SCTP-2", lat: 17.4300, lng: 78.5300 },
  { id: "SCTP-3", lat: 17.3600, lng: 78.4400 }
];

const trucks = [
  { id: "Truck-1", capacity: 2500, collected: 0, color: "blue", speed: 1000, traffic: "Low", status: "stopped" },
  { id: "Truck-2", capacity: 3000, collected: 0, color: "red", speed: 1000, traffic: "Low", status: "stopped" },
  { id: "Truck-3", capacity: 2800, collected: 0, color: "green", speed: 1000, traffic: "Low", status: "stopped" }
];

const gvps = [];
for (let i = 1; i <= 35; i++) {
  const fill = Math.floor(40 + Math.random() * 60);
  gvps.push({
    id: "GVP-" + i,
    lat: 17.35 + Math.random() * 0.15,
    lng: 78.40 + Math.random() * 0.15,
    waste: Math.floor(50 + Math.random() * 150),
    fill_level: fill,
    priority: fill >= 70 ? "High" : "Normal",
    status: "Pending"
  });
}

/**************************************************
 * ICONS & MARKERS
 **************************************************/
const sctpIcon = L.icon({
  iconUrl: "https://www.pikpng.com/pngl/m/36-369401_location-marker-icon-google-maps-pointer-elsavadorla-google.png",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -35]
});

const gvpMarkers = [];
const sctpMarkers = [];
const truckMarkers = {};

// SCTP
sctps.forEach(s => {
  const marker = L.marker([s.lat, s.lng], { icon: sctpIcon })
    .addTo(map)
    .bindPopup(`<b>${s.id}</b><br>Transfer Point`);
  sctpMarkers.push(marker);
});

// Trucks
trucks.forEach((t, i) => {
  const start = sctps[i % sctps.length];
  const marker = L.marker([start.lat, start.lng], {
    icon: L.divIcon({ html: "🚛", iconSize: [25, 25], className: "" })
  }).addTo(map).bindPopup(t.id);
  truckMarkers[t.id] = marker;
});

// GVP
gvps.forEach(g => {
  const marker = L.circleMarker([g.lat, g.lng], {
    radius: 7,
    color: g.priority === "High" ? "red" : "orange",
    fillOpacity: 0.85
  })
    .addTo(map)
    .bindPopup(`<b>${g.id}</b><br>Waste: ${g.waste} kg<br>Fill Level: ${g.fill_level}%<br>Priority: ${g.priority}`);
  gvpMarkers.push(marker);
});

/**************************************************
 * TABLE UPDATES
 **************************************************/
function updateTables() {
  // Truck Table
  const truckTable = document.getElementById("truckTable");
  truckTable.innerHTML = "";
  trucks.forEach(t => {
    truckTable.innerHTML += `
      <tr>
        <td>${t.id}</td>
        <td><span class="status-badge ${t.status === 'running' ? 'status-running' : 'status-stopped'}">${t.status}</span></td>
        <td><span class="waste-collected">${t.collected}</span></td>
      </tr>
    `;
  });

  /**************************************************
 * LIVE MONITORING PANEL UPDATE
 **************************************************/
function updateLiveMonitoring() {
  const monitorContainer = document.getElementById("monitor-trucks");
  monitorContainer.innerHTML = "";

  trucks.forEach(truck => {
    // Approximate distance covered
    const distance = truck.collected * 0.05; // example: each kg = 0.05 km, adjust as needed

    // Approximate fuel consumption
    const fuel = (distance * 0.8).toFixed(1); // 0.8 L/km for example

    // Turnaround time (approx. using steps and speed)
    const timeTaken = truck.status === "running" ? ((truck.speed / 50) * 0.05).toFixed(1) : 0;

    // Count collected GVPs
    const collectedGVPs = gvps.filter(g => g.status === "Collected").length;

    monitorContainer.innerHTML += `
      <div class="truck-monitor-card">
        <div><span class="metric-label">Truck:</span> ${truck.id}</div>
        <div><span class="metric-label">Status:</span> <span class="status-badge ${truck.status}">${truck.status}</span></div>
        <div><span class="metric-label">Speed:</span> ${truck.speed} ms/step</div>
        <div><span class="metric-label">Collected GVPs:</span> ${collectedGVPs}</div>
        <div><span class="metric-label">Total Waste Collected:</span> ${truck.collected} kg</div>
        <div><span class="metric-label">Approx. Distance:</span> ${distance.toFixed(1)} km</div>
        <div><span class="metric-label">Fuel Used:</span> ${fuel} L</div>
        <div><span class="metric-label">Turnaround Time:</span> ${timeTaken} sec</div>
      </div>
    `;
  });
}

// Call this inside your truck movement loop
setInterval(updateLiveMonitoring, 1000); // refresh every 1s


  // GVP Table
  // GVP Table
const gvpTable = document.getElementById("gvpTable");
gvpTable.innerHTML = "";
gvps.forEach(g => {
  gvpTable.innerHTML += `
    <tr>
      <td>${g.id}</td>
      <td>${g.waste}</td>
      <td>
        <span class="gvp-badge ${g.priority === 'High' ? 'gvp-high' : 'gvp-normal'}">
          ${g.fill_level}% (${g.priority})
        </span>
      </td>
      <td>
        <span class="gvp-status ${g.status === 'Collected' ? 'collected' : 'pending'}">
          ${g.status}
        </span>
      </td>
    </tr>
  `;
});


  // SCTP Table
  const sctpTable = document.getElementById("sctpTable");
  sctpTable.innerHTML = "";
  sctps.forEach(s => {
    sctpTable.innerHTML += `
      <tr>
        <td><span class="sctp-badge">${s.id}</span></td>
        <td>${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}</td>
      </tr>
    `;
  });
}

// Initial table update
updateTables();

/**************************************************
 * TRUCK CONTROL PANEL
 **************************************************/
function updateTruckControls() {
  const tbody = document.querySelector("#truckControlTable tbody");
  if (!tbody) return; // skip if table not in HTML
  tbody.innerHTML = "";

  trucks.forEach(truck => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${truck.id}</td>
      <td>
        <select data-truck="${truck.id}">
          <option value="3000" ${truck.speed===3000?'selected':''}>Very Slow</option>
          <option value="2000" ${truck.speed===2000?'selected':''}>Slow</option>
          <option value="1000" ${truck.speed===1000?'selected':''}>Normal</option>
          <option value="500" ${truck.speed===500?'selected':''}>Fast</option>
        </select>
      </td>
      <td id="${truck.id}-traffic">${truck.traffic}</td>
      <td>
        <button id="${truck.id}-start">${truck.status==="running"?"Stop":"Start"}</button>
      </td>
    `;
    tbody.appendChild(row);

    // Speed change
    row.querySelector("select").addEventListener("change", e => {
      truck.speed = parseInt(e.target.value);
    });

    // Start/Stop truck
    row.querySelector("button").addEventListener("click", () => {
      truck.status = truck.status === "running" ? "stopped" : "running";
      row.querySelector("button").innerText = truck.status==="running"?"Stop":"Start";
      if(truck.status === "running") startTruck(truck);
    });
  });
}

updateTruckControls();

/**************************************************
 * TRUCK MOVEMENT
 **************************************************/
function startTruck(truck) {
  const marker = truckMarkers[truck.id];

  const sortedGVPs = gvps.slice().sort((a,b)=>{
    if(a.priority==="High" && b.priority!=="High") return -1;
    if(a.priority!=="High" && b.priority==="High") return 1;
    return 0;
  });

  const index = trucks.indexOf(truck);
  const chunkSize = Math.ceil(sortedGVPs.length / trucks.length);
  const assignedGVPs = sortedGVPs.slice(index * chunkSize, (index+1) * chunkSize);

  const sctp = sctps[index % sctps.length];
  const routePoints = [[sctp.lat,sctp.lng], ...assignedGVPs.map(g=>[g.lat,g.lng]), [sctp.lat,sctp.lng]];

  const stepTime = 50;
  const stepsPerSegment = truck.speed / stepTime;

  let segmentIndex = 0;
  let step = 0;

  function moveStep(){
    if(truck.status==="stopped") return;
    if(segmentIndex >= routePoints.length-1) return;

    const [lat1,lng1] = routePoints[segmentIndex];
    const [lat2,lng2] = routePoints[segmentIndex+1];

    const lat = lat1 + ((lat2-lat1)*step)/stepsPerSegment;
    const lng = lng1 + ((lng2-lng1)*step)/stepsPerSegment;

    marker.setLatLng([lat,lng]);

    assignedGVPs.forEach(g=>{
      if(g.status!=="Collected"){
        const dist = Math.sqrt((g.lat-lat)**2 + (g.lng-lng)**2);
        if(dist<0.0005){
          g.status="Collected";
          truck.collected += g.waste;
        }
      }
    });

    // Traffic simulation
    const trafficLevels = ["Low","Medium","Heavy"];
    if(Math.floor(Math.random()*50)===0){
      truck.traffic = trafficLevels[Math.floor(Math.random()*trafficLevels.length)];
      const trafficTd = document.getElementById(`${truck.id}-traffic`);
      if(trafficTd) trafficTd.innerText = truck.traffic;
    }

    updateTables();

    step++;
    if(step>stepsPerSegment){
      step=0;
      segmentIndex++;
    }

    if(segmentIndex<routePoints.length-1){
      requestAnimationFrame(moveStep);
    }
  }

  moveStep();
}

/**************************************************
 * RUN OPTIMIZATION (ALL TRUCKS)
 **************************************************/
function runOptimization() {

  alert("🚛 Sending data to backend...");

  fetch("http://127.0.0.1:5000/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      gvps: gvps
    })
  })
  .then(res => res.json())
  .then(routes => {
    drawBackendRoutes(routes);
  })
  .catch(err => {
    console.error("Backend Error:", err);
    alert("Backend not connected!");
  });
}

function drawBackendRoutes(routes) {

  // Clear old routes
  if (window.routes) {
    window.routes.forEach(r => map.removeLayer(r));
  }
  window.routes = [];

  routes.forEach(route => {

    const truck = trucks.find(t => t.id === route.truck_id);
    const sctp = sctps.find(s => s.id === route.sctp);

    const routePoints = [
      [sctp.lat, sctp.lng]
    ];

    route.gvps.forEach(gid => {
      const gvp = gvps.find(g => g.id === gid);
      if (gvp) {
        routePoints.push([gvp.lat, gvp.lng]);
        gvp.status = "Collected";
        truck.collected += gvp.waste;
      }
    });

    routePoints.push([sctp.lat, sctp.lng]);

    const polyline = L.polyline(routePoints, {
      color: truck.color,
      weight: 4
    }).addTo(map);

    window.routes.push(polyline);
  });

  updateTables();
}




function updateLiveMonitoring() {
  const monitorContainer = document.getElementById("monitor-trucks");
  monitorContainer.innerHTML = "";

  trucks.forEach(t => {
    const card = document.createElement("div");
    card.className = "truck-monitor-card";

    card.innerHTML = `
      <div><span class="metric-label">Truck:</span> <span class="metric-value">${t.id}</span></div>
      <div><span class="metric-label">Status:</span> <span class="status-badge ${t.status==='running'?'status-running':'status-stopped'}">${t.status}</span></div>
      <div><span class="metric-label">Collected Waste (kg):</span> <span class="metric-value">${t.collected}</span></div>
      <div><span class="metric-label">Speed:</span> <span class="metric-value">${t.speed} ms/step</span></div>
      <div><span class="metric-label">Traffic:</span> <span class="metric-value">${t.traffic}</span></div>
      <div><span class="metric-label">Distance Covered:</span> <span class="metric-value">${t.distance || 0} km</span></div>
      <div><span class="metric-label">Turnaround Time:</span> <span class="metric-value">${t.turnaround || 0} min</span></div>
    `;

    monitorContainer.appendChild(card);
  });
}
