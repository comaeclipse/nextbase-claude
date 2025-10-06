# Scripts

## csv-to-json.js

Converts the Locations.csv file to the locations.json format used by NextBase.

### Usage

**Default paths** (reads from Downloads, writes to data/locations.json):
```bash
node scripts/csv-to-json.js
```

**Custom paths**:
```bash
node scripts/csv-to-json.js <input-csv-path> <output-json-path>
```

**Example**:
```bash
node scripts/csv-to-json.js C:\Users\Meeter\Downloads\Locations.csv data/locations.json
```

### CSV Format Expected

The script expects a CSV with 30 columns in this order:

1. State
2. City
3. County
4. StateParty (R/D)
5. Governor (R/D/M)
6. Mayor (R/D/M)
7. 2016Election (winner name)
8. 2016PresidentPercent (number)
9. 2024 Election (winner name)
10. 2024PresidentPercent (number)
11. ElectionChange (trend text)
12. Population (number with commas)
13. Density (number)
14. Sales Tax (percentage)
15. Income (tax percentage)
16. COL (cost of living index)
17. VA (Yes/No for VA clinic)
18. TCI (Total Crime Index number)
19. Marijuana (Recreational/Medical/Decriminalized/Illegal)
20. LGBTQ (rank number or ?)
21. Tech (Y/N for tech hub)
22. Snow (inches)
23. Rain (inches)
24. Sun (sunny days)
25. ALW (average low winter temp)
26. AHS (average high summer temp)
27. Climate (climate type text)
28. Gas (price)
29. Gifford (gun law grade: F/D/C/B/A)
30. Veterans Benefits (description text)

### Output

Creates a JSON file with this structure:
```json
{
  "locations": [
    {
      "state": "AK",
      "city": "Anchorage",
      "county": "Alaska",
      "stateParty": "R",
      "population": 398807,
      "density": 2718,
      "politics": { ... },
      "vaFacilities": false,
      "crime": { "totalIndex": 5 },
      "tech": { "hubPresent": true },
      "taxes": { ... },
      "marijuana": { ... },
      "lgbtq": { ... },
      "firearms": { ... },
      "climate": { ... },
      "economy": { ... },
      "veteranBenefits": { ... }
    }
  ]
}
```

### Notes

- Missing values (represented as "?") are converted to `null`
- Gifford Score is inverted: F = Very 2A Friendly, A = Restrictive
- Numbers with commas are automatically cleaned
- VA and Tech hub are converted to booleans
