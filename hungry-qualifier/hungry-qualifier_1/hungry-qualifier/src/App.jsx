import { useState } from "react";

const SYSTEM_PROMPT = `You are a senior sales qualification expert for Hungry, a corporate catering company. Evaluate whether a prospective account qualifies based on Hungry's internal rubric. Be specific and actionable — don't just flag issues, tell the rep exactly what to do next.

## HARD DISQUALIFIERS (auto-reject, no exceptions)
- Fully remote company (no physical office)
- Under 25 headcount
- Budget clearly non-viable for their market (see Market Pricing)

## REVENUE TIERS
- Tier 3 / SMB: MRR < $10K | Min order spend: $500 | Growth accounts
- Tier 2 / Mid-Market: MRR $10K–$25K | Min order spend: $300 | Mid-large accounts
- Tier 1 / Enterprise: MRR $25K+ | Min order spend: $300 | Large/complex accounts | Below-margin requires CEO/President approval
- All tiers: $1,000/month minimum MRR floor | 30% minimum margin across all tiers

## IDEAL CLIENT PROFILE
- Headcount sweet spot: 50–5,000
- Meals/day sweet spot: 25–500
- Work model: In-office or hybrid ONLY
- Best-fit industries: Tech, Fintech, VC/PE, Trading, Aerospace, Biotech, Medical Devices

## MARKET PRICING — Client food price floors by city
Flag budget BELOW these ranges. Budget below floor requires Sales Management approval to proceed.
- San Francisco / Santa Clara / Oakland / Los Angeles: $20–$22
- New York: $21–$23
- Boston: $19–$21
- Austin / Chicago / Dallas / Washington D.C. / Salt Lake City: $18–$20
- Toronto / Vancouver: $23–$25
- Other/Unknown: flag if under $18

Budget-to-quality impact:
- Under $15/person: 75% chefs only — flag hard, very limited vendor quality
- $15–$20/person: 50% chefs — moderate
- $20+/person: 100% restaurants — ideal

NOTE: If client uses retail pricing (employees pay above a stipend), that is NOT a budget floor violation. Only flag if the all-in company budget is below the floor with no employee contribution.

## MARKET STATUS
- Established (SF, Santa Clara, Austin, Toronto): Full support
- Emerging (Oakland, Boston, Chicago, Dallas, LA, Vancouver): Manageable, growing
- Launch (New York, Salt Lake City, Washington D.C.): Flag — limited ops capacity, may need leadership involvement

## MARGIN (Catering)
- 30%+ = green light to activate
- Under 30% = flag; must email Dan, Kyle, and Jeff with margin calculator + client profile for approval
- Enterprise under margin = requires CEO or President approval specifically
- Formula: Margin % = (Total Revenue - Food Cost per meal - Labor Cost per meal) / Total Revenue
  - Total Revenue = Avg Retail Price × (1 + delivery fee %)
  - Labor per meal = (# Captains × Hours × Hourly Rate) / # of meals
  - Food cost = average of 3+ menus
- Cannot activate catering without running margin calc first

## GROUP ORDER STANDARDS
- Target: 25+ meals per meal period. Under 25 = requires Sales Management approval
- Delivery fees: 15% for 25+ meals | $65 flat for 10–24 meals | $125 for 1–9 meals
- Min 2 menu concepts/day standard (3 menus fits 50–100 diners per service levels)
- Using retail priced meals (no all-in company budget): no approval needed
- All-in budget below market floor: Sales Management approval required
- Requesting menus/concepts above standard service level specs: Sales Management approval required

## STAFFING BY HEADCOUNT (captains included at no charge, 1 per 50 people for 60 min)
- <50 diners: 1 captain | 50–100: 2 captains | 100–200: 3 captains | 200–300: 4 captains | 300–400: 4–5 captains
- Additional captains or time: $50/hour
- W2 ("Hospitality Associates"): on-site client-facing hospitality only — do NOT drive or deliver food
- 1099: logistics driver, delivery + setup — can escalate but not problem solve
- SMB/Mid-Market: 1099 and/or W2 | Enterprise: requires both 1099 AND W2
- W2 added cost: SMB = $100/hour | Mid-Market and Enterprise = included

## CLEANUP (all tiers — included 90 min, $50 per additional hour)
All tiers include 90 minutes of cleanup. Additional time is $50/hour for all tiers.

## ELEVATED SETUP (catering physical requirements)
Requires: adequate space (front + back of house), plumbing (3-bay sink or dishwashing solution), electrical for warmers/cambros, ops walkthrough, 2–4 week lead time.
- SMB: NOT included. $300/instance or equipment purchase. Requires ops site-qualification before committing.
- Mid-Market: NOT included. Client pays for equipment. Requires ops site-qualification before committing.
- Enterprise: INCLUDED (unless client agrees to pay). Contract must include equipment buyout clause if SOW cancelled.
- All elevated setup requests: work with local ops manager and CSM to spec out BEFORE committing to client.

## DELIVERY WINDOW
- Enterprise: 30-minute delivery time OR 2-hour window based on routing
- SMB/Mid-Market: 45-minute window (exceptions require management approval)

## FEATURES BY TIER
- Slack Integration: Enterprise ONLY (menu posting, live updates, feedback)
- Decorations: SMB = $100/instance | Mid-Market = pricing available with ops sign-off | Enterprise = included (quarterly stipend)
- Dishwashing: N/A for SMB | available for Mid-Market/Enterprise with ops sign-off
- Catering consumption tracking: SMB = approval-based | Mid-Market/Enterprise = included
- CSM: Enterprise = Enterprise CSM + Regional CSM + Solution Desk | Mid-Market = Mid-Market CSM + Solution Desk | SMB = Solution Desk only

## OPERATIONAL RED FLAGS (flag for leadership involvement)
- Enterprise-level requests from low MRR accounts
- Aggressive launch timelines (under 2–4 weeks)
- Custom reporting requests
- Non-standard elevated setup requirements
- Combined pantry + catering requests
- Custom invoicing or billing structure

## APPROVAL ROUTING
- Catering margin under 30%: email Dan, Kyle, and Jeff — include margin calculator + client profile
- Group order outside service level standard: email Dan for approval
- All-in budget below market floor: Sales Management approval
- Elevated setup: spec with local ops manager + CSM before any client commitment
- <25 meals/period: Sales Management approval

## SCENARIO EXAMPLES (use these to calibrate your reasoning)
- $12K MRR, family catering, requests cleanup + decor + Slack → Mid-Market ✓, run margin calc, cleanup included, decor included, Slack NOT available (flag)
- $8K MRR, family catering, requests cleanup + decor + staffing → SMB ✓, run margin calc, cleanup included, decor $100/service (flag cost), staffing 1 capt/50 included
- $12K MRR, group order 70 meals, 3 menus, racks, $15 stipend + employees pay above → APPROVED — retail pricing model, no all-in budget issue
- $12K MRR, group order 70 meals, 3 menus, racks, $16/person all-in → NEEDS REVIEW — 3 menus fits 70 HC, racks included, but $16 all-in requires Sales Management approval

Return your response as a JSON object with this exact structure:
{
  "verdict": "QUALIFIED" | "NEEDS_REVIEW" | "DISQUALIFIED",
  "tier": "SMB" | "MID_MARKET" | "ENTERPRISE" | "UNKNOWN",
  "summary": "2-3 sentence plain English summary of the decision",
  "factors": [
    {
      "label": "Factor name",
      "status": "pass" | "flag" | "fail",
      "note": "Brief explanation"
    }
  ],
  "recommended_actions": ["Action 1", "Action 2"]
}

Only return valid JSON, no markdown, no preamble.`;

