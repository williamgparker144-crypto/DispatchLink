import React, { useEffect, useRef, useCallback } from 'react';

const Dispatch101Page: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject scoped styles into document head
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-d101-styles', 'true');
    style.textContent = D101_STYLES;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Scroll-reveal IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('d101-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const revealEls = container.querySelectorAll('.d101-reveal');
    revealEls.forEach((el) => observer.observe(el));

    return () => {
      revealEls.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  // Equipment bar animation IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fill = entry.target.querySelector('.d101-equip-bar-fill') as HTMLElement | null;
            if (fill) {
              const w = fill.style.width;
              fill.style.width = '0%';
              setTimeout(() => {
                fill.style.width = w;
              }, 200);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const equipCards = container.querySelectorAll('.d101-equip-card');
    equipCards.forEach((el) => barObserver.observe(el));

    return () => {
      equipCards.forEach((el) => barObserver.unobserve(el));
      barObserver.disconnect();
    };
  }, []);

  const handleCtaClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onNavigate('home');
    },
    [onNavigate]
  );

  return (
    <div className="d101-page" ref={containerRef}>
      {/* Background elements scoped inside component */}
      <div className="d101-bg-dots"></div>
      <div className="d101-floating-leaf" style={{ top: '10%', animationDelay: '0s' }}>🍃</div>
      <div className="d101-floating-leaf" style={{ top: '35%', animationDelay: '7s' }}>🌿</div>
      <div className="d101-floating-leaf" style={{ top: '60%', animationDelay: '14s' }}>🍃</div>
      <div className="d101-floating-leaf" style={{ top: '80%', animationDelay: '20s' }}>🌱</div>

      {/* HERO */}
      <section className="d101-hero">
        <div className="d101-hero-content">
          <div className="d101-hero-badge">TechSpatch Logistics Academy</div>
          <h1><span className="d101-yellow">DISPATCH</span> <span className="d101-green">101</span></h1>
          <p className="d101-hero-sub">Master Freight Dispatching Operations — The Comprehensive Workflow Guide by <strong>TechSpatch Logistics Management LLC</strong></p>
          <div className="d101-hero-stats">
            <div className="d101-hero-stat"><span className="d101-num d101-yellow">$2.75+</span><span className="d101-label">Target Rate / Mile</span></div>
            <div className="d101-hero-stat"><span className="d101-num d101-green">2,500</span><span className="d101-label">Weekly Miles Target</span></div>
            <div className="d101-hero-stat"><span className="d101-num d101-peach">15-30%</span><span className="d101-label">Profit Margin</span></div>
          </div>
        </div>
        <div className="d101-scroll-indicator"><span></span></div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 01 — ECONOMICS */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 01</div>
          <h2 className="d101-section-title">The Economic Architecture</h2>
          <p className="d101-section-subtitle">A master dispatcher operates as a financial analyst. Every truck is an independent business unit requiring meticulous management.</p>
        </div>
        <div className="d101-metrics-grid">
          <div className="d101-metric-card d101-yellow d101-reveal">
            <div className="d101-metric-icon d101-yellow">💰</div>
            <div className="d101-metric-label">Operating Cost</div>
            <div className="d101-metric-value d101-yellow">$1.24 – $1.82</div>
            <div className="d101-metric-desc">Per mile excluding driver pay — the absolute floor for business solvency</div>
          </div>
          <div className="d101-metric-card d101-green d101-reveal">
            <div className="d101-metric-icon d101-green">📊</div>
            <div className="d101-metric-label">Break-Even Target</div>
            <div className="d101-metric-value d101-green">$2.00 – $2.30</div>
            <div className="d101-metric-desc">Per mile including realistic driver wage of $0.50–$0.80 CPM</div>
          </div>
          <div className="d101-metric-card d101-peach d101-reveal">
            <div className="d101-metric-icon d101-peach">🎯</div>
            <div className="d101-metric-label">Ideal Loaded Rate</div>
            <div className="d101-metric-value d101-peach">$2.75+</div>
            <div className="d101-metric-desc">Per mile — accommodates 10%–15% deadhead miles</div>
          </div>
          <div className="d101-metric-card d101-sky d101-reveal">
            <div className="d101-metric-icon d101-sky">📈</div>
            <div className="d101-metric-label">Annual Gross Target</div>
            <div className="d101-metric-value d101-sky">$287,500+</div>
            <div className="d101-metric-desc">Based on $2.30 CPM × 2,500 mi/week × 50 weeks</div>
          </div>
        </div>
        <div className="d101-formula-box d101-reveal">
          <div className="d101-formula">G = <span>R</span><sub>rate</sub> × <span>M</span><sub>miles</sub> × <span>W</span><sub>weeks</sub></div>
          <div className="d101-formula-legend">
            <div><strong>G</strong> Annual Gross Revenue</div>
            <div><strong>R</strong> Avg Rate/Mile ($2.75+)</div>
            <div><strong>M</strong> Weekly Miles (2,500)</div>
            <div><strong>W</strong> Work Weeks (50)</div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 02 — EQUIPMENT */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 02</div>
          <h2 className="d101-section-title">Equipment Revenue Guide</h2>
          <p className="d101-section-subtitle">Different trailer types command varying rates based on cargo complexity and physical labor required.</p>
        </div>
        <div className="d101-equip-grid">
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">📦</span>
            <div className="d101-equip-name">Dry Van</div>
            <div className="d101-equip-specs">53 ft · Up to 45,000 lbs</div>
            <div className="d101-equip-earnings">$10K – $14K/mo</div>
            <div className="d101-equip-desc">High volume, versatile, beginner-friendly. Most common trailer on the road.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '55%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">❄️</span>
            <div className="d101-equip-name">Reefer</div>
            <div className="d101-equip-specs">53 ft · Up to 44,000 lbs</div>
            <div className="d101-equip-earnings">$11.2K – $15.2K/mo</div>
            <div className="d101-equip-desc">High rates, strict temperature compliance. Produce, meat, pharma freight.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '62%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">🔩</span>
            <div className="d101-equip-name">Flatbed</div>
            <div className="d101-equip-specs">48 ft · Up to 48,000 lbs</div>
            <div className="d101-equip-earnings">$12K – $16.8K/mo</div>
            <div className="d101-equip-desc">Requires straps/chains/tarps. Steel, lumber, machinery loads.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '72%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">🏗️</span>
            <div className="d101-equip-name">Step Deck</div>
            <div className="d101-equip-specs">48–53 ft · Up to 48,000 lbs</div>
            <div className="d101-equip-earnings">$13.2K – $18K/mo</div>
            <div className="d101-equip-desc">Oversized loads with extra height clearance. Premium freight.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '80%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">🔥</span>
            <div className="d101-equip-name">Hot Shot</div>
            <div className="d101-equip-specs">40 ft gooseneck · Up to 16,500 lbs</div>
            <div className="d101-equip-earnings">$8K – $14K/mo</div>
            <div className="d101-equip-desc">Class 3–5 trucks with gooseneck trailers. Time-critical, LTL, and oilfield freight. Low overhead startup.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '52%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">🚛</span>
            <div className="d101-equip-name">Box Truck</div>
            <div className="d101-equip-specs">16–26 ft · 6,000–10,000 lbs</div>
            <div className="d101-equip-earnings">$6K – $12K/mo</div>
            <div className="d101-equip-desc">Last-mile delivery, furniture, appliances, and local/regional routes. No CDL needed under 26,001 lbs GVWR.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '42%' }}></div></div>
          </div>
          <div className="d101-equip-card d101-reveal">
            <span className="d101-equip-emoji">🚐</span>
            <div className="d101-equip-name">Sprinter Van</div>
            <div className="d101-equip-specs">12–14 ft cargo · 2,500–5,000 lbs</div>
            <div className="d101-equip-earnings">$4K – $9K/mo</div>
            <div className="d101-equip-desc">Expedited, medical, and high-value small freight. Lowest entry cost — no CDL required.</div>
            <div className="d101-equip-bar"><div className="d101-equip-bar-fill" style={{ width: '30%' }}></div></div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 03 — CORE VALUES */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 03</div>
          <h2 className="d101-section-title">The 4 Pillars of Master Dispatching</h2>
          <p className="d101-section-subtitle">Professional standards rooted in real-world CDL experience — leadership by CEO William Parker of TechSpatch.</p>
        </div>
        <div className="d101-values-grid">
          <div className="d101-value-card d101-reveal">
            <div className="d101-value-num">01</div>
            <div className="d101-value-title">🛡️ Driver-First Mindset</div>
            <div className="d101-value-desc">Treat every truck as if it were your own. Prioritize the driver's time, safety, and earnings above all else.</div>
          </div>
          <div className="d101-value-card d101-reveal">
            <div className="d101-value-num">02</div>
            <div className="d101-value-title">📡 Continuous Communication</div>
            <div className="d101-value-desc">Eliminate guesswork through constant contact and real-time updates. No driver should ever wonder what's next.</div>
          </div>
          <div className="d101-value-card d101-reveal">
            <div className="d101-value-num">03</div>
            <div className="d101-value-title">🏆 Performance-Based Trust</div>
            <div className="d101-value-desc">Simple pricing and risk-free options to demonstrate value before seeking long-term commitment.</div>
          </div>
          <div className="d101-value-card d101-reveal">
            <div className="d101-value-num">04</div>
            <div className="d101-value-title">🛣️ Strategic Lane Building</div>
            <div className="d101-value-desc">Focus on building steady lanes and broker relationships rather than chasing one-off spot loads.</div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 04 — DISPATCHER DUO WORKFLOW */}
      <section className="d101-duo-section">
        <div className="d101-duo-container">
          <div className="d101-section-header d101-reveal">
            <div className="d101-section-num">Module 04</div>
            <h2 className="d101-section-title">The Dispatcher Workflow in Action</h2>
            <p className="d101-section-subtitle">Follow two professional dispatchers as they execute the complete freight booking workflow — from carrier vetting to final settlement.</p>
          </div>

          <div className="d101-duo-intro d101-reveal">
            <div className="d101-duo-avatar-wrap">
              <div className="d101-avatar-circle d101-female">👩🏽‍💼<div className="d101-avatar-pulse"></div></div>
              <div className="d101-avatar-name">Tasha M.</div>
              <div className="d101-avatar-role">Lead Dispatcher</div>
            </div>
            <div className="d101-duo-intro-text">
              <h3>Meet the Team</h3>
              <p>Two seasoned dispatchers working in tandem — splitting tasks, verifying each other's work, and keeping freight moving without a hitch.</p>
            </div>
            <div className="d101-duo-avatar-wrap">
              <div className="d101-avatar-circle d101-male">👨🏾‍💼<div className="d101-avatar-pulse"></div></div>
              <div className="d101-avatar-name">Marcus J.</div>
              <div className="d101-avatar-role">Senior Dispatcher</div>
            </div>
          </div>

          <div className="d101-duo-steps">
            {/* STEP 1 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-done">✓</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-female">Tasha</span>
                <div className="d101-duo-step-title">Carrier Onboarding &amp; Authority Verification</div>
                <div className="d101-duo-step-detail">Tasha pulls the carrier's FMCSA data to verify their "Satisfactory" safety rating. She confirms $1M auto liability and $100K cargo coverage, then assembles the Master Packet — W-9, operating authority, and COI — all in one clean PDF ready for brokers.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-complete">✓ Safety Rating Verified</span>
                  <span className="d101-check-tag d101-complete">✓ Insurance Confirmed</span>
                  <span className="d101-check-tag d101-complete">✓ Master Packet Assembled</span>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-done">✓</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-male">Marcus</span>
                <div className="d101-duo-step-title">Strategic Load Sourcing &amp; Lane Analysis</div>
                <div className="d101-duo-step-detail">Marcus scans the load boards for hot markets — reefer surges and produce season spikes. He cross-references broker credit scores via DAT CarrierWatch and calculates deadhead to stay within the 10–15% threshold before presenting options.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-complete">✓ Hot Markets Identified</span>
                  <span className="d101-check-tag d101-complete">✓ Broker Credit Checked</span>
                  <span className="d101-check-tag d101-complete">✓ Deadhead Under 15%</span>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-done">✓</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-female">Tasha</span>
                <div className="d101-duo-step-title">Rate Negotiation &amp; Confirmation</div>
                <div className="d101-duo-step-detail">Tasha calls the broker and negotiates based on lane data — not desperation. She secures $2.85/mi including detention and layover terms, then reviews the Rate Con line-by-line for TONU clauses and special instructions before signing off.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-complete">✓ $2.85/mi Secured</span>
                  <span className="d101-check-tag d101-complete">✓ Detention Terms Included</span>
                  <span className="d101-check-tag d101-complete">✓ Rate Con Verified</span>
                </div>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-active">4</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-both">Tasha + Marcus</span>
                <div className="d101-duo-step-title">Load Intake &amp; Driver Handoff</div>
                <div className="d101-duo-step-detail">Marcus uploads the Rate Con using OCR to auto-populate load details — zero manual entry errors. Tasha sends the driver a clean dispatch sheet with the load number, appointment times, commodity weight, and contact names. Driver confirms trailer is clean, empty, and odor-free.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-complete">✓ OCR Upload Done</span>
                  <span className="d101-check-tag d101-complete">✓ Dispatch Sheet Sent</span>
                  <span className="d101-check-tag d101-progress">⏳ Driver En Route</span>
                </div>
              </div>
            </div>

            {/* STEP 5 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-pending">5</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-male">Marcus</span>
                <div className="d101-duo-step-title">Live Tracking &amp; Exception Management</div>
                <div className="d101-duo-step-detail">Marcus monitors the truck via live asset maps — minute-by-minute GPS tracking. If a delay hits, he proactively notifies the broker and negotiates detention pay. Daily check-in by 10:00 AM sharp to avoid the $50 fine.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-waiting">○ GPS Monitoring Active</span>
                  <span className="d101-check-tag d101-waiting">○ Check Calls on Schedule</span>
                  <span className="d101-check-tag d101-waiting">○ Exception Handling Ready</span>
                </div>
              </div>
            </div>

            {/* STEP 6 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-pending">6</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-female">Tasha</span>
                <div className="d101-duo-step-title">Delivery Confirmation &amp; POD Review</div>
                <div className="d101-duo-step-detail">Tasha reviews the Proof of Delivery for signatures and checks for any OS&amp;D (Overages, Shortages, or Damages). Everything clean — no discrepancies. Load marked as delivered.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-waiting">○ POD Signatures Verified</span>
                  <span className="d101-check-tag d101-waiting">○ OS&amp;D Check Clear</span>
                  <span className="d101-check-tag d101-waiting">○ Delivery Confirmed</span>
                </div>
              </div>
            </div>

            {/* STEP 7 */}
            <div className="d101-duo-step d101-reveal">
              <div className="d101-duo-checkpoint d101-pending">7</div>
              <div className="d101-duo-step-content">
                <span className="d101-duo-step-who d101-both">Tasha + Marcus</span>
                <div className="d101-duo-step-title">Billing, Settlement &amp; Weekly Review</div>
                <div className="d101-duo-step-detail">The delivery packet — BOL, Rate Con, and POD — gets sent instantly to the broker and factoring company for faster payment. Tasha and Marcus close the week reviewing all loads, invoices, and refining the intake process for continuous improvement.</div>
                <div className="d101-duo-step-checklist">
                  <span className="d101-check-tag d101-waiting">○ Packet Sent to Broker</span>
                  <span className="d101-check-tag d101-waiting">○ Factoring Submitted</span>
                  <span className="d101-check-tag d101-waiting">○ Weekly Review Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 05 — 6-PHASE WORKFLOW */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 05</div>
          <h2 className="d101-section-title">The 6-Phase Workflow</h2>
          <p className="d101-section-subtitle">A cyclical process designed to minimize idle time and maximize asset utilization. Disorganization is the silent killer.</p>
        </div>
        <div className="d101-timeline">
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-yellow"></div>
            <div className="d101-timeline-phase d101-yellow">Phase 1</div>
            <div className="d101-timeline-title">Carrier Onboarding &amp; Vetting</div>
            <ul className="d101-timeline-steps">
              <li>Verify carrier's Safety Rating — must be "Satisfactory"</li>
              <li>Insurance review: minimum $1M auto liability + $100K cargo coverage</li>
              <li>Master Packet: W-9, operating authority, COI — ready for rapid spot market response</li>
            </ul>
          </div>
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-green"></div>
            <div className="d101-timeline-phase d101-green">Phase 2</div>
            <div className="d101-timeline-title">Strategic Sourcing &amp; Lane Analysis</div>
            <ul className="d101-timeline-steps">
              <li>Identify hot markets — reefer surges in produce season, holiday freight spikes</li>
              <li>Broker vetting with DAT CarrierWatch — check credit and payment history</li>
              <li>Deadhead analysis — keep within the 10%–15% threshold</li>
            </ul>
          </div>
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-peach"></div>
            <div className="d101-timeline-phase d101-peach">Phase 3</div>
            <div className="d101-timeline-title">Negotiation &amp; Rate Confirmation</div>
            <ul className="d101-timeline-steps">
              <li>Negotiate rates based on lane data, not desperation</li>
              <li>Verify Rate Con includes detention, layover, and TONU terms</li>
              <li>Scrutinize load confirmation for stop-offs and special instructions</li>
            </ul>
          </div>
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-sky"></div>
            <div className="d101-timeline-phase d101-sky">Phase 4</div>
            <div className="d101-timeline-title">Intake &amp; Driver Handoff</div>
            <ul className="d101-timeline-steps">
              <li>OCR upload of Rate Con — auto-populate load details, eliminate manual errors</li>
              <li>Send templated dispatch sheet: load #, appointments, commodity, contacts</li>
              <li>Driver confirms trailer is clean, empty, and odor-free</li>
            </ul>
          </div>
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-mint"></div>
            <div className="d101-timeline-phase d101-mint">Phase 5</div>
            <div className="d101-timeline-title">Tracking &amp; Exception Management</div>
            <ul className="d101-timeline-steps">
              <li>Real-time GPS monitoring via live asset maps</li>
              <li>Proactively notify broker on delays — negotiate detention pay</li>
              <li>Daily check calls by 10:00 AM — $50 fine avoidance</li>
            </ul>
          </div>
          <div className="d101-timeline-item d101-reveal">
            <div className="d101-timeline-dot d101-rose"></div>
            <div className="d101-timeline-phase d101-rose">Phase 6</div>
            <div className="d101-timeline-title">Delivery, Documentation &amp; Settlement</div>
            <ul className="d101-timeline-steps">
              <li>Review POD for signatures and OS&amp;D verification</li>
              <li>Instant billing — delivery packet sent to broker and factoring company</li>
              <li>Weekly review — refine intake process for continuous improvement</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 06 — TRIANGLE */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 06</div>
          <h2 className="d101-section-title">The Triangular Method</h2>
          <p className="d101-section-subtitle">Plan 3 moves ahead to create a consistent lane loop that brings the driver home every weekend with profitable miles.</p>
        </div>
        <div className="d101-triangle-route d101-reveal">
          <div className="d101-route-leg">
            <div className="d101-leg-num">Leg 1 — Outbound</div>
            <div className="d101-cities">Sacramento → Phoenix</div>
            <div className="d101-rate">$2.20/mi</div>
            <div className="d101-miles">750 miles — High-paying outbound</div>
          </div>
          <span className="d101-route-arrow">→</span>
          <div className="d101-route-leg">
            <div className="d101-leg-num">Leg 2 — Secondary</div>
            <div className="d101-cities">Phoenix → Salt Lake City</div>
            <div className="d101-rate">$2.18/mi</div>
            <div className="d101-miles">660 miles — Strong secondary market</div>
          </div>
          <span className="d101-route-arrow">→</span>
          <div className="d101-route-leg">
            <div className="d101-leg-num">Leg 3 — Backhaul</div>
            <div className="d101-cities">SLC → Sacramento</div>
            <div className="d101-rate">$1.38/mi</div>
            <div className="d101-miles">640 miles — Lower but gets driver home</div>
          </div>
          <span className="d101-route-arrow">→</span>
          <div className="d101-route-leg">
            <div className="d101-leg-num">✅ Full Circuit</div>
            <div className="d101-cities">Triangle Complete</div>
            <div className="d101-rate">$1.94/mi avg</div>
            <div className="d101-miles">2,050 total miles — Home for the weekend</div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* MODULE 07 — FRAUD */}
      <section className="d101-section">
        <div className="d101-section-header d101-reveal">
          <div className="d101-section-num">Module 07</div>
          <h2 className="d101-section-title">Scam Detection &amp; Red Flags</h2>
          <p className="d101-section-subtitle">The 2025–2026 market has seen a surge in fraud. A master dispatcher is the carrier's legal shield.</p>
        </div>
        <div className="d101-redflags-grid">
          <div className="d101-redflag-card d101-reveal">
            <span className="d101-redflag-icon">🚩</span>
            <div className="d101-redflag-title">Slot Fee Scams</div>
            <div className="d101-redflag-desc">Any broker asking for a deposit to "reserve" a high-paying load is a scam. Legitimate brokers never charge upfront fees for work.</div>
          </div>
          <div className="d101-redflag-card d101-reveal">
            <span className="d101-redflag-icon">👤</span>
            <div className="d101-redflag-title">Cloned MC Numbers</div>
            <div className="d101-redflag-desc">Scammers use cloned Motor Carrier numbers and spoofed Rate Cons. Always verify the broker's phone number via the FMCSA SAFER system.</div>
          </div>
          <div className="d101-redflag-card d101-reveal">
            <span className="d101-redflag-icon">📧</span>
            <div className="d101-redflag-title">Email Domain Inspection</div>
            <div className="d101-redflag-desc">Professional brokers don't use Gmail or Yahoo. If the email domain doesn't match the corporate website, walk away immediately.</div>
          </div>
        </div>
      </section>

      <div className="d101-section-divider"></div>

      {/* CTA */}
      <section className="d101-cta-section">
        <div className="d101-cta-box d101-reveal">
          <h2 className="d101-cta-title">Ready to <span style={{ color: 'var(--d101-leaf)' }}>Master Dispatching?</span></h2>
          <p className="d101-cta-desc">Join DispatchLink Pro — the platform built by dispatchers, for dispatchers.</p>
          <button className="d101-cta-btn" onClick={handleCtaClick}>Launch DispatchLink →</button>
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────────────────────────
   All CSS with d101- prefix to avoid conflicts
   ───────────────────────────────────────────── */
