import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent } from '@/components/common/Card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateAttendanceRecord } from '@/features/attendance/attendanceSlice';
import { AttendanceStatus, AttendanceRecord } from '@/types';
import { formatDate } from '@/utils/helpers';
import { MESSAGES } from '@/constants';

const today = new Date().toISOString().split('T')[0];

function subtractDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'LEAVE', label: 'Leave' },
  { value: 'HALF_DAY', label: 'Half Day' },
];

const statusBadgeClass: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-800 border-green-200',
  ABSENT: 'bg-red-100 text-red-800 border-red-200',
  LATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LEAVE: 'bg-blue-100 text-blue-800 border-blue-200',
  HALF_DAY: 'bg-purple-100 text-purple-800 border-purple-200',
};

const QUICK_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

const PAGE_SIZE = 15;

function dayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

export function AttendanceHistoryPage() {
  const dispatch = useAppDispatch();
  const { salesmen } = useAppSelector(state => state.salesmen);
  const { records } = useAppSelector(state => state.attendance);

  const [selectedSalesmanId, setSelectedSalesmanId] = useState('');
  const [salesmanSearch, setSalesmanSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(subtractDays(30));
  const [dateTo, setDateTo] = useState(today);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<AttendanceRecord>>({});

  const selectedSalesman = salesmen.find(s => s.id === selectedSalesmanId);

  const filteredSalesmenList = salesmen.filter(s =>
    s.name.toLowerCase().includes(salesmanSearch.toLowerCase()) ||
    s.cnic.includes(salesmanSearch)
  );

  const historyRecords = useMemo(() => {
    if (!selectedSalesmanId) return [];
    return records
      .filter(r => {
        if (r.salesmanId !== selectedSalesmanId) return false;
        if (r.date < dateFrom || r.date > dateTo) return false;
        // Exclude dates before joining date
        if (selectedSalesman && r.date < selectedSalesman.joiningDate) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, selectedSalesmanId, dateFrom, dateTo, selectedSalesman]);

  const totalPages = Math.max(1, Math.ceil(historyRecords.length / PAGE_SIZE));
  const pageRecords = historyRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary counts
  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0, HALF_DAY: 0,
    };
    historyRecords.forEach(r => { counts[r.status]++; });
    return counts;
  }, [historyRecords]);

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditDraft({ ...record });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = () => {
    if (!editDraft.id) return;
    dispatch(updateAttendanceRecord(editDraft as AttendanceRecord));
    toast.success(MESSAGES.ATTENDANCE_UPDATED);
    setEditingId(null);
    setEditDraft({});
  };

  const applyQuickRange = (days: number) => {
    setDateFrom(subtractDays(days));
    setDateTo(today);
    setPage(1);
  };

  const isTimeDisabled = (status: AttendanceStatus | undefined) =>
    status === 'LEAVE' || status === 'ABSENT';

  return (
    <div className="space-y-4">
      {/* Salesman Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search salesman..."
                value={salesmanSearch}
                onChange={e => setSalesmanSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filteredSalesmenList.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSalesmanId(s.id); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedSalesmanId === s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                  }`}
                >
                  <p className="font-medium">{s.name}</p>
                  <p className={`text-xs ${selectedSalesmanId === s.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {s.cnic}
                  </p>
                </button>
              ))}
              {filteredSalesmenList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No salesmen found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date Range & Summary */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                    className="w-36 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    max={today}
                    onChange={e => { setDateTo(e.target.value); setPage(1); }}
                    className="w-36 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {QUICK_RANGES.map(r => (
                    <Button key={r.days} variant="outline" size="sm" onClick={() => applyQuickRange(r.days)}>
                      {r.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedSalesmanId && (
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(summary) as [AttendanceStatus, number][]).map(([status, count]) => (
                <Card key={status}>
                  <CardContent className="p-3 text-center">
                    <p className="text-lg font-bold">{count}</p>
                    <Badge className={`text-xs mt-1 ${statusBadgeClass[status]}`}>{status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      {!selectedSalesmanId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select a salesman to view attendance history
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="border rounded-lg bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Backdated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No attendance records found for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRecords.map(record => {
                    const isEditing = editingId === record.id;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell className="text-muted-foreground">{dayName(record.date)}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editDraft.status}
                              onValueChange={v => {
                                const s = v as AttendanceStatus;
                                setEditDraft(d => ({
                                  ...d,
                                  status: s,
                                  checkIn: s === 'ABSENT' || s === 'LEAVE' ? '' : d.checkIn,
                                  checkOut: s === 'ABSENT' || s === 'LEAVE' ? '' : d.checkOut,
                                }));
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(o => (
                                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={statusBadgeClass[record.status]}>{record.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              className="h-8 text-xs w-24"
                              type="time"
                              value={editDraft.checkIn ?? ''}
                              disabled={isTimeDisabled(editDraft.status as AttendanceStatus)}
                              onChange={e => setEditDraft(d => ({ ...d, checkIn: e.target.value }))}
                            />
                          ) : (
                            <span className="text-sm">{record.checkIn || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              className="h-8 text-xs w-24"
                              type="time"
                              value={editDraft.checkOut ?? ''}
                              disabled={isTimeDisabled(editDraft.status as AttendanceStatus)}
                              onChange={e => setEditDraft(d => ({ ...d, checkOut: e.target.value }))}
                            />
                          ) : (
                            <span className="text-sm">{record.checkOut || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              className="h-8 text-xs min-w-[120px]"
                              value={editDraft.remarks ?? ''}
                              onChange={e => setEditDraft(d => ({ ...d, remarks: e.target.value }))}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">{record.remarks || '—'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.isBackdated && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              Backdated
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={saveEdit} title="Save">
                                  <Save className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={cancelEdit} title="Cancel">
                                  <X className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" size="icon" onClick={() => startEdit(record)} title="Edit">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, historyRecords.length)} of {historyRecords.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
