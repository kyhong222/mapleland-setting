export function attackSpeedToKorean(attackSpeed: number): string {
  const speedMap: Record<number, string> = {
    2: "매우 빠름",
    3: "매우 빠름",
    4: "빠름",
    5: "빠름",
    6: "보통",
    7: "느림",
    8: "느림",
    9: "매우 느림"
  }

  return speedMap[attackSpeed] || "알 수 없음";
}