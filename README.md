# Kunesis - Municipal Stray Management Dashboard

## Overview

The Kunesis Municipal Dashboard is a B2G (Business-to-Government) SaaS platform designed for Greek municipalities to manage stray animal populations humanely and efficiently. It provides real-time oversight of smart-collared animals and manages geofencing for public safety


## Key Features

### 1. Live Monitoring

**Real-Time Map**: Visualize the location of all registered stray animals on a city-wide map.

**Status Indicators**: Color-coded icons for animal status (Normal, Aggressive Behavior Detected, Low Battery, Offline).

**Individual Profiles**: Click on any animal to view ID, vaccination history, sterilization status, and behavioral logs.

### 2. Geofence Management

**Dynamic Exclusion Zones**: Draw and activate virtual fences around high-risk areas (e.g., University campuses, primary schools, highways).

**Deterrent Configuration**: Configure the graduated deterrent levels (Vibration -> Ultrasonic) for specific zones.

**Breach Alerts**: Instant notifications when a pack enters a restricted zone.

### 3. Incident Heatmaps & Analytics

**Hotspot Detection**: Aggregates data from collar "aggression events" (sudden acceleration/barking) and citizen reports to identify dangerous areas.

**Collision Prediction**: Correlates animal crossing patterns with traffic data to predict potential accident sites.

## Installation

Clone the repository:
```
git clone [https://github.com/tzanmix/Kunesis-Dashboard.git](https://github.com/tzanmix/Kunesis-Dashboard.git)
cd municipality-dashboard
```

Install dependencies:
```
npm install
```

Run the development server:
```
ng serve
```

Navigate to http://localhost:4200/.