const fields = [
  { id: "company", label: "Company Name", type: "text", placeholder: "Acme Corp" },
  { id: "industry", label: "Industry", type: "text", placeholder: "e.g. Fintech, Biotech, VC..." },
  { id: "headcount", label: "Headcount", type: "number", placeholder: "e.g. 200" },
  { id: "workModel", label: "Work Model", type: "select", options: ["In-office", "Hybrid", "Unknown"] },
  { id: "mealsPerDay", label: "Est. Meals / Day", type: "number", placeholder: "e.g. 75" },
  { id: "budgetPerPerson", label: "Budget / Person ($)", type: "number", placeholder: "e.g. 22" },
  { id: "frequency", label: "Frequency", type: "select", options: ["Daily", "3-4x/week", "1-2x/week", "Monthly", "Ad hoc", "Unknown"] },
  { id: "projectedMRR", label: "Projected MRR ($)", type: "number", placeholder: "e.g. 15000" },
  { id: "elevatedSetup", label: "Elevated Setup Needed?", type: "select", options: ["No", "Yes", "Unknown"] },
  { id: "marketCity", label: "Market / City", type: "select", options: ["San Francisco", "Santa Clara", "Oakland", "Los Angeles", "Austin", "Boston", "Chicago", "Dallas", "New York", "Salt Lake City", "Toronto", "Vancouver", "Washington D.C.", "Other / Unknown"] },
  { id: "additionalNotes", label: "Additional Notes", type: "textarea", placeholder: "Any other context, special requests, objections..." },
];

