/**
 * Comprehensive list of Indian cities with coordinates.
 * AQI values here are baseline fallbacks only — the useCityAQI hook
 * fetches live data from the backend and overwrites them.
 */

export interface CityBase {
  name: string
  state: string
  lat: number
  lng: number
  /** Baseline AQI used before live data loads */
  baseAqi: number
}

export const CITY_LIST: CityBase[] = [
  // ── Uttar Pradesh ──────────────────────────────────────────────────
  { name: 'Delhi',           state: 'Delhi',           lat: 28.61,  lng: 77.21,  baseAqi: 312 },
  { name: 'Lucknow',         state: 'Uttar Pradesh',   lat: 26.85,  lng: 80.95,  baseAqi: 245 },
  { name: 'Kanpur',          state: 'Uttar Pradesh',   lat: 26.46,  lng: 80.33,  baseAqi: 289 },
  { name: 'Varanasi',        state: 'Uttar Pradesh',   lat: 25.32,  lng: 83.00,  baseAqi: 198 },
  { name: 'Agra',            state: 'Uttar Pradesh',   lat: 27.18,  lng: 78.01,  baseAqi: 210 },
  { name: 'Allahabad',       state: 'Uttar Pradesh',   lat: 25.44,  lng: 81.84,  baseAqi: 220 },
  { name: 'Meerut',          state: 'Uttar Pradesh',   lat: 28.98,  lng: 77.71,  baseAqi: 260 },
  { name: 'Ghaziabad',       state: 'Uttar Pradesh',   lat: 28.67,  lng: 77.45,  baseAqi: 295 },
  { name: 'Noida',           state: 'Uttar Pradesh',   lat: 28.54,  lng: 77.39,  baseAqi: 280 },
  { name: 'Mathura',         state: 'Uttar Pradesh',   lat: 27.49,  lng: 77.67,  baseAqi: 195 },
  { name: 'Bareilly',        state: 'Uttar Pradesh',   lat: 28.36,  lng: 79.42,  baseAqi: 215 },
  { name: 'Moradabad',       state: 'Uttar Pradesh',   lat: 28.84,  lng: 78.77,  baseAqi: 230 },
  { name: 'Gorakhpur',       state: 'Uttar Pradesh',   lat: 26.76,  lng: 83.37,  baseAqi: 185 },
  { name: 'Aligarh',         state: 'Uttar Pradesh',   lat: 27.88,  lng: 78.08,  baseAqi: 205 },
  { name: 'Firozabad',       state: 'Uttar Pradesh',   lat: 27.15,  lng: 78.39,  baseAqi: 200 },

  // ── Maharashtra ────────────────────────────────────────────────────
  { name: 'Mumbai',          state: 'Maharashtra',     lat: 19.07,  lng: 72.87,  baseAqi: 98  },
  { name: 'Pune',            state: 'Maharashtra',     lat: 18.52,  lng: 73.86,  baseAqi: 68  },
  { name: 'Nagpur',          state: 'Maharashtra',     lat: 21.15,  lng: 79.09,  baseAqi: 88  },
  { name: 'Nashik',          state: 'Maharashtra',     lat: 19.99,  lng: 73.79,  baseAqi: 75  },
  { name: 'Aurangabad',      state: 'Maharashtra',     lat: 19.88,  lng: 75.34,  baseAqi: 92  },
  { name: 'Solapur',         state: 'Maharashtra',     lat: 17.68,  lng: 75.90,  baseAqi: 80  },
  { name: 'Kolhapur',        state: 'Maharashtra',     lat: 16.70,  lng: 74.24,  baseAqi: 60  },
  { name: 'Amravati',        state: 'Maharashtra',     lat: 20.93,  lng: 77.75,  baseAqi: 85  },
  { name: 'Nanded',          state: 'Maharashtra',     lat: 19.15,  lng: 77.32,  baseAqi: 78  },
  { name: 'Thane',           state: 'Maharashtra',     lat: 19.22,  lng: 72.98,  baseAqi: 105 },

  // ── Karnataka ──────────────────────────────────────────────────────
  { name: 'Bengaluru',       state: 'Karnataka',       lat: 12.97,  lng: 77.59,  baseAqi: 62  },
  { name: 'Mysuru',          state: 'Karnataka',       lat: 12.30,  lng: 76.65,  baseAqi: 52  },
  { name: 'Hubli',           state: 'Karnataka',       lat: 15.36,  lng: 75.12,  baseAqi: 70  },
  { name: 'Mangaluru',       state: 'Karnataka',       lat: 12.87,  lng: 74.88,  baseAqi: 45  },
  { name: 'Belagavi',        state: 'Karnataka',       lat: 15.85,  lng: 74.50,  baseAqi: 65  },
  { name: 'Davanagere',      state: 'Karnataka',       lat: 14.46,  lng: 75.92,  baseAqi: 72  },
  { name: 'Ballari',         state: 'Karnataka',       lat: 15.14,  lng: 76.92,  baseAqi: 90  },
  { name: 'Shivamogga',      state: 'Karnataka',       lat: 13.93,  lng: 75.57,  baseAqi: 48  },

  // ── Tamil Nadu ─────────────────────────────────────────────────────
  { name: 'Chennai',         state: 'Tamil Nadu',      lat: 13.08,  lng: 80.27,  baseAqi: 55  },
  { name: 'Coimbatore',      state: 'Tamil Nadu',      lat: 11.02,  lng: 76.97,  baseAqi: 48  },
  { name: 'Madurai',         state: 'Tamil Nadu',      lat: 9.93,   lng: 78.12,  baseAqi: 58  },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu',      lat: 10.79,  lng: 78.70,  baseAqi: 52  },
  { name: 'Salem',           state: 'Tamil Nadu',      lat: 11.65,  lng: 78.16,  baseAqi: 55  },
  { name: 'Tirunelveli',     state: 'Tamil Nadu',      lat: 8.73,   lng: 77.70,  baseAqi: 42  },
  { name: 'Vellore',         state: 'Tamil Nadu',      lat: 12.92,  lng: 79.13,  baseAqi: 50  },
  { name: 'Ooty',            state: 'Tamil Nadu',      lat: 11.41,  lng: 76.69,  baseAqi: 28  },
  { name: 'Kodaikanal',      state: 'Tamil Nadu',      lat: 10.23,  lng: 77.49,  baseAqi: 22  },

  // ── West Bengal ────────────────────────────────────────────────────
  { name: 'Kolkata',         state: 'West Bengal',     lat: 22.57,  lng: 88.36,  baseAqi: 178 },
  { name: 'Howrah',          state: 'West Bengal',     lat: 22.59,  lng: 88.31,  baseAqi: 185 },
  { name: 'Durgapur',        state: 'West Bengal',     lat: 23.48,  lng: 87.32,  baseAqi: 155 },
  { name: 'Asansol',         state: 'West Bengal',     lat: 23.68,  lng: 86.98,  baseAqi: 162 },
  { name: 'Siliguri',        state: 'West Bengal',     lat: 26.72,  lng: 88.43,  baseAqi: 88  },
  { name: 'Darjeeling',      state: 'West Bengal',     lat: 27.04,  lng: 88.26,  baseAqi: 26  },

  // ── Rajasthan ──────────────────────────────────────────────────────
  { name: 'Jaipur',          state: 'Rajasthan',       lat: 26.91,  lng: 75.79,  baseAqi: 168 },
  { name: 'Jodhpur',         state: 'Rajasthan',       lat: 26.29,  lng: 73.02,  baseAqi: 155 },
  { name: 'Udaipur',         state: 'Rajasthan',       lat: 24.58,  lng: 73.68,  baseAqi: 88  },
  { name: 'Kota',            state: 'Rajasthan',       lat: 25.18,  lng: 75.84,  baseAqi: 145 },
  { name: 'Ajmer',           state: 'Rajasthan',       lat: 26.45,  lng: 74.64,  baseAqi: 130 },
  { name: 'Bikaner',         state: 'Rajasthan',       lat: 28.02,  lng: 73.31,  baseAqi: 148 },
  { name: 'Alwar',           state: 'Rajasthan',       lat: 27.56,  lng: 76.61,  baseAqi: 160 },
  { name: 'Bharatpur',       state: 'Rajasthan',       lat: 27.22,  lng: 77.49,  baseAqi: 155 },

  // ── Gujarat ────────────────────────────────────────────────────────
  { name: 'Ahmedabad',       state: 'Gujarat',         lat: 23.02,  lng: 72.57,  baseAqi: 145 },
  { name: 'Surat',           state: 'Gujarat',         lat: 21.17,  lng: 72.83,  baseAqi: 132 },
  { name: 'Vadodara',        state: 'Gujarat',         lat: 22.31,  lng: 73.18,  baseAqi: 118 },
  { name: 'Rajkot',          state: 'Gujarat',         lat: 22.30,  lng: 70.80,  baseAqi: 110 },
  { name: 'Bhavnagar',       state: 'Gujarat',         lat: 21.76,  lng: 72.15,  baseAqi: 95  },
  { name: 'Jamnagar',        state: 'Gujarat',         lat: 22.47,  lng: 70.07,  baseAqi: 88  },
  { name: 'Gandhinagar',     state: 'Gujarat',         lat: 23.22,  lng: 72.65,  baseAqi: 125 },
  { name: 'Anand',           state: 'Gujarat',         lat: 22.56,  lng: 72.95,  baseAqi: 105 },

  // ── Madhya Pradesh ─────────────────────────────────────────────────
  { name: 'Bhopal',          state: 'Madhya Pradesh',  lat: 23.26,  lng: 77.41,  baseAqi: 112 },
  { name: 'Indore',          state: 'Madhya Pradesh',  lat: 22.72,  lng: 75.86,  baseAqi: 105 },
  { name: 'Jabalpur',        state: 'Madhya Pradesh',  lat: 23.18,  lng: 79.94,  baseAqi: 98  },
  { name: 'Gwalior',         state: 'Madhya Pradesh',  lat: 26.22,  lng: 78.18,  baseAqi: 175 },
  { name: 'Ujjain',          state: 'Madhya Pradesh',  lat: 23.18,  lng: 75.78,  baseAqi: 108 },
  { name: 'Sagar',           state: 'Madhya Pradesh',  lat: 23.84,  lng: 78.74,  baseAqi: 95  },
  { name: 'Ratlam',          state: 'Madhya Pradesh',  lat: 23.33,  lng: 75.04,  baseAqi: 100 },

  // ── Bihar ──────────────────────────────────────────────────────────
  { name: 'Patna',           state: 'Bihar',           lat: 25.59,  lng: 85.13,  baseAqi: 267 },
  { name: 'Gaya',            state: 'Bihar',           lat: 24.80,  lng: 85.00,  baseAqi: 220 },
  { name: 'Muzaffarpur',     state: 'Bihar',           lat: 26.12,  lng: 85.39,  baseAqi: 240 },
  { name: 'Bhagalpur',       state: 'Bihar',           lat: 25.25,  lng: 87.01,  baseAqi: 195 },
  { name: 'Darbhanga',       state: 'Bihar',           lat: 26.15,  lng: 85.90,  baseAqi: 230 },

  // ── Telangana ──────────────────────────────────────────────────────
  { name: 'Hyderabad',       state: 'Telangana',       lat: 17.38,  lng: 78.48,  baseAqi: 72  },
  { name: 'Warangal',        state: 'Telangana',       lat: 17.97,  lng: 79.60,  baseAqi: 80  },
  { name: 'Nizamabad',       state: 'Telangana',       lat: 18.67,  lng: 78.10,  baseAqi: 75  },
  { name: 'Karimnagar',      state: 'Telangana',       lat: 18.44,  lng: 79.13,  baseAqi: 78  },
  { name: 'Khammam',         state: 'Telangana',       lat: 17.25,  lng: 80.15,  baseAqi: 70  },

  // ── Andhra Pradesh ─────────────────────────────────────────────────
  { name: 'Visakhapatnam',   state: 'Andhra Pradesh',  lat: 17.69,  lng: 83.22,  baseAqi: 78  },
  { name: 'Vijayawada',      state: 'Andhra Pradesh',  lat: 16.51,  lng: 80.62,  baseAqi: 85  },
  { name: 'Guntur',          state: 'Andhra Pradesh',  lat: 16.31,  lng: 80.44,  baseAqi: 80  },
  { name: 'Nellore',         state: 'Andhra Pradesh',  lat: 14.44,  lng: 79.99,  baseAqi: 65  },
  { name: 'Kurnool',         state: 'Andhra Pradesh',  lat: 15.83,  lng: 78.04,  baseAqi: 72  },
  { name: 'Tirupati',        state: 'Andhra Pradesh',  lat: 13.63,  lng: 79.42,  baseAqi: 58  },

  // ── Kerala ─────────────────────────────────────────────────────────
  { name: 'Kochi',           state: 'Kerala',          lat: 9.93,   lng: 76.26,  baseAqi: 42  },
  { name: 'Thiruvananthapuram', state: 'Kerala',       lat: 8.52,   lng: 76.94,  baseAqi: 38  },
  { name: 'Kozhikode',       state: 'Kerala',          lat: 11.25,  lng: 75.78,  baseAqi: 40  },
  { name: 'Thrissur',        state: 'Kerala',          lat: 10.52,  lng: 76.21,  baseAqi: 44  },
  { name: 'Kollam',          state: 'Kerala',          lat: 8.89,   lng: 76.61,  baseAqi: 36  },
  { name: 'Munnar',          state: 'Kerala',          lat: 10.09,  lng: 77.06,  baseAqi: 18  },
  { name: 'Alleppey',        state: 'Kerala',          lat: 9.49,   lng: 76.33,  baseAqi: 40  },

  // ── Punjab & Haryana ───────────────────────────────────────────────
  { name: 'Amritsar',        state: 'Punjab',          lat: 31.63,  lng: 74.87,  baseAqi: 188 },
  { name: 'Ludhiana',        state: 'Punjab',          lat: 30.90,  lng: 75.85,  baseAqi: 195 },
  { name: 'Jalandhar',       state: 'Punjab',          lat: 31.33,  lng: 75.58,  baseAqi: 178 },
  { name: 'Patiala',         state: 'Punjab',          lat: 30.34,  lng: 76.39,  baseAqi: 165 },
  { name: 'Chandigarh',      state: 'Punjab/Haryana',  lat: 30.73,  lng: 76.78,  baseAqi: 142 },
  { name: 'Faridabad',       state: 'Haryana',         lat: 28.41,  lng: 77.31,  baseAqi: 268 },
  { name: 'Gurugram',        state: 'Haryana',         lat: 28.46,  lng: 77.03,  baseAqi: 255 },
  { name: 'Panipat',         state: 'Haryana',         lat: 29.39,  lng: 76.97,  baseAqi: 210 },
  { name: 'Ambala',          state: 'Haryana',         lat: 30.38,  lng: 76.78,  baseAqi: 155 },
  { name: 'Hisar',           state: 'Haryana',         lat: 29.15,  lng: 75.72,  baseAqi: 175 },
  { name: 'Rohtak',          state: 'Haryana',         lat: 28.89,  lng: 76.59,  baseAqi: 185 },

  // ── Odisha ─────────────────────────────────────────────────────────
  { name: 'Bhubaneswar',     state: 'Odisha',          lat: 20.30,  lng: 85.82,  baseAqi: 92  },
  { name: 'Cuttack',         state: 'Odisha',          lat: 20.46,  lng: 85.88,  baseAqi: 98  },
  { name: 'Rourkela',        state: 'Odisha',          lat: 22.22,  lng: 84.86,  baseAqi: 115 },
  { name: 'Puri',            state: 'Odisha',          lat: 19.81,  lng: 85.83,  baseAqi: 55  },
  { name: 'Sambalpur',       state: 'Odisha',          lat: 21.47,  lng: 83.97,  baseAqi: 105 },

  // ── Jharkhand ──────────────────────────────────────────────────────
  { name: 'Ranchi',          state: 'Jharkhand',       lat: 23.35,  lng: 85.33,  baseAqi: 118 },
  { name: 'Jamshedpur',      state: 'Jharkhand',       lat: 22.80,  lng: 86.18,  baseAqi: 135 },
  { name: 'Dhanbad',         state: 'Jharkhand',       lat: 23.80,  lng: 86.45,  baseAqi: 165 },
  { name: 'Bokaro',          state: 'Jharkhand',       lat: 23.67,  lng: 86.15,  baseAqi: 148 },

  // ── Chhattisgarh ───────────────────────────────────────────────────
  { name: 'Raipur',          state: 'Chhattisgarh',    lat: 21.25,  lng: 81.63,  baseAqi: 125 },
  { name: 'Bhilai',          state: 'Chhattisgarh',    lat: 21.21,  lng: 81.43,  baseAqi: 138 },
  { name: 'Bilaspur',        state: 'Chhattisgarh',    lat: 22.09,  lng: 82.15,  baseAqi: 112 },
  { name: 'Korba',           state: 'Chhattisgarh',    lat: 22.35,  lng: 82.68,  baseAqi: 155 },

  // ── Assam & NE ─────────────────────────────────────────────────────
  { name: 'Guwahati',        state: 'Assam',           lat: 26.14,  lng: 91.74,  baseAqi: 82  },
  { name: 'Dibrugarh',       state: 'Assam',           lat: 27.48,  lng: 94.91,  baseAqi: 65  },
  { name: 'Silchar',         state: 'Assam',           lat: 24.83,  lng: 92.80,  baseAqi: 70  },
  { name: 'Shillong',        state: 'Meghalaya',       lat: 25.57,  lng: 91.88,  baseAqi: 24  },
  { name: 'Aizawl',          state: 'Mizoram',         lat: 23.73,  lng: 92.72,  baseAqi: 20  },
  { name: 'Imphal',          state: 'Manipur',         lat: 24.82,  lng: 93.95,  baseAqi: 35  },
  { name: 'Agartala',        state: 'Tripura',         lat: 23.83,  lng: 91.28,  baseAqi: 45  },
  { name: 'Kohima',          state: 'Nagaland',        lat: 25.67,  lng: 94.11,  baseAqi: 22  },
  { name: 'Itanagar',        state: 'Arunachal Pradesh', lat: 27.08, lng: 93.61, baseAqi: 28  },
  { name: 'Gangtok',         state: 'Sikkim',          lat: 27.33,  lng: 88.61,  baseAqi: 20  },

  // ── Himachal Pradesh & Uttarakhand ─────────────────────────────────
  { name: 'Shimla',          state: 'Himachal Pradesh', lat: 31.10, lng: 77.17,  baseAqi: 28  },
  { name: 'Manali',          state: 'Himachal Pradesh', lat: 32.24, lng: 77.19,  baseAqi: 22  },
  { name: 'Dharamshala',     state: 'Himachal Pradesh', lat: 32.22, lng: 76.32,  baseAqi: 25  },
  { name: 'Solan',           state: 'Himachal Pradesh', lat: 30.91, lng: 77.10,  baseAqi: 35  },
  { name: 'Dehradun',        state: 'Uttarakhand',     lat: 30.32,  lng: 78.03,  baseAqi: 95  },
  { name: 'Haridwar',        state: 'Uttarakhand',     lat: 29.95,  lng: 78.16,  baseAqi: 88  },
  { name: 'Rishikesh',       state: 'Uttarakhand',     lat: 30.09,  lng: 78.27,  baseAqi: 45  },
  { name: 'Mussoorie',       state: 'Uttarakhand',     lat: 30.45,  lng: 78.07,  baseAqi: 30  },
  { name: 'Nainital',        state: 'Uttarakhand',     lat: 29.38,  lng: 79.46,  baseAqi: 32  },
  { name: 'Haldwani',        state: 'Uttarakhand',     lat: 29.22,  lng: 79.52,  baseAqi: 85  },

  // ── J&K & Ladakh ───────────────────────────────────────────────────
  { name: 'Srinagar',        state: 'J&K',             lat: 34.08,  lng: 74.80,  baseAqi: 68  },
  { name: 'Jammu',           state: 'J&K',             lat: 32.73,  lng: 74.87,  baseAqi: 118 },
  { name: 'Leh',             state: 'Ladakh',          lat: 34.17,  lng: 77.58,  baseAqi: 15  },
  { name: 'Kargil',          state: 'Ladakh',          lat: 34.56,  lng: 76.13,  baseAqi: 18  },

  // ── Goa ────────────────────────────────────────────────────────────
  { name: 'Panaji',          state: 'Goa',             lat: 15.50,  lng: 73.83,  baseAqi: 35  },
  { name: 'Margao',          state: 'Goa',             lat: 15.28,  lng: 73.96,  baseAqi: 38  },
  { name: 'Vasco da Gama',   state: 'Goa',             lat: 15.40,  lng: 73.81,  baseAqi: 42  },

  // ── Puducherry & Union Territories ────────────────────────────────
  { name: 'Puducherry',      state: 'Puducherry',      lat: 11.93,  lng: 79.83,  baseAqi: 48  },
  { name: 'Port Blair',      state: 'Andaman & Nicobar', lat: 11.67, lng: 92.74, baseAqi: 22  },

  // ── Additional metros & industrial cities ──────────────────────────
  { name: 'Faridabad',       state: 'Haryana',         lat: 28.41,  lng: 77.31,  baseAqi: 268 },
  { name: 'Mira-Bhayandar',  state: 'Maharashtra',     lat: 19.29,  lng: 72.85,  baseAqi: 110 },
  { name: 'Vasai-Virar',     state: 'Maharashtra',     lat: 19.47,  lng: 72.81,  baseAqi: 108 },
  { name: 'Kalyan',          state: 'Maharashtra',     lat: 19.24,  lng: 73.13,  baseAqi: 112 },
  { name: 'Navi Mumbai',     state: 'Maharashtra',     lat: 19.03,  lng: 73.02,  baseAqi: 95  },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra',   lat: 18.63,  lng: 73.80,  baseAqi: 72  },
  { name: 'Bhiwandi',        state: 'Maharashtra',     lat: 19.30,  lng: 73.06,  baseAqi: 118 },
  { name: 'Solapur',         state: 'Maharashtra',     lat: 17.68,  lng: 75.90,  baseAqi: 80  },
  { name: 'Dhule',           state: 'Maharashtra',     lat: 20.90,  lng: 74.78,  baseAqi: 88  },
  { name: 'Latur',           state: 'Maharashtra',     lat: 18.40,  lng: 76.56,  baseAqi: 75  },
]

// Deduplicate by name+state
const seen = new Set<string>()
export const CITIES: CityBase[] = CITY_LIST.filter(c => {
  const key = `${c.name}|${c.state}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})
