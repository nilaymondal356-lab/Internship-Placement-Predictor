document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  STATE
    // ============================================================
    let activeTab = 0;
    const totalTabs = 4;
    let isTransitioning = false;

    const sectionFields = [
        ['CGPA', 'SSC_Marks', 'HSC_Marks'],
        ['Internships', 'Projects', 'WorkshopsCertifications'],
        ['AptitudeTestScore', 'SoftSkillsRating'],
        ['ExtracurricularActivities', 'PlacementTraining']
    ];

    // ============================================================
    //  DOM REFS
    // ============================================================
    const tabCircles = document.querySelectorAll('.tab-circle');
    const connectors = document.querySelectorAll('.tab-connector');
    const panels = document.querySelectorAll('.morph-panel');
    const startBtn = document.getElementById('startBtn');
    const tabsSection = document.getElementById('tabsSection');
    const panelWrapper = document.getElementById('morphPanelWrapper');
    const heroSection = document.getElementById('heroSection');
    const scrollContent = document.getElementById('scrollContent');
    const profileProgressText = document.getElementById('profileProgressText');
    const profileProgressBars = document.querySelectorAll('.profile-step-progress span');

    // Each form panel lives inside its matching numbered step.
    tabCircles.forEach((tab, index) => tab.appendChild(panels[index]));
    if (panelWrapper) panelWrapper.hidden = true;

    // ============================================================
    //  SCROLL-DRIVEN HERO BLUR + CONTENT REVEAL
    // ============================================================
    const revealElements = document.querySelectorAll('[data-reveal]');
    let ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const windowH = window.innerHeight;

            // â”€â”€ Hero blur: 0 at top â†’ max blur when scrollContent is fully in view â”€â”€
            // Start blurring once user scrolls ~20% of viewport
            const blurStart = windowH * 0.15;
            const blurEnd = windowH * 0.85;
            const blurProgress = Math.min(Math.max((scrollY - blurStart) / (blurEnd - blurStart), 0), 1);
            const blurAmount = blurProgress * 22; // max 22px blur
            const scaleAmount = 1 + blurProgress * 0.06; // subtle zoom
            const opacityAmount = 1 - blurProgress * 0.5; // fade to 50% opacity

            if (heroSection) {
                heroSection.style.filter = `blur(${blurAmount}px)`;
                heroSection.style.transform = `scale(${scaleAmount})`;
                heroSection.style.opacity = opacityAmount;
            }

            // â”€â”€ Scroll-reveal elements â”€â”€
            revealElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const triggerPoint = windowH * 0.85;

                if (rect.top < triggerPoint) {
                    el.classList.add('is-revealed');
                }
            });

            // â”€â”€ Hide scroll indicator â”€â”€
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                if (scrollY > 80) {
                    scrollIndicator.classList.add('is-hidden');
                } else {
                    scrollIndicator.classList.remove('is-hidden');
                }
            }

            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Trigger once on load
    onScroll();

    // ============================================================
    //  SECTION COMPLETION TRACKING
    // ============================================================
    function checkSectionCompletion() {
        let previousAllCompleted = true;
        sectionFields.forEach((fields, idx) => {
            const statusEl = document.getElementById(`status${idx}`);
            const tabCircle = tabCircles[idx];
            const currentPanel = panels[idx];

            const inputs = currentPanel.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (!previousAllCompleted) {
                    input.disabled = true;
                    input.style.cursor = 'not-allowed';
                    input.style.opacity = '0.6';
                } else {
                    input.disabled = false;
                    input.style.cursor = 'text';
                    input.style.opacity = '1';
                }
            });

            const customSelects = currentPanel.querySelectorAll('.custom-select');
            customSelects.forEach(sel => {
                if (!previousAllCompleted) {
                    sel.style.pointerEvents = 'none';
                    sel.style.opacity = '0.6';
                } else {
                    sel.style.pointerEvents = 'auto';
                    sel.style.opacity = '1';
                }
            });

            let allFilled = true;
            for (const fieldId of fields) {
                const el = document.getElementById(fieldId);
                if (!el || el.value.trim() === '' || el.value.trim() === 'Select') {
                    allFilled = false;
                    break;
                }
                const val = parseFloat(el.value);
                if (fieldId === 'CGPA' && (val < 1 || val > 10)) {
                    allFilled = false;
                    break;
                }
                if ((fieldId === 'SSC_Marks' || fieldId === 'HSC_Marks') && (val < 25 || val > 100)) {
                    allFilled = false;
                    break;
                }
                if (fieldId === 'Internships' && (val < 1 || val > 10)) {
                    allFilled = false;
                    break;
                }
                if (fieldId === 'Projects' && (val < 1 || val > 30)) {
                    allFilled = false;
                    break;
                }
                if (fieldId === 'WorkshopsCertifications' && (val < 1 || val > 50)) {
                    allFilled = false;
                    break;
                }
                if (fieldId === 'AptitudeTestScore' && (val < 0 || val > 100)) {
                    allFilled = false;
                    break;
                }
                if (fieldId === 'SoftSkillsRating' && (val < 1 || val > 5)) {
                    allFilled = false;
                    break;
                }
            }

            const nextBtn = panels[idx].querySelector('[data-next]');
            if (nextBtn) {
                nextBtn.style.opacity = allFilled ? '1' : '0.5';
                nextBtn.removeAttribute('disabled');
            }

            if (allFilled) {
                tabCircle.classList.add('completed');
                if (statusEl) {
                    statusEl.innerHTML = '<span class="status-dot"></span> Complete';
                    statusEl.classList.add('completed');
                }
                // Fill connector before this tab
                if (idx > 0 && connectors[idx - 1]) {
                    connectors[idx - 1].classList.add('filled');
                }
            } else {
                tabCircle.classList.remove('completed');
                if (statusEl) {
                    statusEl.innerHTML = '<span class="status-dot"></span> Pending';
                    statusEl.classList.remove('completed');
                }
                previousAllCompleted = false;
            }
        });

        updateProfileProgress();
    }

    function updateProfileProgress() {
        if (profileProgressText) {
            profileProgressText.textContent = `Progress: Step ${activeTab + 1} of ${totalTabs}`;
        }

        profileProgressBars.forEach((bar, index) => {
            const isComplete = tabCircles[index]?.classList.contains('completed');
            bar.classList.toggle('is-complete', Boolean(isComplete));
            bar.classList.toggle('is-active', index === activeTab && !isComplete);
        });
    }

    document.querySelectorAll('#predictForm input').forEach(input => {
        input.addEventListener('input', checkSectionCompletion);
        input.addEventListener('change', checkSectionCompletion);
    });

    const cgpaInput = document.getElementById('CGPA');
    if (cgpaInput) {
        cgpaInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const warningMsg = document.getElementById('cgpa-warning');
            if (warningMsg) {
                if (e.target.value !== '' && (val < 1 || val > 10)) {
                    warningMsg.style.display = 'block';
                } else {
                    warningMsg.style.display = 'none';
                }
            }
        });
    }

    const validatePercentage = (inputId, warningId) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                const warningMsg = document.getElementById(warningId);
                if (warningMsg) {
                    if (e.target.value !== '' && (val < 25 || val > 100)) {
                        warningMsg.style.display = 'block';
                    } else {
                        warningMsg.style.display = 'none';
                    }
                }
            });
        }
    };
    validatePercentage('SSC_Marks', 'ssc-warning');
    validatePercentage('HSC_Marks', 'hsc-warning');

    const validateCount = (inputId, warningId, min, max) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                const warningMsg = document.getElementById(warningId);
                if (warningMsg) {
                    if (e.target.value !== '' && (val < min || val > max)) {
                        warningMsg.style.display = 'block';
                    } else {
                        warningMsg.style.display = 'none';
                    }
                }
            });
        }
    };
    validateCount('Internships', 'internships-warning', 1, 10);
    validateCount('Projects', 'projects-warning', 1, 30);
    validateCount('WorkshopsCertifications', 'workshops-warning', 1, 50);
    validateCount('AptitudeTestScore', 'aptitude-warning', 0, 100);
    validateCount('SoftSkillsRating', 'softskills-warning', 1, 5);

    checkSectionCompletion();

    // ============================================================
    //  TAB SWITCHING â€” inline expanding-step morph
    // ============================================================
    function switchToTab(newTab) {
        if (isTransitioning || newTab === activeTab || newTab < 0 || newTab >= totalTabs) return;

        const direction = newTab > activeTab ? 'right' : 'left';
        const currentPanel = panels[activeTab];
        const nextPanel = panels[newTab];
        const beforeRects = new Map(Array.from(tabCircles, tab => [tab, tab.getBoundingClientRect()]));

        isTransitioning = true;
        const panelShift = direction === 'right' ? '56px' : '-56px';

        currentPanel.classList.remove('active');
        currentPanel.classList.remove('exit-left', 'exit-right');
        currentPanel.classList.add('is-transitioning', 'is-exiting');

        nextPanel.classList.remove('exit-left', 'exit-right');
        nextPanel.classList.add('active', 'is-transitioning', 'is-entering');

        tabCircles.forEach(tc => tc.classList.remove('active'));
        tabCircles[newTab].classList.add('active');
        nextPanel.style.setProperty('--panel-shift', panelShift);

        connectors.forEach((conn, idx) => {
            if (idx < newTab) {
                conn.classList.add('filled');
            }
        });

        animateStepLayout(beforeRects, newTab);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                currentPanel.classList.add('is-exit-active');
                nextPanel.classList.remove('is-entering');
                resetPanelAnimations(nextPanel);
            });
        });

        window.setTimeout(() => {
            currentPanel.classList.remove('is-transitioning', 'is-exiting', 'is-exit-active');
            nextPanel.classList.remove('is-transitioning');
            activeTab = newTab;
            isTransitioning = false;
            updateProfileProgress();
        }, 720);
    }

    function animateStepLayout(beforeRects, expandingTab) {
        tabCircles.forEach((tab, index) => {
            const before = beforeRects.get(tab);
            const after = tab.getBoundingClientRect();
            if (!before || !after.width || !after.height) return;

            const moveX = before.left - after.left;
            const moveY = before.top - after.top;

            if (index === expandingTab) {
                const morphAnimation = tab.animate([
                    {
                        transform: `translate(${moveX}px, ${moveY}px) scale(${before.width / after.width}, ${before.height / after.height})`,
                        borderRadius: '20px'
                    },
                    { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '36px' }
                ], {
                    duration: 580,
                    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                    fill: 'both'
                });
                morphAnimation.finished.then(() => morphAnimation.cancel()).catch(() => {});
            } else if (Math.abs(moveX) > 0.5 || Math.abs(moveY) > 0.5) {
                tab.animate([
                    { transform: `translate(${moveX}px, ${moveY}px)` },
                    { transform: 'translate(0, 0)' }
                ], {
                    duration: 500,
                    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                });
            }
        });
    }

    function resetPanelAnimations(panel) {
        const animatedEls = panel.querySelectorAll('.morph-panel__head, .morph-panel__body, .morph-panel__actions, .input-group');
        animatedEls.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // force reflow
            el.style.animation = '';
        });
    }

    // Click on circular tabs
    tabCircles.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = parseInt(tab.dataset.tab);
            switchToTab(targetTab);
        });
    });

    // Next/Back buttons
    document.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!tabCircles[activeTab].classList.contains('completed')) {
                let errorMsg = document.getElementById('general-error-msg');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.id = 'general-error-msg';
                    errorMsg.style.color = '#ff6b6b';
                    errorMsg.style.fontSize = '0.9rem';
                    errorMsg.style.fontWeight = '500';
                    errorMsg.style.marginTop = '12px';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.textContent = 'Please give all the details correctly to continue.';
                    btn.parentNode.appendChild(errorMsg);
                }
                errorMsg.style.display = 'block';
                setTimeout(() => { if(errorMsg) errorMsg.style.display = 'none'; }, 3000);
                return;
            }
            switchToTab(parseInt(btn.dataset.next));
        });
    });

    document.querySelectorAll('[data-prev]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab(parseInt(btn.dataset.prev));
        });
    });

    // Hero CTA â€” smooth scroll to content
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (scrollContent) {
                scrollContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (tabsSection) {
                tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ============================================================
    //  CUSTOM SELECT DROPDOWNS
    // ============================================================
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(sel => {
        const trigger = sel.querySelector('.custom-select__trigger');
        const options = sel.querySelectorAll('.custom-select__option');
        const valueDisplay = sel.querySelector('.custom-select__value');
        const hiddenSelect = sel.querySelector('select');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customSelects.forEach(other => {
                if (other !== sel) {
                    other.classList.remove('is-open');
                    other.closest('.tab-circle')?.classList.remove('has-open-select');
                }
            });
            sel.classList.toggle('is-open');
            sel.closest('.tab-circle')?.classList.toggle('has-open-select', sel.classList.contains('is-open'));
        });

        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.dataset.value;
                const label = opt.querySelector('.custom-select__option-label').textContent;
                valueDisplay.textContent = label;
                sel.classList.add('has-value');
                sel.classList.remove('is-open');
                sel.closest('.tab-circle')?.classList.remove('has-open-select');
                hiddenSelect.value = value;
                hiddenSelect.dispatchEvent(new Event('change'));
                options.forEach(o => o.classList.remove('is-selected'));
                opt.classList.add('is-selected');
                checkSectionCompletion();
            });
        });
    });

    document.addEventListener('click', (e) => {
        customSelects.forEach(sel => {
            if (!sel.contains(e.target)) {
                sel.classList.remove('is-open');
                sel.closest('.tab-circle')?.classList.remove('has-open-select');
            }
        });
    });

    // ============================================================
    //  INTERSECTION OBSERVER â€” hero title animation
    // ============================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    document.querySelectorAll('.reveal-up, .hero-main-title').forEach(el => observer.observe(el));

    // ============================================================
    //  HERO TITLE â€” prefers-reduced-motion fallback
    // ============================================================
    const heroTitle = document.querySelector('.hero-main-title');
    if (heroTitle) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            heroTitle.classList.add('is-visible');
            heroTitle.querySelectorAll('[data-hero-line]').forEach(line => {
                line.style.opacity = '1';
                line.style.filter = 'none';
                line.style.transform = 'none';
            });
            const heroCta = document.querySelector('.hero-cta');
            if (heroCta) {
                heroCta.style.opacity = '1';
                heroCta.style.transform = 'none';
            }
        }
    }

    // Hero floating particles (reduced count)
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 4 + 2;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animation = `float-${i % 3 + 1} ${Math.random() * 10 + 12}s linear infinite`;
            particlesContainer.appendChild(p);
        }
    }
});

