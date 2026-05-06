"""Tkinter-based Virtual Earth Clock for Houston solar time."""

from __future__ import annotations

import math
from datetime import datetime, time, timedelta, timezone, tzinfo


HOUSTON_LONGITUDE = -95.3698
HOUSTON_TIME_ZONE = "America/Chicago"


def _first_weekday_on_or_after(year: int, month: int, day: int, weekday: int) -> int:
    candidate = datetime(year, month, day)
    return day + ((weekday - candidate.weekday()) % 7)


def _central_fallback_timezone(utc_dt: datetime) -> timezone:
    """Return a best-effort Central Time zone when IANA data is unavailable."""
    utc_dt = utc_dt.astimezone(timezone.utc)
    year = utc_dt.year

    # US Central daylight saving time runs from 2am local time on the second
    # Sunday in March to 2am local time on the first Sunday in November.
    dst_start_day = _first_weekday_on_or_after(year, 3, 8, 6)
    dst_end_day = _first_weekday_on_or_after(year, 11, 1, 6)
    dst_start_utc = datetime(year, 3, dst_start_day, 8, tzinfo=timezone.utc)
    dst_end_utc = datetime(year, 11, dst_end_day, 7, tzinfo=timezone.utc)

    if dst_start_utc <= utc_dt < dst_end_utc:
        return timezone(timedelta(hours=-5), "CDT")
    return timezone(timedelta(hours=-6), "CST")


def get_houston_time(utc_dt: datetime) -> datetime:
    """Convert an aware datetime to Houston local time."""
    utc_dt = _as_utc_datetime(utc_dt)

    try:
        from zoneinfo import ZoneInfo

        houston_tz: tzinfo = ZoneInfo(HOUSTON_TIME_ZONE)
    except Exception:
        houston_tz = _central_fallback_timezone(utc_dt)

    return utc_dt.astimezone(houston_tz)


def _as_utc_datetime(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        raise ValueError("datetime must be timezone-aware")
    return dt.astimezone(timezone.utc)


def equation_of_time_minutes(utc_dt: datetime) -> float:
    """Approximate the equation of time in minutes."""
    utc_dt = _as_utc_datetime(utc_dt)
    day_of_year = utc_dt.timetuple().tm_yday
    seasonal_angle = 2 * math.pi / 365 * (day_of_year - 81)
    return (
        9.87 * math.sin(2 * seasonal_angle)
        - 7.53 * math.cos(seasonal_angle)
        - 1.5 * math.sin(seasonal_angle)
    )


def calculate_local_solar_clock_time(
    utc_dt: datetime, longitude: float = HOUSTON_LONGITUDE
) -> time:
    """Approximate local solar clock time for a longitude from an aware datetime."""
    utc_dt = _as_utc_datetime(utc_dt)
    seconds_since_midnight = (
        utc_dt.hour * 3600
        + utc_dt.minute * 60
        + utc_dt.second
        + utc_dt.microsecond / 1_000_000
    )
    correction_seconds = (longitude * 4 + equation_of_time_minutes(utc_dt)) * 60
    solar_seconds = (seconds_since_midnight + correction_seconds) % (24 * 3600)

    hours = int(solar_seconds // 3600)
    minutes = int((solar_seconds % 3600) // 60)
    seconds = int(solar_seconds % 60)
    return time(hours, minutes, seconds)


def calculate_local_solar_time(utc_dt: datetime) -> str:
    """Return a display string for Houston local solar time."""
    solar_time = calculate_local_solar_clock_time(utc_dt)
    return f"{solar_time:%H:%M:%S} (Solar)"


class EarthClock:
    """Tkinter UI that displays UTC, Houston local, and Houston solar time."""

    def __init__(self) -> None:
        import tkinter as tk

        self.tk = tk
        self.root = tk.Tk()
        self.root.title("Virtual Earth Clock - Live Solar Time")
        self.root.geometry("600x700")
        self.root.configure(bg="#0a0a2a")

        title = tk.Label(
            self.root,
            text="Virtual Earth Clock",
            font=("Arial", 24, "bold"),
            fg="#00ffcc",
            bg="#0a0a2a",
        )
        title.pack(pady=10)

        subtitle = tk.Label(
            self.root,
            text="Tracking Earth's rotation - Houston, Texas",
            font=("Arial", 12),
            fg="#88ffaa",
            bg="#0a0a2a",
        )
        subtitle.pack(pady=5)

        self.canvas = tk.Canvas(
            self.root, width=400, height=400, bg="#112233", highlightthickness=0
        )
        self.canvas.pack(pady=20)

        self.utc_label = tk.Label(
            self.root, text="", font=("Courier", 14), fg="#ffcc00", bg="#0a0a2a"
        )
        self.utc_label.pack(pady=5)

        self.local_label = tk.Label(
            self.root, text="", font=("Courier", 14), fg="#00ccff", bg="#0a0a2a"
        )
        self.local_label.pack(pady=5)

        self.solar_label = tk.Label(
            self.root,
            text="",
            font=("Courier", 18, "bold"),
            fg="#ff00aa",
            bg="#0a0a2a",
        )
        self.solar_label.pack(pady=10)

        self.update_clock()

    def draw_clock(self, hours: int, minutes: int, seconds: int) -> None:
        self.canvas.delete("all")
        center_x, center_y = 200, 200
        radius = 180

        self.canvas.create_oval(
            center_x - radius,
            center_y - radius,
            center_x + radius,
            center_y + radius,
            outline="#00ffcc",
            width=8,
        )

        for i in range(12):
            angle = math.radians(i * 30 - 90)
            x1 = center_x + (radius - 20) * math.cos(angle)
            y1 = center_y + (radius - 20) * math.sin(angle)
            x2 = center_x + radius * math.cos(angle)
            y2 = center_y + radius * math.sin(angle)
            self.canvas.create_line(x1, y1, x2, y2, fill="#ffffff", width=4)

        hour_angle = math.radians((hours % 12) * 30 + minutes * 0.5 - 90)
        hx = center_x + 80 * math.cos(hour_angle)
        hy = center_y + 80 * math.sin(hour_angle)
        self.canvas.create_line(center_x, center_y, hx, hy, fill="#ffffff", width=8)

        min_angle = math.radians(minutes * 6 - 90)
        mx = center_x + 120 * math.cos(min_angle)
        my = center_y + 120 * math.sin(min_angle)
        self.canvas.create_line(center_x, center_y, mx, my, fill="#00ccff", width=5)

        sec_angle = math.radians(seconds * 6 - 90)
        sx = center_x + 140 * math.cos(sec_angle)
        sy = center_y + 140 * math.sin(sec_angle)
        self.canvas.create_line(center_x, center_y, sx, sy, fill="#ff0088", width=3)

        self.canvas.create_oval(
            center_x - 10, center_y - 10, center_x + 10, center_y + 10, fill="#ffffff"
        )

    def update_clock(self) -> None:
        now = datetime.now(timezone.utc)

        self.utc_label.config(text=f"UTC: {now:%H:%M:%S UTC}")

        local_time = get_houston_time(now)
        self.local_label.config(text=f"Local: {local_time:%H:%M:%S %Z}")

        self.solar_label.config(text=f"Solar Time: {calculate_local_solar_time(now)}")
        self.draw_clock(local_time.hour, local_time.minute, local_time.second)

        self.root.after(200, self.update_clock)

    def run(self) -> None:
        self.root.mainloop()


def main() -> None:
    clock = EarthClock()
    clock.run()


if __name__ == "__main__":
    main()
