export function exportToCSV(data, columns, filename = 'export') {
  if (!data.length) return;

  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((c) => {
      let val = row[c.key];
      if (c.key.includes('.')) {
        const parts = c.key.split('.');
        val = parts.reduce((o, k) => o?.[k], row);
      }
      if (c.csvRender) val = c.csvRender(val, row);
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    })
  );

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
