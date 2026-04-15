import { useState, useMemo } from 'react';
import { Search, CheckSquare, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/common/Table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/common/Select';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addAttendanceRecords } from '@/features/attendance/attendanceSlice';
import { AttendanceStatus } from '@/types';
import { MESSAGES } from '@/constants';

const today = new Date().toISOString().split('T')[0];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
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

interface AttendanceRow {
  salesmanId: string;
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  remarks: string;
}

const PAGE_SIZE = 10;

export function AttendancePage() {
  const dispatch = useAppDispatch();
  const { salesmen } = useAppSelector(state => state.salesmen);
  const { records } = useAppSelector(state => state.attendance);

  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Salesmen hired on or before selected date
  const eligibleSalesmen = useMemo(
    () => salesmen.filter(s => s.joiningDate <= selectedDate),
    [salesmen, selectedDate]
  );

  const filteredSalesmen = useMemo(
    () =>
      eligibleSalesmen.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cnic.includes(search)
      ),
    [eligibleSalesmen, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredSalesmen.length / PAGE_SIZE));
  const pageSalesmen = filteredSalesmen.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Already saved records for selected date
  const savedForDate = useMemo(
    () => records.filter(r => r.date === selectedDate),
    [records, selectedDate]
  );

  const alreadySaved = (salesmanId: string) =>
    savedForDate.some(r => r.salesmanId === salesmanId);

  // Local attendance state keyed by salesmanId
  const [rows, setRows] = useState<Record<string, AttendanceRow>>({});

  const getRow = (salesmanId: string): AttendanceRow =>
    rows[salesmanId] ?? {
      salesmanId,
      status: 'PRESENT',
      checkIn: '09:00',
      checkOut: '17:00',
      remarks: '',
    };

  const updateRow = (salesmanId: string, field: keyof Omit<AttendanceRow, 'salesmanId'>, value: string) => {
    setRows(prev => {
      const current = getRow(salesmanId);
      const updated = { ...current, [field]: value };
      if (field === 'status' && (value === 'LEAVE' || value === 'ABSENT')) {
        updated.checkIn = '';
        updated.checkOut = '';
      }
      return { ...prev, [salesmanId]: updated };
    });
  };

  const markAllPresent = () => {
    const updates: Record<string, AttendanceRow> = {};
    eligibleSalesmen.forEach(s => {
      if (!alreadySaved(s.id)) {
        updates[s.id] = { salesmanId: s.id, status: 'PRESENT', checkIn: '09:00', checkOut: '17:00', remarks: '' };
      }
    });
    setRows(prev => ({ ...prev, ...updates }));
    toast.info('All marked as Present');
  };

  const isBackdated = selectedDate < today;

  const handleSave = () => {
    const unsaved = eligibleSalesmen.filter(s => !alreadySaved(s.id));
    if (unsaved.length === 0) {
      toast.info('Attendance already saved for all salesmen on this date');
      return;
    }

    const toSave = unsaved.map(s => {
      const row = getRow(s.id);
      return {
        salesmanId: s.id,
        date: selectedDate,
        status: row.status,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        remarks: row.remarks,
        isBackdated,
      };
    });

    dispatch(addAttendanceRecords(toSave));
    toast.success(MESSAGES.ATTENDANCE_SAVED);
    setRows({});
  };

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => { setSelectedDate(d => addDays(d, -1)); setPage(1); }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setPage(1); }}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="outline" size="icon" onClick={() => { setSelectedDate(d => addDays(d, 1)); setPage(1); }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedDate(today); setPage(1); }}>
              Today
            </Button>
            {isBackdated && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">Backdated Entry</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or CNIC..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            <CheckSquare className="w-4 h-4 mr-2" />
            Mark All Present
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>CNIC</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Saved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageSalesmen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No salesmen found for this date
                </TableCell>
              </TableRow>
            ) : (
              pageSalesmen.map((salesman, index) => {
                const row = getRow(salesman.id);
                const saved = alreadySaved(salesman.id);
                const savedRecord = savedForDate.find(r => r.salesmanId === salesman.id);
                const disableTime = row.status === 'LEAVE' || row.status === 'ABSENT';

                return (
                  <TableRow key={salesman.id} className={saved ? 'opacity-60' : ''}>
                    <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                    <TableCell className="font-medium">{salesman.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{salesman.cnic}</TableCell>
                    <TableCell className="min-w-[120px]">
                      {saved ? (
                        <Badge className={statusBadgeClass[savedRecord!.status]}>
                          {savedRecord!.status}
                        </Badge>
                      ) : (
                        <Select
                          value={row.status}
                          onValueChange={v => updateRow(salesman.id, 'status', v)}
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
                      )}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      {saved ? (
                        <span className="text-sm">{savedRecord!.checkIn || '—'}</span>
                      ) : (
                        <Input
                          className="h-8 text-xs w-24"
                          type="time"
                          value={row.checkIn}
                          disabled={disableTime}
                          onChange={e => updateRow(salesman.id, 'checkIn', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      {saved ? (
                        <span className="text-sm">{savedRecord!.checkOut || '—'}</span>
                      ) : (
                        <Input
                          className="h-8 text-xs w-24"
                          type="time"
                          value={row.checkOut}
                          disabled={disableTime}
                          onChange={e => updateRow(salesman.id, 'checkOut', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      {saved ? (
                        <span className="text-sm text-muted-foreground">{savedRecord!.remarks || '—'}</span>
                      ) : (
                        <Input
                          className="h-8 text-xs"
                          placeholder="Remarks..."
                          value={row.remarks}
                          onChange={e => updateRow(salesman.id, 'remarks', e.target.value)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {saved ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Saved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
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
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSalesmen.length)} of {filteredSalesmen.length}
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
    </div>
  );
}
