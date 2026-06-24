import './styles.css';

type PhaseNo = 1;
type Language = 'en' | 'ja';
type LoopMode = 'none' | 'one' | 'conversation' | 'all';
type PlaybackMode = 'none' | 'en' | 'enJa';

const languages: Language[] = ['en', 'ja'];

type PhaseJson = {
  Phase1?: LessonItem[];
};

type LessonItem = {
  id: number;
  phase: number;
  situation: string;
  dialogues: Dialogue[];
};

type Dialogue = {
  sequence: number;
  speakerNo: number;
  en: string;
  ja: string;
};

type PhaseData = Record<PhaseNo, LessonItem[]>;

type CurrentPosition = {
  lessonIndex: number;
  dialogueIndex: number;
  langIndex: number;
};

let phaseData: PhaseData = {
  1: []
};

let currentPhase: PhaseNo = 1;

let currentPosition: CurrentPosition = {
  lessonIndex: 0,
  dialogueIndex: 0,
  langIndex: 0
};

let loopMode: LoopMode = 'none';
let playbackMode: PlaybackMode = 'enJa';

const elements = {
  phaseSelect: requireElement<HTMLSelectElement>('phaseSelect'),
  sentenceList: requireElement<HTMLUListElement>('sentenceList'),
  currentText: requireElement<HTMLParagraphElement>('currentText'),
  audioPlayer: requireElement<HTMLAudioElement>('audioPlayer'),
  playButton: requireElement<HTMLButtonElement>('playButton'),
  stopButton: requireElement<HTMLButtonElement>('stopButton'),
  prevButton: requireElement<HTMLButtonElement>('prevButton'),
  nextButton: requireElement<HTMLButtonElement>('nextButton')
};

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`${id} element not found`);
  }

  return element as T;
}

async function loadPhaseData(): Promise<void> {
  const response = await fetch('/json/phase1.json');

  if (!response.ok) {
    throw new Error(`Failed to load phase1.json: ${response.status}`);
  }

  const data = (await response.json()) as PhaseJson;

  phaseData = {
    1: data.Phase1 ?? []
  };

  renderSentences();
  setCurrentPosition({
    lessonIndex: 0,
    dialogueIndex: 0,
    langIndex: 0
  });

  updateLoopModeButtons();
  updatePlaybackModeButtons();
}

function renderSentences(): void {
  elements.sentenceList.innerHTML = '';

  const lessons = phaseData[currentPhase];

  lessons.forEach((lesson, lessonIndex) => {
    const lessonLi = document.createElement('li');
    lessonLi.className = 'lesson-item';
    lessonLi.dataset.lessonIndex = String(lessonIndex);

    const dialogueList = document.createElement('ul');
    dialogueList.className = 'dialogue-list';

    lesson.dialogues.forEach((dialogue, dialogueIndex) => {
      const dialogueLi = document.createElement('li');

      dialogueLi.className = 'dialogue-item';
      dialogueLi.dataset.lessonIndex = String(lessonIndex);
      dialogueLi.dataset.dialogueIndex = String(dialogueIndex);

      dialogueLi.textContent = `${dialogue.en} / ${dialogue.ja}`;

      dialogueLi.addEventListener('click', () => {
        setCurrentPosition({
          lessonIndex,
          dialogueIndex,
          langIndex: 0
        });

        playCurrent();
      });

      dialogueList.appendChild(dialogueLi);
    });

    lessonLi.appendChild(dialogueList);
    elements.sentenceList.appendChild(lessonLi);
  });
}

function setCurrentPosition(position: CurrentPosition): void {
  const normalizedPosition = normalizePosition(position);

  if (!normalizedPosition) {
    elements.currentText.textContent = '';
    elements.audioPlayer.removeAttribute('src');
    return;
  }

  currentPosition = normalizedPosition;

  const current = getCurrentItem();

  if (!current) {
    return;
  }

  elements.currentText.textContent = current.text;
  elements.audioPlayer.src = buildAudioPath(current.lesson, current.dialogue, current.lang);

  updateActiveSentence();
}

