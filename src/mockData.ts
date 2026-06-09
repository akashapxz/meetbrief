import { Meeting } from './types';

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'AI Meeting Insight Generator - Q3 Kickoff Planning',
    date: '2026-06-05',
    duration: '45 mins',
    transcript: `[00:00] Sarah: Good morning everyone, let's kick off our Q3 planning session for the AI Meeting Insight Generator. Our primary goals today are defining the MVP scope, assigning ownership, and alignment on the timeline.
[02:15] David: Thanks Sarah. On the engineering side, my concern is integrating the Gemini API key securely. We must build a full-stack architecture with Express because we can't expose the API key in the browser.
[05:30] Elena: Absolutely agreed, security is paramount. And on the design side, we want to build a highly polished, desktop-first responsive interface with deep-gray aesthetic theme and sleek toggle tabs. No cluttered margins.
[09:20] David: I can set up the Express backend easily. I will bundle it with esbuild and use tsx for swift development. We will deploy to Cloud Run. Sarah, can we budget 2 weeks for the backend API pipeline?
[12:15] Sarah: Yes, 2 weeks works. Let's finalize the MVP release date. I propose August 15th, 2026.
[15:40] Elena: August 15th is tight but doable if we focus purely on the core scope: transcript summarizing, action item tracking, and structured decision logs. I'll have the interactive dashboard mockups finished by next Wednesday, June 10th.
[21:10] David: Sounds good, Elena. Sarah, do we want history tracking? If so, should we use LocalStorage for high-performance offline state or store in the cloud?
[24:50] Sarah: Let's start with LocalStorage for the MVP to guarantee instant offline transitions and simple deployment, then look into cloud database options for V2. Okay, so I will draft the formal marketing spec by Friday, June 12th.
[31:05] Elena: Perfect. I'll also add a quick "Meeting Simulator" section where people can run a sample mock conversation to see how the transcription works in real-time. It'll make the tool feel incredibly interactive!
[38:15] David: Fantastic idea. I will support the API endpoint returning structured JSON. Sarah, let's wrap up by assigning roles. I am on backend and deployment. Elena is on UX and components. Sarah is coordinating marketing and the general roadmap.
[42:30] Sarah: Perfect. Thanks everyone, super productive kickoff! Let's get to work.`,
    summary: 'The team held a productive Q3 planning kickoff to define the MVP scope and architecture of the AI Meeting Insight Generator. They aligned on a full-stack, secure implementation utilizing Express and local storage for offline support, targeting a launch on August 15, 2026. Custom simulation layers will be added to enhance user engagement.',
    keyTopics: [
      {
        title: 'Backend Architecture & Security',
        description: 'Discussion on full-stack architecture with Express to prevent exposing critical Gemini API keys to the browser, coupled with esbuild compiler pipelines.',
        duration: '10 mins'
      },
      {
        title: 'MVP Scope & Timelines',
        description: 'Agreement on MVP boundaries and choosing August 15th as the concrete launch date. Commitment to finish UX designs by June 10th.',
        duration: '15 mins'
      },
      {
        title: 'Interactive Simulator Feature',
        description: 'Introducing a live sandbox simulator where users can run live meetings to test AI transcription and summary extractions instantly.',
        duration: '8 mins'
      }
    ],
    decisions: [
      {
        id: 'dec-1',
        title: 'Adopt full-stack Express + React architecture',
        category: 'Architecture',
        context: 'Required to ensure proper server-side Gemini SDK handling, keeping API keys hidden from client scripts.'
      },
      {
        id: 'dec-2',
        title: 'MVP Target Date set to August 15, 2026',
        category: 'Timeline',
        context: 'Proposed by Sarah and validated as realistic by engineering and design representatives.'
      },
      {
        id: 'dec-3',
        title: 'Leverage LocalStorage for MVP storage',
        category: 'Storage',
        context: 'Saves setup overhead, allows smooth offline experiences, and satisfies privacy criteria.'
      }
    ],
    actionItems: [
      {
        id: 'act-1',
        task: 'Set up Express server structure and bundle with esbuild',
        assignee: 'David',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-06-12'
      },
      {
        id: 'act-2',
        task: 'Deliver interactive dashboard designs and mockups',
        assignee: 'Elena',
        priority: 'High',
        status: 'Pending',
        dueDate: '2026-06-10'
      },
      {
        id: 'act-3',
        task: 'Draft formal marketing product specification and roadmap',
        assignee: 'Sarah',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '2026-06-12'
      }
    ],
    timeline: [
      { timestamp: '00:00', speaker: 'Sarah', text: 'Kicked off the planning session and outlined high-level goals for Q3 planning.', category: 'Overview' },
      { timestamp: '02:15', speaker: 'David', text: 'Proposed a secure full-stack layout using Express and React to manage critical keys safely on the backend.', category: 'Decision' },
      { timestamp: '12:15', speaker: 'Sarah', text: 'Suggested August 15th for launching the official MVP release.', category: 'Overview' },
      { timestamp: '15:40', speaker: 'Elena', text: 'Agreed on timeline constraints and set target date for user interface layouts to June 10th.', category: 'Action Item' },
      { timestamp: '24:50', speaker: 'Sarah', text: 'Approved utilizing LocalStorage for immediate, high-performance local state management.', category: 'Decision' },
      { timestamp: '31:05', speaker: 'Elena', text: 'Proposed creating an interactive Meeting Simulator for instant demonstration capabilities.', category: 'Overview' },
      { timestamp: '38:15', speaker: 'David', text: 'Confirmed job divisions: David on server, Elena on frontend, and Sarah on marketing.', category: 'Action Item' }
    ],
    sentiment: {
      overall: 'Highly Collaborative & Optimistic',
      confidence: 0.95
    },
    chatHistory: [
      { role: 'user', text: 'What did David and Elena agree on?' },
      { role: 'model', text: 'David and Elena agreed upon a highly secure web architecture. David will set up the Express backend (preventing Gemini API keys from leaking to client space), while Elena will design a premium, high-fidelity dark slate theme. They also agreed to release Elena’s dashboard UI mockups by Wednesday, June 10th.' }
    ]
  },
  {
    id: 'meet-2',
    title: 'Incident 409 Retrospective: Database Lock Crash',
    date: '2026-06-03',
    duration: '30 mins',
    transcript: `[00:00] Marcus: Thanks for jumping on. We are here to conduct a retroactive post-mortem of Incident 409, which caused a 32-minute database bottleneck yesterday afternoon. Let's run through what occurred.
[01:45] Chloe: I investigated the metrics. At 14:15 UTC, during a mass marketing campaign, we experienced concurrent writes on our user table from both the email trigger queue and transaction processors. The index locks escalated, cascading into an API outage.
[04:20] Marcus: Good analysis, Chloe. Did our health checks fail safely?
[06:10] Chloe: Not quite. The check was querying the raw table directly, which also hung, keeping the unhealthy containers in service. We need to split index writes and improve index checking.
[09:30] Marcus: Understood. Let's agree on immediate mitigations. First, we need to add query timeout limits of 4 seconds on all transactional queries to fail fast and avoid thread pool exhaustion.
[12:15] Chloe: Excellent idea, I'll write the PR for that right after this call and test it on staging before the evening.
[16:40] Marcus: High priority. For long term stabilization, we must migrate to read replicas for database analytics and heavy reports. We will assign that to Jeremy.
[21:15] Marcus: Perfect. Chloe, can you also update the system status handler to check a dummy cache table rather than performing a heavy table lookup?
[24:10] Chloe: Yes, I can easily modify the health check module by tomorrow afternoon. This will protect us from domino service failures in the future.
[28:30] Marcus: Great. I will write the post-mortem report and circulate it to stakeholders. Thank you, let's learn from this and make the database indestructible.`,
    summary: 'A diagnostic post-mortem of Incident 409, addressing a 32-minute API crash due to lock contention on the primary database during a heavy transaction surge. The team agreed on implementing query timeouts, decoupling container health checks from central tables, and migrating marketing analytics requests to read replicas.',
    keyTopics: [
      {
        title: 'Root Cause Breakdown',
        description: 'Analyzing the index deadlock caused by concurrent transactional writes and email queue hooks locking the main database table.',
        duration: '10 mins'
      },
      {
        title: 'Transactional Query Timeouts',
        description: 'Setting a strict 4-second timeout to prevent API containers from hanging indefinitely and starving Node pools.',
        duration: '8 mins'
      },
      {
        title: 'Health-Check decoupling',
        description: 'Redesigning container checks to prevent database locks from taking down healthy stateless application nodes.',
        duration: '6 mins'
      }
    ],
    decisions: [
      {
        id: 'dec-11',
        title: 'Implement query timeline ceilings (4s limit)',
        category: 'Engineering',
        context: 'Forces quick failing of slow requests, preserving Express and database connection pooling.'
      },
      {
        id: 'dec-12',
        title: 'Rewrite health checks to target dummy cache entries',
        category: 'Monitoring',
        context: 'Prevents database lockups from cascading into full application network drops.'
      }
    ],
    actionItems: [
      {
        id: 'act-11',
        task: 'Implement database query level timeouts on backend models',
        assignee: 'Chloe',
        priority: 'High',
        status: 'Completed',
        dueDate: '2026-06-04'
      },
      {
        id: 'act-12',
        task: 'Relocate read-heavy marketing reports to secondary database replicas',
        assignee: 'Jeremy',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: '2026-06-20'
      },
      {
        id: 'act-13',
        task: 'Publish final Incident 409 report and distribute to team',
        assignee: 'Marcus',
        priority: 'Low',
        status: 'Completed',
        dueDate: '2026-06-05'
      }
    ],
    timeline: [
      { timestamp: '00:00', speaker: 'Marcus', text: 'Initiated the retrograde meeting on Incident 409 database deadlock.', category: 'Overview' },
      { timestamp: '01:45', speaker: 'Chloe', text: 'Identified overlapping index locks from queues and transactional queries as the physical bottleneck.', category: 'Overview' },
      { timestamp: '09:30', speaker: 'Marcus', text: 'Decreed a strict 4-second API timeout default limit to defend server pools.', category: 'Decision' },
      { timestamp: '12:15', speaker: 'Chloe', text: 'Committed to deploying the timeout correction PR to staging environment today.', category: 'Action Item' },
      { timestamp: '16:40', speaker: 'Marcus', text: 'Assigned long-term replica migrations to Jeremy to separate analytics read queues.', category: 'Action Item' },
      { timestamp: '24:10', speaker: 'Chloe', text: 'Agreed to rewrite node health checking modules and run checks on a dummy Redis status key.', category: 'Decision' }
    ],
    sentiment: {
      overall: 'Focused & Solution-Oriented',
      confidence: 0.98
    },
    chatHistory: [
      { role: 'user', text: 'How long did the database crash last?' },
      { role: 'model', text: 'Based on the Retro transcript, the database crash (Incident 409) lasted for exactly **32 minutes**.' }
    ]
  }
];
