export type StationGroupRow<T> =
  | { type: 'detail'; key: string; record: T }
  | { type: 'subtotal'; key: string; stationName: string; count: number; amount: number; grossSalary: number };

interface StationRecordShape {
  id?: string;
  employee_id: string;
  station_name?: string;
  amount: number;
  gross_salary?: number;
}

export function buildStationGroupRows<T extends StationRecordShape>(records: T[]): StationGroupRow<T>[] {
  const rows: StationGroupRow<T>[] = [];
  let currentStation = '';
  let stationTotal = 0;
  let stationGross = 0;
  let stationCount = 0;

  const flushStation = () => {
    if (stationCount === 0) return;

    rows.push({
      type: 'subtotal',
      key: `subtotal-${currentStation || 'no-station'}`,
      stationName: currentStation,
      count: stationCount,
      amount: stationTotal,
      grossSalary: stationGross,
    });
  };

  records.forEach((record, index) => {
    const stationName = record.station_name || '';

    if (index > 0 && stationName !== currentStation) {
      flushStation();
      stationTotal = 0;
      stationGross = 0;
      stationCount = 0;
    }

    currentStation = stationName;
    stationTotal += Number(record.amount || 0);
    stationGross += Number(record.gross_salary || 0);
    stationCount += 1;

    rows.push({
      type: 'detail',
      key: record.id || record.employee_id,
      record,
    });
  });

  flushStation();
  return rows;
}

export function buildStationSubtotalExportRows<T extends Record<string, unknown> & StationRecordShape>(
  records: T[],
  options: { isArabic: boolean; includeGrossSalary?: boolean },
): Array<Record<string, unknown>> {
  const groupedRows = buildStationGroupRows(records);
  let detailIndex = 0;

  return groupedRows.map((row) => {
    if (row.type === 'detail') {
      detailIndex += 1;
      return {
        ...row.record,
        _index: detailIndex,
        __rowType: 'detail',
      };
    }

    const stationName = row.stationName || (options.isArabic ? 'بدون محطة' : 'No Station');

    return {
      _index: '',
      employee_name: options.isArabic ? 'مجموع المحطة' : 'Station Subtotal',
      employee_code: row.count,
      station_name: stationName,
      department_name: '',
      job_title: '',
      job_level: '',
      hire_date: '',
      bank_account_number: '',
      bank_id_number: '',
      bank_name: '',
      bank_account_type: '',
      gross_salary: options.includeGrossSalary ? row.grossSalary : '',
      percentage: '',
      amount: row.amount,
      __rowType: 'subtotal',
    };
  });
}
