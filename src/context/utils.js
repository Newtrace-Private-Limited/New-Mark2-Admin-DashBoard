export const jsonToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  const keys = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(keys.join(','));

  // Add data rows
  for (const row of data) {
    const values = keys.map(key => JSON.stringify(row[key], replacer));
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

// Custom replacer to handle null and undefined values
const replacer = (key, value) => (value === null || value === undefined ? '' : value);
