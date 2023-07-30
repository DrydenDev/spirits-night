import fs from 'fs';
import YAML from 'yaml';

export function loadYamlFile(filename: string) {
  const file = fs.readFileSync(filename, 'utf8');
  return YAML.parse(file);
}

export function validExpansion(expansion: string) {
  return [
    "Spirit Island",
    "Feather and Flame",
    "Branch and Claw",
    "Jagged Earth",
    "Horizons",
    "Nature Incarnate"
  ].includes(expansion);
}