// ============================================================
//  FORM SUBMISSION & RESULTS
// ============================================================
const predictForm = document.getElementById('predictForm');
if(predictForm) {
    predictForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
            e.preventDefault();
            const currentPanel = e.target.closest('.morph-panel');
            if (currentPanel) {
                const nextBtn = currentPanel.querySelector('[data-next]');
                if (nextBtn) {
                    nextBtn.click();
                } else {
                    const submitBtn = currentPanel.querySelector('button[type="submit"]');
                    if (submitBtn) submitBtn.click();
                }
            }
        }
    });

    predictForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Final safety check to ensure all form sections are truly completed
        const allCompleted = Array.from(document.querySelectorAll('.tab-circle')).every(tab => tab.classList.contains('completed'));
        if (!allCompleted) {
            let errorMsg = document.getElementById('submit-error-msg');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'submit-error-msg';
                errorMsg.style.color = '#ff6b6b';
                errorMsg.style.fontSize = '0.9rem';
                errorMsg.style.fontWeight = '500';
                errorMsg.style.marginTop = '12px';
                errorMsg.style.textAlign = 'center';
                errorMsg.textContent = 'Please complete all sections correctly before submitting.';
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.parentNode.appendChild(errorMsg);
            }
            errorMsg.style.display = 'block';
            setTimeout(() => { if(errorMsg) errorMsg.style.display = 'none'; }, 3000);
            return;
        }

        const loadingOverlay = document.getElementById('loadingOverlay');
        const resultCard = document.getElementById('resultCard');
        const gaugeFill = document.getElementById('gaugeFill');
        const gaugeLabel = document.getElementById('gaugeLabel');
        const resultStatus = document.getElementById('resultStatus');
        const resultSubtitle = document.getElementById('resultSubtitle');
        let finishAnalysis = () => {};

        loadingOverlay.classList.add('active');
        resultCard.style.opacity = '0';
        resultCard.classList.remove('show', 'placed', 'not-placed');
        gaugeFill.style.strokeDasharray = '0 326.73';
        gaugeLabel.textContent = '0%';
        finishAnalysis = startAnalysisAnimation();

        document.getElementById('resultWrap').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        const data = {
            CGPA: parseFloat(document.getElementById('CGPA').value),
            Internships: parseInt(document.getElementById('Internships').value),
            Projects: parseInt(document.getElementById('Projects').value),
            WorkshopsCertifications: parseInt(document.getElementById('WorkshopsCertifications').value),
            AptitudeTestScore: parseInt(document.getElementById('AptitudeTestScore').value),
            SoftSkillsRating: parseFloat(document.getElementById('SoftSkillsRating').value),
            ExtracurricularActivities: document.getElementById('ExtracurricularActivities').value,
            PlacementTraining: document.getElementById('PlacementTraining').value,
            SSC_Marks: parseInt(document.getElementById('SSC_Marks').value),
            HSC_Marks: parseInt(document.getElementById('HSC_Marks').value)
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('API error');
            const result = await response.json();

            setTimeout(() => {
                finishAnalysis();
                loadingOverlay.classList.remove('active');
                const isPlaced = result.placement_status === 'Placed';
                resultCard.classList.add('show');
                resultCard.style.opacity = '1';
                resultStatus.textContent = isPlaced ? 'Placed' : 'Not Placed';
                resultCard.classList.add(isPlaced ? 'placed' : 'not-placed');
                resultSubtitle.textContent = isPlaced
                    ? 'Strong candidate profile â€” ready for placement!'
                    : 'Keep building your skills â€” you\'re getting there!';

                const score = Math.round(result.confidence);
                populateResultInsights(data, isPlaced);

                const circumference = 2 * Math.PI * 52;
                setTimeout(() => {
                    gaugeFill.style.strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
                }, 50);

                const duration = 1500;
                const startTime = performance.now();
                const animateGauge = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 4);
                    gaugeLabel.textContent = Math.floor(easeOut * score) + '%';
                    if (progress < 1) {
                        requestAnimationFrame(animateGauge);
                    } else {
                        gaugeLabel.textContent = score + '%';
                    }
                };
                requestAnimationFrame(animateGauge);

                if (isPlaced) fireConfetti();
            }, 1800);

        } catch (error) {
            console.error('Prediction failed:', error);
            finishAnalysis();
            loadingOverlay.classList.remove('active');
            resultCard.classList.add('show', 'not-placed');
            resultCard.style.opacity = '1';
            resultStatus.textContent = 'Error';
            resultSubtitle.textContent = 'Could not connect to prediction server.';
        }
    });
}