function getCurrentItem():
  | {
      lesson: LessonItem;
      dialogue: Dialogue;
      lang: Language;
      text: string;
    }
  | undefined {
  const lesson = phaseData[currentPhase][currentPosition.lessonIndex];

  if (!lesson) {
    return undefined;
  }

  const dialogue = lesson.dialogues[currentPosition.dialogueIndex];

  if (!dialogue) {
    return undefined;
  }

  const lang = languages[currentPosition.langIndex];
  const text = dialogue[lang];

  return {
    lesson,
    dialogue,
    lang,
    text
  };
}

function normalizePosition(position: CurrentPosition): CurrentPosition | undefined {
  const lessons = phaseData[currentPhase];

  if (lessons.length === 0) {
    return undefined;
  }

  let { lessonIndex, dialogueIndex, langIndex } = position;

  if (lessonIndex < 0) {
    return {
      lessonIndex: 0,
      dialogueIndex: 0,
      langIndex: 0
    };
  }

  if (lessonIndex >= lessons.length) {
    const lastLessonIndex = lessons.length - 1;
    const lastDialogueIndex = lessons[lastLessonIndex].dialogues.length - 1;

    return {
      lessonIndex: lastLessonIndex,
      dialogueIndex: lastDialogueIndex,
      langIndex: getLastLangIndex()
    };
  }

  const lesson = lessons[lessonIndex];

  if (dialogueIndex < 0) {
    if (lessonIndex === 0) {
      return {
        lessonIndex: 0,
        dialogueIndex: 0,
        langIndex: 0
      };
    }

    const prevLessonIndex = lessonIndex - 1;
    const prevLesson = lessons[prevLessonIndex];

    return {
      lessonIndex: prevLessonIndex,
      dialogueIndex: prevLesson.dialogues.length - 1,
      langIndex: getLastLangIndex()
    };
  }

  if (dialogueIndex >= lesson.dialogues.length) {
    if (lessonIndex >= lessons.length - 1) {
      return {
        lessonIndex,
        dialogueIndex: lesson.dialogues.length - 1,
        langIndex: getLastLangIndex()
      };
    }

    return {
      lessonIndex: lessonIndex + 1,
      dialogueIndex: 0,
      langIndex: 0
    };
  }

  if (langIndex < 0) {
    return normalizePosition({
      lessonIndex,
      dialogueIndex: dialogueIndex - 1,
      langIndex: getLastLangIndex()
    });
  }

  if (langIndex >= getPlayableLanguages().length) {
    return normalizePosition({
      lessonIndex,
      dialogueIndex: dialogueIndex + 1,
      langIndex: 0
    });
  }

  return {
    lessonIndex,
    dialogueIndex,
    langIndex
  };
}

