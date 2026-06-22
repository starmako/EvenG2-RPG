import './styles.css';

type PhaseNo = 1;
type Language = 'en' | 'ja';

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

const elements = {
  phaseSelect: requireElement<HTMLSelectElement>('phaseSelect'),
  sentenceList: requireElement<HTMLUListElement>('sentenceList'),
  currentText: requireElement<HTMLParagraphElement>('currentText'),
  audioPlayer: requireElement<HTMLAudioElement>('audioPlayer'),
  playButton: requireElement<HTMLButtonElement>('playButton'),
  stopButton: requireElement<HTMLButtonElement>('stopButton'),
  prevButton: requireElement<HTMLButtonElement>('prevButton'),
  nextButton: requireElement<HTMLButtonElement>('nextButton'),
  loopToggle: requireElement<HTMLInputElement>('loopToggle')
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
}

function renderSentences(): void {
  elements.sentenceList.innerHTML = '';

  const lessons = phaseData[currentPhase];

  lessons.forEach((lesson, lessonIndex) => {
    lesson.dialogues.forEach((dialogue, dialogueIndex) => {
      languages.forEach((lang, langIndex) => {
        const li = document.createElement('li');

        li.textContent = dialogue[lang];
        li.dataset.lessonIndex = String(lessonIndex);
        li.dataset.dialogueIndex = String(dialogueIndex);
        li.dataset.langIndex = String(langIndex);

        li.addEventListener('click', () => {
          setCurrentPosition({
            lessonIndex,
            dialogueIndex,
            langIndex
          });

          playCurrent();
        });

        elements.sentenceList.appendChild(li);
      });
    });
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
    lessonIndex = 0;
    dialogueIndex = 0;
    langIndex = 0;
  }

  if (lessonIndex >= lessons.length) {
    const lastLessonIndex = lessons.length - 1;
    const lastDialogueIndex = lessons[lastLessonIndex].dialogues.length - 1;

    return {
      lessonIndex: lastLessonIndex,
      dialogueIndex: lastDialogueIndex,
      langIndex: languages.length - 1
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
      langIndex: languages.length - 1
    };
  }

  if (dialogueIndex >= lesson.dialogues.length) {
    if (lessonIndex >= lessons.length - 1) {
      return {
        lessonIndex,
        dialogueIndex: lesson.dialogues.length - 1,
        langIndex: languages.length - 1
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
      langIndex: languages.length - 1
    });
  }

  if (langIndex >= languages.length) {
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
  document.querySelectorAll<HTMLLIElement>('#sentenceList li').forEach((el) => {
    const isActive =
      Number(el.dataset.lessonIndex) === currentPosition.lessonIndex &&
      Number(el.dataset.dialogueIndex) === currentPosition.dialogueIndex &&
      Number(el.dataset.langIndex) === currentPosition.langIndex;

    el.classList.toggle('active', isActive);

    if (isActive) {
      el.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
  });
}

function getNextPosition(): CurrentPosition {
  return {
    ...currentPosition,
    langIndex: currentPosition.langIndex + 1
  };
}

function getPreviousPosition(): CurrentPosition {
  return {
    ...currentPosition,
    langIndex: currentPosition.langIndex - 1
  };
}

function buildAudioPath(
  lesson: LessonItem,
  dialogue: Dialogue,
  lang: Language
): string {
  return `/audio/${lesson.id}-${dialogue.sequence}_${lang}.mp3`;
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
  setCurrentPosition(getPreviousPosition());
  playCurrent();
}

function playNext(): void {
  setCurrentPosition(getNextPosition());
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

elements.audioPlayer.addEventListener('ended', () => {
  if (!elements.loopToggle.checked) {
    playNext();
  }
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