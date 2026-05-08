"""
Static health impact data for all 6 AQI categories x 6 organs.
Each entry contains medically accurate, distinct descriptions per category.
"""

HEALTH_IMPACT_DATA: dict[str, dict[str, dict]] = {

    # GOOD (AQI 0-50)
    "Good": {
        "Lungs": {
            "risk_level": "Low",
            "severity_score": 3,
            "description": (
                "Air quality is excellent. Pulmonary function operates at full capacity with "
                "no measurable airway irritation. Alveolar gas exchange is optimal, and "
                "ciliary clearance mechanisms function without impairment."
            ),
            "prevention_tips": [
                "Maintain regular aerobic exercise to strengthen respiratory muscles.",
                "Practice diaphragmatic breathing to maximise lung capacity.",
            ],
            "precautions": [
                "No special precautions required for the general population.",
                "Individuals with severe asthma may still carry a rescue inhaler as routine practice.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "Safe for all outdoor play and physical education activities.",
                "elderly": "Ideal conditions for gentle walks and outdoor recreation.",
                "pregnant": "No restrictions; outdoor activity is encouraged for cardiovascular health.",
                "asthma": "Low risk; standard maintenance medication regimen is sufficient.",
                "cardiovascular": "Excellent conditions for cardiac rehabilitation exercises.",
            },
        },
        "Heart": {
            "risk_level": "Low",
            "severity_score": 2,
            "description": (
                "Cardiovascular stress from airborne pollutants is negligible. Particulate matter "
                "concentrations are too low to trigger systemic inflammation or endothelial "
                "dysfunction. Heart rate variability remains normal."
            ),
            "prevention_tips": [
                "Use clean-air days for moderate-to-vigorous cardiovascular exercise.",
                "Maintain a heart-healthy diet rich in antioxidants to support vascular health.",
            ],
            "precautions": [
                "No air-quality-related precautions needed.",
                "Continue prescribed cardiac medications as directed by your physician.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "No cardiovascular risk from air quality; normal activity recommended.",
                "elderly": "Excellent opportunity for low-impact cardio such as walking or cycling.",
                "pregnant": "Safe for moderate exercise; supports healthy placental circulation.",
                "asthma": "No additional cardiac burden from air quality at this level.",
                "cardiovascular": "Optimal conditions; patients may exercise at prescribed intensity.",
            },
        },
        "Brain": {
            "risk_level": "Low",
            "severity_score": 3,
            "description": (
                "Neurological exposure to air pollutants is at baseline. Cerebral blood flow "
                "is unaffected, and there is no detectable neuroinflammatory response. Cognitive "
                "performance, attention, and mood are not impaired by ambient air quality."
            ),
            "prevention_tips": [
                "Engage in outdoor mindfulness or meditation to leverage clean air for mental clarity.",
                "Ensure adequate sleep to support neurological repair processes.",
            ],
            "precautions": [
                "No air-quality-related neurological precautions required.",
                "Maintain hydration to support optimal cerebral perfusion.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "Neurodevelopment proceeds without air-quality interference.",
                "elderly": "No increased dementia or cognitive decline risk from current air quality.",
                "pregnant": "Fetal neurological development is not threatened at this AQI level.",
                "asthma": "No neurological complications from air quality.",
                "cardiovascular": "Cerebral perfusion is unaffected; no additional risk.",
            },
        },
        "Skin": {
            "risk_level": "Low",
            "severity_score": 2,
            "description": (
                "Dermal exposure to pollutants is minimal. The skin barrier remains intact with "
                "no measurable increase in transepidermal water loss or oxidative damage to "
                "lipid membranes. Sebaceous gland function is normal."
            ),
            "prevention_tips": [
                "Apply a broad-spectrum SPF 30+ sunscreen when spending extended time outdoors.",
                "Cleanse skin gently after outdoor activities to remove trace particulates.",
            ],
            "precautions": [
                "No special skin protection measures required beyond routine skincare.",
                "Individuals with active eczema should continue prescribed topical treatments.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "Delicate skin is not at elevated risk; normal outdoor play is safe.",
                "elderly": "Thinner skin barrier is not significantly challenged at this AQI.",
                "pregnant": "No pollution-related skin concerns; hormonal changes are the primary skin factor.",
                "asthma": "No skin-related concerns linked to air quality.",
                "cardiovascular": "No dermal vascular stress from air quality at this level.",
            },
        },
        "Eyes": {
            "risk_level": "Low",
            "severity_score": 2,
            "description": (
                "Ocular surface exposure to irritants is negligible. Tear film stability is "
                "maintained, and conjunctival goblet cell density is unaffected. There is no "
                "measurable increase in ocular surface inflammation."
            ),
            "prevention_tips": [
                "Wear UV-protective sunglasses during prolonged outdoor exposure.",
                "Maintain adequate hydration to support healthy tear film production.",
            ],
            "precautions": [
                "No air-quality-related eye precautions required.",
                "Contact lens wearers should follow standard hygiene protocols.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "Eyes are not at elevated risk; outdoor activities are unrestricted.",
                "elderly": "Dry eye conditions are not worsened by current air quality.",
                "pregnant": "No ocular concerns related to air quality at this level.",
                "asthma": "No eye-related complications from air quality.",
                "cardiovascular": "No ocular vascular stress attributable to air quality.",
            },
        },
        "Immune System": {
            "risk_level": "Low",
            "severity_score": 3,
            "description": (
                "Immune system function is not challenged by ambient air pollutants. "
                "Innate and adaptive immune responses operate normally, with no pollution-induced "
                "upregulation of pro-inflammatory cytokines. Mucosal immunity in the respiratory "
                "tract is intact."
            ),
            "prevention_tips": [
                "Maintain a balanced diet rich in vitamins C, D, and zinc to support immune function.",
                "Engage in regular moderate exercise to enhance immune surveillance.",
            ],
            "precautions": [
                "No air-quality-related immune precautions required.",
                "Continue any prescribed immunosuppressive or immunomodulatory therapies as directed.",
            ],
            "action_urgency": "Monitor",
            "sensitive_group_notes": {
                "children": "Developing immune systems are not stressed by current air quality.",
                "elderly": "Immunosenescence is not compounded by air quality at this level.",
                "pregnant": "Gestational immune adaptations are not disrupted by current air quality.",
                "asthma": "Airway immune hyperreactivity is not triggered at this AQI.",
                "cardiovascular": "No immune-mediated vascular inflammation from air quality.",
            },
        },
    },

    # MODERATE (AQI 51-100)
    "Moderate": {
        "Lungs": {
            "risk_level": "Moderate",
            "severity_score": 18,
            "description": (
                "Mild airway irritation may occur in unusually sensitive individuals during "
                "prolonged outdoor exertion. Ground-level ozone at moderate concentrations can "
                "cause transient bronchial inflammation, slightly reducing forced expiratory volume."
            ),
            "prevention_tips": [
                "Limit strenuous outdoor exercise to morning hours when ozone levels are lower.",
                "Stay hydrated to maintain mucociliary clearance efficiency.",
            ],
            "precautions": [
                "Sensitive individuals should reduce prolonged heavy exertion outdoors.",
                "Monitor for early symptoms such as mild cough or throat irritation.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "Active children may notice mild throat irritation after prolonged outdoor play.",
                "elderly": "Reduced respiratory reserve means mild symptoms are more likely; shorten outdoor sessions.",
                "pregnant": "Slightly elevated ozone may reduce oxygen delivery efficiency; avoid peak-hour outdoor exercise.",
                "asthma": "Carry rescue inhaler; ozone can trigger mild bronchospasm in sensitive airways.",
                "cardiovascular": "Mild particulate exposure may slightly elevate heart rate during exertion.",
            },
        },
        "Heart": {
            "risk_level": "Moderate",
            "severity_score": 16,
            "description": (
                "Cardiovascular impact remains low but trace fine particulate matter (PM2.5) "
                "begins to enter the pulmonary circulation. Subclinical endothelial micro-stress "
                "may occur in individuals with pre-existing atherosclerosis."
            ),
            "prevention_tips": [
                "Schedule high-intensity cardio workouts for times when AQI is lower.",
                "Consume omega-3 fatty acids to support endothelial anti-inflammatory defences.",
            ],
            "precautions": [
                "Cardiac patients should avoid peak-pollution hours for outdoor exercise.",
                "Monitor resting heart rate for any unexplained elevation.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "No significant cardiac risk; normal activity is appropriate.",
                "elderly": "Mild arterial stiffness may be marginally worsened; prefer indoor exercise.",
                "pregnant": "Slight increase in cardiac output demand; rest if feeling breathless.",
                "asthma": "No direct cardiac risk beyond shared inflammatory pathway.",
                "cardiovascular": "Patients with heart failure or arrhythmia should reduce outdoor exertion duration.",
            },
        },
        "Brain": {
            "risk_level": "Moderate",
            "severity_score": 15,
            "description": (
                "Neurological effects at moderate AQI are subtle and primarily affect highly "
                "sensitive individuals. Trace ultrafine particles may cross the blood-brain "
                "barrier via the olfactory pathway, but at concentrations too low to cause "
                "measurable cognitive impairment in healthy adults."
            ),
            "prevention_tips": [
                "Take short breaks indoors during extended outdoor activities.",
                "Ensure adequate ventilation in workspaces to dilute any infiltrating outdoor pollutants.",
            ],
            "precautions": [
                "If headache develops during outdoor activity, move indoors and rest.",
                "Avoid prolonged outdoor exposure during peak afternoon ozone hours.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "Developing brains are more susceptible; limit outdoor play to under 2 hours continuously.",
                "elderly": "Those with mild cognitive impairment may notice slight worsening of concentration.",
                "pregnant": "Fetal brain development is not significantly threatened at this level.",
                "asthma": "Hypoxia from bronchospasm can amplify neurological symptoms; manage airways first.",
                "cardiovascular": "Reduced cerebral perfusion during cardiac events may be marginally worsened.",
            },
        },
        "Skin": {
            "risk_level": "Moderate",
            "severity_score": 20,
            "description": (
                "At moderate AQI, polycyclic aromatic hydrocarbons (PAHs) and ozone begin to "
                "generate measurable reactive oxygen species on the skin surface. This can "
                "mildly degrade squalene in the sebum layer, reducing the skin's natural antioxidant defence."
            ),
            "prevention_tips": [
                "Apply an antioxidant serum (vitamin C or E) before outdoor exposure.",
                "Use a moisturiser with ceramides to reinforce the skin barrier.",
            ],
            "precautions": [
                "Those with rosacea or eczema should limit continuous outdoor exposure to under 2 hours.",
                "Avoid touching the face with unwashed hands after outdoor activities.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "Children's thinner stratum corneum may show mild dryness; apply moisturiser post-play.",
                "elderly": "Reduced skin repair capacity means oxidative damage accumulates faster; use antioxidant skincare.",
                "pregnant": "Hormonal skin sensitivity may amplify mild irritation; use gentle, fragrance-free products.",
                "asthma": "No direct skin risk beyond shared inflammatory tendency.",
                "cardiovascular": "No specific dermal vascular concern at this level.",
            },
        },
        "Eyes": {
            "risk_level": "Moderate",
            "severity_score": 17,
            "description": (
                "Ozone and nitrogen dioxide at moderate concentrations can mildly irritate the "
                "conjunctival epithelium, causing transient watering or a gritty sensation in "
                "sensitive individuals. Tear film break-up time may be marginally reduced."
            ),
            "prevention_tips": [
                "Wear wrap-around sunglasses to reduce direct pollutant contact with the ocular surface.",
                "Use preservative-free artificial tears if dryness or irritation develops.",
            ],
            "precautions": [
                "Contact lens wearers should consider switching to glasses on days with elevated ozone.",
                "Avoid rubbing eyes after outdoor exposure to prevent mechanical irritation.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "Eyes may water slightly during outdoor play; this is typically self-limiting.",
                "elderly": "Reduced tear production makes eyes more susceptible to mild irritation.",
                "pregnant": "Hormonal changes already affect tear film; moderate AQI may compound dryness.",
                "asthma": "No specific ocular risk beyond general sensitivity.",
                "cardiovascular": "No ocular vascular concern at this AQI level.",
            },
        },
        "Immune System": {
            "risk_level": "Moderate",
            "severity_score": 16,
            "description": (
                "Moderate pollutant levels begin to place a low-grade burden on mucosal immune "
                "defences. Airway macrophages increase phagocytic activity to clear inhaled "
                "particulates, which may slightly divert immune resources from pathogen surveillance."
            ),
            "prevention_tips": [
                "Ensure adequate vitamin D levels, which modulate both innate and adaptive immunity.",
                "Consume probiotic-rich foods to support gut-mucosal immune axis.",
            ],
            "precautions": [
                "Immunocompromised individuals should limit prolonged outdoor exposure.",
                "Wash hands and face after outdoor activities to reduce mucosal pollutant load.",
            ],
            "action_urgency": "Caution",
            "sensitive_group_notes": {
                "children": "Immature immune systems may mount a slightly exaggerated inflammatory response.",
                "elderly": "Baseline immune decline means even low-grade pollutant burden is more significant.",
                "pregnant": "Gestational immune suppression makes additional pollutant burden undesirable.",
                "asthma": "Airway immune hyperreactivity may be mildly amplified; monitor symptoms.",
                "cardiovascular": "Low-grade systemic inflammation from pollutants may marginally affect vascular immunity.",
            },
        },
    },

    # UNHEALTHY FOR SENSITIVE GROUPS (AQI 101-150)
    "Unhealthy for Sensitive Groups": {
        "Lungs": {
            "risk_level": "High",
            "severity_score": 40,
            "description": (
                "Sensitive individuals including asthmatics, children, and the elderly may "
                "experience significant respiratory symptoms. PM2.5 penetrates deep into the "
                "alveoli, triggering inflammatory responses. Bronchial hyperreactivity is "
                "markedly elevated, and FEV1 may decrease by 5-10% in sensitive groups."
            ),
            "prevention_tips": [
                "Sensitive groups should avoid prolonged outdoor exertion entirely.",
                "Use HEPA air purifiers indoors to maintain clean indoor air quality.",
            ],
            "precautions": [
                "Asthmatics should have rescue inhalers readily accessible at all times.",
                "Monitor peak flow readings twice daily if you have asthma or COPD.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "Restrict outdoor play; switch to indoor activities for the day.",
                "elderly": "Avoid all non-essential outdoor activity; keep windows closed.",
                "pregnant": "Limit outdoor exposure to under 30 minutes; avoid busy roads.",
                "asthma": "High risk of acute exacerbation; pre-medicate before any outdoor activity.",
                "cardiovascular": "Increased risk of angina or arrhythmia during outdoor exertion.",
            },
        },
        "Heart": {
            "risk_level": "High",
            "severity_score": 38,
            "description": (
                "Fine particulate matter at this level enters systemic circulation and triggers "
                "measurable endothelial inflammation. C-reactive protein levels rise, and "
                "platelet aggregation increases, elevating thrombotic risk. Individuals with "
                "coronary artery disease face a statistically significant increase in cardiac event risk."
            ),
            "prevention_tips": [
                "Cardiac patients should reschedule outdoor exercise to lower-AQI days.",
                "Increase antioxidant intake through diet to counter systemic oxidative stress.",
            ],
            "precautions": [
                "Patients with heart failure should monitor for increased breathlessness or ankle swelling.",
                "Keep nitroglycerin or other emergency cardiac medications accessible.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "No direct cardiac risk for healthy children; general outdoor restriction applies.",
                "elderly": "Elevated risk of atrial fibrillation episodes; avoid outdoor exertion.",
                "pregnant": "Increased cardiac workload from pregnancy combined with pollution stress; rest indoors.",
                "asthma": "Shared inflammatory pathway may compound cardiac stress.",
                "cardiovascular": "High risk; avoid all strenuous outdoor activity and monitor symptoms closely.",
            },
        },
        "Brain": {
            "risk_level": "Moderate",
            "severity_score": 35,
            "description": (
                "Ultrafine particles and nitrogen dioxide at this level can cross the blood-brain "
                "barrier in measurable quantities. Neuroinflammatory markers begin to rise, and "
                "sensitive individuals may experience headaches, difficulty concentrating, or "
                "mild cognitive fog during prolonged outdoor exposure."
            ),
            "prevention_tips": [
                "Limit outdoor exposure and take regular indoor breaks to reduce cumulative neurological burden.",
                "Stay well-hydrated as dehydration amplifies neurological sensitivity to pollutants.",
            ],
            "precautions": [
                "If persistent headache or confusion develops, move indoors immediately and seek medical advice.",
                "Avoid driving or operating machinery if experiencing cognitive symptoms.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "Neurodevelopmental risk is elevated; limit outdoor time to under 1 hour.",
                "elderly": "Those with dementia or Parkinson's may experience symptom worsening.",
                "pregnant": "Fetal brain development may be affected by sustained exposure; stay indoors.",
                "asthma": "Hypoxia from airway restriction amplifies neurological symptoms.",
                "cardiovascular": "Reduced cerebral perfusion risk is elevated; avoid exertion.",
            },
        },
        "Skin": {
            "risk_level": "High",
            "severity_score": 42,
            "description": (
                "Elevated particulate matter and ozone cause significant oxidative stress on the "
                "skin surface. Squalene oxidation products accumulate, disrupting the skin barrier "
                "and triggering inflammatory cascades. Individuals with eczema, psoriasis, or "
                "acne may experience noticeable flare-ups after outdoor exposure."
            ),
            "prevention_tips": [
                "Apply a physical barrier cream or zinc-based sunscreen before going outdoors.",
                "Double-cleanse skin upon returning indoors to remove particulate deposits.",
            ],
            "precautions": [
                "Those with active inflammatory skin conditions should minimise outdoor exposure.",
                "Avoid exfoliating treatments on days with elevated AQI as the skin barrier is compromised.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "Eczema-prone children are at high risk of flare-ups; keep indoors.",
                "elderly": "Impaired skin repair means oxidative damage is more persistent.",
                "pregnant": "Skin barrier changes during pregnancy increase pollutant absorption risk.",
                "asthma": "Shared atopic tendency means skin and airway inflammation may co-occur.",
                "cardiovascular": "Dermal vascular inflammation may contribute to systemic inflammatory load.",
            },
        },
        "Eyes": {
            "risk_level": "Moderate",
            "severity_score": 33,
            "description": (
                "Particulate matter and ozone at this level cause measurable conjunctival "
                "inflammation. Goblet cell density begins to decrease with repeated exposure, "
                "reducing mucin production and tear film stability. Symptoms include persistent "
                "redness, burning, and increased light sensitivity in sensitive individuals."
            ),
            "prevention_tips": [
                "Use lubricating eye drops before and after outdoor exposure.",
                "Wear close-fitting goggles or glasses to physically shield the ocular surface.",
            ],
            "precautions": [
                "Contact lens wearers should switch to glasses for the day.",
                "Avoid eye makeup that may trap particulates near the ocular surface.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "Children's eyes are more sensitive; avoid prolonged outdoor exposure.",
                "elderly": "Dry eye syndrome is significantly worsened; use lubricating drops frequently.",
                "pregnant": "Hormonal tear film instability is compounded; use preservative-free drops.",
                "asthma": "Shared atopic tendency may cause allergic conjunctivitis flare-ups.",
                "cardiovascular": "No specific additional ocular risk beyond general population.",
            },
        },
        "Immune System": {
            "risk_level": "High",
            "severity_score": 38,
            "description": (
                "Sustained particulate exposure at this level significantly burdens the innate "
                "immune system. Alveolar macrophages become overwhelmed, reducing pathogen "
                "clearance efficiency. Systemic pro-inflammatory cytokine levels rise measurably, "
                "and susceptibility to respiratory infections increases by approximately 20-30%."
            ),
            "prevention_tips": [
                "Ensure up-to-date vaccinations, particularly for influenza and pneumococcal disease.",
                "Increase intake of immune-supporting nutrients including vitamin C, zinc, and selenium.",
            ],
            "precautions": [
                "Immunocompromised individuals should stay indoors and use air purifiers.",
                "Avoid crowded indoor spaces where infection risk compounds pollution-related immune suppression.",
            ],
            "action_urgency": "Avoid Outdoors",
            "sensitive_group_notes": {
                "children": "Infection susceptibility is elevated; avoid crowded outdoor settings.",
                "elderly": "Immune response to pathogens is significantly impaired; stay indoors.",
                "pregnant": "Gestational immune suppression combined with pollution burden increases infection risk.",
                "asthma": "Airway immune defences are compromised; risk of secondary respiratory infection rises.",
                "cardiovascular": "Systemic inflammation from immune activation may stress the cardiovascular system.",
            },
        },
    },

    # UNHEALTHY (AQI 151-200)
    "Unhealthy": {
        "Lungs": {
            "risk_level": "Very High",
            "severity_score": 62,
            "description": (
                "Everyone may begin to experience respiratory symptoms at this level. PM2.5 "
                "concentrations cause widespread alveolar inflammation and oxidative stress. "
                "Forced vital capacity decreases measurably even in healthy adults. Mucus "
                "hypersecretion and bronchospasm are common, and emergency inhaler use increases significantly."
            ),
            "prevention_tips": [
                "Stay indoors with windows and doors closed; use air conditioning on recirculate mode.",
                "Use N95 or KN95 masks if outdoor activity is unavoidable.",
            ],
            "precautions": [
                "Avoid all outdoor exercise; even brief exposure can trigger symptoms in healthy adults.",
                "Seek medical attention if experiencing chest tightness, wheezing, or shortness of breath.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Do not allow outdoor play; keep children indoors with air purifiers running.",
                "elderly": "High risk of acute respiratory failure; ensure immediate access to medical care.",
                "pregnant": "Fetal oxygen supply may be compromised; stay indoors and rest.",
                "asthma": "Very high risk of severe exacerbation requiring emergency treatment.",
                "cardiovascular": "Acute cardiac events are significantly more likely; avoid all exertion.",
            },
        },
        "Heart": {
            "risk_level": "Very High",
            "severity_score": 60,
            "description": (
                "At unhealthy AQI levels, systemic inflammation from PM2.5 exposure causes "
                "measurable increases in blood viscosity and platelet aggregation. Arterial "
                "stiffness increases acutely, raising blood pressure. The risk of myocardial "
                "infarction and stroke is statistically elevated even in previously healthy adults."
            ),
            "prevention_tips": [
                "Remain indoors; avoid any physical exertion that increases cardiac demand.",
                "Ensure all cardiac medications are taken on schedule without interruption.",
            ],
            "precautions": [
                "Cardiac patients should have emergency contact numbers readily available.",
                "Monitor blood pressure and heart rate; seek care if readings are abnormal.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Healthy children face low direct cardiac risk but should remain indoors.",
                "elderly": "Very high risk of acute coronary events; avoid all outdoor activity.",
                "pregnant": "Placental blood flow may be compromised; rest and monitor fetal movement.",
                "asthma": "Shared inflammatory burden may precipitate cardiac arrhythmias.",
                "cardiovascular": "Emergency-level risk; contact cardiologist if symptoms develop.",
            },
        },
        "Brain": {
            "risk_level": "High",
            "severity_score": 55,
            "description": (
                "Neuroinflammation becomes clinically significant at unhealthy AQI levels. "
                "Ultrafine particles accumulate in olfactory neurons and are transported to "
                "the brain. Headaches, dizziness, and cognitive impairment are reported by "
                "a significant proportion of the general population, not just sensitive groups."
            ),
            "prevention_tips": [
                "Stay indoors and use HEPA filtration to minimise indoor particle concentrations.",
                "Avoid activities requiring high concentration or fine motor skills during peak exposure.",
            ],
            "precautions": [
                "Do not drive if experiencing dizziness or cognitive impairment.",
                "Seek medical attention for persistent severe headache or confusion.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Neurodevelopmental harm risk is significant; keep children indoors.",
                "elderly": "Acute cognitive decline episodes are more likely; monitor closely.",
                "pregnant": "Fetal neurological development is at risk from sustained exposure.",
                "asthma": "Hypoxia from severe bronchospasm can cause acute neurological symptoms.",
                "cardiovascular": "Cerebrovascular accident risk is elevated; avoid all exertion.",
            },
        },
        "Skin": {
            "risk_level": "High",
            "severity_score": 58,
            "description": (
                "Skin barrier function is significantly compromised at unhealthy AQI levels. "
                "Transepidermal water loss increases substantially, and pollutant-derived free "
                "radicals cause measurable DNA damage in keratinocytes. Inflammatory skin "
                "conditions flare severely, and even healthy skin shows signs of accelerated ageing."
            ),
            "prevention_tips": [
                "Minimise outdoor exposure; if unavoidable, cover all exposed skin with clothing.",
                "Apply a rich barrier repair cream immediately after any outdoor exposure.",
            ],
            "precautions": [
                "Individuals with psoriasis or eczema should contact their dermatologist for adjusted treatment.",
                "Avoid all cosmetic procedures that compromise the skin barrier during this period.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Severe eczema flares are likely; apply prescribed topical steroids proactively.",
                "elderly": "Skin healing is severely impaired; any wounds or abrasions need prompt care.",
                "pregnant": "Increased skin permeability during pregnancy raises pollutant absorption risk.",
                "asthma": "Atopic dermatitis flares may co-occur with respiratory symptoms.",
                "cardiovascular": "Systemic inflammatory load from skin inflammation adds to cardiovascular burden.",
            },
        },
        "Eyes": {
            "risk_level": "High",
            "severity_score": 53,
            "description": (
                "Conjunctival and corneal epithelial damage occurs with sustained exposure at "
                "unhealthy AQI levels. Tear film is severely destabilised, and goblet cell "
                "loss accelerates. Symptoms include intense burning, photophobia, blurred "
                "vision, and significant redness affecting the majority of exposed individuals."
            ),
            "prevention_tips": [
                "Stay indoors; if outdoors is unavoidable, wear sealed protective eyewear.",
                "Use lubricating eye drops every 1-2 hours to maintain ocular surface hydration.",
            ],
            "precautions": [
                "Do not wear contact lenses; switch to glasses for the duration of elevated AQI.",
                "Seek ophthalmological care if vision becomes blurred or pain is severe.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Eye irritation is likely; keep children indoors and away from open windows.",
                "elderly": "Severe dry eye exacerbation; use lubricating drops every hour.",
                "pregnant": "Hormonal ocular changes combined with pollution cause significant discomfort.",
                "asthma": "Allergic conjunctivitis may flare alongside respiratory symptoms.",
                "cardiovascular": "No specific additional ocular risk beyond general population.",
            },
        },
        "Immune System": {
            "risk_level": "Very High",
            "severity_score": 60,
            "description": (
                "Immune system dysregulation becomes clinically significant at unhealthy AQI. "
                "Chronic activation of innate immune pathways leads to immune exhaustion, "
                "reducing the body's ability to respond to new pathogens. Autoimmune conditions "
                "may flare, and recovery from illness takes significantly longer."
            ),
            "prevention_tips": [
                "Stay indoors and avoid contact with sick individuals to reduce infection risk.",
                "Prioritise sleep and nutrition to support immune recovery.",
            ],
            "precautions": [
                "Immunocompromised individuals should contact their physician for guidance.",
                "Avoid starting new immunosuppressive treatments during peak pollution periods.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Infection risk is very high; keep children home from school if possible.",
                "elderly": "Immune exhaustion risk is severe; avoid all unnecessary outdoor exposure.",
                "pregnant": "Infection during pregnancy carries serious risks; stay indoors.",
                "asthma": "Immune-mediated airway inflammation is at its peak; follow action plan.",
                "cardiovascular": "Immune-driven vascular inflammation significantly elevates cardiac risk.",
            },
        },
    },

    # VERY UNHEALTHY (AQI 201-300)
    "Very Unhealthy": {
        "Lungs": {
            "risk_level": "Very High",
            "severity_score": 78,
            "description": (
                "Severe respiratory distress is expected across the general population. PM2.5 "
                "concentrations cause acute lung injury with widespread alveolar inflammation. "
                "Oxygen saturation may drop measurably even in healthy adults. Emergency "
                "department visits for respiratory complaints increase dramatically at this level."
            ),
            "prevention_tips": [
                "Remain indoors with all ventilation sealed; use multiple HEPA air purifiers.",
                "If forced outdoors, use a properly fitted N95 respirator and limit exposure to minutes.",
            ],
            "precautions": [
                "Have emergency medications and contact numbers prepared in advance.",
                "Monitor oxygen saturation with a pulse oximeter if available.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Absolute indoor confinement required; any outdoor exposure is dangerous.",
                "elderly": "Risk of acute respiratory failure is very high; have emergency plan ready.",
                "pregnant": "Severe fetal hypoxia risk; seek medical evaluation if any symptoms develop.",
                "asthma": "Life-threatening exacerbation risk; have oral steroids and nebuliser ready.",
                "cardiovascular": "Acute cardiorespiratory failure risk; emergency medical care may be needed.",
            },
        },
        "Heart": {
            "risk_level": "Very High",
            "severity_score": 75,
            "description": (
                "Cardiovascular emergency risk is substantially elevated. Acute-phase proteins "
                "surge in response to PM2.5 exposure, causing rapid arterial inflammation. "
                "Blood pressure spikes are common, and the risk of acute myocardial infarction "
                "is several times higher than baseline for individuals with pre-existing conditions."
            ),
            "prevention_tips": [
                "Stay completely indoors; any physical exertion is contraindicated.",
                "Ensure all antihypertensive and anticoagulant medications are taken as prescribed.",
            ],
            "precautions": [
                "Cardiac patients should have emergency services contact ready.",
                "Seek immediate care for chest pain, palpitations, or sudden breathlessness.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Healthy children face low direct cardiac risk but must remain indoors.",
                "elderly": "Acute MI risk is very high; avoid all physical activity.",
                "pregnant": "Placental abruption risk may be elevated; seek obstetric advice.",
                "asthma": "Cardiorespiratory interaction at this level can cause dangerous arrhythmias.",
                "cardiovascular": "Extreme risk; consider hospital admission for high-risk patients.",
            },
        },
        "Brain": {
            "risk_level": "Very High",
            "severity_score": 72,
            "description": (
                "Neurological impairment is widespread at very unhealthy AQI levels. Cerebral "
                "blood flow is reduced due to systemic vasoconstriction from PM2.5 exposure. "
                "Acute neurological events including transient ischaemic attacks are more "
                "frequent. Cognitive function, reaction time, and mood are significantly impaired."
            ),
            "prevention_tips": [
                "Stay indoors with HEPA filtration; avoid all outdoor exposure.",
                "Avoid tasks requiring high cognitive load or precision during peak exposure periods.",
            ],
            "precautions": [
                "Seek emergency care immediately for sudden severe headache, vision changes, or weakness.",
                "Do not drive or operate heavy machinery.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Severe neurodevelopmental risk; absolute indoor confinement required.",
                "elderly": "Acute stroke risk is significantly elevated; monitor closely.",
                "pregnant": "Fetal brain injury risk from sustained hypoxia; seek medical evaluation.",
                "asthma": "Severe hypoxia from bronchospasm can cause acute neurological events.",
                "cardiovascular": "Cerebrovascular accident risk is very high; emergency care may be needed.",
            },
        },
        "Skin": {
            "risk_level": "Very High",
            "severity_score": 74,
            "description": (
                "Skin barrier is severely compromised at very unhealthy AQI levels. Pollutant "
                "penetration into the dermis triggers deep inflammatory responses. Collagen "
                "degradation accelerates markedly, and the risk of secondary skin infections "
                "increases due to barrier failure. Existing skin conditions require urgent medical management."
            ),
            "prevention_tips": [
                "Cover all skin with protective clothing if any outdoor exposure is unavoidable.",
                "Apply medical-grade barrier creams and change them frequently.",
            ],
            "precautions": [
                "Contact a dermatologist for emergency management of flaring skin conditions.",
                "Avoid all skin procedures, including washing with hot water, which further disrupts the barrier.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Severe eczema crisis is likely; seek paediatric dermatology advice.",
                "elderly": "Skin breakdown and ulceration risk is high; inspect skin daily.",
                "pregnant": "Pollutant absorption through compromised skin poses fetal risk.",
                "asthma": "Atopic crisis involving both skin and airways is likely.",
                "cardiovascular": "Systemic inflammatory burden from skin damage adds to cardiac risk.",
            },
        },
        "Eyes": {
            "risk_level": "Very High",
            "severity_score": 71,
            "description": (
                "Severe ocular surface damage occurs with any outdoor exposure at very unhealthy "
                "AQI levels. Corneal epithelial erosions are possible with sustained exposure. "
                "Intense photophobia, severe pain, and significant vision impairment are "
                "reported. Individuals with glaucoma face elevated intraocular pressure risk."
            ),
            "prevention_tips": [
                "Stay completely indoors; seal windows and use air purifiers.",
                "If outdoors is unavoidable, use sealed protective goggles, not just glasses.",
            ],
            "precautions": [
                "Seek ophthalmological emergency care for severe eye pain or vision loss.",
                "Do not wear contact lenses under any circumstances.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Severe eye irritation and potential corneal damage; keep indoors.",
                "elderly": "Glaucoma patients face acute intraocular pressure spikes; seek urgent care.",
                "pregnant": "Severe ocular discomfort; use lubricating drops every 30 minutes.",
                "asthma": "Allergic ocular crisis may co-occur with respiratory emergency.",
                "cardiovascular": "Ocular vascular events are more likely at this level.",
            },
        },
        "Immune System": {
            "risk_level": "Very High",
            "severity_score": 76,
            "description": (
                "Immune system collapse risk is significant at very unhealthy AQI levels. "
                "Sustained cytokine storm-like responses deplete immune reserves. Opportunistic "
                "infections become a serious concern, and autoimmune flares are severe. "
                "Recovery from any concurrent illness is dramatically prolonged."
            ),
            "prevention_tips": [
                "Stay indoors; avoid all contact with potentially infected individuals.",
                "Maintain strict hygiene and nutrition to preserve remaining immune capacity.",
            ],
            "precautions": [
                "Immunocompromised patients should contact their specialist immediately.",
                "Any fever or signs of infection require prompt medical evaluation.",
            ],
            "action_urgency": "Stay Indoors",
            "sensitive_group_notes": {
                "children": "Severe infection risk; keep home and monitor for fever.",
                "elderly": "Immune collapse risk is very high; consider hospital-level monitoring.",
                "pregnant": "Severe infection risk to mother and fetus; seek immediate medical guidance.",
                "asthma": "Immune-mediated airway crisis is likely; have emergency plan activated.",
                "cardiovascular": "Immune-driven cardiac inflammation risk is at its peak.",
            },
        },
    },

    # HAZARDOUS (AQI 301+)
    "Hazardous": {
        "Lungs": {
            "risk_level": "Severe",
            "severity_score": 97,
            "description": (
                "Hazardous air quality poses an immediate life-threatening risk to the lungs. "
                "Acute lung injury and chemical pneumonitis can develop within hours of exposure. "
                "Oxygen saturation drops critically, and mechanical ventilation may be required "
                "in severe cases. All outdoor activity must cease immediately."
            ),
            "prevention_tips": [
                "Seal all gaps in doors and windows with tape or wet towels.",
                "Use industrial-grade respirators (P100) if evacuation is required.",
            ],
            "precautions": [
                "Call emergency services immediately if experiencing severe breathing difficulty.",
                "Activate emergency asthma or COPD action plans without delay.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Life-threatening risk; evacuate to clean-air shelter immediately.",
                "elderly": "Acute respiratory failure is imminent without protection; seek emergency care.",
                "pregnant": "Fetal respiratory compromise is critical; immediate medical evaluation required.",
                "asthma": "Life-threatening status asthmaticus risk; call emergency services.",
                "cardiovascular": "Acute cardiorespiratory arrest risk; emergency hospitalisation required.",
            },
        },
        "Heart": {
            "risk_level": "Severe",
            "severity_score": 95,
            "description": (
                "Hazardous pollution levels trigger acute cardiovascular emergencies. Massive "
                "systemic inflammation causes rapid arterial occlusion risk. Acute myocardial "
                "infarction, stroke, and sudden cardiac death rates spike dramatically during "
                "hazardous air quality events. Immediate medical intervention is critical."
            ),
            "prevention_tips": [
                "Remain completely stationary indoors; any exertion is life-threatening.",
                "Ensure all cardiac emergency medications are immediately accessible.",
            ],
            "precautions": [
                "Call emergency services at the first sign of chest pain or cardiac symptoms.",
                "High-risk cardiac patients should consider pre-emptive hospitalisation.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Healthy children face lower direct risk but must be evacuated to clean air.",
                "elderly": "Immediate hospitalisation recommended for all cardiac patients.",
                "pregnant": "Acute placental insufficiency risk; emergency obstetric care required.",
                "asthma": "Cardiorespiratory collapse risk; emergency services must be on standby.",
                "cardiovascular": "Extreme emergency; immediate hospitalisation is strongly advised.",
            },
        },
        "Brain": {
            "risk_level": "Severe",
            "severity_score": 92,
            "description": (
                "Hazardous air quality causes acute neurological emergencies. Cerebral hypoxia "
                "from severely compromised respiratory function can cause loss of consciousness. "
                "Acute stroke risk is dramatically elevated. Neurological symptoms including "
                "confusion, seizures, and loss of coordination require immediate emergency response."
            ),
            "prevention_tips": [
                "Evacuate to a clean-air environment immediately if possible.",
                "Seal indoor spaces and use maximum-capacity air purification.",
            ],
            "precautions": [
                "Call emergency services immediately for any neurological symptoms.",
                "Do not leave vulnerable individuals alone during hazardous air quality events.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Acute brain injury risk; immediate evacuation to clean air is essential.",
                "elderly": "Acute stroke and cognitive collapse risk; emergency care required.",
                "pregnant": "Fetal brain damage from hypoxia is a critical risk; emergency care needed.",
                "asthma": "Severe hypoxia-induced neurological crisis; call emergency services.",
                "cardiovascular": "Acute cerebrovascular emergency risk; immediate hospitalisation required.",
            },
        },
        "Skin": {
            "risk_level": "Severe",
            "severity_score": 88,
            "description": (
                "Hazardous pollutant concentrations cause chemical burns and severe toxic "
                "dermatitis on exposed skin. Systemic absorption of toxic compounds through "
                "the compromised skin barrier poses organ-level toxicity risks. Any skin "
                "exposure to outdoor air at this level requires immediate decontamination."
            ),
            "prevention_tips": [
                "Cover all skin completely with protective clothing before any outdoor exposure.",
                "Decontaminate skin immediately upon returning indoors with gentle soap and water.",
            ],
            "precautions": [
                "Seek emergency dermatological care for chemical burns or severe reactions.",
                "Do not apply any topical products to chemically irritated skin without medical guidance.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Chemical skin injury risk is high; keep completely indoors.",
                "elderly": "Severe skin breakdown and systemic toxicity risk; emergency care required.",
                "pregnant": "Systemic toxin absorption through skin poses critical fetal risk.",
                "asthma": "Skin and airway chemical irritation may cause simultaneous crises.",
                "cardiovascular": "Systemic toxic absorption adds to acute cardiovascular emergency risk.",
            },
        },
        "Eyes": {
            "risk_level": "Severe",
            "severity_score": 90,
            "description": (
                "Hazardous air quality causes acute chemical conjunctivitis and corneal burns "
                "with any outdoor exposure. Permanent vision damage is possible without "
                "immediate decontamination. Toxic gases at these concentrations cause "
                "irreversible damage to the ocular surface within minutes of exposure."
            ),
            "prevention_tips": [
                "Wear sealed chemical splash goggles if any outdoor exposure is unavoidable.",
                "Flush eyes immediately with clean water for 15 minutes after any outdoor exposure.",
            ],
            "precautions": [
                "Seek emergency ophthalmological care for any eye pain or vision changes.",
                "Do not rub eyes; this spreads chemical irritants across the ocular surface.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Permanent eye damage risk; absolute indoor confinement required.",
                "elderly": "Acute glaucoma crisis and corneal damage risk; emergency care required.",
                "pregnant": "Severe ocular chemical injury risk; seek emergency care immediately.",
                "asthma": "Chemical ocular and airway crisis may occur simultaneously.",
                "cardiovascular": "Acute ocular vascular emergency risk at this level.",
            },
        },
        "Immune System": {
            "risk_level": "Severe",
            "severity_score": 93,
            "description": (
                "Hazardous air quality triggers a systemic toxic immune response. Cytokine "
                "storm-like cascades can cause multi-organ failure in vulnerable individuals. "
                "The immune system is overwhelmed by the toxic burden, leaving the body "
                "completely defenceless against pathogens. Immediate medical intervention is required."
            ),
            "prevention_tips": [
                "Evacuate to a clean-air medical facility if possible.",
                "Maintain strict isolation from any potential infection sources.",
            ],
            "precautions": [
                "Seek immediate medical care; do not attempt to manage immune crisis at home.",
                "All immunocompromised individuals require emergency hospitalisation.",
            ],
            "action_urgency": "Emergency",
            "sensitive_group_notes": {
                "children": "Life-threatening immune crisis risk; emergency medical care required.",
                "elderly": "Multi-organ failure risk from immune collapse; immediate hospitalisation.",
                "pregnant": "Sepsis risk to mother and fetus is critical; emergency obstetric care.",
                "asthma": "Immune-mediated respiratory and systemic crisis; call emergency services.",
                "cardiovascular": "Immune-driven multi-organ failure including cardiac arrest risk.",
            },
        },
    },
}

RISK_ORDER = ["Low", "Moderate", "High", "Very High", "Severe"]

CONDITION_ORGAN_AFFINITY: dict[str, list[str]] = {
    "Asthma": ["Lungs", "Immune System"],
    "COPD": ["Lungs", "Heart"],
    "Heart Disease": ["Heart", "Brain"],
    "Diabetes": ["Heart", "Immune System", "Eyes"],
    "Pregnancy": ["Lungs", "Brain", "Immune System"],
}
