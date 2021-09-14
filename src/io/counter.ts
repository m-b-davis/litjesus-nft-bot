import fs from 'fs';

export function initialiseCounter() {
  // Create counter file if doesn't exist
  if (!fs.existsSync(counterPath)) {
    updateCounter(0);
  }
}

export function getLastCounter(): number {
  const content = fs.readFileSync(counterPath);
  const data = JSON.parse(content.toString());
  return data.value;
}

export function updateCounter(value: number) {
  console.log("Updating counter to " + value);
  const json = JSON.stringify({ value });
  fs.writeFileSync(counterPath, json, "utf8");
}

export function setHighestCounter(value: number) {
  const lastCounter = getLastCounter();
  if (value > lastCounter) {
    updateCounter(value);
  } else {
    console.log("Ignoring, highest count still " + lastCounter);
  }
}
