import { ModuleDefinition } from '@/types/assessment';

export const eadlModules: ModuleDefinition[] = [
  {
    id: 'digital-comms',
    name: 'Digital Communications',
    description: 'Use a smartphone to send text messages, reply to email, and join a telehealth video call.',
    icon: 'MessageSquare',
    steps: [
      {
        id: 'dc-step1',
        shortLabel: 'Send text message',
        instruction: 'Text your daughter to let her know your appointment time.',
        reassessmentInstruction: 'Text your son to confirm you received the prescription.',
        reassessmentHints: ['Open Messages, find Michael (Son), and send him a text message'],
        targetElement: 'messages-daughter',
        expectedAction: 'send_sms',
        hints: ['Open Messages, find Emma (Daughter), and send her a text message'],
        timeoutSeconds: 60,
      },
      {
        id: 'dc-step2',
        shortLabel: 'Reply to email',
        instruction: 'Find and reply to the unread email from your doctor\'s office.',
        reassessmentInstruction: 'Open and reply to the unread email from OhioHealth Patient Services.',
        reassessmentHints: ['Tap the bold unread email from OhioHealth, then tap Reply and send your response'],
        targetElement: 'email-reply',
        expectedAction: 'send_email',
        hints: ['Tap the bold unread email, then tap Reply and send your response'],
        timeoutSeconds: 60,
      },
      {
        id: 'dc-step3',
        shortLabel: 'Join telehealth call',
        instruction: 'Join your telehealth visit and turn off your microphone.',
        reassessmentInstruction: 'Join your telehealth visit and turn on your camera.',
        reassessmentHints: ['Tap the camera button at the bottom of the screen to turn on your video'],
        targetElement: 'mute-button',
        expectedAction: 'toggle_mute',
        hints: ['Tap the microphone button at the bottom of the screen to mute yourself'],
        timeoutSeconds: 30,
      },
    ],
    openEndedQuestion: 'What makes it hard or easy for you to communicate using technology?',
    simpleMode: {
      iconCount: 6,
      buttonSize: 'xlarge',
      showHints: true,
      reducedClutter: true,
    },
    complexMode: {
      iconCount: 20,
      buttonSize: 'normal',
      showHints: false,
      distractors: true,
    },
  },
  {
    id: 'ehr',
    name: 'Patient Portal',
    description: 'Navigate a MyChart patient portal to view lab results, check appointments, and message your doctor.',
    icon: 'Heart',
    steps: [
      {
        id: 'ehr-step1',
        shortLabel: 'View lab result',
        instruction: 'Find and open your most recent lab result.',
        reassessmentInstruction: 'Find and open your most recent lab result.',
        reassessmentHints: ['Look in Test Results for your Lipid Panel — the most recent result — and tap to expand it'],
        targetElement: 'lab-result-recent',
        expectedAction: 'open_result',
        hints: ['Look in Test Results for your most recent lab work and tap to expand it'],
        timeoutSeconds: 45,
      },
      {
        id: 'ehr-step2',
        shortLabel: 'Check appointment',
        instruction: 'Find your upcoming appointment details.',
        reassessmentInstruction: 'Find your upcoming appointment and identify the location.',
        reassessmentHints: ['Go to Appointments and tap the Dr. James Okafor appointment card to see details'],
        targetElement: 'appointment-card',
        expectedAction: 'view_appointment',
        hints: ['Go to Appointments and tap the upcoming appointment card to see details'],
        timeoutSeconds: 45,
      },
      {
        id: 'ehr-step3',
        shortLabel: 'Message doctor',
        instruction: 'Send a new message to your doctor asking about your medication.',
        reassessmentInstruction: 'Reply to the message from your care team.',
        reassessmentHints: ['Find the message from Nurse Coordinator, open it, tap Reply, and send your response'],
        targetElement: 'compose-message',
        expectedAction: 'send_message',
        hints: ['Go to Messages, tap New Message, type your question, then tap Send'],
        timeoutSeconds: 60,
      },
    ],
    openEndedQuestion: 'What is the hardest part of using online tools for your health?',
    simpleMode: {
      iconCount: 4,
      buttonSize: 'xlarge',
      showHints: true,
      reducedClutter: true,
    },
    complexMode: {
      iconCount: 12,
      buttonSize: 'normal',
      showHints: false,
      distractors: true,
    },
  },
];

export const getModuleById = (id: string): ModuleDefinition | undefined => {
  return eadlModules.find(m => m.id === id);
};

export const getModuleIcon = (iconName: string) => {
  const icons: Record<string, string> = {
    MessageSquare: '💬',
    Heart: '❤️',
    Wallet: '💳',
    ShoppingCart: '🛒',
    MapPin: '📍',
    Play: '▶️',
    Shield: '🛡️',
  };
  return icons[iconName] || '📱';
};
