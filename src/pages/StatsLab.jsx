import React from 'react';
import { useOmni } from '../context/OmniContext';
import { BarChart3, Activity, PieChart, History } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { ActivityCalendar } from 'react-activity-calendar';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const StatsLab = () => {
  const { branches, tasks } = useOmni();

  // ... (keep Doughnut logic) ...
  const completedDailyTasks = tasks.filter(t => t.done && t.type === 'daily');
  const completedWeeklyTasks = tasks.filter(t => t.done && t.type === 'weekly');
  
  // Helper to generate chart data for a specific task list
  const generateChartData = (taskList) => {
    const branchStats = {};
    let totalMinutes = 0;

    taskList.forEach(task => {
      const bId = task.branchId;
      const tTime = task.tentativeTime || 0;
      if (tTime > 0) {
        if (!branchStats[bId]) branchStats[bId] = 0;
        branchStats[bId] += tTime;
        totalMinutes += tTime;
      }
    });

    const activeBranchIds = Object.keys(branchStats);
    const labels = [];
    const data = [];
    const bgColors = [];

    activeBranchIds.forEach(bId => {
      const branch = branches.find(b => b.id === bId) || { name: 'Unknown', color: '#ccc' };
      labels.push(branch.name);
      data.push(branchStats[bId]);
      bgColors.push(branch.color);
    });

    return {
      totalMinutes,
      chartData: {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: bgColors.length > 0 ? bgColors : ['#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 4,
        }],
      }
    };
  };

  const dailyChart = generateChartData(completedDailyTasks);
  const weeklyChart = generateChartData(completedWeeklyTasks);

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { color: 'var(--text-primary)', font: { family: 'inherit' } } },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.label === 'No Data') return '0m';
            const mins = context.raw;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return ` ${h}h ${m}m`;
          }
        }
      }
    }
  };

  const formatMins = (totalMins) => {
    if (totalMins === 0) return '0h 0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  // --- PREPARE DATA: TRUE 365-DAY GITHUB HEATMAP ---
  const today = startOfDay(new Date());

  const dailyVolumes = {};
  tasks.filter(t => t.done && t.completedAt).forEach(task => {
    const dayKey = format(new Date(task.completedAt), 'yyyy-MM-dd');
    if (!dailyVolumes[dayKey]) dailyVolumes[dayKey] = 0;
    dailyVolumes[dayKey] += (task.tentativeTime || 0);
  });

  const getLevel = (minutes) => {
    if (!minutes || minutes === 0) return 0;
    if (minutes >= 240) return 4;
    if (minutes >= 120) return 3;
    if (minutes >= 60) return 2;
    return 1;
  };

  const heatmapData = Array.from({ length: 365 }, (_, i) => {
    const d = subDays(today, 364 - i);
    const dayStr = format(d, 'yyyy-MM-dd');
    const volume = dailyVolumes[dayStr] || 0;
    return {
      date: dayStr,
      count: volume,
      level: getLevel(volume)
    };
  });

  const theme = {
    light: ['#e2e8f0', '#f4b8a2', '#e88d6e', '#e0653c', '#e28743'],
    dark: ['#e2e8f0', '#f4b8a2', '#e88d6e', '#e0653c', '#e28743']
  };

  // --- PREPARE DATA: HISTORY GROUPS ---
  const groupedWeeklyTasks = {};
  completedWeeklyTasks.forEach(t => {
    const d = new Date(t.completedAt || new Date());
    // weekStartsOn: 0 means Sunday
    const weekStart = startOfWeek(d, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(d, { weekStartsOn: 0 });
    const rangeKey = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
    
    if (!groupedWeeklyTasks[rangeKey]) groupedWeeklyTasks[rangeKey] = [];
    groupedWeeklyTasks[rangeKey].push(t);
  });

  const groupedDailyTasks = {};
  completedDailyTasks.forEach(t => {
    const d = new Date(t.completedAt || new Date());
    const dayKey = format(d, 'EEEE, MMM dd, yyyy'); // e.g. "Monday, Oct 02, 2023"
    
    if (!groupedDailyTasks[dayKey]) groupedDailyTasks[dayKey] = [];
    groupedDailyTasks[dayKey].push(t);
  });

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header className="dashboard-header">
        <h1><BarChart3 style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> The Stats Lab</h1>
        <p>Analyze your volume and consistency.</p>
      </header>

      {/* Heatmap Card */}
      <div className="card" style={{ marginBottom: '2rem', overflowX: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Activity color="var(--color-placement)" />
          <h2 style={{ margin: 0 }}>365-Day Consistency Heatmap</h2>
        </div>
        
        <div style={{ minWidth: '800px' }}>
          <ActivityCalendar 
            data={heatmapData} 
            theme={theme}
            hideTotalCount={true}
            renderBlock={(block, activity) => 
              React.cloneElement(block, {
                title: `${activity.count} minutes on ${format(new Date(activity.date), 'MMM dd, yyyy')}`
              })
            }
            colorScheme="light"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Daily Doughnut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>
            <PieChart color="var(--color-gate)" />
            <h3 style={{ margin: 0 }}>Daily Focus Allocation</h3>
          </div>
          <div style={{ width: '250px', height: '250px', position: 'relative' }}>
            <Doughnut data={dailyChart.chartData} options={doughnutOptions} />
            <div style={{ position: 'absolute', top: '40%', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Today's Vol.</p>
              <h3 style={{ margin: 0 }}>{formatMins(dailyChart.totalMinutes)}</h3>
            </div>
          </div>
        </div>

        {/* Weekly Doughnut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>
            <PieChart color="var(--color-research)" />
            <h3 style={{ margin: 0 }}>Weekly Focus Allocation</h3>
          </div>
          <div style={{ width: '250px', height: '250px', position: 'relative' }}>
            <Doughnut data={weeklyChart.chartData} options={doughnutOptions} />
            <div style={{ position: 'absolute', top: '40%', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Week's Vol.</p>
              <h3 style={{ margin: 0 }}>{formatMins(weeklyChart.totalMinutes)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* History Section: Two Columns */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <History color="var(--color-academics)" />
          <h2 style={{ margin: 0 }}>Task History Archive</h2>
        </div>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>A complete log of all the tasks you have conquered.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Weekly History Column */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-research)' }}>
              Weekly Macro Goals
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {Object.keys(groupedWeeklyTasks).length > 0 ? (
                Object.entries(groupedWeeklyTasks).reverse().map(([range, tks]) => (
                  <div key={range} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {range}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {tks.map(task => {
                        const branch = branches.find(b => b.id === task.branchId) || { name: 'Unknown', color: '#ccc' };
                        return (
                          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '6px', borderLeft: `3px solid ${branch.color}` }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <h5 style={{ margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{task.title}</h5>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatMins(task.tentativeTime || 0)}
                            </div>
                            <div className="branch-tag" style={{ backgroundColor: branch.color, fontSize: '0.7rem', padding: '2px 6px' }}>
                              {branch.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '8px' }}>
                  No weekly tasks completed yet.
                </div>
              )}
            </div>
          </div>

          {/* Daily History Column */}
          <div>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--color-placement)' }}>
              Daily Focus Tasks
            </h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {Object.keys(groupedDailyTasks).length > 0 ? (
                Object.entries(groupedDailyTasks).reverse().map(([day, tks]) => (
                  <div key={day} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {tks.map(task => {
                        const branch = branches.find(b => b.id === task.branchId) || { name: 'Unknown', color: '#ccc' };
                        return (
                          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '6px', borderLeft: `3px solid ${branch.color}` }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <h5 style={{ margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{task.title}</h5>
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {formatMins(task.tentativeTime || 0)}
                            </div>
                            <div className="branch-tag" style={{ backgroundColor: branch.color, fontSize: '0.7rem', padding: '2px 6px' }}>
                              {branch.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '8px' }}>
                  No daily tasks completed yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatsLab;
