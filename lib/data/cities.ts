export const CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Noida",
  "Gurugram",
  "Indore",
];

export function getRandomCity() {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}
