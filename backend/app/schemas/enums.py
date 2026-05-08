from enum import Enum


class AQICategory(str, Enum):
    GOOD = "Good"
    MODERATE = "Moderate"
    UNHEALTHY_SENSITIVE = "Unhealthy for Sensitive Groups"
    UNHEALTHY = "Unhealthy"
    VERY_UNHEALTHY = "Very Unhealthy"
    HAZARDOUS = "Hazardous"


class RiskLevel(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    VERY_HIGH = "Very High"
    SEVERE = "Severe"


class ActionUrgency(str, Enum):
    MONITOR = "Monitor"
    CAUTION = "Caution"
    AVOID_OUTDOORS = "Avoid Outdoors"
    STAY_INDOORS = "Stay Indoors"
    EMERGENCY = "Emergency"


class ModelType(str, Enum):
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    XGBOOST = "xgboost"
    LINEAR_REGRESSION = "linear_regression"
