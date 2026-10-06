import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Building,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  Globe,
  Loader2,
  Video,
} from 'lucide-react';
import { useCms } from '../../../context/CmsContext';

interface ChatMeetingSchedulerProps {
  onMeetingScheduled?: (meetingData: any) => void;
  prefillSolution?: string;
  initialData?: any;
}

export const ChatMeetingScheduler: React.FC<ChatMeetingSchedulerProps> = ({
  onMeetingScheduled,
  prefillSolution,
}) => {
  const { cmsData, refreshCmsData } = useCms();

  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [meetingType, setMeetingType] = useState<'walkthrough' | 'fixSandbox' | 'vpcArchitecture'>('fixSandbox');
  const [fullName, setFullName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [booked, setBooked] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const dates = [
    { label: 'Today (Urgent)', value: new Date().toISOString().split('T')[0] },
    { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
    { label: 'Next Business Day', value: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] },
  ];

  React.useEffect(() => {
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(`/api/calendar/slots?date=${encodeURIComponent(selectedDate)}`);
        const data = await res.json();
        if (data.success) {
          setAvailableSlots(data.slots);
          if (data.slots.length > 0 && !data.slots.includes(selectedSlot)) {
            setSelectedSlot(data.slots[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workEmail.trim() || !selectedSlot || isBooking) return;

    setIsBooking(true);
    try {
      const topic =
        meetingType === 'fixSandbox'
          ? 'FIX 4.4 & MT5 Sandbox Bridge Demonstration'
          : meetingType === 'vpcArchitecture'
          ? 'Enterprise Private VPC & H100 Architecture'
          : 'Executive 9xen Platform Overview & ROI';

      const payload = {
        name: fullName.trim(),
        email: workEmail.trim(),
        company: companyName.trim() || 'Institutional Trader / Fund',
        date: selectedDate,
        slot: selectedSlot,
        meetingType,
        topic: `${topic} - Prefill: ${prefillSolution || 'None'}`,
      };

      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBooked(true);
        setBookingError(null);
        refreshCmsData();
        onMeetingScheduled?.({
          name: fullName,
          email: workEmail,
          company: companyName,
          date: selectedDate,
          time: selectedSlot,
          topic,
        });
      } else {
        const data = await res.json();
        const msg = data.error || 'Booking slot conflict. Please choose another time.';
        setBookingError(msg);
        // Refresh available slots for this date
        try {
          const slotRes = await fetch(`/api/calendar/slots?date=${encodeURIComponent(selectedDate)}`);
          const slotData = await slotRes.json();
          if (slotData.success && slotData.slots) {
            setAvailableSlots(slotData.slots);
            if (slotData.slots.length > 0 && !slotData.slots.includes(selectedSlot)) {
              setSelectedSlot(slotData.slots[0]);
            }
          }
        } catch {}
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError('Unable to connect to calendar service at this moment.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadCalendarIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//9xen Autonomous Intelligence//Executive Walkthrough//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}@9xen.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:9xen Institutional Sandbox & Architecture Walkthrough
DESCRIPTION:Live 20-minute technical demonstration with 9xen Lead Quant Solutions Architect. Focus: ${prefillSolution || 'AlphaBot Pro FIX 4.4 Engine'}.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '9xen-executive-walkthrough.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-cyan-400 animate-pulse" />
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Discovery Session Confirmed!</h4>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Meeting coordinates & Sandbox access instructions have been dispatched to <strong className="text-cyan-300">{workEmail}</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadCalendarIcs}
          className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border border-white/10"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Add to Calendar (.ics)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header Info */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/20 text-cyan-200 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>Schedule 1-on-1 Architect Discovery Session</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
            20-MIN BRIEFING
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Walk through low-latency FIX execution live with our Principal Quant Solutions Engineers.
        </p>
      </div>

      <form onSubmit={handleBookSession} className="space-y-3.5">
        {/* Meeting Focus Type */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-slate-400">Select Demonstration Topic:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMeetingType('fixSandbox')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                meetingType === 'fixSandbox'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-[#121212] border-white/10 text-white/70'
              }`}
            >
              <span className="text-[10px] block">⚡ FIX / MT5 Sandbox</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingType('vpcArchitecture')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                meetingType === 'vpcArchitecture'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                  : 'bg-[#121212] border-white/10 text-white/70'
              }`}
            >
              <span className="text-[10px] block">🛡️ Private VPC / H100</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingType('walkthrough')}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                meetingType === 'walkthrough'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-[#121212] border-white/10 text-white/70'
              }`}
            >
              <span className="text-[10px] block">📊 Executive ROI</span>
            </button>
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-cyan-400" />
            <span>Target Day:</span>
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
            {dates.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSelectedDate(d.value)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedDate === d.value
                    ? 'bg-cyan-500 text-black font-bold shadow'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot Selector */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Available Technical Slots (Timezone Auto-detected):</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {isLoadingSlots ? (
              <div className="col-span-2 py-4 flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking availability...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2 rounded-xl border text-left font-mono text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                    selectedSlot === slot
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-[#121212] border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <span>{slot}</span>
                  {selectedSlot === slot && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))
            ) : (
              <div className="col-span-2 py-4 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                No technical slots available for this day.
              </div>
            )}
          </div>
        </div>

        {/* Contact Info Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              placeholder="m.vance@quantfunds.com"
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {bookingError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{bookingError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isBooking}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-black font-black text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isBooking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reserving Private Slot...</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              <span>Confirm 20-Min Architecture Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
