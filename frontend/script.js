/* =========================================================
   CODENTIFY — Vanilla JS interactions
   Subtle, premium, Apple-grade motion. No libraries.
   ========================================================= */

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar: transparent → solid on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 24) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile burger (simple toggle) ---------- */
  const burger = document.getElementById('burger');
  const links = document.querySelector('.navbar__links');
  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = links.style.display === 'flex';
      links.style.display = isOpen ? '' : 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '84px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = '#fff';
      links.style.padding = '24px 40px';
      links.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
    });
  }

  /* ---------- Scroll reveal (fade in + slide up) ---------- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Magnetic buttons (extremely subtle) ---------- */
  if (!prefersReducedMotion) {
    const buttons = document.querySelectorAll('.btn');
    const strength = 8; // max px offset — kept tiny for a "premium" feel

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const mx = (x / rect.width) * strength;
        const my = (y / rect.height) * strength;
        btn.style.setProperty('--mx', `${mx}px`);
        btn.style.setProperty('--my', `${my}px`);
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Subtle mouse parallax on hero mockup ---------- */
  if (!prefersReducedMotion) {
    const parallaxEl = document.querySelector('[data-parallax] .mockup');
    const hero = document.querySelector('.hero');

    if (parallaxEl && hero) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        // Very small rotation — a whisper of depth, not a tilt effect
        const rotateY = x * 4;
        const rotateX = y * -4;

        parallaxEl.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      });

      hero.addEventListener('mouseleave', () => {
        parallaxEl.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    }
  }

  /* ---------- Accordion (FAQ) ---------- */
  const accordionItems = document.querySelectorAll('.accordion__item');
  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items for a clean, single-open accordion
      accordionItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  /* =========================================================
     REAL FILE UPLOAD + AI/ML PLAGIARISM COMPARISON
     Files are sent to the Codentify backend, which parses them
     into Abstract Syntax Trees and runs them through a trained
     Random Forest model (see /backend and /ml_engine in the repo).
     Currently only .java files are supported by the trained model.
     ========================================================= */

  // Change this if the backend runs somewhere other than localhost during development,
  // or point it at your deployed API URL in production.
  const BACKEND_URL = 'http://localhost:8000';

  const EXT_META = {
    java: { color: '#E76F00', label: 'Java' },
    py:   { color: '#3776AB', label: 'Python' },
    js:   { color: '#F7DF1E', label: 'JavaScript' },
    ts:   { color: '#3178C6', label: 'TypeScript' },
    cpp:  { color: '#00599C', label: 'C++' },
    cc:   { color: '#00599C', label: 'C++' },
    c:    { color: '#555555', label: 'C' },
    cs:   { color: '#68217A', label: 'C#' },
    go:   { color: '#00ADD8', label: 'Go' },
    rs:   { color: '#DEA584', label: 'Rust' },
    rb:   { color: '#CC342D', label: 'Ruby' },
    php:  { color: '#777BB4', label: 'PHP' },
    swift:{ color: '#FA7343', label: 'Swift' },
    kt:   { color: '#7F52FF', label: 'Kotlin' },
    txt:  { color: '#9CA3AF', label: 'Text' },
  };

  function getExtMeta(filename) {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    return EXT_META[ext] || { color: '#6B7280', label: ext ? ext.toUpperCase() : 'File' };
  }

  async function compareFilesOnBackend(fileA, fileB) {
    const formData = new FormData();
    formData.append('file_a', fileA);
    formData.append('file_b', fileB);

    const response = await fetch(`${BACKEND_URL}/compare`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // FastAPI puts validation/error messages in `detail`
      throw new Error(data.detail || 'Something went wrong comparing these files.');
    }

    return data; // { similarity, prediction, confidence }
  }

  function initCompareWidget(scope) {
    const chipA = scope.querySelector('#uploadChipA');
    const chipB = scope.querySelector('#uploadChipB');
    const inputA = scope.querySelector('#fileInputA');
    const inputB = scope.querySelector('#fileInputB');
    const pillContainer = scope.querySelector('#filePillContainer');
    const compareBtn = scope.querySelector('#compareBtn');
    const resultBox = scope.querySelector('#similarityResult');
    const resultValue = scope.querySelector('#similarityValue');
    const hint = scope.querySelector('#uploadHint');

    if (!chipA || !chipB || !inputA || !inputB || !compareBtn) return;

    const state = { fileA: null, fileB: null };

    function renderPills() {
      pillContainer.innerHTML = '';
      [['A', state.fileA, chipA], ['B', state.fileB, chipB]].forEach(([key, file, chip]) => {
        const textEl = chip.querySelector('.upload-chip__text');
        if (file) {
          chip.classList.add('has-file');
          textEl.textContent = file.name;

          const meta = getExtMeta(file.name);
          const pill = document.createElement('div');
          pill.className = 'file-pill';
          pill.innerHTML = `
            <span class="file-pill__dot" style="background:${meta.color}"></span>
            <span>${file.name}</span>
          `;
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'file-pill__remove';
          removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
          removeBtn.textContent = '×';
          removeBtn.addEventListener('click', () => {
            state[key === 'A' ? 'fileA' : 'fileB'] = null;
            if (key === 'A') inputA.value = '';
            else inputB.value = '';
            renderPills();
          });
          pill.appendChild(removeBtn);
          pillContainer.appendChild(pill);
        } else {
          chip.classList.remove('has-file');
          textEl.textContent = `Upload File ${key}`;
        }
      });

      const ready = Boolean(state.fileA && state.fileB);
      compareBtn.disabled = !ready;
      if (hint) {
        hint.textContent = ready
          ? 'Ready to compare — analyzed by the AI/ML engine (.java files only, for now).'
          : 'Select two Java files to compare.';
      }
      resultBox.style.display = 'none';
    }

    inputA.addEventListener('change', () => {
      if (inputA.files && inputA.files[0]) {
        state.fileA = inputA.files[0];
        renderPills();
      }
    });

    inputB.addEventListener('change', () => {
      if (inputB.files && inputB.files[0]) {
        state.fileB = inputB.files[0];
        renderPills();
      }
    });

    compareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!state.fileA || !state.fileB) return;

      const originalLabel = compareBtn.textContent;
      compareBtn.disabled = true;
      compareBtn.textContent = 'Comparing…';

      try {
        const result = await compareFilesOnBackend(state.fileA, state.fileB);
        const percent = Math.round(result.similarity * 100);
        const isPlagiarized = result.prediction === 'plagiarized';
        const confidencePercent = Math.round(result.confidence * 100);

        resultValue.style.transition = 'opacity 0.3s var(--ease-premium)';
        resultValue.style.opacity = '0';
        resultBox.style.display = 'flex';

        setTimeout(() => {
          resultValue.textContent = `${percent}%`;
          resultValue.style.color = isPlagiarized ? '#DC2626' : 'var(--accent-blue)';
          resultValue.style.opacity = '1';
        }, 200);

        if (hint) {
          hint.textContent = isPlagiarized
            ? `Flagged as plagiarized (${confidencePercent}% model confidence).`
            : `Not flagged as plagiarized (${confidencePercent}% model confidence).`;
        }
      } catch (err) {
        resultBox.style.display = 'none';
        if (hint) {
          hint.textContent = err.message || 'Could not reach the comparison service. Is the backend running?';
        }
      } finally {
        compareBtn.disabled = false;
        compareBtn.textContent = originalLabel;
      }
    });

    renderPills();
  }

  document.querySelectorAll('.mockup').forEach((mockup) => initCompareWidget(mockup));
})();