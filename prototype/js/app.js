document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const refs = {
        status: $("onboardingStatus"), prev: $("previousStepButton"), next: $("nextStepButton"),
        name: $("workerName"), phone: $("workerPhone"), otp: $("otpInput"), otpHelp: $("otpHelper"),
        sendOtp: $("sendOtpButton"), verifyOtp: $("verifyOtpButton"), city: $("citySelect"), zone: $("zoneInput"),
        location: $("grantLocationButton"), locationHelp: $("locationStatus"), earnRange: $("earningsRange"), earnInput: $("earningsInput"),
        recs: $("recommendationMetrics"), riskBadge: $("previewRiskBadge"), riskText: $("riskExplanation"),
        dashboard: $("dashboardView"), claims: $("claimsView"), admin: $("adminView"), settings: $("settingsView"),
        deviceStatus: $("deviceStatus"), deviceTitle: $("deviceTitle"), banner: $("workerBanner"),
        heroProtected: $("heroProtectedValue"), heroPayout: $("heroPayoutValue"), loadDemo: $("loadDemoWorker"), toast: $("toast")
    };
    const nav = [...document.querySelectorAll(".nav-pill")];
    const stepPills = [...document.querySelectorAll(".step-pill")];
    const stepPanes = [...document.querySelectorAll(".step-pane")];
    const platformInputs = [...document.querySelectorAll('input[name="platform"]')];
    const defaultText = Object.fromEntries([...document.querySelectorAll("[data-i18n]")].map((node) => [node.dataset.i18n, node.textContent]));
    const views = { dashboard: refs.dashboard, claims: refs.claims, admin: refs.admin, settings: refs.settings };
    const cities = {
        Bengaluru: { zone: "Koramangala K-04", zr: 1.22, rain: 1.18, heat: 0.92, aqi: 0.72, close: 0.62, forecast: "High rain expected in Bengaluru next week." },
        Chennai: { zone: "Velachery C-11", zr: 1.3, rain: 1.28, heat: 1.06, aqi: 0.66, close: 0.58, forecast: "Localized flooding in Chennai could increase claims next week." },
        Delhi: { zone: "Dwarka D-09", zr: 1.14, rain: 0.8, heat: 1.2, aqi: 1.32, close: 0.74, forecast: "High AQI and heat stress are expected in Delhi." },
        Mumbai: { zone: "Andheri West M-07", zr: 1.26, rain: 1.25, heat: 0.84, aqi: 0.78, close: 0.68, forecast: "Mumbai rain corridors suggest a higher auto-payout probability." }
    };
    const copy = {
        en: { preview: "Preview mode", active: "Active", expired: "Expired", low: "Low", medium: "Medium", high: "High", hello: "Hello", complete: "Complete onboarding", activate: "Activate plan", renew: "Renew plan", simulate: "Simulate auto claim", increase: "Increase cover", adjust: "Adjust plan", shield: "Turn on Auto Shield", otpSent: "Demo OTP sent. Use code", otpOk: "OTP verified.", otpBad: "That OTP does not match the demo code.", location: "Location linked to your selected micro-zone.", finish: "Finish the current step before moving on.", setup: "Complete onboarding before activating the plan.", plan: "Plan activated. Coverage is now live.", cover: "Coverage and premium updated.", on: "Auto Shield Mode enabled.", off: "Auto Shield Mode disabled.", notice: "Notification preference updated.", demo: "Sample worker loaded for judge review.", claimStart: "Auto-claim simulation started.", claimPaid: "Payout completed and worker timeline updated." },
        hi: { preview: "???????? ???", active: "??????", expired: "??????", low: "??", medium: "?????", high: "????", hello: "??????", complete: "?????????? ???? ????", activate: "????? ?????? ????", renew: "????? ???????? ????", simulate: "??? ????? ?????", increase: "??? ??????", adjust: "????? ???????? ????", shield: "??? ????? ???? ????", otpSent: "???? OTP ???? ???? ?? ??? ????? ????", otpOk: "OTP ??????? ?? ????", otpBad: "?? OTP ???? ??? ?? ??? ???? ?????", location: "?????? ???? ???????-??? ?? ???? ?? ???", finish: "??? ????? ?? ???? ?? ????? ???? ?????", setup: "????? ?????? ???? ?? ???? ?????????? ???? ?????", plan: "????? ?????? ?? ????", cover: "????? ?? ???????? ????? ????", on: "??? ????? ??? ???? ????", off: "??? ????? ??? ??? ????", notice: "?????????? ?????????? ????? ????", demo: "?? ?????? ?? ??? ???? ????? ??? ?? ????", claimStart: "???-????? ?????????? ???? ????", claimPaid: "?????? ???? ??? ?? ???????? ????? ?? ???" }
    };
    const hiStatic = { heroTitle: "???? ???? ?? ???? ???? ?? ???????? ?????", heroSubtitle: "?????, ????? ?? ?????? ??? ?? ?? ?????? ?????", heroPrimary: "???? ????", heroSecondary: "???? ?????", onboardingTitle: "????? ???????? ?????", stepOneShort: "?????", stepTwoShort: "??????????", stepThreeShort: "??????", fieldName: "???", fieldPhone: "??? ????", sendOtp: "OTP ?????", fieldCity: "???", fieldEarnings: "??? ????? ????", previousStep: "????", nextStep: "???", navDashboard: "????????", navClaims: "?????", navAdmin: "?????", navSettings: "????????", footerCopy: "???? ?? ??? ??????? ????? ?? ??? ??? ??????????? ?????????? ??????" };
    const state = {
        lang: "en", step: 1, view: "dashboard", onboarded: false, otpSent: false, otpCode: "", otpOk: false, located: false,
        worker: { name: "Ravi Kumar", phone: "9876543210", platform: "Swiggy", city: "Bengaluru", zone: "Koramangala K-04", avg: 1100, coverage: 1200, trust: 82, hours: 34, zones: 8, days: 6, active: false },
        settings: { autoShield: true, payment: "UPI", notifications: { alerts: true, payouts: true, weeklySummary: true } },
        claim: { amount: 450, reason: "Heavy rain", status: "Paid", timeline: [] },
        admin: { workers: 12840, policies: 9640, claims: 431, fraud: 19, revenue: 768000, payouts: 498000, heatmap: [{ city: "Bengaluru", score: 72 }, { city: "Chennai", score: 84 }, { city: "Delhi", score: 78 }, { city: "Mumbai", score: 80 }], trend: [{ day: "Mon", value: 26 }, { day: "Tue", value: 42 }, { day: "Wed", value: 31 }, { day: "Thu", value: 55 }, { day: "Fri", value: 48 }, { day: "Sat", value: 36 }, { day: "Sun", value: 28 }] },
        ui: { timer: null, claimTimers: [] }
    };
    const t = (k) => copy[state.lang][k] || copy.en[k] || k;
    const money = (v) => new Intl.NumberFormat(state.lang === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
    const stamp = () => new Intl.DateTimeFormat(state.lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date());
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const round = (v, step) => Math.round(v / step) * step;
    const trustDiscount = (v) => v >= 86 ? 0.85 : v >= 71 ? 0.92 : v >= 51 ? 0.95 : v >= 31 ? 0.97 : 1;
    const coverMult = (v) => v <= 900 ? 1 : v <= 1500 ? 1.3 : 1.6;
    const riskBucket = (v) => v < 45 ? "low" : v < 70 ? "medium" : "high";
    const riskClass = (v) => ({ low: "risk-low", medium: "risk-medium", high: "risk-high" })[v];
    const activeStatus = () => state.worker.active ? { text: t("active"), className: "status-active" } : state.onboarded ? { text: t("expired"), className: "status-expired" } : { text: t("preview"), className: "status-soft" };
    const currentCity = () => cities[state.worker.city] || cities.Bengaluru;
    const firstName = () => state.worker.name.trim().split(" ")[0] || "Worker";
    const timeline = (mode) => mode === "processing" ? [{ label: "Trigger detected", icon: "cloud-rain", time: stamp(), state: "done" }, { label: "Claim auto-created", icon: "file-plus-2", time: stamp(), state: "pending" }, { label: "AI verified", icon: "brain-circuit", time: stamp(), state: "pending" }, { label: "Payout sent", icon: "badge-indian-rupee", time: stamp(), state: "pending" }] : mode === "approved" ? [{ label: "Trigger detected", icon: "cloud-rain", time: stamp(), state: "done" }, { label: "Claim auto-created", icon: "file-plus-2", time: stamp(), state: "done" }, { label: "AI verified", icon: "brain-circuit", time: stamp(), state: "done" }, { label: "Payout sent", icon: "badge-indian-rupee", time: stamp(), state: "pending" }] : [{ label: "Trigger detected", icon: "cloud-rain", time: "6:10 PM", state: "done" }, { label: "Claim auto-created", icon: "file-plus-2", time: "6:10 PM", state: "done" }, { label: "AI verified", icon: "brain-circuit", time: "6:11 PM", state: "done" }, { label: "Payout sent", icon: "badge-indian-rupee", time: "6:12 PM", state: "done" }];
    state.claim.timeline = timeline("paid");
    function profile() {
        const city = currentCity();
        const seasonal = city.rain > 1.15 ? 1.22 : city.aqi > 1.1 ? 1.18 : 1.05;
        const platform = { Swiggy: 1.05, Zomato: 1, Amazon: 0.92, Zepto: 1.08 }[state.worker.platform] || 1;
        const risk = clamp(Math.round(20 + city.zr * 18 + city.rain * 16 + city.heat * 11 + city.aqi * 14 + city.close * 10 + platform * 8 + (state.worker.avg / 150) * 1.2 + (state.located ? -4 : 4)), 28, 92);
        const bucket = riskBucket(risk);
        const suggested = clamp(round(state.worker.avg * (bucket === "high" ? 1.7 : bucket === "medium" ? 1.45 : 1.2), 100), 700, 2400);
        const premium = Math.round(28 * city.zr * seasonal * trustDiscount(state.worker.trust) * coverMult(state.worker.coverage));
        const used = Math.min(state.worker.coverage, state.claim.status === "Paid" ? state.claim.amount : Math.round(state.claim.amount * 0.5));
        return { city, risk, bucket, bucketLabel: t(bucket), bucketClass: riskClass(bucket), suggested, premium, used, progress: clamp(Math.round((used / state.worker.coverage) * 100), 0, 100), projected: Math.min(state.worker.coverage, round(state.worker.avg * (bucket === "high" ? 0.5 : bucket === "medium" ? 0.38 : 0.24), 50)) };
    }
    function alerts(p) {
        const level = (v) => v > 1.15 ? "high" : v > 0.84 ? "medium" : "low";
        return [
            { id: "rain", title: "Rain alert", icon: "cloud-rain", level: level(p.city.rain), impact: t(level(p.city.rain)), detail: `Rain bands expected in ${state.worker.zone} between 5 PM and 8 PM.`, loss: Math.min(state.worker.coverage, round(state.worker.avg * p.city.rain * 0.34, 50)) },
            { id: "heat", title: "Heatwave alert", icon: "sun-medium", level: level(p.city.heat), impact: t(level(p.city.heat)), detail: "Temperature is approaching the heat trigger window.", loss: Math.min(state.worker.coverage, round(state.worker.avg * p.city.heat * 0.29, 50)) },
            { id: "aqi", title: "AQI alert", icon: "wind", level: level(p.city.aqi), impact: t(level(p.city.aqi)), detail: "Air quality is being watched against payout thresholds.", loss: Math.min(state.worker.coverage, round(state.worker.avg * p.city.aqi * 0.32, 50)) },
            { id: "curfew", title: "Curfew watch", icon: "ban", level: level(p.city.close), impact: t(level(p.city.close)), detail: "Local closure feeds are checked for sudden restrictions.", loss: Math.min(state.worker.coverage, round(state.worker.avg * p.city.close * 0.4, 50)) }
        ];
    }
    function suggestions(p, live) {
        const list = [
            { title: `${live[0].title}: ${live[0].impact} impact`, body: `Expected loss is ${money(live[0].loss)}. Increase weekly protection for tomorrow's shift?`, action: "increase-coverage", label: t("increase"), target: Math.max(p.suggested, state.worker.coverage) },
            { title: "Work pattern changed this week", body: `You worked ${state.worker.hours} hours across ${state.worker.days} days. AI suggests aligning cover with actual activity.`, action: "optimize-plan", label: t("adjust"), target: p.suggested }
        ];
        if (!state.settings.autoShield) {
            list.push({ title: "High-risk days can auto-adjust cover", body: "Auto Shield can recommend more cover before rain or AQI spikes.", action: "toggle-autoshield", label: t("shield") });
        }
        return list;
    }
    function earningTwin(p) {
        const platformLift = { Swiggy: 1.08, Zomato: 1.02, Amazon: 0.9, Zepto: 1.12 }[state.worker.platform] || 1;
        const hours = [
            ["08:00", 0.22], ["10:00", 0.34], ["12:00", 0.82], ["14:00", 0.7],
            ["16:00", 0.58], ["18:00", 0.95], ["20:00", 1.08], ["22:00", 0.64]
        ];
        return hours.map(([slot, weight]) => ({
            slot,
            earnings: round((state.worker.avg / 4.2) * weight * platformLift, 10),
            intensity: Math.max(20, Math.round(weight * 100))
        }));
    }
    function disruptionForecast(p) {
        return [
            { window: "Tonight", signal: "Rain + order slowdown", probability: clamp(Math.round(p.city.rain * 44 + p.risk * 0.35), 28, 93), action: "Pre-activate rain cover" },
            { window: "Tomorrow lunch", signal: "Heat stress", probability: clamp(Math.round(p.city.heat * 38 + p.risk * 0.24), 18, 88), action: "Shift toward shorter windows" },
            { window: "Tomorrow evening", signal: "AQI + congestion", probability: clamp(Math.round(p.city.aqi * 32 + p.risk * 0.22), 16, 86), action: "Keep coverage near dinner peak" }
        ];
    }
    function mlSignals(p) {
        const twinAccuracy = clamp(Math.round(88 + state.worker.trust / 10 - state.worker.zones / 8), 82, 97);
        const triggerConfidence = clamp(Math.round(74 + p.city.rain * 10 + p.city.aqi * 6), 76, 96);
        const anomalyRisk = clamp(Math.round(46 - state.worker.trust / 4 - state.worker.days * 2 + state.worker.zones), 6, 44);
        const zoneCluster = p.city.rain > 1.2 ? "High-rain cluster" : p.city.aqi > 1 ? "AQI-heavy cluster" : "Mixed urban cluster";
        return { twinAccuracy, triggerConfidence, anomalyRisk, zoneCluster };
    }
    function validate(step) {
        return step === 1 ? state.worker.name.trim().length >= 2 && /^\d{10}$/.test(state.worker.phone) && state.otpOk : step === 2 ? !!state.worker.platform : !!state.worker.city && state.worker.avg >= 500;
    }
    function flash(text) {
        refs.toast.textContent = text;
        refs.toast.classList.add("is-visible");
        clearTimeout(state.ui.timer);
        state.ui.timer = setTimeout(() => refs.toast.classList.remove("is-visible"), 2600);
    }
    function applyStatic() {
        document.documentElement.lang = state.lang === "hi" ? "hi" : "en";
        document.querySelectorAll("[data-i18n]").forEach((node) => {
            node.textContent = state.lang === "hi" && hiStatic[node.dataset.i18n]
                ? hiStatic[node.dataset.i18n]
                : defaultText[node.dataset.i18n];
        });
    }
    function renderDashboard(p, live, ai) {
        const st = activeStatus();
        const twin = earningTwin(p);
        const forecast = disruptionForecast(p);
        const signals = mlSignals(p);
        refs.dashboard.innerHTML = `<div class="app-screen"><article class="dashboard-hero"><div class="section-row"><div><span class="panel-label">${t("hello")} ${firstName()}</span><h4>${state.worker.platform} partner in ${state.worker.city}</h4></div><div class="status-cluster"><span class="status-pill ${st.className}">${st.text}</span><span class="status-pill ${p.bucketClass}">${p.bucketLabel}</span></div></div><p>${state.worker.zone} · Income protection only</p></article><article class="data-card"><div class="section-row"><div><h4>Earnings protection</h4><p>Protected this week</p></div><span class="tag">${money(state.worker.coverage)} coverage limit</span></div><strong>${money(state.worker.coverage)}</strong><p>${money(p.used)} used this week</p><div class="progress-bar"><span style="width:${p.progress}%"></span></div><div class="bar-labels"><span>Coverage progress</span><span>${p.progress}%</span></div></article><article class="data-card"><div class="section-row"><div><h4>Weekly plan</h4><p>Adjust cover and premium instantly.</p></div><button class="action-chip" type="button" data-action="activate-plan">${state.worker.active ? t("renew") : t("activate")}</button></div><div class="dual-stat-grid"><div class="mini-stat"><span>Weekly premium</span><strong>${money(p.premium)}</strong><small>Auto-priced from risk</small></div><div class="mini-stat"><span>Coverage amount</span><strong>${money(state.worker.coverage)}</strong><small>Flexible every week</small></div></div><div class="slider-stack"><input id="coverageRange" type="range" min="500" max="2500" step="100" value="${state.worker.coverage}"><div class="bar-labels"><span>${money(500)}</span><span>${money(state.worker.coverage)}</span><span>${money(2500)}</span></div></div></article><article class="data-card"><div class="section-row"><div><h4>Digital Earning Twin</h4><p>Personalized hourly earning forecast for payout precision.</p></div><span class="tag">${signals.twinAccuracy}% accuracy</span></div><div class="twin-grid">${twin.map((slot) => `<div class="twin-cell"><span>${slot.slot}</span><strong>${money(slot.earnings)}</strong><div class="mini-progress"><span style="width:${slot.intensity}%"></span></div></div>`).join("")}</div><p>AI predicts dinner hours are the highest-income window, so rain and curfew payouts are weighted toward those slots.</p></article><article class="data-card"><div class="section-row"><div><h4>48h disruption forecaster</h4><p>Proactive Shield predicts zone disruption probability before it happens.</p></div><span class="tag">${signals.zoneCluster}</span></div><div class="forecast-grid">${forecast.map((item) => `<div class="forecast-card"><div class="section-row"><strong>${item.window}</strong><span class="impact-pill">${item.probability}%</span></div><p>${item.signal}</p><div class="mini-progress"><span style="width:${item.probability}%"></span></div><small>${item.action}</small></div>`).join("")}</div></article><article class="data-card"><div class="section-row"><div><h4>Live disruption alerts</h4><p>Real-time parametric triggers for this zone.</p></div><button class="action-chip" type="button" data-action="simulate-claim" data-trigger="rain">${t("simulate")}</button></div><div class="alerts-grid">${live.map((x) => `<div class="alert-card ${x.level}"><div class="section-row"><div class="topline"><i data-lucide="${x.icon}"></i><div><h4>${x.title}</h4><p>${x.detail}</p></div></div><span class="impact-pill">${x.impact}</span></div><p>Expected income loss ${money(x.loss)}</p></div>`).join("")}</div></article><article class="timeline-card"><div class="section-row"><div><h4>Auto claims</h4><p>Last claim: ${money(state.claim.amount)} ${state.claim.status.toLowerCase()}</p></div><span class="status-pill ${state.claim.status === "Paid" ? "status-active" : state.claim.status === "Approved" ? "risk-medium" : "status-soft"}">${state.claim.status}</span></div><div class="timeline-stack">${state.claim.timeline.map((x) => `<div class="timeline-item ${x.state}"><i data-lucide="${x.icon}"></i><div><strong>${x.label}</strong><span>${x.time}</span></div></div>`).join("")}</div></article><article class="data-card"><div class="section-row"><div><h4>AI assistant</h4><p>Simple nudges to keep weekly cover aligned to risk.</p></div></div><div class="assistant-grid">${ai.map((x) => `<div class="assistant-card"><h4>${x.title}</h4><p>${x.body}</p><div class="suggestion-actions"><button class="insight-action" type="button" data-action="${x.action}" ${x.target ? `data-target="${x.target}"` : ""}>${x.label}</button></div></div>`).join("")}</div></article><article class="data-card"><div class="section-row"><div><h4>Activity tracker</h4><p>Used for insights and fraud checks.</p></div></div><div class="activity-grid"><div class="mini-stat"><span>Hours worked</span><strong>${state.worker.hours}</strong><small>This week</small></div><div class="mini-stat"><span>Zones visited</span><strong>${state.worker.zones}</strong><small>GPS matched</small></div><div class="mini-stat"><span>Active days</span><strong>${state.worker.days}</strong><small>Delivery activity verified</small></div><div class="mini-stat"><span>Trust score</span><strong>${state.worker.trust}</strong><small>${signals.anomalyRisk}% anomaly risk</small></div></div></article></div>`;
    }
    function renderClaims(p, live) {
        const twin = earningTwin(p);
        const signals = mlSignals(p);
        refs.claims.innerHTML = `<div class="app-screen"><div class="claims-grid"><article class="trigger-card"><div class="section-row"><div><h4>Transparent claim engine</h4><p>Trigger conditions</p></div><button class="primary-button" type="button" data-action="simulate-claim" data-trigger="rain">${t("simulate")}</button></div><div class="trigger-list"><div class="trigger-item"><i data-lucide="cloud-rain"></i><div><strong>Rain</strong><span>Rain > 50 mm/hr for 30 minutes</span></div></div><div class="trigger-item"><i data-lucide="sun-medium"></i><div><strong>Heat</strong><span>Temperature > 45°C during working window</span></div></div><div class="trigger-item"><i data-lucide="wind"></i><div><strong>AQI</strong><span>AQI > 300 on consecutive readings</span></div></div><div class="trigger-item"><i data-lucide="ban"></i><div><strong>Curfew</strong><span>Verified restriction affecting the zone</span></div></div></div><p>Auto claim triggered due to ${state.claim.reason}. No manual request needed.</p></article><article class="timeline-card"><div class="section-row"><div><h4>Payout system</h4><p>${money(state.claim.amount)} credited in 5 seconds</p></div><span class="status-pill ${state.claim.status === "Paid" ? "status-active" : state.claim.status === "Approved" ? "risk-medium" : "status-soft"}">${state.claim.status}</span></div><div class="payout-highlight"><strong>${money(state.claim.amount)}</strong><span>Payout method: ${state.settings.payment}</span></div><div class="timeline-stack">${state.claim.timeline.map((x) => `<div class="timeline-item ${x.state}"><i data-lucide="${x.icon}"></i><div><strong>${x.label}</strong><span>${x.time}</span></div></div>`).join("")}</div></article></div><div class="risk-grid"><article class="chart-card"><div class="section-row"><div><h4>AI + risk engine</h4><p>Risk calculated using weather + area history.</p></div></div><div class="metric-grid"><div class="metric-pill"><span>Location</span><strong>${Math.round(p.city.zr * 25)}</strong><small>Weighted in pricing</small></div><div class="metric-pill"><span>Weather trend</span><strong>${Math.round(p.city.rain * 24)}</strong><small>Weighted in pricing</small></div><div class="metric-pill"><span>Past disruptions</span><strong>${Math.round(p.city.aqi * 24)}</strong><small>Weighted in pricing</small></div><div class="metric-pill"><span>Daily earnings</span><strong>${Math.round(state.worker.avg / 50)}</strong><small>Weighted in pricing</small></div></div><p>Current premium is ${money(p.premium)} for ${money(state.worker.coverage)} of weekly income cover.</p></article><article class="settings-card"><div class="section-row"><div><h4>ML verification stack</h4><p>Why the model trusts this claim.</p></div><span class="status-pill risk-low">${signals.anomalyRisk}% anomaly risk</span></div><div class="metric-grid"><div class="metric-pill"><span>Earning Twin confidence</span><strong>${signals.twinAccuracy}%</strong><small>Based on repeated hourly fit</small></div><div class="metric-pill"><span>Trigger confidence</span><strong>${signals.triggerConfidence}%</strong><small>Cross-source weather + zone signals</small></div><div class="metric-pill"><span>Zone cluster</span><strong>${signals.zoneCluster}</strong><small>Spatial risk grouping</small></div><div class="metric-pill"><span>Expected loss window</span><strong>${money(twin[5].earnings + twin[6].earnings)}</strong><small>Dinner rush loss estimate</small></div></div></article></div><div class="risk-grid"><article class="settings-card"><div class="section-row"><div><h4>Fraud detection</h4><p>Fraud risk: Low</p></div><span class="status-pill risk-low">${t("low")}</span></div><div class="fraud-list"><div class="fraud-item success"><i data-lucide="map-pinned"></i><div><strong>GPS match</strong><span>Worker zone and trigger zone are aligned.</span></div></div><div class="fraud-item success"><i data-lucide="copy-check"></i><div><strong>Duplicate check</strong><span>No overlapping claim found for this worker.</span></div></div><div class="fraud-item success"><i data-lucide="clock-3"></i><div><strong>Activity validation</strong><span>Hours worked and active days match expected behavior.</span></div></div></div></article><article class="chart-card"><div class="section-row"><div><h4>Current alert stack</h4><p>Visible explanation of what the worker is being monitored for.</p></div></div><div class="alerts-grid">${live.map((x) => `<div class="alert-card ${x.level}"><div class="section-row"><div class="topline"><i data-lucide="${x.icon}"></i><div><h4>${x.title}</h4><p>${x.detail}</p></div></div><span class="impact-pill">${x.impact}</span></div><p>Expected loss ${money(x.loss)}</p></div>`).join("")}</div></article></div></div>`;
    }
    function renderAdmin(p) {
        const peak = Math.max(...state.admin.trend.map((x) => x.value));
        const maxMoney = Math.max(state.admin.revenue, state.admin.payouts);
        const signals = mlSignals(p);
        refs.admin.innerHTML = `<div class="app-screen"><div class="admin-metrics">${[{ label: "Total workers", value: state.admin.workers + (state.onboarded ? 1 : 0) }, { label: "Active policies", value: state.admin.policies + (state.worker.active ? 1 : 0) }, { label: "Claims triggered", value: state.admin.claims + (state.claim.status ? 1 : 0) }, { label: "Fraud cases", value: state.admin.fraud }].map((x) => `<div class="metric-pill"><span>${x.label}</span><strong>${x.value.toLocaleString(state.lang === "hi" ? "hi-IN" : "en-IN")}</strong><small>Live demo metric</small></div>`).join("")}</div><article class="chart-card"><div class="section-row"><div><h4>Model monitor</h4><p>Visible AI metrics for judges and underwriting teams.</p></div></div><div class="metric-grid"><div class="metric-pill"><span>DET accuracy</span><strong>${signals.twinAccuracy}%</strong><small>Hourly earning twin fit</small></div><div class="metric-pill"><span>Forecast confidence</span><strong>${signals.triggerConfidence}%</strong><small>Disruption ensemble certainty</small></div><div class="metric-pill"><span>Anomaly score</span><strong>${signals.anomalyRisk}%</strong><small>Lower is safer</small></div><div class="metric-pill"><span>Active zone cluster</span><strong>${signals.zoneCluster}</strong><small>Spatial risk segment</small></div></div></article><article class="chart-card"><div class="section-row"><div><h4>Risk heatmap</h4><p>City-wise disruption intensity.</p></div></div><div class="heatmap-grid">${state.admin.heatmap.map((x) => `<div class="heatmap-item"><span>${x.city}</span><div class="heatmap-bar"><span style="width:${x.score}%"></span></div><strong>${x.score}</strong></div>`).join("")}</div></article><article class="chart-card"><div class="section-row"><div><h4>Claims over time</h4><p>Claims pattern for the current week.</p></div></div><div class="chart-bars">${state.admin.trend.map((x) => `<div class="chart-bar"><span style="height:${Math.max(24, Math.round((x.value / peak) * 130))}px"></span><small>${x.day}</small></div>`).join("")}</div></article><article class="chart-card"><div class="section-row"><div><h4>Weekly revenue vs payouts</h4><p>Portfolio health for the demo pool.</p></div></div><div class="comparison-stack"><div class="compare-row"><div class="bar-labels"><span>Revenue</span><span>${money(state.admin.revenue)}</span></div><div class="progress-bar"><span class="revenue" style="width:${Math.round((state.admin.revenue / maxMoney) * 100)}%"></span></div></div><div class="compare-row"><div class="bar-labels"><span>Payouts</span><span>${money(state.admin.payouts)}</span></div><div class="progress-bar"><span class="payouts" style="width:${Math.round((state.admin.payouts / maxMoney) * 100)}%"></span></div></div></div></article><article class="chart-card"><div class="section-row"><div><h4>Predictions</h4><p>Forward-looking claim planning.</p></div></div><div class="prediction-stack"><div class="prediction-item"><i data-lucide="cloud-lightning"></i><div><strong>${p.city.forecast}</strong><span>Expected claim volume could rise if the pattern continues.</span></div></div><div class="prediction-item"><i data-lucide="wallet"></i><div><strong>Reserve recommendation</strong><span>Keep at least ${money(Math.round(state.admin.payouts * 1.15))} available for instant payouts.</span></div></div></div></article></div>`;
    }
    function renderSettings(p) {
        refs.settings.innerHTML = `<div class="app-screen"><article class="settings-card"><div class="section-row"><div><h4>Settings</h4><p>Income protection only</p></div></div><div class="lang-switch"><button class="lang-button ${state.lang === "en" ? "is-active" : ""}" type="button" data-action="set-language" data-lang="en">English</button><button class="lang-button ${state.lang === "hi" ? "is-active" : ""}" type="button" data-action="set-language" data-lang="hi">?????</button></div></article><div class="settings-grid"><article class="settings-card"><div class="section-row"><div><h4>Auto Shield Mode</h4><p>AI can suggest more cover before high-risk days.</p></div><button class="switch ${state.settings.autoShield ? "is-on" : ""}" type="button" data-action="toggle-autoshield" aria-pressed="${state.settings.autoShield}"></button></div></article><article class="settings-card"><div class="section-row"><div><h4>Payment methods</h4><p>Simulated payout method for the demo.</p></div></div><div class="method-grid">${["UPI", "Wallet", "Bank"].map((x) => `<button class="payment-chip ${state.settings.payment === x ? "is-active" : ""}" type="button" data-action="set-payment" data-method="${x}"><i data-lucide="${x === "UPI" ? "smartphone" : x === "Wallet" ? "wallet" : "landmark"}"></i><span>${x}</span></button>`).join("")}</div></article></div><article class="settings-card"><div class="section-row"><div><h4>Notifications</h4><p>Choose what the worker sees on the phone.</p></div></div><div class="toggle-stack">${[["alerts", "Alerts", "Rain, heat, AQI, and curfew updates."], ["payouts", "Payouts", "Claim creation, approval, and payout status."], ["weeklySummary", "Weekly summary", "Weekly cover review and earnings insights."]].map(([k, ttl, body]) => `<div class="setting-row"><div><strong>${ttl}</strong><span>${body}</span></div><button class="switch ${state.settings.notifications[k] ? "is-on" : ""}" type="button" data-action="toggle-notification" data-setting="${k}" aria-pressed="${state.settings.notifications[k]}"></button></div>`).join("")}</div></article><article class="settings-card"><div class="section-row"><div><h4>Worker profile</h4><p>Current worker summary</p></div></div><div class="metric-grid"><div class="metric-pill"><span>Worker</span><strong>${state.worker.name}</strong><small>${state.worker.platform} · ${state.worker.city}</small></div><div class="metric-pill"><span>Average earnings</span><strong>${money(state.worker.avg)}</strong><small>Per day</small></div><div class="metric-pill"><span>Current cover</span><strong>${money(state.worker.coverage)}</strong><small>${money(p.premium)} premium</small></div><div class="metric-pill"><span>Preferred payout</span><strong>${state.settings.payment}</strong><small>Simulated instant transfer</small></div></div></article></div>`;
    }
    function renderOnboarding(p) {
        const live = alerts(p);
        const ai = suggestions(p, live);
        applyStatic();
        stepPanes.forEach((pane) => pane.classList.toggle("is-active", Number(pane.dataset.step) === state.step));
        stepPills.forEach((pill) => pill.classList.toggle("is-active", Number(pill.dataset.stepTarget) === state.step));
        refs.status.textContent = state.onboarded ? t("complete") : `Step ${state.step} of 3`;
        refs.prev.disabled = state.step === 1;
        refs.prev.style.opacity = state.step === 1 ? "0.5" : "1";
        refs.next.textContent = state.step === 3 ? t("complete") : (state.lang === "hi" ? "???" : "Next");
        refs.otpHelp.textContent = state.otpOk ? t("otpOk") : state.otpSent ? `${t("otpSent")} ${state.otpCode}` : (state.lang === "hi" ? "???? ??? ????? ?? ??? OTP ??????" : "Tap Send OTP to generate a demo code for this prototype.");
        refs.locationHelp.textContent = state.located ? t("location") : (state.lang === "hi" ? "?????? ?????? ?? ?????? ?? ????? ??? ????? ???? ????" : "Location access improves trigger accuracy and fraud checks.");
        refs.riskBadge.className = `status-pill ${p.bucketClass}`;
        refs.riskBadge.textContent = `${p.bucketLabel} risk`;
        refs.recs.innerHTML = `<div class="metric-pill"><span>Risk score</span><strong>${p.risk}/100</strong><small>${p.bucketLabel} risk for this zone</small></div><div class="metric-pill"><span>Weekly premium</span><strong>${money(p.premium)}</strong><small>Dynamic micro-pricing</small></div><div class="metric-pill"><span>Suggested cover</span><strong>${money(p.suggested)}</strong><small>Based on average daily earnings</small></div><div class="metric-pill"><span>Projected payout</span><strong>${money(p.projected)}</strong><small>Estimated income loss if triggered</small></div>`;
        refs.riskText.textContent = `Risk calculated using weather + area history. ${state.worker.city} ${state.worker.zone} currently maps to ${p.bucketLabel.toLowerCase()} weekly pricing.`;
        renderDashboard(p, live, ai);
        renderClaims(p, live);
        renderAdmin(p);
        renderSettings(p);
        const st = activeStatus();
        refs.deviceStatus.className = `status-pill ${st.className}`;
        refs.deviceStatus.textContent = st.text;
        refs.deviceTitle.textContent = { dashboard: state.lang === "hi" ? "????????" : "Dashboard", claims: state.lang === "hi" ? "?????" : "Claims", admin: state.lang === "hi" ? "?????" : "Admin", settings: state.lang === "hi" ? "????????" : "Settings" }[state.view];
        refs.banner.textContent = state.worker.active ? `${state.worker.name} is protected this week. ${state.settings.autoShield ? "Auto Shield is on." : "Manual plan adjustments only."}` : "Preview updates as you change the profile.";
        refs.heroProtected.textContent = money(state.worker.coverage);
        refs.heroPayout.textContent = money(state.claim.amount);
        Object.entries(views).forEach(([k, node]) => node.classList.toggle("is-active", k === state.view));
        nav.forEach((button) => button.classList.toggle("is-active", button.dataset.view === state.view));
        document.querySelectorAll(".choice-chip").forEach((chip) => { const input = chip.querySelector("input"); chip.classList.toggle("is-selected", !!input?.checked); });
        window.lucide?.createIcons();
    }
    function render() {
        renderOnboarding(profile());
    }
    function complete() {
        if (!validate(1) || !validate(2) || !validate(3)) {
            state.step = !validate(1) ? 1 : !validate(2) ? 2 : 3;
            flash(t("setup"));
            render();
            return;
        }
        state.onboarded = true;
        state.worker.active = true;
        state.view = "dashboard";
        flash(t("plan"));
        render();
    }
    function clearClaimTimers() {
        state.ui.claimTimers.forEach(clearTimeout);
        state.ui.claimTimers = [];
    }
    function simulateClaim(trigger) {
        clearClaimTimers();
        const hit = alerts(profile()).find((x) => x.id === trigger) || alerts(profile())[0];
        state.claim.reason = hit.title;
        state.claim.amount = hit.loss;
        state.claim.status = "Processing";
        state.claim.timeline = timeline("processing");
        state.admin.claims += 1;
        flash(t("claimStart"));
        render();
        state.ui.claimTimers.push(setTimeout(() => {
            state.claim.timeline = [{ label: "Trigger detected", icon: "cloud-rain", time: stamp(), state: "done" }, { label: "Claim auto-created", icon: "file-plus-2", time: stamp(), state: "done" }, { label: "AI verified", icon: "brain-circuit", time: stamp(), state: "pending" }, { label: "Payout sent", icon: "badge-indian-rupee", time: stamp(), state: "pending" }];
            render();
        }, 1000));
        state.ui.claimTimers.push(setTimeout(() => {
            state.claim.status = "Approved";
            state.claim.timeline = timeline("approved");
            render();
        }, 2200));
        state.ui.claimTimers.push(setTimeout(() => {
            state.claim.status = "Paid";
            state.claim.timeline = timeline("paid");
            state.admin.payouts += state.claim.amount;
            state.worker.active = true;
            flash(t("claimPaid"));
            render();
        }, 3600));
    }
    function loadDemo() {
        state.worker = { name: "Ravi Kumar", phone: "9876543210", platform: "Swiggy", city: "Bengaluru", zone: "Koramangala K-04", avg: 1200, coverage: 1400, trust: 84, hours: 37, zones: 9, days: 6, active: true };
        state.step = 3;
        state.onboarded = true;
        state.otpSent = true;
        state.otpCode = "4821";
        state.otpOk = true;
        state.located = true;
        state.view = "dashboard";
        refs.name.value = state.worker.name;
        refs.phone.value = state.worker.phone;
        refs.otp.value = state.otpCode;
        refs.city.value = state.worker.city;
        refs.zone.value = state.worker.zone;
        refs.earnRange.value = String(state.worker.avg);
        refs.earnInput.value = String(state.worker.avg);
        platformInputs.forEach((input) => { input.checked = input.value === state.worker.platform; });
        render();
        flash(t("demo"));
        document.getElementById("appSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function handleAction(node) {
        const { action, target, lang, method, setting, trigger } = node.dataset;
        if (action === "activate-plan") complete();
        else if (action === "simulate-claim") simulateClaim(trigger || "rain");
        else if (action === "increase-coverage") { state.worker.coverage = clamp(Number(target) || profile().suggested, 500, 2500); flash(t("cover")); render(); }
        else if (action === "optimize-plan") { state.worker.coverage = profile().suggested; flash(t("cover")); render(); }
        else if (action === "toggle-autoshield") { state.settings.autoShield = !state.settings.autoShield; flash(state.settings.autoShield ? t("on") : t("off")); render(); }
        else if (action === "set-language") { state.lang = lang || "en"; render(); }
        else if (action === "set-payment") { state.settings.payment = method || "UPI"; render(); }
        else if (action === "toggle-notification") { state.settings.notifications[setting] = !state.settings.notifications[setting]; flash(t("notice")); render(); }
    }
    document.addEventListener("click", (event) => {
        const scroll = event.target.closest("[data-scroll-target]");
        if (scroll) document.getElementById(scroll.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
        const action = event.target.closest("[data-action]");
        if (action) handleAction(action);
    });
    refs.loadDemo.addEventListener("click", loadDemo);
    refs.sendOtp.addEventListener("click", () => { state.otpCode = String(Math.floor(1000 + Math.random() * 9000)); state.otpSent = true; state.otpOk = false; refs.otp.value = ""; render(); });
    refs.verifyOtp.addEventListener("click", () => { state.otpOk = !!state.otpCode && refs.otp.value.trim() === state.otpCode; flash(state.otpOk ? t("otpOk") : t("otpBad")); render(); });
    refs.prev.addEventListener("click", () => { if (state.step > 1) { state.step -= 1; render(); } });
    refs.next.addEventListener("click", () => { if (state.step === 3) complete(); else if (!validate(state.step)) flash(t("finish")); else { state.step += 1; render(); } });
    stepPills.forEach((pill) => pill.addEventListener("click", () => { const target = Number(pill.dataset.stepTarget); if (target > state.step && !validate(state.step)) { flash(t("finish")); return; } state.step = target; render(); }));
    refs.name.addEventListener("input", (e) => { state.worker.name = e.target.value; render(); });
    refs.phone.addEventListener("input", (e) => { const digits = e.target.value.replace(/\D/g, "").slice(0, 10); e.target.value = digits; state.worker.phone = digits; render(); });
    platformInputs.forEach((input) => input.addEventListener("change", (e) => { if (e.target.checked) { state.worker.platform = e.target.value; render(); } }));
    refs.city.addEventListener("change", (e) => { state.worker.city = e.target.value; state.worker.zone = currentCity().zone; refs.zone.value = state.worker.zone; render(); });
    refs.location.addEventListener("click", () => { state.located = true; state.worker.zone = currentCity().zone; refs.zone.value = state.worker.zone; flash(t("location")); render(); });
    const syncEarnings = (value) => { state.worker.avg = clamp(Number(value) || 500, 500, 2500); if (state.settings.autoShield && !state.onboarded) state.worker.coverage = profile().suggested; refs.earnRange.value = String(state.worker.avg); refs.earnInput.value = String(state.worker.avg); render(); };
    refs.earnRange.addEventListener("input", (e) => syncEarnings(e.target.value));
    refs.earnInput.addEventListener("input", (e) => syncEarnings(e.target.value));
    document.addEventListener("input", (event) => { if (event.target.id === "coverageRange") { state.worker.coverage = Number(event.target.value); render(); } });
    nav.forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
    render();
});

