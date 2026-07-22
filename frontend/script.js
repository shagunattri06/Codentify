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
     FILE UPLOAD + AI/ML MODEL COMPARISON
     This frontend does NOT compute plagiarism/similarity itself.
     It only reads the two files, sends them to your trained
     model's API, and renders whatever result comes back.

     -----------------------------------------------------------
     WIRE THIS UP TO YOUR MODEL:
     1. Set API_ENDPOINT below to your backend route
        (e.g. a Flask/FastAPI endpoint that loads your trained
        model and returns a JSON result).
     2. Your endpoint should accept a POST with JSON body:
          {
            "file_a": { "name": "A.py", "content": "...source..." },
            "file_b": { "name": "B.py", "content": "...source..." }
          }
     3. Your endpoint should respond with JSON shaped like:
          {
            "similarity": 87.4,          // 0-100 overall score from your model
            "verdict": "High similarity", // short label, your choice
            "breakdown": {                 // optional, powers the bar chart
              "Structural": 82,
              "Textual": 91,
              "Token Overlap": 76
            }
          }
        "breakdown" is optional — if your model only returns a
        single score, omit it and the bar chart is skipped.
     4. Once your endpoint is live, set USE_MOCK_PREVIEW to false.
     ========================================================= */

  const API_ENDPOINT = 'http://localhost:5000/api/compare';

  // DEV PREVIEW ONLY. While true, no network call is made and no
  // file content is analyzed — this just fills the UI with fixed
  // placeholder numbers so you can see the charts render. It does
  // NOT compute any real similarity. Set to false once your model
  // API (above) is ready, so results come from the trained model.
  const USE_MOCK_PREVIEW = false;

  function getMockPreviewResult() {
    return {
      similarity: 74,
      verdict: 'Moderate similarity',
      breakdown: {
        Structural: 68,
        Textual: 81,
        'Token Overlap': 59,
      },
    };
  }

  async function requestComparisonFromModel(fileA, fileB) {
    if (USE_MOCK_PREVIEW) {
      // Simulate network latency so the loading state is visible.
      await new Promise((resolve) => setTimeout(resolve, 700));
      return getMockPreviewResult();
    }

    const [contentA, contentB] = await Promise.all([
      readFileAsText(fileA),
      readFileAsText(fileB),
    ]);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_a: { name: fileA.name, content: contentA },
        file_b: { name: fileB.name, content: contentB },
      }),
    });

    if (!response.ok) {
      throw new Error(`Model API responded with status ${response.status}`);
    }

    return response.json();
  }

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

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function initCompareWidget(scope) {
    const chipA = scope.querySelector('#uploadChipA');
    const chipB = scope.querySelector('#uploadChipB');
    const inputA = scope.querySelector('#fileInputA');
    const inputB = scope.querySelector('#fileInputB');
    const pillContainer = scope.querySelector('#filePillContainer');
    const compareBtn = scope.querySelector('#compareBtn');
    const loadingBox = scope.querySelector('#compareLoading');
    const errorBox = scope.querySelector('#compareError');
    const resultBox = scope.querySelector('#similarityResult');
    const resultValue = scope.querySelector('#similarityValue');
    const resultVerdict = scope.querySelector('#similarityVerdict');
    const doughnutCanvas = scope.querySelector('#similarityDoughnut');
    const barCanvas = scope.querySelector('#breakdownBar');
    const hint = scope.querySelector('#uploadHint');

    if (!chipA || !chipB || !inputA || !inputB || !compareBtn) return;

    const state = { fileA: null, fileB: null };
    const charts = { doughnut: null, bar: null };

    function resetResultUI() {
      if (errorBox) errorBox.style.display = 'none';
      if (loadingBox) loadingBox.style.display = 'none';
      if (resultBox) resultBox.style.display = 'none';
    }

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
          ? 'Ready to compare — this will be sent to the plagiarism-detection model.'
          : "Select two code files to compare — they'll be sent to the plagiarism-detection model for analysis.";
      }
      resetResultUI();
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

    function renderCharts(result) {
      if (typeof Chart === 'undefined') return; // Chart.js failed to load

      const percent = Math.max(0, Math.min(100, Math.round(result.similarity)));

      if (doughnutCanvas) {
        if (charts.doughnut) charts.doughnut.destroy();
        charts.doughnut = new Chart(doughnutCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Similar', 'Different'],
            datasets: [{
              data: [percent, 100 - percent],
              backgroundColor: ['#2563EB', '#F1F1EF'],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            cutout: '72%',
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
          },
        });
      }

      const breakdown = result.breakdown && typeof result.breakdown === 'object'
        ? result.breakdown
        : null;

      if (barCanvas) {
        if (charts.bar) {
          charts.bar.destroy();
          charts.bar = null;
        }
        if (breakdown) {
          const labels = Object.keys(breakdown);
          const values = labels.map((key) => breakdown[key]);
          charts.bar = new Chart(barCanvas, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                data: values,
                backgroundColor: '#2563EB',
                borderRadius: 6,
                maxBarThickness: 28,
              }],
            },
            options: {
              responsive: true,
              indexAxis: 'y',
              scales: {
                x: { min: 0, max: 100, grid: { display: false } },
                y: { grid: { display: false } },
              },
              plugins: { legend: { display: false } },
            },
          });
        }
        barCanvas.closest('.chart-box').style.display = breakdown ? '' : 'none';
      }
    }

    compareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!state.fileA || !state.fileB) return;

      const originalLabel = compareBtn.textContent;
      compareBtn.disabled = true;
      compareBtn.textContent = 'Comparing…';
      resetResultUI();
      if (loadingBox) loadingBox.style.display = 'flex';

      try {
        const result = await requestComparisonFromModel(state.fileA, state.fileB);

        if (loadingBox) loadingBox.style.display = 'none';
        resultBox.style.display = 'flex';
        resultValue.textContent = `${Math.round(result.similarity)}%`;
        if (resultVerdict) resultVerdict.textContent = result.verdict || '';
        renderCharts(result);

        if (hint) {
          hint.textContent = USE_MOCK_PREVIEW
            ? 'Showing placeholder preview data — connect API_ENDPOINT in script.js to your trained model.'
            : 'Result returned by the plagiarism-detection model.';
        }
      } catch (err) {
        if (loadingBox) loadingBox.style.display = 'none';
        if (errorBox) {
          errorBox.style.display = 'block';
          errorBox.textContent = "Couldn't reach the comparison model. Make sure your backend API is running and API_ENDPOINT in script.js points to it.";
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