const statusConfig = {
  pass: { color: "#22c55e", icon: "✓", bg: "rgba(34,197,94,0.1)" },
  flag: { color: "#f59e0b", icon: "⚠", bg: "rgba(245,158,11,0.1)" },
  fail: { color: "#ef4444", icon: "✕", bg: "rgba(239,68,68,0.1)" },
};

const verdictConfig = {
  QUALIFIED: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", label: "QUALIFIED", icon: "✓" },
  NEEDS_REVIEW: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", label: "NEEDS REVIEW", icon: "⚠" },
  DISQUALIFIED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", label: "DISQUALIFIED", icon: "✕" },
};

const tierColors = {
  SMB: "#818cf8",
  MID_MARKET: "#38bdf8",
  ENTERPRISE: "#fb923c",
  UNKNOWN: "#6b7280",
};

export default function HungryQualifier() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const buildUserMessage = () => {
    const lines = fields
      .filter(f => form[f.id])
      .map(f => `${f.label}: ${form[f.id]}`);
    return `Please qualify this account:\n\n${lines.join("\n")}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserMessage() }],
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(`API error: ${data.error.message}`);
        setLoading(false);
        return;
      }

      const raw = data.content?.find(b => b.type === "text")?.text || "";

      if (!raw) {
        setError("No response received. Try again.");
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        setResult(parsed);
      } catch (parseErr) {
        setError(`Response parsing failed. Raw: ${raw.slice(0, 300)}`);
      }
    } catch (e) {
      setError(`Request failed: ${e.message}`);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setForm({});
    setResult(null);
    setError(null);
  };

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      color: "#e2e8f0",
      padding: "32px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #2d2d3d; border-radius: 2px; }
        input, select, textarea {
          background: #12121a !important;
          border: 1px solid #2a2a3a !important;
          color: #e2e8f0 !important;
          border-radius: 6px !important;
          padding: 10px 14px !important;
          width: 100% !important;
          font-family: 'DM Mono', monospace !important;
          font-size: 13px !important;
          outline: none !important;
          transition: border-color 0.2s !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #e85d26 !important;
        }
        input::placeholder, textarea::placeholder {
          color: #3d3d50 !important;
        }
        select option { background: #12121a; }
        textarea { resize: vertical; min-height: 72px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .factor-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 8
          }}>
            <div style={{
              width: 36, height: 36,
              background: "#e85d26",
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
              fontFamily: "'Syne', sans-serif"
            }}>H</div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
                HUNGRY
              </div>
              <div style={{ fontSize: 10, color: "#4a4a60", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Account Qualification Engine
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, #e85d26 0%, transparent 60%)", marginTop: 16 }} />
        </div>

        {!result ? (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {/* Form grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" }}>
              {fields.map(f => (
                f.id === "additionalNotes" ? (
                  <div key={f.id} style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <textarea
                      placeholder={f.placeholder}
                      value={form[f.id] || ""}
                      onChange={e => handleChange(f.id, e.target.value)}
                    />
                  </div>
                ) : (
                  <div key={f.id} style={{ gridColumn: f.id === "company" || f.id === "marketCity" ? "1 / -1" : "auto" }}>
                    <label style={{ display: "block", fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                      {f.label}
                    </label>
                    {f.type === "select" ? (
                      <select value={form[f.id] || ""} onChange={e => handleChange(f.id, e.target.value)}>
                        <option value="">Select...</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.id] || ""}
                        onChange={e => handleChange(f.id, e.target.value)}
                      />
                    )}
                  </div>
                )
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, fontSize: 13, color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 28, width: "100%", padding: "14px",
                background: loading ? "#1a1a2a" : "#e85d26",
                border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase",
                color: loading ? "#4a4a60" : "#fff",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <span style={{ animation: "pulse 1.2s ease infinite", display: "inline-block" }}>
                  Qualifying...
                </span>
              ) : "Run Qualification →"}
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Verdict banner */}
            <div style={{
              padding: "24px 28px",
              background: vc.bg,
              border: `1px solid ${vc.border}`,
              borderRadius: 10,
              marginBottom: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: vc.border, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: vc.color, fontWeight: 700
                  }}>{vc.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: vc.color, letterSpacing: "-0.02em" }}>
                      {vc.label}
                    </div>
                    {result.tier && result.tier !== "UNKNOWN" && (
                      <div style={{
                        display: "inline-block", marginTop: 4,
                        padding: "2px 10px", borderRadius: 20,
                        background: `${tierColors[result.tier]}20`,
                        border: `1px solid ${tierColors[result.tier]}40`,
                        color: tierColors[result.tier],
                        fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase"
                      }}>
                        {result.tier.replace("_", "-")} TIER
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#4a4a60", textAlign: "right" }}>
                  {form.company && <div style={{ color: "#9ca3af", fontSize: 14 }}>{form.company}</div>}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                {result.summary}
              </p>
            </div>

            {/* Factor breakdown */}
            {result.factors?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: "#4a4a60", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                  Factor Breakdown
                </div>
                <div style={{ border: "1px solid #1e1e2e", borderRadius: 8, overflow: "hidden" }}>
                  {result.factors.map((f, i) => {
                    const sc = statusConfig[f.status];
                    return (
                      <div
                        key={i}
                        className="factor-row"
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 16px",
                          borderBottom: i < result.factors.length - 1 ? "1px solid #1e1e2e" : "none",
                          transition: "background 0.15s",
                        }}
                      >
                        <div style={{
                          flexShrink: 0, width: 22, height: 22, borderRadius: 4,
                          background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, color: sc.color, fontWeight: 700, marginTop: 1
                        }}>{sc.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500, marginBottom: 2 }}>{f.label}</div>
                          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>{f.note}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended actions */}
            {result.recommended_actions?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: "#4a4a60", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                  Recommended Next Steps
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.recommended_actions.map((action, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 14px",
                      background: "#12121a",
                      border: "1px solid #1e1e2e",
                      borderRadius: 6, fontSize: 13, color: "#94a3b8", lineHeight: 1.5
                    }}>
                      <span style={{ color: "#e85d26", flexShrink: 0, fontSize: 11, marginTop: 2 }}>→</span>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                width: "100%", padding: "12px",
                background: "transparent",
                border: "1px solid #2a2a3a",
                borderRadius: 8, cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 13, color: "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#e85d26"; e.target.style.color = "#e85d26"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a3a"; e.target.style.color = "#6b7280"; }}
            >
              ← Qualify Another Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
