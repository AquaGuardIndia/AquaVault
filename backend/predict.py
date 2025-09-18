import pandas as pd
import numpy as np
from joblib import load
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from sklearn.preprocessing import LabelEncoder

# Load the trained model
model = load('ground_water_predictor.pkl')

# Load 2021 data
df_2021 = pd.read_csv('Ground Water 2021.csv')

# Preprocess function (same as training)
def preprocess(df):
    df = df.copy()
    df = df.ffill()  # Updated to use ffill()
    le_station = LabelEncoder()
    le_state = LabelEncoder()
    df['Station Name'] = le_station.fit_transform(df['Station Name'])
    df['STATE'] = le_state.fit_transform(df['STATE'])
    return df, le_station, le_state

df_2021_processed, le_station, le_state = preprocess(df_2021)

# Filter for Kalyani Industrial Area
west_bengal_data = df_2021_processed[df_2021_processed['STATE'] == le_state.transform(['WEST BENGAL'])[0]]
kalyani_data = west_bengal_data[west_bengal_data['Station Name'].astype(str).str.contains('KALYANI INDUSTRIAL AREA')]

# Features for prediction
X_pred = kalyani_data[[
    'Station Name', 'STATE',
    'Temperature Min', 'Temperature Max',
    'pH Min', 'pH Max',
    'Conductivity (µmhos/cm) Min', 'Conductivity (µmhos/cm) Max'
]]

# Rename columns to match training feature names (with '_prev')
X_pred.columns = [
    'Station Name_prev', 'STATE_prev',
    'Temperature Min_prev', 'Temperature Max_prev',
    'pH Min_prev', 'pH Max_prev',
    'Conductivity (µmhos/cm) Min_prev', 'Conductivity (µmhos/cm) Max_prev'
]
predictions = model.predict(X_pred)

# Create DataFrame for predictions
pred_df = pd.DataFrame(predictions, columns=[
    'Temperature Min', 'Temperature Max',
    'pH Min', 'pH Max',
    'Conductivity (µmhos/cm) Min', 'Conductivity (µmhos/cm) Max'
])

# Add station info
pred_df['Station Code'] = kalyani_data['Station Code'].values
pred_df['Station Name'] = 'KALYANI INDUSTRIAL AREA'
pred_df['STATE'] = 'WEST BENGAL'

def calculate_recharge_potential(row):
    # Average values
    avg_pH = (row['pH Min'] + row['pH Max']) / 2
    avg_cond = (row['Conductivity (µmhos/cm) Min'] + row['Conductivity (µmhos/cm) Max']) / 2
    avg_temp = (row['Temperature Min'] + row['Temperature Max']) / 2
    
    # pH factor (optimal range 6.5-8.5)
    pH_factor = 1.0 - abs(7.5 - avg_pH) / 7.5
    
    # Conductivity factor (normalized, lower conductivity means better recharge)
    cond_factor = 1.0 / (1.0 + avg_cond/5000)  # 5000 µmhos/cm as normalization factor
    
    # Temperature factor (normalized around optimal 25°C)
    temp_factor = 1.0 - abs(25 - avg_temp) / 25
    
    # Combined quality factor (0-1 scale)
    quality_factor = (pH_factor * 0.4 + cond_factor * 0.4 + temp_factor * 0.2)
    
    # Calculate recharge in Million Cubic Meters (MCM)
    rainfall = 1.5  # meters/year
    catchment_area = 100 * 1000000  # m² (100 km²)
    base_recharge_coef = 0.20
    
    # Calculate potential recharge volume in MCM
    recharge_volume_mcm = (rainfall * catchment_area * base_recharge_coef * quality_factor) / 1000000
    
    # Calculate percentage of maximum theoretical recharge
    max_theoretical_recharge = rainfall * catchment_area * base_recharge_coef / 1000000
    recharge_percentage = (recharge_volume_mcm / max_theoretical_recharge) * 100
    
    return recharge_volume_mcm, recharge_percentage

# Calculate rechargeability
recharge_results = pred_df.apply(calculate_recharge_potential, axis=1)
pred_df['Recharge_Volume_MCM'] = [x[0] for x in recharge_results]
pred_df['Recharge_Potential_Percent'] = [x[1] for x in recharge_results]

# Print prediction summary for Kalyani
print("\nKalyani Industrial Area - Groundwater Prediction Summary for 2022:")
print("----------------------------------------")
print("Temperature Prediction:")
print(f"Min: {pred_df['Temperature Min'].values[0]:.2f}°C")
print(f"Max: {pred_df['Temperature Max'].values[0]:.2f}°C")
print("\npH Prediction:")
print(f"Min: {pred_df['pH Min'].values[0]:.2f}")
print(f"Max: {pred_df['pH Max'].values[0]:.2f}")
print("\nConductivity Prediction:")
print(f"Min: {pred_df['Conductivity (µmhos/cm) Min'].values[0]:.2f} µmhos/cm")
print(f"Max: {pred_df['Conductivity (µmhos/cm) Max'].values[0]:.2f} µmhos/cm")
print("\nRecharge Potential:")
print(f"Volume: {pred_df['Recharge_Volume_MCM'].values[0]:.2f} MCM/year")
print(f"Percentage: {pred_df['Recharge_Potential_Percent'].values[0]:.2f}%")

# 2D Visualizations for Kalyani
plt.figure(figsize=(15, 5))

# Temperature prediction plot
plt.subplot(131)
plt.bar(['Min Temperature', 'Max Temperature'], 
        [pred_df['Temperature Min'].values[0], pred_df['Temperature Max'].values[0]],
        color=['blue', 'red'])
plt.title('Temperature Prediction for 2022')
plt.ylabel('Temperature (°C)')

# pH prediction plot
plt.subplot(132)
plt.bar(['Min pH', 'Max pH'], 
        [pred_df['pH Min'].values[0], pred_df['pH Max'].values[0]],
        color=['green', 'orange'])
plt.title('pH Prediction for 2022')
plt.ylabel('pH Value')

# Recharge prediction plot
plt.subplot(133)
plt.bar(['Recharge Volume'], [pred_df['Recharge_Volume_MCM'].values[0]], color='purple')
plt.title('Predicted Recharge Volume')
plt.ylabel('Million Cubic Meters/year')

plt.tight_layout()
plt.savefig('kalyani_2d_predictions.png')
plt.close()

# 3D Visualization for Kalyani
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# Create points for current and predicted values
ax.scatter(pred_df['pH Min'].values[0], 
          pred_df['Conductivity (µmhos/cm) Min'].values[0], 
          pred_df['Temperature Min'].values[0], 
          color='blue', label='Minimum Values')
ax.scatter(pred_df['pH Max'].values[0], 
          pred_df['Conductivity (µmhos/cm) Max'].values[0], 
          pred_df['Temperature Max'].values[0], 
          color='red', label='Maximum Values')

ax.set_xlabel('pH')
ax.set_ylabel('Conductivity (µmhos/cm)')
ax.set_zlabel('Temperature (°C)')
ax.set_title('3D Parameter Space for Kalyani Industrial Area')
ax.legend()

plt.savefig('kalyani_3d_visualization.png')
plt.close()

print('\nVisualizations saved as:')
print('1. kalyani_2d_predictions.png')
print('2. kalyani_3d_visualization.png')