function startAnalysisAnimation() {
    const progressLabel = document.getElementById('analysisProgress');
    const visual = document.getElementById('analysisVisual');
    const stageLabel = document.getElementById('analysisStage');
    const steps = [...document.querySelectorAll('[data-analysis-step]')];
    const stages = [
        'Reading academic signals and achievements.',
        'Mapping practical experience and project depth.',
        'Balancing aptitude with communication readiness.',
        'Finalizing your placement outlook.'
    ];
    let progress = 7;

    const paint = (isComplete = false) => {
        const stageIndex = isComplete ? 3 : Math.min(3, Math.floor(progress / 25));
        progressLabel.textContent = `${Math.round(progress)}%`;
        visual.style.setProperty('--scan-progress', `${progress}%`);
        stageLabel.textContent = stages[stageIndex];
        steps.forEach((step, index) => step.classList.toggle('is-active', index === stageIndex));
    };

    paint();
    const timer = window.setInterval(() => {
        const increment = progress < 35 ? 4.5 : progress < 70 ? 2.7 : 1.15;
        progress = Math.min(95, progress + increment);
        paint();
    }, 90);

    return () => {
        window.clearInterval(timer);
        progress = 100;
        paint(true);
    };
}

function populateResultInsights(data, isPlaced) {
    const clamp = (value) => Math.round(Math.max(4, Math.min(99, value)));
    const academic = clamp((data.CGPA / 10) * 55 + ((data.SSC_Marks + data.HSC_Marks) / 200) * 45);
    const experience = clamp(data.Internships * 20 + data.Projects * 8 + data.WorkshopsCertifications * 7);
    const readiness = clamp(data.AptitudeTestScore * 0.64 + (data.SoftSkillsRating / 5) * 36);
    const signals = [
        ['academic', academic],
        ['experience', experience],
        ['readiness', readiness]
    ];

    signals.forEach(([name, value]) => {
        document.getElementById(`${name}SignalValue`).textContent = `${value}%`;
        const bar = document.getElementById(`${name}SignalBar`);
        bar.style.width = '0';
        window.setTimeout(() => { bar.style.width = `${value}%`; }, 130);
    });

    const highlights = isPlaced
        ? ['âœ¦ Strong placement fit', 'Interview-ready profile', 'Positive model outcome']
        : ['âœ¦ Growth path identified', 'Build experience depth', 'Reassess after upskilling'];
    const tags = document.getElementById('resultTags');
    tags.replaceChildren();
    highlights.forEach((highlight) => {
        const tag = document.createElement('span');
        tag.textContent = highlight;
        tags.appendChild(tag);
    });
}

// ============================================================
//  CONFETTI
// ============================================================
function fireConfetti() {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: '9999'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#120b08', '#2a160e', '#4a2818', '#75462a', '#9a6845', '#d8b08b', '#168063'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width * 0.5 + (Math.random() - 0.5) * 300,
            y: canvas.height * 0.4,
            vx: (Math.random() - 0.5) * 16,
            vy: -(Math.random() * 12 + 4),
            size: Math.random() * 7 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.15 + Math.random() * 0.1
        });
    }

    const startTime = performance.now();
    const duration = 3500;

    function animate(t) {
        const elapsed = t - startTime;
        if (elapsed > duration) { canvas.remove(); return; }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fadeStart = duration * 0.65;
        const alpha = elapsed > fadeStart ? 1 - (elapsed - fadeStart) / (duration - fadeStart) : 1;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.99;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.globalAlpha = alpha * (0.7 + Math.random() * 0.3);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;

            if (p.size > 6) {
                ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
