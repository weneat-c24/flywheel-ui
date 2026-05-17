export async function delay(ms = 80 + Math.random() * 170): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
