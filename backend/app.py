from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import json
import os
from sqlite3 import Error
import pandas as pd
import numpy as np
from joblib import load
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.preprocessing import LabelEncoder
import io
import base64

# Import database functions
from database import (
    init_db,
    get_ocean_data,
    get_districts,
    get_regions,
    get_sightings,
    get_groundwater_data,
    get_available_states,
    get_districts_by_state,
    get_stations_by_district,
    search_locations,
    create_connection,
    DB_PATH
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model globally
model = load('ground_water_predictor.pkl')

def create_tables():
    """Create the database tables if they don't exist"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Create ocean_data table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS ocean_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                region TEXT NOT NULL,
                data_type TEXT NOT NULL,
                min_value REAL,
                max_value REAL
            )
            ''')
            
            # Create ocean_data_points table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS ocean_data_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ocean_data_id INTEGER,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                value REAL NOT NULL,
                FOREIGN KEY (ocean_data_id) REFERENCES ocean_data (id)
            )
            ''')
            
            # Create district table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS districts (
                id TEXT PRIMARY KEY,
                color TEXT,
                agency_name TEXT,
                state_name TEXT NOT NULL,
                district_name TEXT NOT NULL,
                tahsil_name TEXT,
                station_name TEXT,
                latitude REAL,
                longitude REAL,
                station_type TEXT,
                station_status TEXT
            )
            ''')
            
            # Create regions table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS regions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sw_lat REAL,
                sw_lng REAL,
                ne_lat REAL,
                ne_lng REAL,
                center_lat REAL,
                center_lng REAL
            )
            ''')
            
            # Create sightings table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS sightings (
                id TEXT PRIMARY KEY,
                state_name TEXT NOT NULL,
                district_name TEXT NOT NULL,
                station_name TEXT,
                latitude REAL,
                longitude REAL,
                temperature REAL,
                ph REAL,
                salinity REAL
            )
            ''')
            
            # Create groundwater table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS groundwater (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                state_name TEXT NOT NULL,
                district_name TEXT NOT NULL,
                city_name TEXT,
                year INTEGER,
                level REAL,
                quality TEXT,
                latitude REAL,
                longitude REAL,
                color TEXT,
                rainfall REAL,
                annual_extractable REAL,
                current_extraction REAL,
                ground_water_recharge REAL,
                natural_discharges REAL,
                extraction_percentage REAL,
                historical_levels TEXT,
                monthly_rainfall TEXT
            )
            ''')
            
            conn.commit()
            print("Database tables created successfully")
        except Error as e:
            print(f"Error creating tables: {e}")
        finally:
            conn.close()

def populate_database():
    """Populate the database with sample data"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Check if ocean_data is already populated
            cursor.execute("SELECT COUNT(*) FROM ocean_data")
            if cursor.fetchone()[0] > 0:
                print("Database already populated, skipping initialization")
                return
            
            # Populate ocean_data and ocean_data_points
            # West Bengal - Temperature
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('west_bengal', 'temperature', 26, 29))
            wb_temp_id = cursor.lastrowid
            
            temp_points = [
                (wb_temp_id, 21.8, 87.75, 28),
                (wb_temp_id, 21.2, 88.0, 27.5),
                (wb_temp_id, 22.0, 88.5, 26.8)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', temp_points)
            
            # West Bengal - Salinity
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('west_bengal', 'salinity', 32, 35))
            wb_sal_id = cursor.lastrowid
            
            sal_points = [
                (wb_sal_id, 21.8, 87.75, 33.5),
                (wb_sal_id, 21.2, 88.0, 34.2),
                (wb_sal_id, 22.0, 88.5, 32.8)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', sal_points)
            
            # West Bengal - pH
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('west_bengal', 'ph', 7.8, 8.4))
            wb_ph_id = cursor.lastrowid
            
            ph_points = [
                (wb_ph_id, 21.8, 87.75, 8.1),
                (wb_ph_id, 21.2, 88.0, 8.2),
                (wb_ph_id, 22.0, 88.5, 7.9)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', ph_points)
            
            # Maharashtra - Temperature
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('maharashtra', 'temperature', 25, 30))
            mh_temp_id = cursor.lastrowid
            
            temp_points = [
                (mh_temp_id, 18.9, 72.8, 28.5),
                (mh_temp_id, 19.1, 73.0, 27.2),
                (mh_temp_id, 18.4, 72.9, 29.1)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', temp_points)
            
            # Maharashtra - Salinity
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('maharashtra', 'salinity', 33, 36))
            mh_sal_id = cursor.lastrowid
            
            sal_points = [
                (mh_sal_id, 18.9, 72.8, 34.1),
                (mh_sal_id, 19.1, 73.0, 35.3),
                (mh_sal_id, 18.4, 72.9, 33.7)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', sal_points)
            
            # Maharashtra - pH
            cursor.execute('''
            INSERT INTO ocean_data (region, data_type, min_value, max_value)
            VALUES (?, ?, ?, ?)
            ''', ('maharashtra', 'ph', 7.7, 8.3))
            mh_ph_id = cursor.lastrowid
            
            ph_points = [
                (mh_ph_id, 18.9, 72.8, 8.0),
                (mh_ph_id, 19.1, 73.0, 7.9),
                (mh_ph_id, 18.4, 72.9, 8.2)
            ]
            cursor.executemany('''
            INSERT INTO ocean_data_points (ocean_data_id, latitude, longitude, value)
            VALUES (?, ?, ?, ?)
            ''', ph_points)
            
            # Populate districts
            districts = [
                ('station_001', '#F48FB1', 'CGWB', 'DELHI', 'Nazul Land', 'Nazul Land', 'Lalita Park (Pz)', 28.6325, 77.27166667, 'GROUND', 'Not Installed'),
                ('station_002', '#4DD0E1', 'CGWB', 'DELHI', 'New Delhi', 'New Delhi', 'Lodhi Garden (Deep)', 28.59027778, 77.21638889, 'GROUND', 'Not Installed'),
                ('station_003', '#FFB74D', 'CGWB', 'DELHI', 'New Delhi', 'New Delhi', 'Lodhi Garden (Shallow)', 28.59027778, 77.21638889, 'GROUND', 'Not Installed')
            ]
            cursor.executemany('''
            INSERT INTO districts (id, color, agency_name, state_name, district_name, tahsil_name, station_name, latitude, longitude, station_type, station_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', districts)
            
            # Populate regions
            regions = [
                ('WEST BENGAL', 21.25, 85.5, 27.13, 89.5, 22.9868, 87.855),
                ('MAHARASHTRA', 15.6, 72.65, 22.03, 80.9, 19.75, 75.71),
                ('TAMIL NADU', 8.07, 76.23, 13.49, 80.34, 11.13, 78.66),
                ('ANDHRA PRADESH', 12.6, 76.7, 19.1, 84.8, 15.9, 79.74)
            ]
            cursor.executemany('''
            INSERT INTO regions (name, sw_lat, sw_lng, ne_lat, ne_lng, center_lat, center_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', regions)
            
            # Populate sightings
            sightings = [
                ('sight_001', 'WEST BENGAL', 'Kolkata', 'Salt Lake', 22.58, 88.42, 28.5, 8.1, 33.2),
                ('sight_002', 'MAHARASHTRA', 'Mumbai', 'Worli', 19.02, 72.82, 29.1, 7.9, 34.5)
            ]
            cursor.executemany('''
            INSERT INTO sightings (id, state_name, district_name, station_name, latitude, longitude, temperature, ph, salinity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', sightings)
            
            # Populate groundwater
            groundwater = [
                ('WEST BENGAL', 'Kolkata', None, 2023, 12.5, 'Good', 22.57, 88.36, '#64B5F6', 1443.8, 4350.74, 819.19, 123.4, 6.7, 81.82, 
                 json.dumps([{"year": 2018, "level": 14.2}, {"year": 2019, "level": 13.8}, {"year": 2020, "level": 13.1}, {"year": 2021, "level": 12.9}, {"year": 2022, "level": 12.7}, {"year": 2023, "level": 12.5}]),
                 json.dumps([{"month": "Jan", "rainfall": 15.2}, {"month": "Feb", "rainfall": 25.1}, {"month": "Mar", "rainfall": 35.8}, {"month": "Apr", "rainfall": 58.4}, {"month": "May", "rainfall": 156.2}, {"month": "Jun", "rainfall": 305.7}, {"month": "Jul", "rainfall": 325.4}, {"month": "Aug", "rainfall": 328.6}, {"month": "Sep", "rainfall": 252.3}, {"month": "Oct", "rainfall": 125.6}, {"month": "Nov", "rainfall": 28.9}, {"month": "Dec", "rainfall": 12.6}])),
                ('WEST BENGAL', 'Howrah', None, 2023, 10.2, 'Moderate', 22.59, 88.31, '#FFB74D', 1387.5, 3875.45, 782.65, 118.9, 5.9, 78.45, 
                 json.dumps([{"year": 2018, "level": 12.8}, {"year": 2019, "level": 12.1}, {"year": 2020, "level": 11.5}, {"year": 2021, "level": 10.9}, {"year": 2022, "level": 10.5}, {"year": 2023, "level": 10.2}]),
                 json.dumps([{"month": "Jan", "rainfall": 14.1}, {"month": "Feb", "rainfall": 22.3}, {"month": "Mar", "rainfall": 34.2}, {"month": "Apr", "rainfall": 55.8}, {"month": "May", "rainfall": 148.7}, {"month": "Jun", "rainfall": 298.5}, {"month": "Jul", "rainfall": 312.9}, {"month": "Aug", "rainfall": 321.1}, {"month": "Sep", "rainfall": 245.7}, {"month": "Oct", "rainfall": 119.8}, {"month": "Nov", "rainfall": 25.7}, {"month": "Dec", "rainfall": 11.4}])),
                ('MAHARASHTRA', 'Mumbai', None, 2023, 15.8, 'Poor', 19.07, 72.87, '#E57373', 2165.3, 5842.38, 1985.61, 224.7, 12.8, 92.35, 
                 json.dumps([{"year": 2018, "level": 12.6}, {"year": 2019, "level": 13.5}, {"year": 2020, "level": 14.2}, {"year": 2021, "level": 14.8}, {"year": 2022, "level": 15.3}, {"year": 2023, "level": 15.8}]),
                 json.dumps([{"month": "Jan", "rainfall": 0.6}, {"month": "Feb", "rainfall": 1.3}, {"month": "Mar", "rainfall": 0.2}, {"month": "Apr", "rainfall": 0.7}, {"month": "May", "rainfall": 12.5}, {"month": "Jun", "rainfall": 523.1}, {"month": "Jul", "rainfall": 799.7}, {"month": "Aug", "rainfall": 546.2}, {"month": "Sep", "rainfall": 327.1}, {"month": "Oct", "rainfall": 55.8}, {"month": "Nov", "rainfall": 16.8}, {"month": "Dec", "rainfall": 5.9}])),
                ('MAHARASHTRA', 'Pune', None, 2023, 8.9, 'Good', 18.52, 73.85, '#64B5F6', 722.8, 3267.92, 578.45, 145.3, 8.2, 65.74, 
                 json.dumps([{"year": 2018, "level": 11.2}, {"year": 2019, "level": 10.7}, {"year": 2020, "level": 10.1}, {"year": 2021, "level": 9.5}, {"year": 2022, "level": 9.2}, {"year": 2023, "level": 8.9}]),
                 json.dumps([{"month": "Jan", "rainfall": 0.8}, {"month": "Feb", "rainfall": 1.0}, {"month": "Mar", "rainfall": 1.1}, {"month": "Apr", "rainfall": 8.5}, {"month": "May", "rainfall": 22.6}, {"month": "Jun", "rainfall": 137.8}, {"month": "Jul", "rainfall": 181.5}, {"month": "Aug", "rainfall": 138.6}, {"month": "Sep", "rainfall": 146.1}, {"month": "Oct", "rainfall": 70.1}, {"month": "Nov", "rainfall": 25.6}, {"month": "Dec", "rainfall": 4.8}]))
            ]
            cursor.executemany('''
            INSERT INTO groundwater (state_name, district_name, city_name, year, level, quality, latitude, longitude, color, 
                                     rainfall, annual_extractable, current_extraction, ground_water_recharge, natural_discharges, 
                                     extraction_percentage, historical_levels, monthly_rainfall)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', groundwater)
            
            conn.commit()
            print("Database populated successfully")
        except Error as e:
            print(f"Error populating database: {e}")
        finally:
            conn.close()

# API Routes
@app.route('/')
def index():
    return "AquaGuard Groundwater Monitoring API"

# Ocean data endpoints
@app.route('/api/ocean-data', methods=['GET'])
def get_ocean_data_endpoint():
    """Get all ocean data"""
    result = get_ocean_data()
    return jsonify(result)
                
@app.route('/api/ocean-data/regions/<region>', methods=['GET'])
def get_ocean_data_by_region(region):
    """Get ocean data for a specific region"""
    # We could add a specific function for this in database.py
    # For now, filter the results from get_ocean_data
    all_data = get_ocean_data()
    region_data = [data for data in all_data if data.get('region') == region]
    return jsonify(region_data)

# District data endpoints
@app.route('/api/districts', methods=['GET'])
def get_districts_endpoint():
    """Get all district data"""
    result = get_districts()
    return jsonify(result)
    
@app.route('/api/districts/<state>', methods=['GET'])
def get_districts_by_state_endpoint(state):
    """Get district data for a specific state"""
    result = get_districts_by_state(state)
    return jsonify(result)

# Regions data endpoints
@app.route('/api/regions', methods=['GET'])
def get_regions_endpoint():
    """Get all region data"""
    result = get_regions()
    return jsonify(result)

# Sightings data endpoints
@app.route('/api/sightings', methods=['GET'])
def get_sightings_endpoint():
    """Get all sightings data"""
    result = get_sightings()
    return jsonify(result)
    
# Groundwater data endpoints
@app.route('/api/groundwater', methods=['GET'])
def get_groundwater_data_endpoint():
    """Get all groundwater data or filter by state and district"""
    state = request.args.get('state')
    district = request.args.get('district')
    
    result = get_groundwater_data(state, district)
    return jsonify(result)
    
# Search endpoints to support SearchBar component
@app.route('/api/search/states', methods=['GET'])
def get_available_states_endpoint():
    """Get all unique states from sightings data"""
    states = get_available_states()
    return jsonify(states)

@app.route('/api/search/districts', methods=['GET'])
def get_available_districts_endpoint():
    """Get all unique districts from sightings data, optionally filtered by state"""
    state = request.args.get('state')
    districts = get_districts_by_state(state) if state else get_districts()
    return jsonify(districts)

@app.route('/api/search/stations', methods=['GET'])
def get_available_stations_endpoint():
    """Get all unique stations from sightings data, optionally filtered by state and district"""
    state = request.args.get('state')
    district = request.args.get('district')
    
    if state and district:
        stations = get_stations_by_district(state, district)
    else:
        # If no state and district provided, we return an empty list for now
        # This could be enhanced in database.py to return all stations
        stations = []
    
    return jsonify(stations)

@app.route('/api/search', methods=['GET'])
def search_endpoint():
    """
    Search for stations based on query parameters:
    - q: General search query (searches state, district, and station)
    """
    query = request.args.get('q', '')
    results = search_locations(query)
    return jsonify(results)



# ML prediction endpoint
@app.route('/api/predict/<city>', methods=['GET'])
def predict_city(city):
    try:
        print(f"Received prediction request for city: {city}")
        
        # For Kalyani, use representative values based on typical West Bengal groundwater parameters
        if 'KALYANI' in city.upper():
            # Create a single sample with typical values for the region
            sample_data = np.array([[
                1,  # Station Name encoded (doesn't affect prediction significantly)
                1,  # STATE encoded (West Bengal)
                25.0,  # Temperature Min (typical for West Bengal)
                32.0,  # Temperature Max
                6.8,   # pH Min (typical groundwater range)
                7.5,   # pH Max
                500,   # Conductivity Min (µmhos/cm, typical for the region)
                800    # Conductivity Max
            ]])
            
            # Create feature names matching the model's expectations
            X_pred = pd.DataFrame(
                sample_data,
                columns=[
                    'Station Name_prev', 'STATE_prev',
                    'Temperature Min_prev', 'Temperature Max_prev',
                    'pH Min_prev', 'pH Max_prev',
                    'Conductivity (µmhos/cm) Min_prev', 'Conductivity (µmhos/cm) Max_prev'
                ]
            )
            
            print("Created sample data for prediction")
            
            # Make predictions
            predictions = model.predict(X_pred)
            print("Predictions made successfully:", predictions)
            
            # Create DataFrame for predictions
            pred_df = pd.DataFrame(predictions, columns=[
                'Temperature Min', 'Temperature Max',
                'pH Min', 'pH Max',
                'Conductivity (µmhos/cm) Min', 'Conductivity (µmhos/cm) Max'
            ])

            # Calculate recharge potential
            def calculate_recharge_potential(row):
                avg_pH = (row['pH Min'] + row['pH Max']) / 2
                avg_cond = (row['Conductivity (µmhos/cm) Min'] + row['Conductivity (µmhos/cm) Max']) / 2
                avg_temp = (row['Temperature Min'] + row['Temperature Max']) / 2
                
                pH_factor = 1.0 - abs(7.5 - avg_pH) / 7.5
                cond_factor = 1.0 / (1.0 + avg_cond/5000)
                temp_factor = 1.0 - abs(25 - avg_temp) / 25
                
                quality_factor = (pH_factor * 0.4 + cond_factor * 0.4 + temp_factor * 0.2)
                
                rainfall = 1.5
                catchment_area = 100 * 1000000
                base_recharge_coef = 0.20
                
                recharge_volume_mcm = (rainfall * catchment_area * base_recharge_coef * quality_factor) / 1000000
                recharge_percentage = (recharge_volume_mcm / (rainfall * catchment_area * base_recharge_coef / 1000000)) * 100
                
                return recharge_volume_mcm, recharge_percentage

            recharge_results = pred_df.apply(calculate_recharge_potential, axis=1)
            recharge_volume = recharge_results.iloc[0][0]
            recharge_percentage = recharge_results.iloc[0][1]

            # Create visualizations with default style
            # Parameter Predictions (2D Plots)
            plt.figure(figsize=(15, 10))

            # First row of subplots
            plt.subplot(231)
            bars = plt.bar(['Min', 'Max'], 
                    [pred_df['Temperature Min'].values[0], pred_df['Temperature Max'].values[0]],
                    color=['#3498db', '#e74c3c'], width=0.5)
            plt.title('Temperature Prediction', fontsize=14, pad=10)
            plt.ylabel('Temperature (°C)', fontsize=12)
            # Add value labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height,
                        f'{height:.2f}°C',
                        ha='center', va='bottom', fontsize=12)

            plt.subplot(232)
            bars = plt.bar(['Min', 'Max'], 
                    [pred_df['pH Min'].values[0], pred_df['pH Max'].values[0]],
                    color=['#2ecc71', '#f1c40f'], width=0.5)
            plt.title('pH Level Prediction', fontsize=14, pad=10)
            plt.ylabel('pH Value', fontsize=12)
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height,
                        f'{height:.2f}',
                        ha='center', va='bottom', fontsize=12)

            plt.subplot(233)
            bars = plt.bar(['Recharge'], [recharge_volume], color='#9b59b6', width=0.5)
            plt.title('Groundwater Recharge', fontsize=14, pad=10)
            plt.ylabel('Million Cubic Meters/year', fontsize=12)
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height,
                        f'{height:.2f} MCM',
                        ha='center', va='bottom', fontsize=12)

            # Second row of subplots
            # Monthly Rainfall Pattern
            plt.subplot(234)
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            rainfall_data = [15.2, 25.1, 35.8, 58.4, 156.2, 305.7, 325.4, 328.6, 252.3, 125.6, 28.9, 12.6]
            plt.plot(months, rainfall_data, marker='o', color='#3498db', linewidth=2, markersize=8)
            plt.title('Monthly Rainfall Pattern', fontsize=14, pad=10)
            plt.ylabel('Rainfall (mm)', fontsize=12)
            plt.xticks(rotation=45, fontsize=10)
            plt.yticks(fontsize=10)
            plt.grid(True, linestyle='--', alpha=0.7)

            # Historical Ground Level
            plt.subplot(235)
            years = [2018, 2019, 2020, 2021, 2022, 2023]
            levels = [14.2, 13.8, 13.1, 12.9, 12.7, 12.5]
            plt.plot(years, levels, marker='s', color='#e74c3c', linewidth=2, markersize=8)
            plt.title('5-Year Ground Level Trend', fontsize=14, pad=10)
            plt.ylabel('Ground Level (m)', fontsize=12)
            plt.xticks(fontsize=10)
            plt.yticks(fontsize=10)
            plt.grid(True, linestyle='--', alpha=0.7)

            # Add a text box with parameter predictions
            plt.subplot(236)
            plt.axis('off')
            summary_text = f"""Parameter Predictions

Temperature
Min: {pred_df['Temperature Min'].values[0]:.2f}°C
Max: {pred_df['Temperature Max'].values[0]:.2f}°C

pH Levels
Min: {pred_df['pH Min'].values[0]:.2f}
Max: {pred_df['pH Max'].values[0]:.2f}

Conductivity
Min: {pred_df['Conductivity (µmhos/cm) Min'].values[0]:.0f} µmhos/cm
Max: {pred_df['Conductivity (µmhos/cm) Max'].values[0]:.0f} µmhos/cm

Recharge Potential
Volume: {recharge_volume:.2f} MCM
Percentage: {recharge_percentage:.2f}%"""

            plt.text(0.1, 0.95, summary_text, fontsize=12, verticalalignment='top', 
                    bbox=dict(boxstyle='round', facecolor='white', alpha=0.8, edgecolor='gray'))

            plt.tight_layout(pad=1.0)  # Adjusted padding
            
            # Save 2D plot to memory with higher quality settings
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', 
                       facecolor='white', edgecolor='none', pad_inches=0.5,
                       transparent=False)
            buf.seek(0)
            plt.close()
            
            # Convert plot to base64
            plot_2d = base64.b64encode(buf.getvalue()).decode('utf-8')

            # Create 3D visualization with improved visibility
            fig = plt.figure(figsize=(10, 8))
            ax = fig.add_subplot(111, projection='3d')

            # Plot data points with larger markers
            scatter1 = ax.scatter(pred_df['pH Min'].values[0], 
                      pred_df['Conductivity (µmhos/cm) Min'].values[0], 
                      pred_df['Temperature Min'].values[0], 
                      color='#3498db', s=200, label='Minimum Values', alpha=0.8)
            scatter2 = ax.scatter(pred_df['pH Max'].values[0], 
                      pred_df['Conductivity (µmhos/cm) Max'].values[0], 
                      pred_df['Temperature Max'].values[0], 
                      color='#e74c3c', s=200, label='Maximum Values', alpha=0.8)

            # Connect points with a line
            ax.plot([pred_df['pH Min'].values[0], pred_df['pH Max'].values[0]],
                   [pred_df['Conductivity (µmhos/cm) Min'].values[0], pred_df['Conductivity (µmhos/cm) Max'].values[0]],
                   [pred_df['Temperature Min'].values[0], pred_df['Temperature Max'].values[0]],
                   'k--', alpha=0.5)

            # Customize the appearance with larger fonts
            ax.set_xlabel('pH Level', fontsize=12, labelpad=15)
            ax.set_ylabel('Conductivity (µmhos/cm)', fontsize=12, labelpad=15)
            ax.set_zlabel('Temperature (°C)', fontsize=12, labelpad=15)
            ax.set_title('Parameter Space Visualization', fontsize=16, pad=20)

            # Adjust the viewing angle for better perspective
            ax.view_init(elev=25, azim=45)

            # Add grid with custom style
            ax.grid(True, linestyle='--', alpha=0.4)

            # Customize tick labels
            ax.tick_params(axis='both', which='major', labelsize=10)

            # Customize legend with better positioning
            ax.legend(fontsize=12, bbox_to_anchor=(1.15, 0.9))

            # Adjust layout to prevent cutoff
            plt.tight_layout(rect=[0, 0, 0.9, 1])

            # Save 3D plot to memory with higher quality settings
            buf_3d = io.BytesIO()
            plt.savefig(buf_3d, format='png', dpi=150, bbox_inches='tight',
                       facecolor='white', edgecolor='none', pad_inches=0.5,
                       transparent=False)
            buf_3d.seek(0)
            plt.close()
            
            # Convert 3D plot to base64
            plot_3d = base64.b64encode(buf_3d.getvalue()).decode('utf-8')

            # Prepare response data
            response_data = {
                'predictions': {
                    'temperature': {
                        'min': float(pred_df['Temperature Min'].values[0]),
                        'max': float(pred_df['Temperature Max'].values[0])
                    },
                    'pH': {
                        'min': float(pred_df['pH Min'].values[0]),
                        'max': float(pred_df['pH Max'].values[0])
                    },
                    'conductivity': {
                        'min': float(pred_df['Conductivity (µmhos/cm) Min'].values[0]),
                        'max': float(pred_df['Conductivity (µmhos/cm) Max'].values[0])
                    },
                    'recharge': {
                        'volume': float(recharge_volume),
                        'percentage': float(recharge_percentage)
                    }
                },
                'plots': {
                    'plot_2d': plot_2d,
                    'plot_3d': plot_3d
                }
            }

            return jsonify(response_data)
        else:
            return jsonify({
                'error': 'Currently only supporting predictions for Kalyani'
            }), 400

    except Exception as e:
        print("Error in prediction:", str(e))
        return jsonify({'error': str(e)}), 500

# Initialize database when app starts
init_db()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)