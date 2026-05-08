"""Script to generate air_quality.csv and sample_upload.csv datasets."""
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)

def gen_rows(n, pm25_range, pm10_range, no2_range, so2_range, co_range, o3_range, aqi_range, category):
    pm25 = rng.uniform(*pm25_range, n).round(2)
    pm10 = rng.uniform(*pm10_range, n).round(2)
    no2  = rng.uniform(*no2_range,  n).round(2)
    so2  = rng.uniform(*so2_range,  n).round(2)
    co   = rng.uniform(*co_range,   n).round(2)
    o3   = rng.uniform(*o3_range,   n).round(2)
    aqi  = rng.integers(*aqi_range, n, endpoint=True)
    return pd.DataFrame({
        "PM2.5": pm25, "PM10": pm10, "NO2": no2,
        "SO2": so2, "CO": co, "O3": o3,
        "AQI": aqi, "AQI_Category": category
    })

categories = [
    (200, (0, 12),    (0, 54),    (0, 53),      (0, 35),    (0, 4.4),    (0, 54),    (0, 50),    "Good"),
    (200, (12, 35),   (54, 154),  (53, 100),    (35, 75),   (4.4, 9.4),  (55, 70),   (51, 100),  "Moderate"),
    (200, (35, 55),   (154, 254), (100, 360),   (75, 185),  (9.4, 12.4), (71, 85),   (101, 150), "Unhealthy for Sensitive Groups"),
    (150, (55, 150),  (254, 354), (360, 649),   (185, 304), (12.4, 15.4),(86, 105),  (151, 200), "Unhealthy"),
    (150, (150, 250), (354, 424), (649, 1249),  (304, 604), (15.4, 30.4),(106, 200), (201, 300), "Very Unhealthy"),
    (100, (250, 500), (424, 604), (1249, 2049), (604, 1004),(30.4, 50.4),(201, 504), (301, 500), "Hazardous"),
]

frames = [gen_rows(n, pm25, pm10, no2, so2, co, o3, aqi, cat)
          for n, pm25, pm10, no2, so2, co, o3, aqi, cat in categories]

df = pd.concat(frames, ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)
df.to_csv("air_quality.csv", index=False)
print(f"air_quality.csv written: {len(df)} rows")

# ── sample_upload.csv ──────────────────────────────────────────────────────────
valid_rows = [
    {"PM2.5": 5.1,  "PM10": 20.3, "NO2": 15.0, "SO2": 8.0,  "CO": 1.2, "O3": 30.0},
    {"PM2.5": 10.0, "PM10": 45.0, "NO2": 40.0, "SO2": 20.0, "CO": 3.0, "O3": 48.0},
    {"PM2.5": 20.5, "PM10": 80.0, "NO2": 65.0, "SO2": 50.0, "CO": 6.0, "O3": 60.0},
    {"PM2.5": 30.0, "PM10": 120.0,"NO2": 80.0, "SO2": 60.0, "CO": 8.0, "O3": 65.0},
    {"PM2.5": 40.0, "PM10": 180.0,"NO2": 150.0,"SO2": 100.0,"CO": 10.0,"O3": 75.0},
    {"PM2.5": 50.0, "PM10": 220.0,"NO2": 200.0,"SO2": 130.0,"CO": 11.5,"O3": 80.0},
    {"PM2.5": 70.0, "PM10": 280.0,"NO2": 400.0,"SO2": 200.0,"CO": 13.0,"O3": 90.0},
    {"PM2.5": 100.0,"PM10": 320.0,"NO2": 500.0,"SO2": 250.0,"CO": 14.5,"O3": 100.0},
    {"PM2.5": 160.0,"PM10": 370.0,"NO2": 700.0,"SO2": 350.0,"CO": 18.0,"O3": 130.0},
    {"PM2.5": 200.0,"PM10": 400.0,"NO2": 900.0,"SO2": 450.0,"CO": 22.0,"O3": 160.0},
    {"PM2.5": 260.0,"PM10": 440.0,"NO2": 1300.0,"SO2": 650.0,"CO": 35.0,"O3": 220.0},
    {"PM2.5": 350.0,"PM10": 500.0,"NO2": 1600.0,"SO2": 750.0,"CO": 40.0,"O3": 300.0},
    {"PM2.5": 8.0,  "PM10": 30.0, "NO2": 25.0, "SO2": 12.0, "CO": 2.0, "O3": 40.0},
    {"PM2.5": 15.0, "PM10": 60.0, "NO2": 55.0, "SO2": 38.0, "CO": 5.0, "O3": 58.0},
    {"PM2.5": 45.0, "PM10": 200.0,"NO2": 180.0,"SO2": 120.0,"CO": 11.0,"O3": 78.0},
    {"PM2.5": 0.5,  "PM10": 5.0,  "NO2": 3.0,  "SO2": 1.0,  "CO": 0.3, "O3": 10.0},
    {"PM2.5": 120.0,"PM10": 340.0,"NO2": 550.0,"SO2": 270.0,"CO": 14.0,"O3": 95.0},
]

invalid_rows = [
    {"PM2.5": -5,    "PM10": 20.0, "NO2": 15.0, "SO2": 8.0,  "CO": 1.2, "O3": 30.0},   # negative value
    {"PM2.5": "abc", "PM10": 45.0, "NO2": 40.0, "SO2": 20.0, "CO": 3.0, "O3": 48.0},   # non-numeric
    {"PM2.5": 9999,  "PM10": 80.0, "NO2": 65.0, "SO2": 50.0, "CO": 6.0, "O3": 60.0},   # out-of-range
]

sample_df = pd.DataFrame(valid_rows + invalid_rows)
sample_df.to_csv("sample_upload.csv", index=False)
print(f"sample_upload.csv written: {len(sample_df)} rows ({len(valid_rows)} valid, {len(invalid_rows)} invalid)")
