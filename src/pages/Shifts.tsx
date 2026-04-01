import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import trendUpIcon from "../assets/trend-up.svg";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const Shifts = () => {
    const navigate = useNavigate();
    const { riderUuid, kycStatus, isOnline, setIsOnline, selectedHubName, selectedZoneName } = useAuth();
    
    // Shift Data States
    const [shifts, setShifts] = useState<any[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [isToggling, setIsToggling] = useState(false);
    const [loading, setLoading] = useState(true);
    const [consistencyTarget, setConsistencyTarget] = useState(3);
    const [bonusAmount, setBonusAmount] = useState('₹500');
    const [bonusSlot, setBonusSlot] = useState('9-11 PM');
    const [totalCompletedShifts, setTotalCompletedShifts] = useState(0);
    const [prefStart, setPrefStart] = useState('9:00 PM');
    const [prefEnd, setPrefEnd] = useState('11:00 PM');
    const [inferredStart, setInferredStart] = useState<string | null>(null);
    const [inferredEnd, setInferredEnd] = useState<string | null>(null);

    // Sync active shift and fetch weekly data
    useEffect(() => {
        if (!riderUuid) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Calculate start of this week (Monday 00:00:00)
                const now = new Date();
                const day = now.getDay(); 
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(now.setDate(diff));
                monday.setHours(0, 0, 0, 0);
                const startOfWeek = monday.toISOString();

                // 2. Fetch Weekly Shifts
                const { data: shiftData, error: shiftError } = await supabase
                    .from('rider_shifts')
                    .select('*')
                    .eq('rider_id', riderUuid)
                    .gte('started_at', startOfWeek)
                    .order('started_at', { ascending: true });

                if (shiftError) throw shiftError;
                if (shiftData) {
                    setShifts(shiftData);
                    const active = shiftData.find(s => s.is_active === true);
                    setActiveShift(active || null);
                }

                // 3. Fetch Total Completed Shifts for Cold Start (All time)
                const { count: totalShiftsCount } = await supabase
                    .from('rider_shifts')
                    .select('*', { count: 'exact', head: true })
                    .eq('rider_id', riderUuid)
                    .eq('is_active', false);
                
                setTotalCompletedShifts(totalShiftsCount || 0);

                // 4. Fetch Shift Preferences (Consistency, Bonus, Preferred/Inferred Times)
                const { data: prefData } = await supabase
                    .from('rider_shift_preferences')
                    .select('consistency_days_target, bonus_amount, bonus_time_slot, preferred_start_hour, preferred_end_hour, inferred_start_hour, inferred_end_hour')
                    .eq('rider_id', riderUuid)
                    .maybeSingle();
                
                if (prefData) {
                    if (prefData.consistency_days_target) setConsistencyTarget(prefData.consistency_days_target);
                    if (prefData.bonus_amount) setBonusAmount(prefData.bonus_amount);
                    if (prefData.bonus_time_slot) setBonusSlot(prefData.bonus_time_slot);
                    
                    const formatHour = (h: number) => {
                        const h12 = h % 12 || 12;
                        return `${h12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
                    };

                    if (prefData.preferred_start_hour) setPrefStart(formatHour(prefData.preferred_start_hour));
                    if (prefData.preferred_end_hour) setPrefEnd(formatHour(prefData.preferred_end_hour));
                    if (prefData.inferred_start_hour !== null && prefData.inferred_start_hour !== undefined) {
                        setInferredStart(formatHour(prefData.inferred_start_hour));
                    }
                    if (prefData.inferred_end_hour !== null && prefData.inferred_end_hour !== undefined) {
                        setInferredEnd(formatHour(prefData.inferred_end_hour));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch shifts:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [riderUuid, isOnline]);

    // Live Shift Timer: Updates elapsedMinutes every 60s
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (activeShift) {
            const startTime = new Date(activeShift.started_at).getTime();
            const updateElapsed = () => {
                const now = new Date().getTime();
                const diff = Math.floor((now - startTime) / (1000 * 60));
                setElapsedMinutes(diff);
            };
            
            updateElapsed(); // Initial run
            interval = setInterval(updateElapsed, 60000);
        } else {
            setElapsedMinutes(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeShift]);

    // Derived Metrics
    const completedShifts = shifts.filter(s => !s.is_active);
    const totalDurationMinutes = completedShifts.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) + elapsedMinutes;
    
    const formatDuration = (totalMins: number) => {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return `${h}h ${m}m`;
    };

    // Daily Average Calculation
    const uniqueDaysWorked = new Set(shifts.map(s => new Date(s.started_at).toDateString())).size;
    
    // Consistency Calculation (Requirement: Unique days with at least one COMPLETED shift)
    const completedUniqueDays = new Set(completedShifts.map(s => new Date(s.started_at).toDateString())).size;
    const consistencyPercentage = Math.min(Math.round((completedUniqueDays / consistencyTarget) * 100), 100);
    const isGoalMet = completedUniqueDays >= consistencyTarget;

    const dailyAvgMinutes = uniqueDaysWorked > 0 ? Math.round(totalDurationMinutes / uniqueDaysWorked) : 0;

    // Chart Data Generation (Mon-Sun)
    const getChartData = () => {
        const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
        shifts.forEach(s => {
            const d = new Date(s.started_at);
            let dayIdx = d.getDay() - 1; // 1 (Mon) becomes 0
            if (dayIdx === -1) dayIdx = 6; // 0 (Sun) becomes 6
            
            let duration = (s.duration_minutes || 0);
            if (s.is_active) duration += elapsedMinutes;
            
            weeklyData[dayIdx] += duration;
        });
        
        // Return hours for chart display
        return weeklyData.map(mins => Number((mins / 60).toFixed(1)));
    };

    const chartHours = getChartData();

    // Ported handleToggleOnline Logic
    const handleToggleOnline = async () => {
        if (kycStatus !== "verified" || !riderUuid || isToggling) return;
        
        const nextOnline = !isOnline;
        setIsToggling(true);
        
        try {
            if (nextOnline) {
                // Shift Start
                const { data: newShift, error: shiftError } = await supabase
                    .from('rider_shifts')
                    .insert({ 
                        rider_id: riderUuid, 
                        is_active: true,
                        hub_name: selectedHubName || selectedZoneName || 'Primary'
                    })
                    .select('*')
                    .single();

                if (shiftError) throw shiftError;
                
                setActiveShift(newShift);
                
                // 2. Log Interaction for Learning Layer
                const currentHour = new Date().getHours();
                const hubName = selectedHubName || selectedZoneName || 'Primary';
                
                await supabase.from('rider_interactions').insert({
                    rider_id: riderUuid,
                    interaction_type: 'completed',
                    time_slot_start: currentHour,
                    hub_name: hubName
                });

                await supabase.from('riders').update({ is_online: true }).eq('id', riderUuid);
            } else {
                // Shift End
                if (activeShift) {
                    const startedAt = new Date(activeShift.started_at);
                    const endedAt = new Date();
                    const durationInMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));

                    const { error: updateShiftError } = await supabase
                        .from('rider_shifts')
                        .update({
                            ended_at: endedAt.toISOString(),
                            is_active: false,
                            duration_minutes: durationInMinutes
                        })
                        .eq('id', activeShift.id);

                    if (updateShiftError) throw updateShiftError;
                    setActiveShift(null);
                }
                
                await supabase.from('riders').update({ is_online: false }).eq('id', riderUuid);
            }

            setIsOnline(nextOnline);
            localStorage.setItem("rider_is_online", nextOnline.toString());
            
        } finally {
            setIsToggling(false);
        }
    };

    // --- Area Insights (Top Working Areas) ---
    const areasMap = new Map<string, { mins: number, earnings: number }>();
    shifts.forEach(s => {
        const hName = s.hub_name || (selectedHubName || selectedZoneName || 'Primary Hub');
        const current = areasMap.get(hName) || { mins: 0, earnings: 0 };
        areasMap.set(hName, {
            mins: current.mins + (s.duration_minutes || 0) + (s.is_active ? elapsedMinutes : 0),
            earnings: current.earnings + Number(s.earnings || 0)
        });
    });
    const topAreas = Array.from(areasMap.entries()).map(([name, data]) => ({
        name: name.toLowerCase().endsWith('hub') ? name : `${name} Hub`,
        hours: formatDuration(data.mins),
        earnings: `₹${data.earnings}`
    })).slice(0, 3); // Top 3 areas

    // --- Peak Hours (City Rush Hours) ---
    const rushWindows = [
        { name: 'Lunch Rush', start: 12, end: 15, timing: '12 PM - 3 PM' },
        { name: 'Dinner Rush', start: 19, end: 22, timing: '7 PM - 10 PM' }
    ];

    const peakHourStats = rushWindows.map(window => {
        const windowShifts = shifts.filter(s => {
            const startHour = new Date(s.started_at).getHours();
            const endHour = s.ended_at ? new Date(s.ended_at).getHours() : new Date().getHours();
            // A shift is part of a rush if it starts or ends within the window, or spans across it
            return (startHour < window.end && endHour >= window.start);
        });

        const totalEarnings = windowShifts.reduce((acc, s) => acc + Number(s.earnings || 0), 0);
        return {
            name: window.name,
            timing: window.timing,
            shiftsCount: windowShifts.length,
            earnings: totalEarnings
        };
    }).filter(stat => stat.shiftsCount > 0);

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-y-auto flex flex-col items-center pb-10">
            {/* Purple Glowing Orb */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Header */}
            <div className="flex-none w-[362px] pt-12 flex items-center justify-center relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="absolute left-0 w-[37px] h-[37px] rounded-full border border-[#EDEDED] bg-white flex items-center justify-center shrink-0 active:scale-95 transition-transform z-20"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Heading */}
                <h1 className="text-black text-[22px] font-medium leading-none">
                    Shifts
                </h1>
            </div>

            {/* Shift Container */}
            <div className="mt-7.25 w-[362px] rounded-[14px] border border-[#EDEDED] bg-white z-10 flex flex-col shrink-0 mt-[29px]">
                {/* Header Content */}
                <div className="pt-[10px] pl-[13px] pr-[13px]">
                    <h3 className="text-[14px] font-bold text-black leading-none">
                        {totalCompletedShifts < 3 
                            ? "Learning your patterns based on your behavior" 
                            : (inferredStart ? "Grid.pe Suggested" : "Your Preffered Shift")
                        }
                    </h3>
                    {totalCompletedShifts < 3 ? (
                        <div className="mt-[12px] flex flex-col gap-[6px]">
                            <div className="w-full h-[6px] bg-[#E0E3FF] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#5260FE] transition-all duration-1000"
                                    style={{ width: `${(totalCompletedShifts / 3) * 100}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-medium text-black/40">
                                {3 - totalCompletedShifts} more shifts to analyze for AI suggestions
                            </span>
                        </div>
                    ) : (
                        <p className="mt-[7px] text-[14px] font-medium text-black leading-none">
                            {(() => {
                                const name = selectedHubName || selectedZoneName || 'Primary';
                                const displayName = name.toLowerCase().endsWith('hub') ? name : `${name} Hub`;
                                const start = inferredStart || prefStart;
                                const end = inferredEnd || prefEnd;
                                return `${start} - ${end} (${displayName})`;
                            })()}
                        </p>
                    )}
                </div>

                {/* Loader Section (Weekly Consistency) */}
                <div className="mt-[20px] px-[13px]">
                    <div className="flex justify-between items-center mb-[6px]">
                        <span className="text-[12px] font-bold text-black">Weekly Consistency</span>
                        <span className="text-[12px] font-bold text-[#5260FE]">{consistencyPercentage}%</span>
                    </div>
                    <div className="w-[332px] h-[17px] bg-[#E0E3FF] rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-[#5260FE] flex items-center justify-center transition-all duration-500"
                            style={{ width: `${consistencyPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-[14px] px-[13px]">
                    <p className="text-[14px] font-bold text-black leading-none">
                        Consistency: {completedUniqueDays}/{consistencyTarget} days completed
                    </p>
                    <div 
                        className={`mt-[6px] px-2.5 py-2 rounded-xl inline-flex items-center gap-2 transition-all duration-500 border ${
                            isGoalMet 
                                ? "bg-gradient-to-r from-[#FFD700]/10 via-[#FDB931]/10 to-[#FFD700]/10 border-[#FDB931] shadow-[0_0_15px_rgba(253,185,49,0.15)]" 
                                : "bg-transparent border-transparent"
                        }`}
                    >
                        <span className={`text-[14px] font-bold ${isGoalMet ? "text-black" : "text-black"}`}>
                            {isGoalMet ? "Status:" : "Streak Bonus:"}
                        </span>
                        <span className={`text-[14px] font-medium flex items-center gap-1.5 ${isGoalMet ? "text-[#D97706]" : "text-black"}`}>
                            {isGoalMet ? `${bonusAmount} Earned & Added to Wallet` : bonusAmount}
                            {isGoalMet && (
                                <div className="w-5 h-5 bg-[#34C759] rounded-full flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-[6px] px-[13px] pb-[10px]">
                    <p className="text-[12px] font-medium italic text-black/50 leading-[1.4]">
                        {totalCompletedShifts >= 3 && inferredStart 
                            ? "Optimized based on your last 7 days of activity." 
                            : "Grid.pe learns your shift patterns based on when you start working and when you go offline."
                        }
                    </p>
                </div>
            </div>

            {/* Shift Insights Heading */}
            <div className="w-[362px] mt-8 mb-3 shrink-0">
                <h3 className="text-[15px] font-medium text-black">
                    Shift Insights
                </h3>
            </div>

            {/* Insights Container */}
            <div className="w-[362px] rounded-[14px] border border-[#EDEDED] bg-white flex flex-col shrink-0 p-[10px_13px_10px_13px]">
                {/* Top Row: Metrics and Trend */}
                <div className="flex items-start">
                    {/* Daily Average Info */}
                    <div className="flex flex-col">
                        <span className="text-[12px] font-normal text-black leading-none">
                            Daily average
                        </span>
                        <span className="mt-[1px] text-[22px] font-medium text-black leading-none">
                            {formatDuration(dailyAvgMinutes)}
                        </span>
                    </div>

                    {/* 16px Gap */}
                    <div className="w-[16px]" />

                    {/* Trend Indicator */}
                    {totalDurationMinutes > 0 && (
                        <div className="flex flex-col pt-[2px]">
                            {/* TODO: Fetch real 'Network Average' from the database to replace this hardcoded 25% */}
                            <div className="flex items-center gap-1">
                                <img
                                    src={trendUpIcon}
                                    alt="Trend Up"
                                    className="w-4 h-4"
                                />
                                <span className="text-[12px] font-medium text-[#37AD3A] leading-none">
                                    25%
                                </span>
                            </div>
                            <p className="mt-[3px] text-[12px] font-medium text-[#9F9FAB] leading-tight">
                                above network average
                            </p>
                        </div>
                    )}
                </div>

                {/* Weekly Hours Chart Section (Final Polished Grid) */}
                <div className="mt-[12px] w-[314px] flex flex-col">
                    <div className="relative h-[140px] w-full mt-2 mb-10">
                        {/* Vertical Grid Lines (Separators) - 7 lines, framing the START of each day column */}
                        <div className="absolute inset-0 pointer-events-none h-[164px]">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute h-full border-l-[0.8px] border-dashed border-[#EDEDED]"
                                    style={{ left: `${(i * 100) / 7}%` }}
                                />
                            ))}
                        </div>

                        {/* Y-Axis Labels & Grid Lines - 8 lines, 20px spacing */}
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {[
                                { val: 9, pos: 0, label: null },
                                { val: 8, pos: 20, label: "8h" },
                                { val: 7.33, pos: 40, label: null },
                                { val: 6.66, pos: 60, label: null },
                                { val: 6, pos: 80, label: "6h" },
                                { val: 4, pos: 100, label: null },
                                { val: 2, pos: 120, label: null },
                                { val: 0, pos: 140, label: "0" }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute left-0 right-0 border-b-[0.8px] border-[#EDEDED]"
                                    style={{ top: `${item.pos}px` }}
                                >
                                    {item.label && (
                                        <span
                                            className="absolute right-[-24px] text-[12px] font-normal text-black/50 top-0 -translate-y-1/2"
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Avg Line (Green Dashed) - Only shown if rider has a positive daily average */}
                        {dailyAvgMinutes > 0 && (
                            <div
                                className="absolute left-0 right-0 border-t border-dashed border-[#27C840] z-20"
                                style={{ top: "70px" }}
                            >
                                <span
                                    className="absolute right-[-28px] text-[12px] font-normal text-[#27C840] top-0 -translate-y-1/2"
                                >
                                    avg
                                </span>
                            </div>
                        )}

                        {/* Bars & X-Axis */}
                        <div className="absolute inset-0 flex items-end justify-between px-0" style={{ height: "140px" }}>
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                                const h = chartHours[idx];
                                let barH = 0;
                                if (h <= 6) {
                                    barH = h * 10;
                                } else {
                                    barH = 60 + Math.min(h - 6, 2.66) * 30;
                                }

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center relative h-full justify-end">
                                        {/* Bar */}
                                        <div
                                            className="w-[20px] bg-[#5260FE] rounded-t-[4px] transition-all duration-500 z-10"
                                            style={{ height: `${barH}px` }}
                                        />

                                        {/* X-Axis Label */}
                                        <span className="absolute bottom-[-20px] text-[12px] font-normal text-black/50">
                                            {day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Chart Divider - Below chart */}
                <div className="mt-[-4px] w-[362px] -ml-[13px] h-[1px] bg-black/15" />

                {/* Insights Metrics Rows */}
                <div className="mt-[12px] flex flex-col gap-[6px]">
                    {[
                        { label: "Total Active Hours:", value: formatDuration(totalDurationMinutes) },
                        { label: "Shifts Completed:", value: completedShifts.length.toString() },
                        { label: "Days Worked:", value: uniqueDaysWorked.toString() },
                        { label: "Network Avg:", value: "5h 20m" }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className={`text-[14px] text-black ${i === 0 ? "font-bold" : "font-medium"}`}>
                                {item.label}
                            </span>
                            <span className={`text-[14px] text-black ${i === 0 ? "font-bold" : "font-medium"}`}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Insights Container */}
            <div className="mt-[12px] w-[362px] rounded-[14px] border border-[#EDEDED] bg-white flex flex-col shrink-0 p-[12px_14px_12px_14px]">
                {/* Top Working Areas */}
                <div className="flex flex-col gap-[6px]">
                    <h3 className="text-[14px] font-bold text-black uppercase opacity-50 font-satoshi" style={{ letterSpacing: '-0.43px' }}>Top Working Areas</h3>
                    {topAreas.length > 0 ? (
                        topAreas.map((area, i) => (
                            <div key={i} className="flex justify-between items-center text-[14px] font-medium text-black font-satoshi">
                                <span className="flex-1">{area.name}</span>
                                <span className="w-[80px] text-right">{area.hours}</span>
                                <span className="w-[60px] text-right">{area.earnings}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-[14px] font-medium text-black/40 italic font-satoshi">No working areas recorded this week.</p>
                    )}
                </div>

                {/* Section Spacing */}
                <div className="h-[16px]" />

                {/* City Rush Hours */}
                <div className="flex flex-col gap-[6px]">
                    <h3 className="text-[14px] font-bold text-black uppercase opacity-50 font-satoshi" style={{ letterSpacing: '-0.43px' }}>City Rush Hours</h3>
                    {peakHourStats.length > 0 ? (
                        peakHourStats.map((peak, i) => (
                            <div key={i} className="flex justify-between items-center text-[14px] font-medium text-black font-satoshi">
                                <div className="flex flex-col flex-1">
                                    <span>{peak.name}</span>
                                    <span className="text-[10px] text-black/50">{peak.timing}</span>
                                </div>
                                <span className="w-[80px] text-right">{peak.shiftsCount} {peak.shiftsCount === 1 ? 'Shift' : 'Shifts'}</span>
                                <span className="w-[60px] text-right">₹{peak.earnings}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-[14px] font-medium text-black/50 italic leading-snug font-satoshi">
                            Work during lunch (12-3 PM) or dinner (7-10 PM) to see peak hour insights.
                        </p>
                    )}
                </div>
            </div>

            {/* Final Info Box - Only shown if rider has at least 3 completed shifts */}
            {completedShifts.length >= 3 && (
                <div className="mt-[32px] w-[362px] bg-black rounded-[20px] p-[20px_16px] flex flex-col gap-[8px] shrink-0 mb-[10px]">
                    <p className="text-[14px] font-medium text-white leading-tight font-satoshi" style={{ letterSpacing: '-0.43px' }}>
                        💡 You earned 25% more during evening shifts this week.
                    </p>
                    <p className="text-[14px] font-medium text-white leading-tight font-satoshi" style={{ letterSpacing: '-0.43px' }}>
                        Keep your {bonusSlot} streak to unlock the {bonusAmount} bonus.
                    </p>
                </div>
            )}

            {/* Dynamic CTA Button: 17px below info box (or more for layout balance) */}
            <div className={`w-full flex justify-center pb-10 ${completedShifts.length >= 3 ? 'mt-[10px]' : 'mt-[32px]'}`}>
                <button
                    onClick={handleToggleOnline}
                    disabled={isToggling}
                    className="w-[362px] h-[52px] bg-black rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-[0px_8px_16px_rgba(0,0,0,0.15)]"
                >
                    {isToggling ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="text-white text-[16px] font-bold font-satoshi">
                            {isOnline ? "Go Offline Now" : "Go Online Now"}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Shifts;
