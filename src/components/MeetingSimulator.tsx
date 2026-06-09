import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, FastForward, RotateCcw, BrainCircuit, Users, MessageSquareCode, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SimulationScript {
  timestamp: string;
  speaker: string;
  text: string;
}

interface PresetScenario {
  id: string;
  name: string;
  description: string;
  script: SimulationScript[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'design',
    name: '🎨 Product Design Align Sync',
    description: 'Design mockups review for V2 features and design principles alignment.',
    script: [
      { timestamp: '00:00', speaker: 'Chloe', text: "Hey team, welcome to our design review. Let's look over the V2 prototype drafts Elena sent." },
      { timestamp: '05:40', speaker: 'Elena', text: "Yes! I focused on generous negative space, crisp font-pairings with Inter, and dynamic motion animations." },
      { timestamp: '11:20', speaker: 'David', text: "The motion curves look incredibly smooth, Elena. Can we ensure they translate easily to React Native wrappers?" },
      { timestamp: '18:15', speaker: 'Elena', text: "Completely. I already prepared a spreadsheet of cubic-bezier values for standard easing." },
      { timestamp: '24:30', speaker: 'Chloe', text: "Splendid. Let's align on locking this library asset stack by next Friday, June 12th." },
      { timestamp: '30:45', speaker: 'David', text: "Agreed. I will initiate the component wiring in the repository as soon as the styling guide doc is checked in." }
    ]
  },
  {
    id: 'standup',
    name: '🚀 Daily Engineering Standup',
    description: 'Quick operational standup sync reviewing blockers, QA tickets, and staging builds.',
    script: [
      { timestamp: '00:00', speaker: 'Marcus', text: "Morning everyone, quick standup today. Any major updates or staging roadblocks?" },
      { timestamp: '06:15', speaker: 'Chloe', text: "I fixed the memory leak on standard WebSocket reconnects. Staging is solid now." },
      { timestamp: '12:40', speaker: 'David', text: "Excellent work Chloe. I am finalizing the API specs for file bulk uploads today." },
      { timestamp: '18:50', speaker: 'Marcus', text: "Awesome David, that was blocking the marketing team's asset imports." },
      { timestamp: '25:10', speaker: 'Chloe', text: "Do we want QA to run regression sweeps on the staging build tonight?" },
      { timestamp: '31:05', speaker: 'Marcus', text: "Yes, I will notify Jeremy to kick off the regression cycle before 6:00 PM." }
    ]
  },
  {
    id: 'crisis',
    name: '🚨 Urgent Post-Mortem Outage Sync',
    description: 'Diagnostic retrospective investigating server overload incident and prevention steps.',
    script: [
      { timestamp: '00:00', speaker: 'David', text: "Okay, let's trace the root cause on the 10:15 AM server container outage." },
      { timestamp: '07:30', speaker: 'Chloe', text: "It was a spiral lock contention in database thread pooling during a concurrent write blast." },
      { timestamp: '14:15', speaker: 'David', text: "Ah, the connection timeout default was too loose. Express hung waiting for Postgres replies." },
      { timestamp: '22:50', speaker: 'Chloe', text: "Precisely. We must set transactional ceilings to 4 seconds to fail-safe promptly next time." },
      { timestamp: '31:20', speaker: 'David', text: "I agree. Let's schedule implementing the model timeout hooks immediately by end of week." }
    ]
  },
  {
    id: 'marketing_v2',
    name: '📊 V3 Strategic Marketing Launch',
    description: 'Action-packed sync establishing budget frameworks, influencer targets, and promotional dates.',
    script: [
      { timestamp: '00:00', speaker: 'Sarah', text: "Good morning team! We are here to finalize our Q4 product release marketing roadmap. Sarah leading the agenda today." },
      { timestamp: '03:20', speaker: 'Chloe', text: "Thanks Sarah. On the operations side, we want to ensure any new landing page designs load in under 1.2 seconds for higher conversions." },
      { timestamp: '07:15', speaker: 'David', text: "Right, we should optimize our images and defer heavy styles using optimized bundling techniques." },
      { timestamp: '11:05', speaker: 'Sarah', text: "Absolutely. Now regarding budget, we have a $25,000 threshold for the paid search and influencer campaign." },
      { timestamp: '14:50', speaker: 'Marcus', text: "I suggest allocating $15,000 to targeted video creators and the remaining $10,000 for direct search engine visual ads." },
      { timestamp: '18:35', speaker: 'Sarah', text: "I love that breakdown. Let's formally agree to this budget plan. Chloe, can you track creative deadlines?" },
      { timestamp: '22:15', speaker: 'Chloe', text: "Yes. I will set up the marketing campaign tracker in our collaborative workspace by Wednesday." },
      { timestamp: '25:40', speaker: 'David', text: "I can have the registration webhook API completed to map inbound referrals accurately." },
      { timestamp: '29:30', speaker: 'Marcus', text: "Awesome David, that ensures we measure ROI down to the decimal point." },
      { timestamp: '32:45', speaker: 'Sarah', text: "Splendid sync! Let's lock our campaign calendar for December 1st launch. Meeting adjourned." }
    ]
  },
  {
    id: 'cybersec',
    name: '🔐 Enterprise Security Fire Drill',
    description: 'Critical operational tabletop testing token rotating protocols, incident detection time, and SLA guidelines.',
    script: [
      { timestamp: '00:00', speaker: 'Chloe', text: "Attention team. We are initiating our scheduled tabletop incident fire drill. Focus: token escalation threat." },
      { timestamp: '03:40', speaker: 'David', text: "Understood. The moment we notice an abnormal token pattern, I would trigger the main master secret rotation API. It takes 15 seconds." },
      { timestamp: '07:10', speaker: 'Chloe', text: "Brilliant. Marcus, if customers experience transient connection dropouts during the database swap, what is our messaging protocol?" },
      { timestamp: '11:05', speaker: 'Marcus', text: "We will publish an official status brief on the portal within 10 minutes. Uptime compliance demands direct, transparent disclosure." },
      { timestamp: '14:50', speaker: 'Sarah', text: "And what is the maximum restoration timeline according to the enterprise service SLA?" },
      { timestamp: '19:15', speaker: 'Chloe', text: "Our client SLA guarantees a 30-minute acknowledgement window and a 2-hour maximum restoration time limit." },
      { timestamp: '23:25', speaker: 'David', text: "Understood. I will write an automated playbook script that runs health integrity verification sweeps during rotating keys." },
      { timestamp: '27:30', speaker: 'Elena', text: "On the client dashboard, I will make sure we show a graceful connection recovery state widget instead of crash errors." },
      { timestamp: '30:45', speaker: 'Marcus', text: "Outstanding precautions Elena. It keeps clients relaxed during active rotations." },
      { timestamp: '34:15', speaker: 'Chloe', text: "Perfect drill outcome. I will log these compliance metrics for the auditing board by tomorrow." }
    ]
  },
  {
    id: 'migration',
    name: '☁️ Multi-Region Database Scalability',
    description: 'Planning regional read-replicas migration, partition keys, and network load-balancing targets.',
    script: [
      { timestamp: '00:00', speaker: 'David', text: "Welcome everyone. Let's lay out the technical specs for our multi-region database scaling migration." },
      { timestamp: '03:45', speaker: 'Marcus', text: "Right now, our database cluster is single-homed in Oregon. Asian and European API lookups have 300ms of lag." },
      { timestamp: '07:30', speaker: 'Elena', text: "We need databases in Singapore and Frankfurt. This reduces API lookup latencies to under 50ms regionally." },
      { timestamp: '11:45', speaker: 'Chloe', text: "Let's use asynchronous read-replicas for product catalogs, and keep primary transaction writes in Oregon." },
      { timestamp: '15:20', speaker: 'David', text: "Agreed. I will prepare the Terraform configuration files for the replica nodes by Friday." },
      { timestamp: '19:50', speaker: 'Elena', text: "I will update the dashboard loader to fetch local metrics if the regional connection fails, so users don't see blank charts." },
      { timestamp: '23:30', speaker: 'Marcus', text: "Perfect Elena. Resilience is just as vital as performance during this swap." },
      { timestamp: '27:15', speaker: 'Chloe', text: "We will perform a dry-run sync on the staging environment this Sunday at midnight to measure block synchronization throughput." },
      { timestamp: '31:00', speaker: 'David', text: "I will lead the deployment setup. Let's aim to complete the staging validation and lock database replication plans by Monday." }
    ]
  },
  {
    id: 'sustainability',
    name: '🌿 Corporate ESG Green Hosting Sync',
    description: 'Optimizing computing operations to reduce carbon footprint index and transition server runtimes.',
    script: [
      { timestamp: '00:00', speaker: 'Sarah', text: "Welcome team. Today we align our development processes with the corporate ESG Green Computing Initiative." },
      { timestamp: '04:15', speaker: 'Elena', text: "On our user interface, we can make heavy rendering charts lazy-load. This drastically reduces local mobile CPU cycles." },
      { timestamp: '08:30', speaker: 'David', text: "And on the backend, our Cloud provider offers carbon-neutral server zones. Moving our container cluster there reduces emissions by 40%." },
      { timestamp: '12:45', speaker: 'Chloe', text: "We can also scale-to-zero during non-operational hours on our sandbox environments. No reason to run servers when developers are away." },
      { timestamp: '17:35', speaker: 'Sarah', text: "That is an exceptionally crisp idea, Chloe. Do we have average energy metrics to report to stakeholders?" },
      { timestamp: '22:10', speaker: 'David', text: "Yes, I will configure carbon diagnostic telemetry in our cluster outputs to calculate equivalent trees offset in real-time." },
      { timestamp: '26:45', speaker: 'Elena', text: "Let's draw a quiet, elegant green leaf indicator in our workspace menu to let users see their ecological footprint score." },
      { timestamp: '32:15', speaker: 'Sarah', text: "Perfect. David, prepare the migration task. Elena, draft the leaf indicator designs. Let's submit the ESG proposal by Wednesday." }
    ]
  },
  {
    id: 'ai_governance',
    name: '🤖 AI Ethics & Transcripts Safety Standards',
    description: 'Formulating client-side content scrubbing, privacy masking, and model boundary compliance audits.',
    script: [
      { timestamp: '00:00', speaker: 'Marcus', text: "Good afternoon. We are standardizing our AI governance guidelines for managing customer transcripts securely." },
      { timestamp: '04:30', speaker: 'Elena', text: "Our main guideline: ensure no Personal Identifiable Information (PII) like phone numbers, passwords, or home addresses are passed to public models." },
      { timestamp: '09:15', speaker: 'David', text: "I can construct an automatic regex-based client-side mask scrubber. It replaces raw emails and numeric tokens with generic labels before sending API calls." },
      { timestamp: '14:00', speaker: 'Chloe', text: "That is exactly what we need. We also need standard compliance headers stating 'Transcripts are processed safely in memory with zero model training persistence'." },
      { timestamp: '18:45', speaker: 'Sarah', text: "We should publish this on our workspace homepage. Transmit high security and high corporate integrity." },
      { timestamp: '23:30', speaker: 'Elena', text: "I'll design a discrete secure lock icon displaying 'Strict PII Scrubbing Active' adjacent to the analyze upload action." },
      { timestamp: '27:45', speaker: 'David', text: "I will bundle the masking filters with our core ingestion routines. The masking script will be finished by Wednesday." },
      { timestamp: '32:15', speaker: 'Marcus', text: "Excellent. Let's conduct a complete QA dry-run with simulated mock conversations to ensure the scrubber blocks all sample PII perfectly." }
    ]
  }
];

