"use client";

import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react";
import { useEffect, useState } from "react";

interface HomeWeatherProps {
  address?: string | null;
  countryCode?: string | null;
  isArabic: boolean;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
}

interface ForecastResult {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
}

interface WeatherData {
  location: string;
  temperature: number;
  humidity?: number;
  wind?: number;
  code?: number;
}

function weatherText(code: number | undefined, ar: boolean) {
  if (code === undefined) return ar ? "الطقس" : "Weather";
  if ([0, 1].includes(code)) return ar ? "صحوة" : "Clear";
  if ([2, 3].includes(code)) return ar ? "غائم جزئيًا" : "Partly cloudy";
  if ([45, 48].includes(code)) return ar ? "ضباب" : "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return ar ? "رذاذ" : "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ar ? "ممطر" : "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ar ? "ثلوج" : "Snowy";
  if ([95, 96, 99].includes(code)) return ar ? "عواصف" : "Storms";
  return ar ? "الطقس" : "Weather";
}

function WeatherIcon({ code }: { code?: number }) {
  if (code === undefined) return <Cloud className="h-5 w-5" aria-hidden="true" />;
  if ([0, 1].includes(code)) return <Sun className="h-5 w-5" aria-hidden="true" />;
  if ([2, 3].includes(code)) return <CloudSun className="h-5 w-5" aria-hidden="true" />;
  if ([45, 48].includes(code)) return <CloudFog className="h-5 w-5" aria-hidden="true" />;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className="h-5 w-5" aria-hidden="true" />;
  if ([95, 96, 99].includes(code)) return <CloudLightning className="h-5 w-5" aria-hidden="true" />;
  return <Cloud className="h-5 w-5" aria-hidden="true" />;
}

function buildCandidates(address: string | null | undefined) {
  const raw = (address ?? "").trim();
  const parts = raw.split(",").map((value) => value.trim()).filter((value) => value.length >= 2);
  return [...parts.slice(0, 3).reverse(), ...parts.slice(-2), raw]
    .filter((value, index, array) => Boolean(value) && array.indexOf(value) === index)
    .slice(0, 6);
}

async function fetchWeather(
  address: string | null | undefined,
  countryCode: string | null | undefined,
  isArabic: boolean,
  signal: AbortSignal,
) {
  const candidates = buildCandidates(address);
  if (!candidates.length) return null;

  for (const candidate of candidates) {
    try {
      const params = new URLSearchParams({
        name: candidate,
        count: "1",
        language: isArabic ? "ar" : "en",
        format: "json",
      });
      const code = countryCode?.trim();
      if (code) params.set("countryCode", code.toUpperCase());

      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
      if (!geoResponse.ok) continue;
      const geo = (await geoResponse.json()) as { results?: GeocodeResult[] };
      const location = geo.results?.[0];
      if (!location) continue;

      const forecastParams = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
      });
      const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`, { signal });
      if (!forecastResponse.ok) continue;
      const current = ((await forecastResponse.json()) as ForecastResult).current;
      if (typeof current?.temperature_2m !== "number") continue;

      return {
        location: location.name,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        code: current.weather_code,
      } satisfies WeatherData;
    } catch {
      if (signal.aborted) return null;
    }
  }

  return null;
}

export function HomeWeather({ address, countryCode, isArabic }: HomeWeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(Boolean(address?.trim()));

  useEffect(() => {
    const controller = new AbortController();
    if (!address?.trim()) {
      setWeather(null);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    void fetchWeather(address, countryCode, isArabic, controller.signal)
      .then(setWeather)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [address, countryCode, isArabic]);

  if (loading) {
    return (
      <div className="flex min-w-0 items-center gap-3 py-1" aria-label={isArabic ? "جار تحميل الطقس" : "Loading weather information"}>
        <span className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-[var(--cs-slate-100)] text-[var(--cs-slate-500)]">
          <Cloud className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--cs-ink-950)]">{isArabic ? "جاري تحميل الطقس" : "Loading weather"}</p>
          <p className="mt-0.5 text-xs text-[var(--cs-slate-500)]">{isArabic ? "يتم التحقق من حالة الطقس." : "Checking current conditions."}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex min-w-0 items-center gap-3 py-1" aria-label={isArabic ? "معلومات الطقس غير متاحة" : "Weather information unavailable"}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cs-slate-100)] text-[var(--cs-slate-500)]">
          <Cloud className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--cs-ink-950)]">{isArabic ? "الطقس غير متاح" : "Weather unavailable"}</p>
          <p className="mt-0.5 text-xs text-[var(--cs-slate-500)]">{isArabic ? "تحقق من عنوان العيادة في بيانات الملف." : "Check the clinic address in the clinic profile."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 py-1" aria-label={isArabic ? `الطقس في ${weather.location}` : `Weather in ${weather.location}`}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--cs-cyan-100)] text-[var(--cs-cyan-700)]">
        <WeatherIcon code={weather.code} />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-[var(--cs-ink-950)]">{Math.round(weather.temperature)}°C</span>
          <span className="text-sm font-medium text-[var(--cs-slate-700)]">{weatherText(weather.code, isArabic)}</span>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--cs-slate-500)]">
          <span>{weather.location}</span>
          {typeof weather.humidity === "number" ? <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" aria-hidden="true" />{weather.humidity}%</span> : null}
          {typeof weather.wind === "number" ? <span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" aria-hidden="true" />{Math.round(weather.wind)} km/h</span> : null}
        </p>
      </div>
    </div>
  );
}
