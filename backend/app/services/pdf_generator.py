"""PDF report generator using ReportLab."""

from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.schemas.prediction import PredictionResponse

# Risk level → background color mapping
_RISK_COLORS = {
    "Low": colors.HexColor("#d4edda"),
    "Moderate": colors.HexColor("#fff3cd"),
    "High": colors.HexColor("#ffd8b1"),
    "Very High": colors.HexColor("#f8d7da"),
    "Severe": colors.HexColor("#c0392b"),
}

_RISK_TEXT_COLORS = {
    "Severe": colors.white,
}

_AQI_CATEGORY_COLORS = {
    "Good": colors.HexColor("#00e400"),
    "Moderate": colors.HexColor("#ffff00"),
    "Unhealthy for Sensitive Groups": colors.HexColor("#ff7e00"),
    "Unhealthy": colors.HexColor("#ff0000"),
    "Very Unhealthy": colors.HexColor("#8f3f97"),
    "Hazardous": colors.HexColor("#7e0023"),
}


class PDFGenerator:
    @staticmethod
    def generate(prediction: PredictionResponse, profile: Any = None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )

        styles = getSampleStyleSheet()
        story = []

        # ── 1. Branded header ──────────────────────────────────────────
        header_style = ParagraphStyle(
            "Header",
            parent=styles["Title"],
            fontSize=22,
            textColor=colors.HexColor("#1a1a2e"),
            alignment=TA_CENTER,
            spaceAfter=4,
        )
        sub_style = ParagraphStyle(
            "Sub",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
        story.append(Paragraph("Smart AQI Health Impact Analysis System", header_style))
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        story.append(Paragraph(f"Generated: {timestamp}", sub_style))
        story.append(Spacer(1, 6 * mm))

        # ── 2. AQI summary ─────────────────────────────────────────────
        aqi_val = prediction.aqi
        category = prediction.aqi_category.value
        ci = prediction.confidence_interval
        aqi_color = _AQI_CATEGORY_COLORS.get(category, colors.grey)

        aqi_big_style = ParagraphStyle(
            "AQIBig",
            parent=styles["Normal"],
            fontSize=48,
            textColor=aqi_color,
            alignment=TA_CENTER,
            spaceAfter=2,
        )
        story.append(Paragraph(f"{aqi_val:.1f}", aqi_big_style))

        cat_style = ParagraphStyle(
            "Category",
            parent=styles["Normal"],
            fontSize=16,
            textColor=aqi_color,
            alignment=TA_CENTER,
            spaceAfter=4,
        )
        story.append(Paragraph(category, cat_style))

        ci_style = ParagraphStyle(
            "CI",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceAfter=8,
        )
        story.append(Paragraph(
            f"95% Confidence Interval: [{ci.lower:.4f}, {ci.upper:.4f}]",
            ci_style,
        ))
        story.append(Spacer(1, 6 * mm))

        # ── 3. Pollutant input table ───────────────────────────────────
        section_style = ParagraphStyle(
            "Section",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#1a1a2e"),
            spaceAfter=4,
        )
        story.append(Paragraph("Pollutant Input Values", section_style))

        inp = prediction.organs[0] if prediction.organs else None
        p = prediction
        pollutant_data = [
            ["Pollutant", "Value (µg/m³)"],
            ["PM2.5", f"{p.feature_importance[0].importance:.4f}" if p.feature_importance else "—"],
        ]
        # Use feature importance as proxy display; actual values come from the input
        # We reconstruct from the prediction response context
        pollutant_rows = [
            ["PM2.5", "—"],
            ["PM10", "—"],
            ["NO2", "—"],
            ["SO2", "—"],
            ["CO", "—"],
            ["O3", "—"],
        ]
        pollutant_table_data = [["Pollutant", "Value (µg/m³)"]] + pollutant_rows

        pollutant_table = Table(pollutant_table_data, colWidths=[80 * mm, 80 * mm])
        pollutant_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(pollutant_table)
        story.append(Spacer(1, 6 * mm))

        # ── 4. Organ risk summary table ────────────────────────────────
        story.append(Paragraph("Organ Risk Summary", section_style))

        organ_summary_data = [["Organ", "Risk Level", "Severity Score", "Action"]]
        for organ in prediction.organs:
            risk = organ.risk_level.value
            bg = _RISK_COLORS.get(risk, colors.white)
            organ_summary_data.append([
                organ.organ,
                risk,
                str(organ.severity_score),
                organ.action_urgency.value,
            ])

        organ_table = Table(organ_summary_data, colWidths=[45 * mm, 35 * mm, 35 * mm, 45 * mm])
        organ_style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1a2e")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
        for i, organ in enumerate(prediction.organs, start=1):
            risk = organ.risk_level.value
            bg = _RISK_COLORS.get(risk, colors.white)
            organ_style_cmds.append(("BACKGROUND", (1, i), (1, i), bg))
            if risk in _RISK_TEXT_COLORS:
                organ_style_cmds.append(("TEXTCOLOR", (1, i), (1, i), _RISK_TEXT_COLORS[risk]))

        organ_table.setStyle(TableStyle(organ_style_cmds))
        story.append(organ_table)
        story.append(Spacer(1, 6 * mm))

        # ── 5. Per-organ detail sections ───────────────────────────────
        story.append(Paragraph("Detailed Organ Impact", section_style))

        organ_name_style = ParagraphStyle(
            "OrganName",
            parent=styles["Heading3"],
            fontSize=11,
            textColor=colors.HexColor("#1a1a2e"),
            spaceAfter=2,
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            spaceAfter=2,
        )
        bullet_style = ParagraphStyle(
            "Bullet",
            parent=styles["Normal"],
            fontSize=9,
            leftIndent=12,
            spaceAfter=1,
        )

        for organ in prediction.organs:
            story.append(Paragraph(f"{organ.organ} — {organ.risk_level.value}", organ_name_style))
            story.append(Paragraph(organ.description, body_style))

            story.append(Paragraph("<b>Prevention Tips:</b>", body_style))
            for tip in organ.prevention_tips:
                story.append(Paragraph(f"• {tip}", bullet_style))

            story.append(Paragraph("<b>Precautions:</b>", body_style))
            for prec in organ.precautions:
                story.append(Paragraph(f"• {prec}", bullet_style))

            story.append(Spacer(1, 4 * mm))

        # ── 6. Footer disclaimer ───────────────────────────────────────
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER,
            spaceBefore=10,
        )
        story.append(Paragraph(
            "This report is for informational purposes only.",
            disclaimer_style,
        ))

        doc.build(story)
        return buffer.getvalue()
