import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tableSeatApi } from '../api/table-seats';
import { sectionApi } from '../api/sections';
import { sessionApi } from '../api/sessions';
import type { TableSeat } from '../types';
import TableDetailModal from '../components/TableDetailModal';

export default function TablesPage() {
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  const [selectedTable, setSelectedTable] = useState<TableSeat | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(highlightTimer.current);
  }, []);

  const { data: tables, isLoading } = useQuery({
    queryKey: ['table-seats'],
    queryFn: () => tableSeatApi.getAll().then((r) => r.data),
  });

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionApi.getAll().then((r) => r.data),
  });

  const { data: openSessions } = useQuery({
    queryKey: ['open-sessions'],
    queryFn: () => sessionApi.getAll('open').then((r) => r.data),
    refetchInterval: 10000,
  });

  const openSessionByTable = Object.fromEntries(
    (openSessions ?? []).map((s) => [s.table_id, s]),
  );

  const sectionName = sections?.find((s) => s.id === sectionId)?.name;

  const filtered: TableSeat[] = sectionId
    ? (tables ?? []).filter((t) => t.section_id === sectionId)
    : (tables ?? []);

  // Grouping for "all tables" view
  const groupedBySections = (() => {
    const allTables = tables ?? [];
    const allSections = sections ?? [];
    const groups: { id: string | null; name: string; tables: TableSeat[] }[] = [];

    for (const section of allSections) {
      const sectionTables = allTables.filter((t) => t.section_id === section.id);
      if (sectionTables.length > 0) {
        groups.push({ id: section.id, name: section.name, tables: sectionTables });
      }
    }

    const knownSectionIds = new Set(allSections.map((s) => s.id));
    const otherTables = allTables.filter((t) => !t.section_id || !knownSectionIds.has(t.section_id));
    if (otherTables.length > 0) {
      groups.push({ id: null, name: 'Diğer', tables: otherTables });
    }

    return groups;
  })();

  const statusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Boş';
      case 'occupied': return 'Dolu';
      case 'reserved': return 'Rezerve';
      default: return status;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {sectionName ? `${sectionName} — Masalar` : 'Tüm Masalar'}
      </h1>

      {isLoading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : sectionId ? (
        filtered.length === 0 ? (
          <p className="text-gray-500">Masa bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((table) => {
              const session = openSessionByTable[table.id];
              const runningTotal = session ? Number(session.total_price ?? 0) : null;
              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`rounded-xl border-2 p-5 text-center cursor-pointer hover:shadow-md transition-all duration-500 ${statusColor(table.status)} ${highlightId === table.id ? 'ring-3 ring-blue-400 shadow-lg scale-105' : ''}`}
                >
                  <p className="font-semibold text-lg">{table.name}</p>
                  <p className="text-xs mt-1 uppercase tracking-wide font-medium">
                    {statusLabel(table.status)}
                  </p>
                  {runningTotal !== null && (
                    <p className="text-sm font-bold mt-2">
                      {runningTotal.toFixed(2)} ₺
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : groupedBySections.length === 0 ? (
        <p className="text-gray-500">Masa bulunamadı.</p>
      ) : (
        <div className="space-y-8">
          {groupedBySections.map((group) => (
            <div key={group.id ?? '__other__'}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {group.name}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {group.tables.map((table) => {
                  const session = openSessionByTable[table.id];
                  const runningTotal = session ? Number(session.total_price ?? 0) : null;
                  return (
                    <div
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`rounded-xl border-2 p-5 text-center cursor-pointer hover:shadow-md transition-all duration-500 ${statusColor(table.status)} ${highlightId === table.id ? 'ring-3 ring-blue-400 shadow-lg scale-105' : ''}`}
                    >
                      <p className="font-semibold text-lg">{table.name}</p>
                      <p className="text-xs mt-1 uppercase tracking-wide font-medium">
                        {statusLabel(table.status)}
                      </p>
                      {runningTotal !== null && (
                        <p className="text-sm font-bold mt-2">
                          {runningTotal.toFixed(2)} ₺
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          onClose={(interactedTableId?: string) => {
            setSelectedTable(null);
            if (interactedTableId) {
              setHighlightId(interactedTableId);
              clearTimeout(highlightTimer.current);
              highlightTimer.current = setTimeout(() => setHighlightId(null), 3000);
            }
          }}
        />
      )}
    </div>
  );
}
