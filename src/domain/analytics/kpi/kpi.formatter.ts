"use server";

export const kpiFormatter = {
  integer: (value: number): string => {
    return Math.round(value).toLocaleString("ar-SA");
  },

  currency: (value: number): string => {
    return (value / 1000).toLocaleString("ar-SA", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  },

  percentage: (value: number): string => {
    return `${value.toLocaleString("ar-SA", { maximumFractionDigits: 1 })}%`;
  },

  minutes: (value: number): string => {
    return `${Math.round(value)} دقيقة`;
  },
};
