import React, { useState, useEffect } from 'react';
import { ActivityOut, Room, Student } from '../libs/types';
import { downloadCertificatesPpt } from '../libs/api';
import FileInput from '../components/FileInput';

interface CertificatesProps {
  years: string[];
  selectedYear: string | null;
  setSelectedYear: (y: string | null) => void;
  rooms: Room[];
  activities: ActivityOut[];
  students: Student[];
  selectedRoom: number | null;
  setSelectedRoom: (room: number | null) => void;
  selectedActivityId: number | null;
  setSelectedActivityId: (id: number | null) => void;
}

type CertificateType = 'participation' | 'position_individual' | 'position_team' | '';

export default function Certificates({ years, selectedYear, setSelectedYear, rooms, activities, selectedRoom, setSelectedRoom, selectedActivityId, setSelectedActivityId }: CertificatesProps) {
  const [certificateType, setCertificateType] = useState<CertificateType>('');
  const [pptFile, setPptFile] = useState<File | null>(null);
  const [awardDate, setAwardDate] = useState('');

  const selectedActivity = activities.find(a => a.id === selectedActivityId) || null;

  useEffect(() => {
    // Reset subsequent selections when the room changes
    setCertificateType('');
    setSelectedActivityId(null);
    setPptFile(null);
  }, [selectedRoom]);

  useEffect(() => {
    // Reset activity and file when cert type changes
    setSelectedActivityId(null);
    setPptFile(null);
  }, [certificateType]);

  useEffect(() => {
    // Default award date to activity date when selection changes
    setAwardDate(selectedActivity?.activity_date || "");
  }, [selectedActivity?.activity_date]);

  const filteredActivities = certificateType === 'position_individual'
    ? activities.filter(a => !a.is_team)
    : certificateType === 'position_team'
      ? activities.filter(a => a.is_team)
      : [];

  async function onGeneratePpt(): Promise<void> {
    if (!selectedYear) { alert("Please select a year."); return; }
    if (!selectedRoom) { alert("Please select a room."); return; }
    if (!certificateType) { alert("Please select a certificate type."); return; }
    if (certificateType.startsWith('position') && !selectedActivityId) { alert("Please select an activity."); return; }
    if (!pptFile) { alert("Please upload a PPTX template file."); return; }

    const form = new FormData();
    form.set("room", String(selectedRoom));
    form.set("school_year", selectedYear);
    form.set("template_kind", certificateType);
    if (awardDate) form.set("award_date", awardDate);
    form.set("template", pptFile);

    try {
      const activityId = certificateType === 'participation' ? 0 : selectedActivityId!;
      const blob = await downloadCertificatesPpt(activityId, form);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fn = `certificates_room${selectedRoom}_${certificateType}_${activityId}.pptx`;
      a.download = fn;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Generate failed: ${e?.message ?? String(e)}`);
    }
  }

  const getPlaceholders = () => {
    switch (certificateType) {
      case 'position_individual':
      case 'position_team':
        return ['{NAME}', '{EVENT DATE}', '{EVENT}', '{POSITION}'].concat(certificateType === 'position_team' ? ['{TEAM_NAME}'] : []).join(', ');
      case 'participation':
        return ['{NAME}', '{AWARD_DATE}', '{EVENTS}'].join(', ');
      default:
        return '';
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Generate Certificates</h1>

        {/* Step 1: Year Selection */}
        <div className="space-y-2">
          <label htmlFor="year-select" className="block text-lg font-semibold text-gray-700">Step 1: Select a Year</label>
          <select
            id="year-select"
            className="w-full h-11 px-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedYear ?? ''}
            onChange={(e) => setSelectedYear(e.target.value || null)}
          >
            <option value="">-- Select a Year --</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Step 2: Room Selection */}
        <div className="space-y-2">
          <label htmlFor="room-select" className="block text-lg font-semibold text-gray-700">Step 2: Select a Room</label>
          <select
            id="room-select"
            className="w-full h-11 px-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedRoom ?? ''}
            onChange={(e) => setSelectedRoom(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">-- Select a Room --</option>
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {selectedYear && selectedRoom && (
          <>
            {/* Step 3: Certificate Type */}
            <div className="space-y-2">
              <label htmlFor="cert-type-select" className="block text-lg font-semibold text-gray-700">Step 2: Choose Certificate Type</label>
              <select
                id="cert-type-select"
                className="w-full h-11 px-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={certificateType}
                onChange={e => setCertificateType(e.target.value as CertificateType)}
              >
                <option value="">-- Select Type --</option>
                <option value="participation">Participation</option>
                <option value="position_individual">Positional (Individual)</option>
                <option value="position_team">Positional (Team)</option>
              </select>
            </div>

            {certificateType.startsWith('position') && (
              <>
                {/* Step 4: Activity Selection */}
                <div className="space-y-2">
                  <label htmlFor="activity-select" className="block text-lg font-semibold text-gray-700">Step 3: Select an Activity</label>
                  <select
                    id="activity-select"
                    className="w-full h-11 px-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedActivityId ?? ''}
                    onChange={(e) => setSelectedActivityId(e.target.value ? Number(e.target.value) : null)}
                    disabled={filteredActivities.length === 0}
                  >
                    <option value="">-- Select an Activity --</option>
                    {filteredActivities.map(a => (
                      <option key={a.id} value={a.id}>{a.activity_date} – {a.name}</option>
                    ))}
                  </select>
                  {filteredActivities.length === 0 && <p className="text-sm text-gray-500">No {certificateType.split('_')[1]} activities found.</p>}
                </div>
              </>
            )}

            {certificateType && (
              <>
                {/* Step 4: Upload Template */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-700">Step {certificateType.startsWith('position') ? 4 : 3}: Upload Template</label>
                  <FileInput file={pptFile} onFileChange={setPptFile} acceptedFileType=".pptx" />
                  {getPlaceholders() && (
                    <p className="text-xs text-gray-500 pt-1">Use placeholders: <span className="font-mono">{getPlaceholders()}</span></p>
                  )}
                </div>

                {pptFile && (
                  <>
                    {/* Optional: Award Date */}
                    {(certificateType === 'participation') && (
                      <div className="space-y-2">
                        <label htmlFor="award-date" className="block text-sm font-medium text-gray-600">Award Date (Optional)</label>
                        <input
                          id="award-date"
                          type="date"
                          className="w-full h-11 px-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={awardDate}
                          onChange={e => setAwardDate(e.target.value)}
                          placeholder="Defaults to latest event date"
                        />
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      onClick={onGeneratePpt}
                      className="w-full h-11 px-4 text-white font-semibold bg-orange-600 rounded-xl shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      Generate PPT
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
