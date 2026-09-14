import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react";

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

async function getWeather(address: string | null | undefined, countryCode: string | null | undefined, isArabic: boolean): Promise<{ location: string; temperature: number; humidity?: number; wind?: number; code?: number } | null> {
  const raw = (address ?? "").trim();
  const parts = raw.split(",").map((value) => value.trim()).filter((value) => value.length >= 2);
  const candidates = [raw, parts[0], parts[1], ...parts.slice(-1)].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index).slice(0, 4);
  if (!candidates.length) return null;

  for (const candidate of candidates) {
    try {
      const params = new URLSearchParams({ name: candidate, count: "1", language: isArabic ? "ar" : "en", format: "json" });
      if (countryCode) params.set("countryCode", countryCode.toLowerCase());
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
      if (!geoResponse.ok) continue;
      const geo = (await geoResponse.json()) as { results?: GeocodeResult[] };
      const location = geo.results?.[0];
      if (!location) continue;

      const forecastParams = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code", temperature_unit: "celsius", wind_speed_unit: "kmh" });
      const forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`, { next: { revalidate: 900 }, signal: AbortSignal.timeout(5000) });
      if (!forecastResponse.ok) continue;
      const forecast = (await forecastResponse.json()) as ForecastResult;
      const current = forecast.current;
      if (typeof current?.temperature_2m !== "number") continue;
      return { location: location.name, temperature: current.temperature_2m, humidity: current.relative_humidity_2m, wind: current.wind_speed_10m, code: current.weather_code };
    } catch {
      continue;
    }
  }
  return null;
}

export async function HomeWeather({ address, countryCode, isArabic }: HomeWeatherProps) {
  const weather = await getWeather(address, countryCode, isArabic);
  if (!weather) {
    return <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--cs-slate-200)] bg-[var(--cs-slate-50)] px-3 py-2.5" aria-label={isArabic ? "معلومات الطقس غير متاحة" : "Weather information unavailable"}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--cs-slate-500)]"><Cloud className="h-5 w-5" aria-hidden="true" /></span>
      <div className="min-w-0"><p className="text-xs font-semibold text-[var(--cs-ink-950)]">{isArabic ? "الطقس" : "Weather"}</p><p className="mt-0.5 text-xs text-[var(--cs-slate-500)]">{isArabic ? "غير متاح حاليًا" : "Currently unavailable"}</p></div>
    </div>;
  }

  return <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--cs-slate-200)] bg-[var(--cs-slate-50)] px-3 py-2.5" aria-label={isArabic ? `الطقس في ${weather.location}` : `Weather in ${weather.location}`}>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cs-cyan-100)] text-[var(--cs-cyan-700)]"><WeatherIcon code={weather.code} /></span>
    <div className="min-w-0"><div className="flex items-baseline gap-2"><span className="text-lg font-bold tabular-nums text-[var(--cs-ink-950)]">{Math.round(weather.temperature)}°</span><span className="truncate text-xs font-medium text-[var(--cs-slate-700)]">{weatherText(weather.code, isArabic)}</span></div>
      <p className="mt-0.5 truncate text-xs text-[var(--cs-slate-500)]">{weather.location}{typeof weather.humidity === "number" ? <><span aria-hidden="true"> · </span><span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3" aria-hidden="true" />{weather.humidity}%</span></> : null}{typeof weather.wind === "number" ? <><span aria-hidden="true"> · </span><span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" aria-hidden="true" />{Math.round(weather.wind)} km/h</span></> : null}</p>
    </div>
  </div>;
}