function updateActiveSentence(): void {
  document.querySelectorAll<HTMLLIElement>('.dialogue-item').forEach((el) => {
    const isActive =
      Number(el.dataset.lessonIndex) === currentPosition.lessonIndex &&
      Number(el.dataset.dialogueIndex) === currentPosition.dialogueIndex;

    el.classList.toggle('active', isActive);

    if (isActive) {
      el.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  });
}

function getPlayableLanguages(): Language[] {
  if (playbackMode === 'en') {
    return ['en'];
  }

  return languages;
}

function getLastLangIndex(): number {
  return getPlayableLanguages().length - 1;
}

function getNextPosition(): CurrentPosition {
  if (playbackMode === 'en') {
    return {
      lessonIndex: currentPosition.lessonIndex,
      dialogueIndex: currentPosition.dialogueIndex + 1,
      langIndex: 0
    };
  }

  return {
    ...currentPosition,
    langIndex: currentPosition.langIndex + 1
  };
}

function getPreviousPosition(): CurrentPosition {
  if (playbackMode === 'en') {
    return {
      lessonIndex: currentPosition.lessonIndex,
      dialogueIndex: currentPosition.dialogueIndex - 1,
      langIndex: 0
    };
  }

  return {
    ...currentPosition,
    langIndex: currentPosition.langIndex - 1
  };
}

function getFirstPosition(): CurrentPosition {
  return {
    lessonIndex: 0,
    dialogueIndex: 0,
    langIndex: 0
  };
}

function getFirstPositionInCurrentConversation(): CurrentPosition {
  return {
    lessonIndex: currentPosition.lessonIndex,
    dialogueIndex: 0,
    langIndex: 0
  };
}

function getLastPositionInCurrentConversation(): CurrentPosition {
  const lesson = phaseData[currentPhase][currentPosition.lessonIndex];

  return {
    lessonIndex: currentPosition.lessonIndex,
    dialogueIndex: Math.max(lesson.dialogues.length - 1, 0),
    langIndex: getLastLangIndex()
  };
}

function isSamePosition(a: CurrentPosition, b: CurrentPosition): boolean {
  return (
    a.lessonIndex === b.lessonIndex &&
    a.dialogueIndex === b.dialogueIndex &&
    a.langIndex === b.langIndex
  );
}

function isEndOfCurrentConversation(): boolean {
  return isSamePosition(currentPosition, getLastPositionInCurrentConversation());
}

function isEndOfAll(): boolean {
  const lessons = phaseData[currentPhase];

  if (lessons.length === 0) {
    return true;
  }

  const lastLessonIndex = lessons.length - 1;
  const lastLesson = lessons[lastLessonIndex];

  return isSamePosition(currentPosition, {
    lessonIndex: lastLessonIndex,
    dialogueIndex: lastLesson.dialogues.length - 1,
    langIndex: getLastLangIndex()
  });
}

function buildAudioPath(
  lesson: LessonItem,
  dialogue: Dialogue,
  lang: Language
): string {
  return `/audio/${lesson.id}-${dialogue.sequence}_${lang}.mp3`;
}

function playCurrent(): void {
  if (playbackMode === 'none') {
    return;
  }

  const current = getCurrentItem();

  if (!current) {
    return;
  }

  if (playbackMode === 'en' && current.lang !== 'en') {
    setCurrentPosition({
      ...currentPosition,
      langIndex: 0
    });
  }

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
  setCurrentPosition(getPreviousPosition());
  playCurrent();
}

function playNext(): void {
  setCurrentPosition(getNextPosition());
  playCurrent();
}

function handleAudioEnded(): void {
  if (playbackMode === 'none') {
    return;
  }

  if (loopMode === 'one') {
    elements.audioPlayer.currentTime = 0;
    playCurrent();
    return;
  }

  if (loopMode === 'conversation' && isEndOfCurrentConversation()) {
    setCurrentPosition(getFirstPositionInCurrentConversation());
    playCurrent();
    return;
  }

  if (loopMode === 'all' && isEndOfAll()) {
    setCurrentPosition(getFirstPosition());
    playCurrent();
    return;
  }

  if (loopMode === 'none' && isEndOfAll()) {
    return;
  }

  if (loopMode === 'none' && isEndOfCurrentConversation()) {
    return;
  }

  playNext();
}

function updateLoopModeButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-loop-mode]').forEach((button) => {
    const mode = button.dataset.loopMode as LoopMode;
    button.classList.toggle('active', mode === loopMode);
  });
}

function updatePlaybackModeButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-playback-mode]').forEach((button) => {
    const mode = button.dataset.playbackMode as PlaybackMode;
    button.classList.toggle('active', mode === playbackMode);
  });
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

elements.audioPlayer.addEventListener('ended', handleAudioEnded);

document.querySelectorAll<HTMLButtonElement>('[data-loop-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedMode = button.dataset.loopMode as Exclude<LoopMode, 'none'>;

    loopMode = loopMode === selectedMode ? 'none' : selectedMode;
    updateLoopModeButtons();
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-playback-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedMode = button.dataset.playbackMode as PlaybackMode;

    playbackMode = playbackMode === selectedMode ? 'none' : selectedMode;

    if (playbackMode === 'en' && currentPosition.langIndex !== 0) {
      setCurrentPosition({
        ...currentPosition,
        langIndex: 0
      });
    }

    updatePlaybackModeButtons();
  });
});

elements.phaseSelect.addEventListener('change', () => {
  currentPhase = Number(elements.phaseSelect.value) as PhaseNo;

  renderSentences();
  setCurrentPosition({
    lessonIndex: 0,
    dialogueIndex: 0,
    langIndex: 0
  });
});

loadPhaseData().catch((error: unknown) => {
  console.error(error);
});