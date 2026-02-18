import React, { useEffect, useRef } from 'react';
import './Dispatch101Page.css';

const Dispatch101Page: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('home');
  };

  return (
    <div className="d101-page" ref={containerRef}>
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
              <div className="d101-avatar-circle d101-female">👩🏽‍💼</div>
              <div className="d101-avatar-name">Tasha M.</div>
              <div className="d101-avatar-role">Lead Dispatcher</div>
            </div>
            <div className="d101-duo-intro-text">
              <h3>Meet the Team</h3>
              <p>Two seasoned dispatchers working in tandem — splitting tasks, verifying each other's work, and keeping freight moving without a hitch.</p>
            </div>
            <div className="d101-duo-avatar-wrap">
              <div className="d101-avatar-circle d101-male">👨🏾‍💼</div>
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

export default Dispatch101Page;
