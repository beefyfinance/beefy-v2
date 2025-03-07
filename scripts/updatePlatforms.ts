import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface Platform {
  id: string;
  name: string;
  website?: string;
  twitter?: string;
  documentation?: string;
  description?: string;
  type?: string;
}

const platformsPath = path.resolve(__dirname, '../src/config/platforms.json');
const csvPath = path.resolve(__dirname, './platforms.csv');

function loadPlatforms(): Platform[] {
  const platformsData = fs.readFileSync(platformsPath, 'utf-8');
  return JSON.parse(platformsData) as Platform[];
}

function savePlatforms(platforms: Platform[]) {
  fs.writeFileSync(platformsPath, JSON.stringify(platforms, null, 2), 'utf-8');
}

function updatePlatformData(platforms: Platform[], updatedData: Platform) {
  const index = platforms.findIndex(platform => platform.id === updatedData.id);
  if (index !== -1) {
    platforms[index] = { ...platforms[index], ...updatedData };
  }
}

function updatePlatformsFromCSV() {
  const platforms = loadPlatforms();

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row: Platform) => {
      updatePlatformData(platforms, row);
    })
    .on('end', () => {
      savePlatforms(platforms);
      console.log('Platforms updated successfully');
    });
}

updatePlatformsFromCSV();
