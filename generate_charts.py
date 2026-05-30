import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
from matplotlib.ticker import FuncFormatter

# =====================================================
# SETUP
# =====================================================

ASSET_DIR = "public/assets"
os.makedirs(ASSET_DIR, exist_ok=True)

BG = "#F7F3EC"
PANEL = "#FFFDF8"

TEXT = "#171717"
MUTED = "#6F6A63"

BLUE = "#315C72"
GOLD = "#C89B3C"
RED = "#A6423A"
GREEN = "#4F7D5A"
GRAY = "#B8B1A8"

GRID = "#D8D0C5"

plt.rcParams.update({
    "figure.facecolor": BG,
    "axes.facecolor": BG,
    "savefig.facecolor": BG,
    "font.family": "DejaVu Sans",
    "text.color": TEXT,
    "axes.labelcolor": MUTED,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
})


def remove_all_axes(ax):
    ax.set_xticks([])
    ax.set_yticks([])

    for spine in ax.spines.values():
        spine.set_visible(False)


def money_b(x, pos):
    return f"${int(x)}B"


# =====================================================
# SCALE CHART
# =====================================================

labels = [
    "Endowment assets",
    "Annual giving",
    "Annual withdrawals"
]

values = [944.3, 78, 33.4]
colors = [BLUE, GOLD, GREEN]

fig, ax = plt.subplots(figsize=(12, 7))

remove_all_axes(ax)

y_positions = [2, 1, 0]

bars = ax.barh(
    y_positions,
    values,
    color=colors,
    height=0.48
)

ax.set_xlim(0, 1050)
ax.set_ylim(-0.8, 2.8)

for i, (label, val, color) in enumerate(zip(labels, values, colors)):

    y = y_positions[i]

    ax.text(
        0,
        y + 0.38,
        label.upper(),
        fontsize=11,
        fontweight="bold",
        color=MUTED,
    )

    ax.text(
        val + 12,
        y,
        f"${val:g}B",
        va="center",
        fontsize=26,
        fontweight="bold",
        color=TEXT
    )

ax.text(
    0,
    2.72,
    "Higher education operates at enormous philanthropic scale",
    fontsize=28,
    fontweight="bold",
    color=TEXT
)

ax.text(
    0,
    2.45,
    "The system already contains massive financial resources intended for impact.",
    fontsize=15,
    color=MUTED
)

plt.tight_layout()
plt.savefig(
    f"{ASSET_DIR}/scale_chart.png",
    dpi=260,
    bbox_inches="tight"
)
plt.close()

# =====================================================
# BARRIERS VISUAL
# =====================================================

fig, ax = plt.subplots(figsize=(11, 7))

remove_all_axes(ax)

layers = [
    ("Unclear purpose", RED, 0.92),
    ("No clear owner", GOLD, 0.82),
    ("Interpretation uncertainty", BLUE, 0.72),
    ("Approval friction", GRAY, 0.62),
    ("No follow-through", GREEN, 0.52),
]

for i, (label, color, width) in enumerate(layers):

    y = 0.82 - (i * 0.12)

    rect = FancyBboxPatch(
        (0.04, y),
        width,
        0.08,

        boxstyle="round,pad=0.012,rounding_size=0.02",

        linewidth=0,
        facecolor=color,
        alpha=0.88
    )

    ax.add_patch(rect)

    ax.text(
        0.07,
        y + 0.04,
        label,
        va="center",
        fontsize=16,
        fontweight="bold",
        color="white"
    )

ax.text(
    0.04,
    0.96,
    "Operational barriers compound over time",
    fontsize=28,
    fontweight="bold",
    transform=ax.transAxes
)

ax.text(
    0.04,
    0.91,
    "Most inactive funds were not blocked by lack of need.\nThey stalled inside unclear systems.",
    fontsize=15,
    color=MUTED,
    transform=ax.transAxes
)

ax.text(
    0.04,
    0.15,
    "Observed patterns across fund-resolution reviews",
    fontsize=11,
    color=MUTED,
    transform=ax.transAxes
)

plt.tight_layout()
plt.savefig(
    f"{ASSET_DIR}/barriers_chart.png",
    dpi=260,
    bbox_inches="tight"
)
plt.close()

# =====================================================
# INACTIVITY TIMELINE
# =====================================================

fig, ax = plt.subplots(figsize=(12, 7))

remove_all_axes(ax)

years = np.arange(0, 8)

activity_1 = [1, 1, 1, 0.85, 0.55, 0.25, 0.1, 0]
activity_2 = [1, 0.95, 0.8, 0.7, 0.62, 0.55, 0.48, 0.42]
activity_3 = [0, 0, 0, 0, 0, 0, 0, 0]

x = np.linspace(0.08, 0.92, len(years))

ax.plot(
    x,
    activity_1,
    linewidth=8,
    color=BLUE,
    solid_capstyle="round"
)

ax.plot(
    x,
    activity_2,
    linewidth=8,
    color=GOLD,
    solid_capstyle="round"
)