const D101_STYLES = `
/* ═══════ D101 CUSTOM PROPERTIES ═══════ */
.d101-page {
  --d101-sun: #E5A700;
  --d101-sun-light: #FCD34D;
  --d101-sun-glow: #FBBF24;
  --d101-leaf: #16A34A;
  --d101-leaf-light: #4ADE80;
  --d101-leaf-glow: #22C55E;
  --d101-mint: #10B981;
  --d101-sky: #0EA5E9;
  --d101-sky-light: #38BDF8;
  --d101-rose: #F43F5E;
  --d101-peach: #FB923C;
  --d101-warm-white: #FEF9EF;
  --d101-text-dark: #1C1917;
  --d101-text-mid: #44403C;
  --d101-text-soft: #78716C;
  --d101-card-bg: rgba(255,255,255,0.88);
  --d101-section-bg: #FEFCE8;

  font-family: 'DM Sans', sans-serif;
  background: var(--d101-warm-white);
  color: var(--d101-text-dark);
  overflow-x: hidden;
  line-height: 1.7;
  position: relative;
}

.d101-page *, .d101-page *::before, .d101-page *::after {
  box-sizing: border-box;
}

/* ═══════ BG DOTS & LEAVES ═══════ */
.d101-bg-dots {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: radial-gradient(circle, rgba(22,163,74,0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  z-index: 0;
  pointer-events: none;
}

.d101-floating-leaf {
  position: fixed;
  font-size: 22px;
  opacity: 0.07;
  animation: d101-leafDrift 28s linear infinite;
  z-index: 0;
  pointer-events: none;
}
@keyframes d101-leafDrift {
  0% { transform: translateX(-60px) translateY(100vh) rotate(0deg); }
  100% { transform: translateX(calc(100vw + 60px)) translateY(-100px) rotate(360deg); }
}

/* ═══════ HERO ═══════ */
.d101-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  overflow: hidden;
  background: linear-gradient(170deg, #ECFDF5 0%, #FEF9C3 40%, #FFF7ED 80%, #FEFCE8 100%);
}
.d101-hero::before {
  content: '';
  position: absolute;
  top: -30%; right: -20%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%);
  animation: d101-heroSun 10s ease-in-out infinite alternate;
}
.d101-hero::after {
  content: '';
  position: absolute;
  bottom: -20%; left: -10%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%);
  animation: d101-heroSun 12s ease-in-out infinite alternate-reverse;
}
@keyframes d101-heroSun {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(20px, -15px); }
}
.d101-hero-content { position: relative; z-index: 2; max-width: 900px; }
.d101-hero-badge {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(22,163,74,0.1);
  border: 1px solid rgba(22,163,74,0.25);
  border-radius: 40px;
  font-family: 'Oxanium', sans-serif;
  font-size: 13px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--d101-leaf);
  margin-bottom: 30px;
  animation: d101-fadeSlideUp 0.8s ease-out;
}
.d101-hero h1 {
  font-family: 'Oxanium', sans-serif;
  font-size: clamp(42px, 8vw, 90px);
  font-weight: 800;
  line-height: 1.05;
  margin-bottom: 10px;
  animation: d101-fadeSlideUp 0.8s ease-out 0.2s both;
}
.d101-hero h1 .d101-yellow { color: var(--d101-sun); }
.d101-hero h1 .d101-green { color: var(--d101-leaf); }
.d101-hero-sub {
  font-size: clamp(16px, 2.5vw, 22px);
  color: var(--d101-text-mid);
  margin-bottom: 40px;
  animation: d101-fadeSlideUp 0.8s ease-out 0.4s both;
}
.d101-hero-sub strong { color: var(--d101-leaf); }
.d101-hero-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  animation: d101-fadeSlideUp 0.8s ease-out 0.6s both;
}
.d101-hero-stat {
  text-align: center;
  padding: 20px 28px;
  background: var(--d101-card-bg);
  border: 1px solid rgba(22,163,74,0.12);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  min-width: 160px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.04);
}
.d101-hero-stat .d101-num {
  font-family: 'Oxanium', sans-serif;
  font-size: 36px;
  font-weight: 800;
  display: block;
}
.d101-hero-stat .d101-num.d101-yellow { color: var(--d101-sun); }
.d101-hero-stat .d101-num.d101-green { color: var(--d101-leaf); }
.d101-hero-stat .d101-num.d101-peach { color: var(--d101-peach); }
.d101-hero-stat .d101-label {
  font-size: 12px;
  color: var(--d101-text-soft);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 4px;
}
@keyframes d101-fadeSlideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.d101-scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  animation: d101-bounce 2s infinite;
}
.d101-scroll-indicator span {
  display: block;
  width: 24px; height: 24px;
  border-right: 2px solid var(--d101-leaf);
  border-bottom: 2px solid var(--d101-leaf);
  transform: rotate(45deg);
  opacity: 0.4;
}
@keyframes d101-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(12px); }
}

/* ═══════ SECTIONS ═══════ */
.d101-section {
  position: relative;
  z-index: 1;
  padding: 100px 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.d101-section-header {
  text-align: center;
  margin-bottom: 70px;
}
.d101-section-num {
  font-family: 'Oxanium', sans-serif;
  font-size: 14px;
  letter-spacing: 6px;
  color: var(--d101-sun);
  text-transform: uppercase;
  margin-bottom: 12px;
}
.d101-section-title {
  font-family: 'Oxanium', sans-serif;
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  margin-bottom: 16px;
}
.d101-section-subtitle {
  font-size: 17px;
  color: var(--d101-text-soft);
  max-width: 650px;
  margin: 0 auto;
}
.d101-section-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--d101-sun-light), var(--d101-leaf-light), transparent);
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.5;
}

/* ═══════ METRIC CARDS ═══════ */
.d101-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}
.d101-metric-card {
  background: var(--d101-card-bg);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 24px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
}
.d101-metric-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
.d101-metric-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 4px;
  border-radius: 24px 24px 0 0;
}
.d101-metric-card.d101-yellow::before { background: linear-gradient(90deg, var(--d101-sun), var(--d101-sun-light)); }
.d101-metric-card.d101-green::before { background: linear-gradient(90deg, var(--d101-leaf), var(--d101-leaf-light)); }
.d101-metric-card.d101-peach::before { background: linear-gradient(90deg, var(--d101-peach), #FDBA74); }
.d101-metric-card.d101-sky::before { background: linear-gradient(90deg, var(--d101-sky), var(--d101-sky-light)); }
.d101-metric-icon {
  width: 56px; height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 18px;
}
.d101-metric-icon.d101-yellow { background: rgba(245,158,11,0.12); }
.d101-metric-icon.d101-green { background: rgba(22,163,74,0.12); }
.d101-metric-icon.d101-peach { background: rgba(251,146,60,0.12); }
.d101-metric-icon.d101-sky { background: rgba(14,165,233,0.12); }
.d101-metric-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--d101-text-soft);
  margin-bottom: 8px;
}
.d101-metric-value {
  font-family: 'Oxanium', sans-serif;
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}
.d101-metric-value.d101-yellow { color: var(--d101-sun); }
.d101-metric-value.d101-green { color: var(--d101-leaf); }
.d101-metric-value.d101-peach { color: var(--d101-peach); }
.d101-metric-value.d101-sky { color: var(--d101-sky); }
.d101-metric-desc { font-size: 14px; color: var(--d101-text-soft); line-height: 1.6; }

/* ═══════ FORMULA ═══════ */
.d101-formula-box {
  text-align: center;
  padding: 50px 30px;
  background: linear-gradient(135deg, rgba(245,158,11,0.06), rgba(22,163,74,0.06));
  border: 1px solid rgba(22,163,74,0.1);
  border-radius: 28px;
  margin: 40px 0;
}
.d101-formula-box .d101-formula {
  font-family: 'Oxanium', sans-serif;
  font-size: clamp(20px, 4vw, 36px);
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 2px;
}
.d101-formula-box .d101-formula span { color: var(--d101-leaf); }
.d101-formula-legend {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}
.d101-formula-legend div { font-size: 14px; color: var(--d101-text-soft); }
.d101-formula-legend div strong { color: var(--d101-leaf); margin-right: 4px; }

/* ═══════ EQUIPMENT ═══════ */
.d101-equip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.d101-equip-card {
  background: var(--d101-card-bg);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  transition: all 0.4s ease;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
}
.d101-equip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.08);
}
.d101-equip-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  animation: d101-truckBounce 3s ease-in-out infinite;
}
@keyframes d101-truckBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.d101-equip-name { font-family: 'Oxanium', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.d101-equip-specs { font-family: 'Oxanium', sans-serif; font-size: 13px; color: var(--d101-sky); font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; }
.d101-equip-earnings { font-family: 'Oxanium', sans-serif; font-size: 22px; font-weight: 700; color: var(--d101-leaf); margin-bottom: 10px; }
.d101-equip-desc { font-size: 13px; color: var(--d101-text-soft); line-height: 1.5; }
.d101-equip-bar { margin-top: 16px; height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; }
.d101-equip-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--d101-leaf), var(--d101-sun-light)); transition: width 1.5s ease-out; }

/* ═══════ VALUES ═══════ */
.d101-values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}
.d101-value-card {
  padding: 30px;
  border-radius: 24px;
  border: 1px solid rgba(0,0,0,0.06);
  background: var(--d101-card-bg);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}
.d101-value-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
.d101-value-num { font-family: 'Oxanium', sans-serif; font-size: 48px; font-weight: 800; color: rgba(245,158,11,0.1); position: absolute; top: 10px; right: 20px; }
.d101-value-title { font-family: 'Chakra Petch', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--d101-leaf); }
.d101-value-desc { font-size: 14px; color: var(--d101-text-soft); line-height: 1.7; }

/* ═══════ DISPATCHER DUO WORKFLOW ═══════ */
.d101-duo-section {
  background: linear-gradient(170deg, #ECFDF5 0%, #FEF9C3 50%, #FFF7ED 100%);
  padding: 100px 20px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.d101-duo-container { max-width: 1100px; margin: 0 auto; }

.d101-duo-intro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}
.d101-duo-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.d101-avatar-circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
}
.d101-avatar-circle.d101-female {
  background: linear-gradient(135deg, #FDE68A, #FBBF24);
  border: 3px solid var(--d101-sun);
}
.d101-avatar-circle.d101-male {
  background: linear-gradient(135deg, #A7F3D0, #34D399);
  border: 3px solid var(--d101-leaf);
}
.d101-avatar-pulse {
  position: absolute;
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid;
  animation: d101-avatarPulse 2.5s ease-out infinite;
}
.d101-avatar-circle.d101-female .d101-avatar-pulse { border-color: var(--d101-sun); }
.d101-avatar-circle.d101-male .d101-avatar-pulse { border-color: var(--d101-leaf); }
@keyframes d101-avatarPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}
.d101-avatar-name { font-family: 'Oxanium', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
.d101-avatar-role { font-size: 12px; color: var(--d101-text-soft); }
.d101-duo-intro-text {
  max-width: 420px;
  text-align: center;
}
.d101-duo-intro-text h3 {
  font-family: 'Chakra Petch', sans-serif;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
}
.d101-duo-intro-text p { font-size: 15px; color: var(--d101-text-mid); }

/* DUO STEPS */
.d101-duo-steps {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.d101-duo-steps::before {
  content: '';
  position: absolute;
  left: 36px;
  top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, var(--d101-sun), var(--d101-leaf-light), var(--d101-sky), var(--d101-peach), var(--d101-mint), var(--d101-leaf), var(--d101-sun-light));
  border-radius: 2px;
}

.d101-duo-step {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 20px 0;
  position: relative;
}
.d101-duo-checkpoint {
  flex-shrink: 0;
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  font-family: 'Oxanium', sans-serif;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
}
.d101-duo-step:hover .d101-duo-checkpoint { transform: scale(1.12); }

.d101-duo-checkpoint.d101-done {
  background: linear-gradient(135deg, var(--d101-leaf), var(--d101-leaf-light));
  color: white;
  box-shadow: 0 6px 24px rgba(22,163,74,0.25);
}
.d101-duo-checkpoint.d101-active {
  background: linear-gradient(135deg, var(--d101-sun), var(--d101-sun-light));
  color: white;
  box-shadow: 0 6px 24px rgba(245,158,11,0.25);
  animation: d101-checkpointPulse 2s infinite;
}
.d101-duo-checkpoint.d101-pending {
  background: white;
  border: 3px solid rgba(0,0,0,0.08);
  color: var(--d101-text-soft);
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}
@keyframes d101-checkpointPulse {
  0%, 100% { box-shadow: 0 6px 24px rgba(245,158,11,0.2); }
  50% { box-shadow: 0 6px 36px rgba(245,158,11,0.45); }
}

.d101-duo-step-content {
  flex: 1;
  background: var(--d101-card-bg);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 24px;
  padding: 28px 32px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}
.d101-duo-step:hover .d101-duo-step-content {
  transform: translateX(6px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}
.d101-duo-step-who {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.d101-duo-step-who.d101-female { background: rgba(251,191,36,0.15); color: var(--d101-sun); }
.d101-duo-step-who.d101-male { background: rgba(34,197,94,0.15); color: var(--d101-leaf); }
.d101-duo-step-who.d101-both { background: rgba(14,165,233,0.12); color: var(--d101-sky); }

.d101-duo-step-title { font-family: 'Chakra Petch', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.d101-duo-step-detail { font-size: 14px; color: var(--d101-text-mid); line-height: 1.7; }
.d101-duo-step-checklist {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.d101-check-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.d101-check-tag.d101-complete { background: rgba(22,163,74,0.1); color: var(--d101-leaf); }
.d101-check-tag.d101-progress { background: rgba(245,158,11,0.1); color: var(--d101-sun); }
.d101-check-tag.d101-waiting { background: rgba(0,0,0,0.04); color: var(--d101-text-soft); }

/* ═══════ TIMELINE ═══════ */
.d101-timeline {
  position: relative;
  padding-left: 60px;
}
.d101-timeline::before {
  content: '';
  position: absolute;
  left: 24px; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--d101-sun), var(--d101-leaf), var(--d101-sky), var(--d101-peach), var(--d101-mint), var(--d101-rose));
  border-radius: 2px;
}
.d101-timeline-item {
  position: relative;
  margin-bottom: 40px;
  padding: 28px;
  background: var(--d101-card-bg);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 24px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}
.d101-timeline-item:hover { transform: translateX(8px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
.d101-timeline-dot {
  position: absolute;
  left: -48px; top: 32px;
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 3px solid;
  background: var(--d101-warm-white);
}
.d101-timeline-dot.d101-yellow { border-color: var(--d101-sun); box-shadow: 0 0 12px rgba(245,158,11,0.3); }
.d101-timeline-dot.d101-green { border-color: var(--d101-leaf); box-shadow: 0 0 12px rgba(22,163,74,0.3); }
.d101-timeline-dot.d101-peach { border-color: var(--d101-peach); box-shadow: 0 0 12px rgba(251,146,60,0.3); }
.d101-timeline-dot.d101-sky { border-color: var(--d101-sky); box-shadow: 0 0 12px rgba(14,165,233,0.3); }
.d101-timeline-dot.d101-mint { border-color: var(--d101-mint); box-shadow: 0 0 12px rgba(16,185,129,0.3); }
.d101-timeline-dot.d101-rose { border-color: var(--d101-rose); box-shadow: 0 0 12px rgba(244,63,94,0.3); }
.d101-timeline-phase {
  font-family: 'Oxanium', sans-serif;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.d101-timeline-phase.d101-yellow { color: var(--d101-sun); }
.d101-timeline-phase.d101-green { color: var(--d101-leaf); }
.d101-timeline-phase.d101-peach { color: var(--d101-peach); }
.d101-timeline-phase.d101-sky { color: var(--d101-sky); }
.d101-timeline-phase.d101-mint { color: var(--d101-mint); }
.d101-timeline-phase.d101-rose { color: var(--d101-rose); }
.d101-timeline-title { font-family: 'Chakra Petch', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 12px; }
.d101-timeline-steps { list-style: none; padding: 0; margin: 0; }
.d101-timeline-steps li {
  padding: 8px 0 8px 28px;
  position: relative;
  font-size: 15px;
  color: var(--d101-text-mid);
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.d101-timeline-steps li:last-child { border-bottom: none; }
.d101-timeline-steps li::before { content: '\\2713'; position: absolute; left: 4px; color: var(--d101-leaf); font-weight: bold; }

/* ═══════ TRIANGLE ROUTE ═══════ */
.d101-triangle-route {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin: 40px 0;
}
.d101-route-leg {
  text-align: center;
  padding: 28px 24px;
  background: var(--d101-card-bg);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 24px;
  min-width: 220px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}
.d101-route-leg:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(0,0,0,0.06); }
.d101-route-leg .d101-leg-num { font-family: 'Oxanium', sans-serif; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
.d101-route-leg:nth-child(1) .d101-leg-num { color: var(--d101-sky); }
.d101-route-leg:nth-child(3) .d101-leg-num { color: var(--d101-leaf); }
.d101-route-leg:nth-child(5) .d101-leg-num { color: var(--d101-peach); }
.d101-route-leg:nth-child(7) { background: rgba(22,163,74,0.06); border-color: rgba(22,163,74,0.15); }
.d101-route-leg:nth-child(7) .d101-leg-num { color: var(--d101-leaf); }
.d101-route-leg .d101-cities { font-family: 'Chakra Petch', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.d101-route-leg .d101-rate { font-family: 'Oxanium', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
.d101-route-leg:nth-child(1) .d101-rate { color: var(--d101-sky); }
.d101-route-leg:nth-child(3) .d101-rate { color: var(--d101-leaf); }
.d101-route-leg:nth-child(5) .d101-rate { color: var(--d101-peach); }
.d101-route-leg:nth-child(7) .d101-rate { color: var(--d101-leaf); }
.d101-route-leg .d101-miles { font-size: 13px; color: var(--d101-text-soft); }
.d101-route-arrow { font-size: 28px; color: var(--d101-sun); animation: d101-pulseArrow 2s infinite; }
@keyframes d101-pulseArrow {
  0%, 100% { opacity: 0.3; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(6px); }
}

/* ═══════ RED FLAGS ═══════ */
.d101-redflags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.d101-redflag-card {
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(244,63,94,0.12);
  background: rgba(244,63,94,0.03);
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
}
.d101-redflag-card:hover { border-color: rgba(244,63,94,0.25); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(244,63,94,0.06); }
.d101-redflag-icon { font-size: 36px; margin-bottom: 14px; display: block; }
.d101-redflag-title { font-family: 'Chakra Petch', sans-serif; font-size: 18px; font-weight: 700; color: var(--d101-rose); margin-bottom: 8px; }
.d101-redflag-desc { font-size: 14px; color: var(--d101-text-soft); line-height: 1.7; }

/* ═══════ CTA ═══════ */
.d101-cta-section { text-align: center; padding: 80px 20px; position: relative; z-index: 1; }
.d101-cta-box {
  max-width: 700px;
  margin: 0 auto;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(22,163,74,0.06));
  border: 1px solid rgba(22,163,74,0.15);
  border-radius: 28px;
}
.d101-cta-title { font-family: 'Oxanium', sans-serif; font-size: clamp(24px, 4vw, 36px); font-weight: 800; margin-bottom: 16px; }
.d101-cta-desc { font-size: 16px; color: var(--d101-text-soft); margin-bottom: 30px; }
.d101-cta-btn {
  display: inline-block;
  padding: 16px 48px;
  background: linear-gradient(135deg, var(--d101-leaf), var(--d101-sun));
  color: white;
  font-family: 'Oxanium', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.d101-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(22,163,74,0.25); }

/* ═══════ ANIMATIONS ═══════ */
.d101-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.d101-reveal.d101-visible { opacity: 1; transform: translateY(0); }

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .d101-timeline { padding-left: 40px; }
  .d101-timeline::before { left: 14px; }
  .d101-timeline-dot { left: -34px; }
  .d101-route-arrow { display: none; }
  .d101-hero-stats { gap: 16px; }
  .d101-hero-stat { min-width: 130px; padding: 16px 20px; }
  .d101-duo-intro { flex-direction: column; gap: 24px; }
  .d101-duo-step { flex-direction: column; gap: 12px; }
  .d101-duo-steps::before { left: 16px; }
  .d101-duo-checkpoint { width: 56px; height: 56px; font-size: 22px; }
}
`;

export default Dispatch101Page;
