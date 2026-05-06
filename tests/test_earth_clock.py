"""Tests for the Earth Clock solar-time helpers."""

from __future__ import annotations

import unittest
from datetime import datetime, timezone

import earth_clock


class EarthClockTest(unittest.TestCase):
    def test_calculate_local_solar_time_formats_houston_solar_time(self) -> None:
        utc_dt = datetime(2024, 3, 20, 18, 0, 0, tzinfo=timezone.utc)

        self.assertEqual(
            earth_clock.calculate_local_solar_time(utc_dt),
            "11:30:40 (Solar)",
        )

    def test_calculate_local_solar_time_wraps_before_midnight_utc(self) -> None:
        utc_dt = datetime(2024, 1, 1, 1, 0, 0, tzinfo=timezone.utc)

        self.assertEqual(
            earth_clock.calculate_local_solar_time(utc_dt),
            "18:34:48 (Solar)",
        )

    def test_naive_datetime_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "timezone-aware"):
            earth_clock.calculate_local_solar_time(datetime(2024, 1, 1, 0, 0, 0))

    def test_get_houston_time_uses_daylight_saving_offset(self) -> None:
        utc_dt = datetime(2024, 7, 1, 18, 0, 0, tzinfo=timezone.utc)

        houston_time = earth_clock.get_houston_time(utc_dt)

        self.assertEqual(houston_time.hour, 13)
        self.assertEqual(houston_time.utcoffset().total_seconds(), -5 * 60 * 60)


if __name__ == "__main__":
    unittest.main()
