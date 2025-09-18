import json
import os
import sqlite3
from sqlite3 import Error

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'aquaguard.db')

def create_connection():
    """Create a database connection to the SQLite database"""
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        return conn
    except Error as e:
        print(e)
    return conn

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

def init_db():
    """Initialize the database"""
    create_tables()
    populate_database()

# Database query functions
def get_ocean_data():
    """Get all ocean data"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ocean_data")
            ocean_data = []
            
            for row in cursor.fetchall():
                data = dict(row)
                # Get all points for this ocean data
                cursor.execute(
                    "SELECT * FROM ocean_data_points WHERE ocean_data_id = ?", 
                    (row['id'],)
                )
                points = [dict(point) for point in cursor.fetchall()]
                data['points'] = points
                ocean_data.append(data)
            
            return ocean_data
        except Error as e:
            print(f"Error retrieving ocean data: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_districts():
    """Get all districts"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM districts")
            districts = [dict(row) for row in cursor.fetchall()]
            return districts
        except Error as e:
            print(f"Error retrieving districts: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_regions():
    """Get all regions"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM regions")
            regions = [dict(row) for row in cursor.fetchall()]
            return regions
        except Error as e:
            print(f"Error retrieving regions: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_sightings():
    """Get all sightings"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sightings")
            sightings = [dict(row) for row in cursor.fetchall()]
            return sightings
        except Error as e:
            print(f"Error retrieving sightings: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_groundwater_data(state=None, district=None):
    """Get all groundwater data or filter by state and district"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Get states for the result structure
            if state:
                states = [state]
            else:
                cursor.execute("SELECT DISTINCT state_name FROM groundwater")
                states = [row['state_name'] for row in cursor.fetchall()]
            
            result = {}
            
            for current_state in states:
                result[current_state] = {}
                
                # Get districts for the current state
                if district and state == current_state:
                    districts = [district]
                else:
                    cursor.execute(
                        "SELECT DISTINCT district_name FROM groundwater WHERE state_name = ?", 
                        (current_state,)
                    )
                    districts = [row['district_name'] for row in cursor.fetchall()]
                
                for current_district in districts:
                    # Get district data
                    cursor.execute(
                        """
                        SELECT * FROM groundwater 
                        WHERE state_name = ? AND district_name = ?
                        """, 
                        (current_state, current_district)
                    )
                    
                    district_data = {}
                    
                    for row in cursor.fetchall():
                        data_point = {
                            "id": row['id'],
                            "year": row['year'],
                            "level": row['level'],
                            "quality": row['quality'],
                            "latitude": row['latitude'],
                            "longitude": row['longitude'],
                            "color": row['color'],
                            "rainfall": row['rainfall'],
                            "annualExtractable": row['annual_extractable'],
                            "groundWaterExtraction": row['current_extraction'],
                            "groundWaterRecharge": row['ground_water_recharge'],
                            "naturalDischarges": row['natural_discharges'],
                            "extraction": row['extraction_percentage']
                        }
                        
                        # Parse JSON data
                        if row['historical_levels']:
                            data_point['historicalLevels'] = json.loads(row['historical_levels'])
                        
                        if row['monthly_rainfall']:
                            data_point['monthlyRainfall'] = json.loads(row['monthly_rainfall'])
                        
                        if row['city_name']:
                            # If there's a city, this is city-level data
                            district_data[row['city_name']] = data_point
                        else:
                            # This is district-level data
                            district_data = data_point
                    
                    result[current_state][current_district] = district_data
            
            if state and district:
                return {state: {district: result[state][district]}}
            elif state:
                return {state: result[state]}
            
            return result
        except Error as e:
            print(f"Error retrieving groundwater data: {e}")
            return {}
        finally:
            conn.close()
    
    return {}

def get_available_states():
    """Get all unique states from sightings data"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT state_name FROM sightings ORDER BY state_name")
            states = [row['state_name'] for row in cursor.fetchall()]
            return states
        except Error as e:
            print(f"Error retrieving available states: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_districts_by_state(state):
    """Get all unique districts for a given state"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT DISTINCT district_name FROM sightings WHERE state_name = ? ORDER BY district_name", 
                (state,)
            )
            districts = [row['district_name'] for row in cursor.fetchall()]
            return districts
        except Error as e:
            print(f"Error retrieving districts for state {state}: {e}")
            return []
        finally:
            conn.close()
    
    return []

def get_stations_by_district(state, district):
    """Get all unique stations for a given district"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT DISTINCT station_name FROM sightings WHERE state_name = ? AND district_name = ? ORDER BY station_name", 
                (state, district)
            )
            stations = [row['station_name'] for row in cursor.fetchall()]
            return stations
        except Error as e:
            print(f"Error retrieving stations for district {district} in state {state}: {e}")
            return []
        finally:
            conn.close()
    
    return []

def search_locations(query):
    """Search for locations matching the query"""
    conn = create_connection()
    if conn:
        try:
            cursor = conn.cursor()
            
            # Search states, districts, stations, and cities
            search_term = f"%{query}%"
            
            # Search states
            cursor.execute(
                "SELECT DISTINCT state_name AS name, 'state' AS type FROM groundwater WHERE state_name LIKE ?", 
                (search_term,)
            )
            state_results = [dict(row) for row in cursor.fetchall()]
            
            # Search districts
            cursor.execute(
                "SELECT DISTINCT district_name AS name, state_name AS parent, 'district' AS type FROM groundwater WHERE district_name LIKE ?", 
                (search_term,)
            )
            district_results = [dict(row) for row in cursor.fetchall()]
            
            # Combine results
            results = state_results + district_results
            
            return results
        except Error as e:
            print(f"Error searching locations: {e}")
            return []
        finally:
            conn.close()
    
    return []