ax.plot(
    x,
    activity_3,
    linewidth=8,
    color=RED,
    solid_capstyle="round"
)

for i in range(len(x)):
    ax.scatter(x[i], activity_1[i], s=120, color=BLUE)
    ax.scatter(x[i], activity_2[i], s=120, color=GOLD)
    ax.scatter(x[i], activity_3[i], s=120, color=RED)

ax.text(
    0.08,
    1.12,
    "Inactive funds often disappear gradually",
    fontsize=28,
    fontweight="bold",
    transform=ax.transAxes
)

ax.text(
    0.08,
    1.04,
    "Some funds stopped being used years ago.\nOthers never activated at all.",
    fontsize=15,
    color=MUTED,
    transform=ax.transAxes
)

ax.text(
    0.93,
    activity_1[-2],
    "Dormant",
    fontsize=15,
    fontweight="bold",
    color=BLUE
)

ax.text(
    0.93,
    activity_2[-1],
    "Underused",
    fontsize=15,
    fontweight="bold",
    color=GOLD
)

ax.text(
    0.93,
    activity_3[0] + 0.02,
    "Never activated",
    fontsize=15,
    fontweight="bold",
    color=RED
)

for i, yr in enumerate(years):

    ax.text(
        x[i],
        -0.08,
        f"FY{yr+1}",
        ha="center",
        fontsize=11,
        color=MUTED
    )

ax.set_xlim(0, 1.08)
ax.set_ylim(-0.15, 1.15)

plt.tight_layout()
plt.savefig(
    f"{ASSET_DIR}/inactivity_chart.png",
    dpi=260,
    bbox_inches="tight"
)
plt.close()

# =====================================================
# IMPACT CHART
# =====================================================

fig, ax = plt.subplots(figsize=(10, 7))

remove_all_axes(ax)

ax.bar(
    [0],
    [1],
    width=0.42,
    color=GRAY,
)

ax.bar(
    [1],
    [8],
    width=0.42,
    color=GREEN,
)

ax.text(
    0,
    1.2,
    "1×",
    ha="center",
    fontsize=26,
    fontweight="bold"
)

ax.text(
    1,
    8.35,
    "8×",
    ha="center",
    fontsize=42,
    fontweight="bold",
    color=GREEN
)

ax.text(
    0,
    -0.55,
    "Before intervention",
    ha="center",
    fontsize=13,
    color=MUTED
)

ax.text(
    1,
    -0.55,
    "After intervention",
    ha="center",
    fontsize=13,
    color=MUTED
)

ax.text(
    -0.15,
    9.2,
    "Fund activation accelerated rapidly",
    fontsize=30,
    fontweight="bold"
)

ax.text(
    -0.15,
    8.5,
    "Structured review and direct intervention transformed institutional momentum.",
    fontsize=15,
    color=MUTED
)

ax.set_ylim(0, 10)
ax.set_xlim(-0.6, 1.6)

plt.tight_layout()
plt.savefig(
    f"{ASSET_DIR}/impact_chart.png",
    dpi=260,
    bbox_inches="tight"
)
plt.close()

# =====================================================
# SCHOLARSHIP VISUAL
# =====================================================

fig, ax = plt.subplots(figsize=(11, 6.5))

remove_all_axes(ax)

# left side
left_box = FancyBboxPatch(
    (0.06, 0.18),
    0.32,
    0.55,

    boxstyle="round,pad=0.02,rounding_size=0.03",

    linewidth=0,
    facecolor=RED,
    alpha=0.88
)

ax.add_patch(left_box)

# right side
right_box = FancyBboxPatch(
    (0.52, 0.12),
    0.38,
    0.7,

    boxstyle="round,pad=0.02,rounding_size=0.03",

    linewidth=0,
    facecolor=GREEN,
    alpha=0.9
)

ax.add_patch(right_box)

ax.text(
    0.22,
    0.77,
    "Department-only",
    ha="center",
    fontsize=15,
    fontweight="bold",
    color=TEXT
)

ax.text(
    0.71,
    0.87,
    "Shared ownership",
    ha="center",
    fontsize=16,
    fontweight="bold",
    color=TEXT
)

ax.text(
    0.22,
    0.45,
    "13%",
    ha="center",
    va="center",
    fontsize=52,
    fontweight="bold",
    color="white"
)

ax.text(
    0.71,
    0.47,
    "87%",
    ha="center",
    va="center",
    fontsize=64,
    fontweight="bold",
    color="white"
)

ax.text(
    0.08,
    0.97,
    "Scholarship activation improved when ownership was shared",
    fontsize=28,
    fontweight="bold",
    transform=ax.transAxes
)

ax.text(
    0.08,
    0.90,
    "Financial aid expertise and departmental coordination dramatically increased utilization.",
    fontsize=15,
    color=MUTED,
    transform=ax.transAxes
)

plt.tight_layout()
plt.savefig(
    f"{ASSET_DIR}/scholarship_chart.png",
    dpi=260,
    bbox_inches="tight"
)
plt.close()

print("Cinematic scrollytelling charts generated.")