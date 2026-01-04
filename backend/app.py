from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)


app = Flask(__name__)
CORS(app)

print("Smart Waste Routing Backend Running")

# ---------- helpers ----------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

# ---------- STATIC ----------
SCTPS = [
    {"id": "SCTP-1", "lat": 17.4139, "lng": 78.4797},
    {"id": "SCTP-2", "lat": 17.43, "lng": 78.53},
    {"id": "SCTP-3", "lat": 17.36, "lng": 78.44}
]

TRUCKS = [
    {"id": "Truck-1", "fuel_rate": 0.8},
    {"id": "Truck-2", "fuel_rate": 0.9},
    {"id": "Truck-3", "fuel_rate": 0.85}
]

# ---------- ROUTE ----------
@app.route("/optimize", methods=["POST"])
def optimize():
    data = request.get_json()
    gvps = data["gvps"]

    routes = []
    chunk = math.ceil(len(gvps) / len(TRUCKS))

    for i, truck in enumerate(TRUCKS):
        assigned = gvps[i*chunk:(i+1)*chunk]
        sctp = SCTPS[i]

        dist = 0
        waste = 0
        prev = sctp

        for g in assigned:
            dist += haversine(prev["lat"], prev["lng"], g["lat"], g["lng"])
            waste += g["waste"]
            prev = g

        dist += haversine(prev["lat"], prev["lng"], sctp["lat"], sctp["lng"])

        routes.append({
            "truck_id": truck["id"],
            "sctp": sctp["id"],
            "gvps": [g["id"] for g in assigned],
            "distance_km": round(dist, 2),
            "fuel_used": round(dist * truck["fuel_rate"], 2),
            "time_min": round((dist / 25) * 60, 1),
            "total_waste": waste,
            "turnaround_time": round(((dist / 25) * 60) + 15, 1)
        })

    return jsonify(routes)

# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True)