interface MeetingSimulatorProps {
  onSimulationComplete: (title: string, transcript: string) => void;
}

export default function MeetingSimulator({ onSimulationComplete }: MeetingSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(PRESET_SCENARIOS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [generatedScript, setGeneratedScript] = useState<SimulationScript[]>([]);
  const [ticker, setTicker] = useState('00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scenario = PRESET_SCENARIOS.find(s => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  useEffect(() => {
    // Reset state when scenario changes
    setIsPlaying(false);
    setCurrentLineIndex(0);
    setGeneratedScript([]);
    setTicker('00:00');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [selectedScenarioId]);

  const startSimulation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setGeneratedScript([]);
    setCurrentLineIndex(0);
    
    let lineIdx = 0;
    
    // Core simulation interval
    timerRef.current = setInterval(() => {
      if (lineIdx < scenario.script.length) {
        const nextLine = scenario.script[lineIdx];
        setGeneratedScript(prev => [...prev, nextLine]);
        setTicker(nextLine.timestamp);
        lineIdx++;
        setCurrentLineIndex(lineIdx);
      } else {
        stopSimulation();
      }
    }, 2000);
  };

  const stopSimulation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const skipToDone = () => {
    stopSimulation();
    setGeneratedScript(scenario.script);
    setCurrentLineIndex(scenario.script.length);
    if (scenario.script.length > 0) {
      setTicker(scenario.script[scenario.script.length - 1].timestamp);
    }
  };

  const resetSimulator = () => {
    stopSimulation();
    setGeneratedScript([]);
    setCurrentLineIndex(0);
    setTicker('00:00');
  };

  const pushToAnalyzer = () => {
    const transcriptText = generatedScript
      .map(line => `[${line.timestamp}] ${line.speaker}: ${line.text}`)
      .join('\n');
    onSimulationComplete(scenario.name.replace(/[🎨🚀🚨]\s*/g, ''), transcriptText);
    resetSimulator();
  };

  return (
    <div id="meeting-simulator-container" className="bg-white rounded-xl border border-gray-100 shadow-xs p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            Interactive Meeting Simulator
          </h2>
          <p className="text-sm text-gray-500">
            Simulate a live transcript feed between team members to instantly experience AI extraction.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1.5 max-w-full">
          {PRESET_SCENARIOS.map((p) => (
            <button
              key={p.id}
              onClick={() => !isPlaying && setSelectedScenarioId(p.id)}
              disabled={isPlaying}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                selectedScenarioId === p.id
                  ? 'bg-indigo-600 text-white shadow-xs border border-indigo-600'
                  : 'bg-gray-150 text-gray-700 border border-transparent hover:bg-gray-200 disabled:opacity-40'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-50 rounded-xl p-5 border border-gray-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              <Users className="w-3.5 h-3.5" /> Selected Session info
            </div>
            <h3 className="text-md font-semibold text-gray-900 mb-1">{scenario.name}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{scenario.description}</p>
            
            {/* Status indicators */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-gray-100">
                <span className="text-gray-500">Virtual Time elapsed:</span>
                <span className="font-mono font-medium text-gray-800 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                  {ticker}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-gray-100">
                <span className="text-gray-500">Simulating Speakers:</span>
                <span className="font-medium text-gray-800">
                  {Array.from(new Set(scenario.script.map(s => s.speaker))).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-gray-100">
                <span className="text-gray-500">Live feed Status:</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {isPlaying ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-red-600 font-semibold uppercase tracking-wider text-[10px]">Streaming...</span>
                    </>
                  ) : currentLineIndex > 0 ? (
                    <span className="text-green-600 font-semibold uppercase tracking-wider text-[10px]">Ready to Analyze</span>
                  ) : (
                    <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Standing By</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {!isPlaying ? (
                <button
                  onClick={startSimulation}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition hover:scale-[1.02] duration-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Live Feed
                </button>
              ) : (
                <button
                  onClick={stopSimulation}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Pause Feed
                </button>
              )}
              {isPlaying && (
                <button
                  onClick={skipToDone}
                  title="Skip to end of simulation"
                  className="p-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs transition"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetSimulator}
                disabled={generatedScript.length === 0}
                className="flex-1 py-2 px-3 border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
              
              <button
                onClick={pushToAnalyzer}
                disabled={generatedScript.length === 0}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 transition"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Analyze Draft
              </button>
            </div>
          </div>
        </div>

        {/* Live Audio Waves and speech Bubble Logs */}
        <div className="lg:col-span-2 border border-gray-200 bg-zinc-950 rounded-xl p-5 flex flex-col justify-between h-[360px] relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest pointer-events-none select-none">
            [SYS_NODE_ACTIVE_3000]
          </div>

          <div className="h-full flex flex-col justify-between overflow-hidden">
            {/* Simulation Transcript Logs Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Live stream feed output</span>
              </div>
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-0.5 bg-indigo-400 animate-[bounce_0.8s_infinite] h-2.5" />
                  <div className="w-0.5 bg-teal-400 animate-[bounce_1.2s_infinite] h-1.5" />
                  <div className="w-0.5 bg-indigo-400 animate-[bounce_0.6s_infinite] h-3.5" />
                  <div className="w-0.5 bg-teal-400 animate-[bounce_1s_infinite] h-2" />
                </div>
              )}
            </div>

            {/* Bubble logs container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
              {generatedScript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <MessageSquareCode className="w-8 h-8 text-zinc-700 stroke-[1.5] mb-2" />
                  <p className="text-xs font-mono">Simulate a meeting to capture custom speech-to-text transcript logs in real time.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {generatedScript.map((line, i) => {
                    const isSystem = line.speaker === 'System';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5"
                      >
                        <span className="font-mono text-[11px] text-zinc-600 bg-zinc-900 px-1 py-0.5 rounded select-none shrink-0 mt-0.5">
                          {line.timestamp}
                        </span>
                        
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1.5 mb-0.5">
                            <span className="text-xs font-semibold text-zinc-200">
                              {line.speaker}
                            </span>
                            <span className="text-[10px] text-zinc-600">speaker</span>
                          </div>
                          
                          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 rounded-r-lg rounded-bl-lg px-2.5 py-1.5 border-l-2 border-indigo-500/80">
                            {line.text}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer Prompt */}
            {generatedScript.length > 0 && !isPlaying && (
              <div className="border-t border-zinc-900 pt-3 mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-400 max-w-[70%]">
                  Live feed completed successfully! Feed is ready for insight distillation.
                </span>
                <button
                  onClick={pushToAnalyzer}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold tracking-wide uppercase transition shadow-md"
                >
                  Analyze Simulator Transcript ⚡
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
