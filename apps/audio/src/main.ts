import './styles.css'
//import phase1 from './json/phase1.json' assert { type: 'json' };
//console.log('phase1.json loaded:', phase1);
type PhaseNo = 1;

type PhaseJson = {
  Phase1?: DialogueItem[];
};

type DialogueItem = {
  id: number;
  speakerNo?: number;
  sequence: number;
  en: string;
  ja?: string;
};

type PhaseData = Record<PhaseNo, DialogueItem[]>;

let phaseData: PhaseData = {
  1: []
};

const phaseSelect = document.getElementById('phaseSelect') as HTMLSelectElement | null;
const sentenceList = document.getElementById('sentenceList') as HTMLUListElement | null;
const currentText = document.getElementById('currentText') as HTMLParagraphElement | null;
const audioPlayer = document.getElementById('audioPlayer') as HTMLAudioElement | null;

const playButton = document.getElementById('playButton') as HTMLButtonElement | null;
const stopButton = document.getElementById('stopButton') as HTMLButtonElement | null;
const prevButton = document.getElementById('prevButton') as HTMLButtonElement | null;
const nextButton = document.getElementById('nextButton') as HTMLButtonElement | null;
const loopToggle = document.getElementById('loopToggle') as HTMLInputElement | null;

let currentIndex = 0;
let currentPhase: PhaseNo = 1;

function requireElement<T extends HTMLElement>(element: T | null, name: string): T {
  if (!element) {
    throw new Error(`${name} element not found`);
  }
  return element;
}

const elements = {
  phaseSelect: requireElement(phaseSelect, 'phaseSelect'),
  sentenceList: requireElement(sentenceList, 'sentenceList'),
  currentText: requireElement(currentText, 'currentText'),
  audioPlayer: requireElement(audioPlayer, 'audioPlayer'),
  playButton: requireElement(playButton, 'playButton'),
  stopButton: requireElement(stopButton, 'stopButton'),
  prevButton: requireElement(prevButton, 'prevButton'),
  nextButton: requireElement(nextButton, 'nextButton'),
  loopToggle: requireElement(loopToggle, 'loopToggle')
};

async function loadPhaseData(): Promise<void> {
  const response = await fetch("/json/phase1.json");

  if (!response.ok) {
    throw new Error(`Failed to load phase1.json: ${response.status}`);
  }
console.log(`success to load phase1.json: ${response.status}`);
  const data = (await response.json()) as PhaseJson;

  phaseData = {
    1: data.Phase1 ?? []
  };

  renderSentences();
  setCurrentSentence(0);
}

function renderSentences(): void {
  elements.sentenceList.innerHTML = '';

  const sentences = phaseData[currentPhase];

  sentences.forEach((item, index) => {
    const li = document.createElement('li');

    li.textContent = item.en;
    li.addEventListener('click', () => {
      setCurrentSentence(index);
      playCurrent();
    });

    elements.sentenceList.appendChild(li);
  });
}

function setCurrentSentence(index: number): void {
  const sentences = phaseData[currentPhase];

  if (sentences.length === 0) {
    elements.currentText.textContent = '';
    elements.audioPlayer.removeAttribute('src');
    return;
  }

  if (index < 0) {
    currentIndex = 0;
  } else if (index >= sentences.length) {
    currentIndex = sentences.length - 1;
  } else {
    currentIndex = index;
  }

  const item = sentences[currentIndex];

  elements.currentText.textContent = item.en;
  elements.audioPlayer.src = buildAudioPath(item, "en");

  document.querySelectorAll<HTMLLIElement>('#sentenceList li').forEach((el, i) => {
    const isActive = i === currentIndex;

    el.classList.toggle('active', isActive);

    if (isActive) {
      el.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  });
}

function playCurrent(): void {
  elements.audioPlayer.play().catch((error: unknown) => {
    console.error('Audio playback failed', error);
  });
}

function pauseCurrent(): void {
  elements.audioPlayer.pause();
}

function stopCurrent(): void {
  elements.audioPlayer.pause();
  elements.audioPlayer.currentTime = 0;
}

function playPrevious(): void {
  setCurrentSentence(currentIndex - 1);
  playCurrent();
}

function playNext(): void {
  setCurrentSentence(currentIndex + 1);
  playCurrent();
}

elements.prevButton.addEventListener('click', playPrevious);

elements.nextButton.addEventListener('click', playNext);

elements.playButton.addEventListener('click', () => {
  if (elements.audioPlayer.paused) {
    playCurrent();
  } else {
    pauseCurrent();
  }
});

elements.stopButton.addEventListener('click', stopCurrent);

elements.loopToggle.addEventListener('change', () => {
  elements.audioPlayer.loop = elements.loopToggle.checked;
});

elements.phaseSelect.addEventListener('change', () => {
  currentPhase = Number(elements.phaseSelect.value) as PhaseNo;
  currentIndex = 0;
  renderSentences();
  setCurrentSentence(0);
});

loadPhaseData().catch((error: unknown) => {
  console.error(error);
});

function buildAudioPath(
  item: DialogueItem,
  lang: "en" | "ja"
): string {
  return `./audio/${item.id}-${item.sequence}_${lang}.mp3`;
}

