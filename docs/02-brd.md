# Xchange — Business Requirements Document (BRD)

Version: 1.0 | Doc 2 of 6 | Market: India (Bengaluru first) | Companion: 01 PRD

All figures marked assumption are planning inputs to be validated in the concierge beta, not forecasts.

## 1. Executive summary

Xchange is a peer-to-peer exchange marketplace where people trade things they own for things they want, with optional cash adjustment. Its differentiator is a matching engine that discovers two-way and three-way exchange cycles, so users do not need to find the one person who wants what they have and has what they want.

The business bet: a trusted, dense local network of exchanges can become a repeat-use circular-economy platform, monetised through visibility, convenience and trust services rather than by charging for the exchange itself.

## 2. Business objectives

| ID | Objective | Measure | Target (assumption) |
| --- | --- | --- | --- |
| BO-1 | Prove liquidity | Exchanges per 100 active listings per month | 8 or more within the launch cluster |
| BO-2 | Prove trust | Dispute rate; repeat trading | Disputes under 3%; 30-day repeat trading above 25% |
| BO-3 | Prove the differentiator | Completed 3-way chains | 10 completed; chain completion above 60% |
| BO-4 | Prove willingness to pay | Paying share of monthly actives | 2 to 4% on Plus or promotions by month 9 |
| BO-5 | Capital efficiency | Cost per completed exchange | Under ₹150 on organic and community channels |

## 3. Problem and opportunity

Indian used-goods sellers currently rely on OLX, Facebook Marketplace and WhatsApp groups. These are money-first, haggle-heavy and low in trust.

OLX reports around 30 million monthly users, which shows large latent demand for second-hand trade.

Students and young professionals own items they no longer use and want something else more than cash.

Existing barter apps are early stage and local. Xchange competes on liquidity design, trust and chain matching. Competitive claims must be validated by hands-on testing of Sloop, Baater, Swapll and DeKeLe before they are used in marketing.

## 4. Target market and segmentation

| Segment | Why first | Typical items | Priority |
| --- | --- | --- | --- |
| Students | Frequent need change, low cash | Books, cycles, gadgets, furniture | 1 |
| Young professionals | Frequent upgrades, tech density | Electronics, furniture, accessories | 1 |
| Hobbyists | High-value niche items | Instruments, cameras, sports gear | 2 |
| Families | Large item churn | Appliances, kids items, furniture | 3 |
| Small business | Surplus inventory | Tools, equipment | Later (v2) |

Launch cluster: 3 to 5 adjacent Bengaluru neighbourhoods (candidates HSR Layout, Koramangala, Indiranagar, Whitefield) plus 2 to 3 college campuses.

## 5. Value proposition

| Stakeholder | Value |
| --- | --- |
| Item owner | Convert idle items into wanted items without needing cash or a buyer |
| Item seeker | Acquire things at lower cost by trading what they already own |
| Community | Reduced waste, local circular economy |
| Xchange | Network effects from matching density; data advantage for valuation and matching |

## 6. Business model

### 6.1 Principles

Core exchange is free forever to build liquidity.

Monetise convenience, visibility and trust, not the swap itself.

No stored-value wallet, credits, escrow or fund holding until counsel confirms regulatory position.

### 6.2 Revenue streams

| Stream | Description | Price hypothesis | Stage |
| --- | --- | --- | --- |
| Featured listings | Boost visibility for 3 to 7 days | ₹49 to ₹149 | v1.0 |
| Xchange Plus | Advanced alerts, extra filters, priority matching, more active listings, analytics | ₹99 to ₹199 per month | v1.0 |
| Verified badge | Optional ID verification | ₹49 to ₹99 one time | v1.5 |
| Trade protection | Optional inspection or protection, partner-based | Per transaction | v2.0 |
| Delivery referral | Commission from logistics partners | 5 to 15% of fee | v2.0 |
| Business accounts | Bulk listings, API, B2B swaps | Custom | v2.0 |
| Partnerships | Refurbishers, recyclers, brands offering trade-in | Revenue share | v2.0 |

All prices are experiments to be A/B tested. Pricing excludes applicable GST.

### 6.3 Unit economics model (illustrative, assumption)

Let MAU = monthly active users, p = paying conversion, ARPPU = average monthly revenue per paying user.

Monthly revenue ≈ MAU × p × ARPPU.

| Scenario | MAU | p | ARPPU | Monthly revenue |
| --- | --- | --- | --- | --- |
| Conservative | 20,000 | 2% | ₹120 | ₹48,000 |
| Base | 50,000 | 3% | ₹140 | ₹210,000 |
| Optimistic | 100,000 | 4% | ₹160 | ₹640,000 |

Interpretation: subscription alone will not carry the company at city scale. Plan for promotions, verification and partner revenue to reach meaningful income, and treat this as a strong reason to stay lean.

### 6.4 Cost structure (monthly, assumption, India, lean team)

| Item | Estimate |
| --- | --- |
| Cloud and infrastructure (v0.1 to v1.0) | ₹20,000 to ₹80,000 |
| AI API usage (Gemini) | ₹5,000 to ₹50,000 depending on listing volume |
| SMS OTP and notifications | ₹5,000 to ₹30,000 |
| Maps and geocoding | ₹2,000 to ₹20,000 |
| Moderation (part-time to start) | ₹30,000 to ₹80,000 |
| Community marketing and campus ambassadors | ₹50,000 to ₹2,00,000 |
| Legal and compliance (one-time plus retainer) | ₹1,00,000 to ₹3,00,000 one-time |
| Team | Founder-led plus 2 to 4 engineers and 1 designer initially |

## 7. Go-to-market

| Window | Objective | Target (assumption) |
| --- | --- | --- |
| Days 1 to 15 | Customer discovery | 50 interviews |
| Days 16 to 30 | Seed supply | 200 listings, partly founder-assisted |
| Days 31 to 45 | Closed concierge beta | 100 users |
| Days 46 to 60 | Local public launch | 500 users |
| Days 61 to 90 | Retention and matching tuning | 1,000 users |

Channels: campus clubs, apartment associations, tech-park communities, local WhatsApp and Telegram groups, Instagram and YouTube creators in sustainability and gadgets, referral program (both parties receive Plus trial days).

Concierge programme: a founder-run service manually proposing swaps to learn rejection reasons, price tolerance and category demand before automating.

## 8. Business requirements

| ID | Requirement | Linked PRD section |
| --- | --- | --- |
| BR-1 | Users must be able to list, discover and complete exchanges without paying | 6.3 to 6.7 |
| BR-2 | The platform must capture exchange outcome data (accept, reject, reason) to improve matching | 7, 10 |
| BR-3 | The platform must support optional cash adjustment between users without the platform holding funds | 6.5 |
| BR-4 | The platform must enforce prohibited-item and safety policies | 8 |
| BR-5 | The platform must support paid visibility and subscription features without blocking core exchange | 11 (v1.0) |
| BR-6 | The platform must comply with DPDP and applicable Indian e-commerce and consumer rules | 9 |
| BR-7 | The platform must provide admin tooling for moderation, analytics and dispute handling | 6.8 |
| BR-8 | The architecture must support multi-party trades without schema redesign | System Design |
| BR-9 | The product must be launchable by city, with feature flags per city | System Design |

## 9. Legal and regulatory considerations

This section is not legal advice. Obtain counsel before public launch.

| Area | Consideration | Action |
| --- | --- | --- |
| Intermediary status | Marketplace may be treated as an intermediary or e-commerce entity | Counsel to confirm structure and obligations, grievance officer, takedown timelines |
| Consumer Protection and E-Commerce Rules | Seller disclosures, grievance redress; 2026 amendments scheduled from 1 Jan 2027 | Review against rules in force at launch |
| DPDP Act and Rules | Consent notices, purpose limitation, data principal rights, breach notification, deletion | Consent flows, retention policy, data processing register |
| Payments | Cash adjustment done between users outside the platform at v0.x | No custody of funds; revisit with counsel before any payment feature |
| Prohibited goods | Weapons, drugs, counterfeit, stolen, regulated medicines etc. | Policy, keyword and image moderation, takedown SLA |
| GST and tax | Subscription and promotion revenue taxable | Register entity and GST, invoicing |
| Children | Minors using platform | Age gate 18+ initially; parental consent rules under DPDP if opened later |
| IP and counterfeit | Brand misuse | Notice and takedown procedure |
| App store policy | Apple and Google rules on UGC, account deletion, payments | Report and block in app, in-app deletion, use store billing for digital subscriptions |

## 10. Risk register

| ID | Risk | Impact | Probability | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| R1 | Insufficient local liquidity | Critical | High | Dense cluster, seeding, concierge matching | Founder |
| R2 | Trust incident (theft, harassment) | Critical | Medium | OTP, ratings, safe points, report and ban, insurance later | Trust lead |
| R3 | Low willingness to pay | High | Medium | Multiple revenue experiments, low cost base | Founder |
| R4 | Competitor copies chains | Medium | Medium | Data moat, speed, community | Product |
| R5 | AI mis-valuation harms trust | Medium | Medium | Ranges, disclaimers, user control, feedback loop | Product |
| R6 | Regulatory shift | High | Medium | Counsel, modular compliance | Legal |
| R7 | Moderation cost grows faster than revenue | Medium | Medium | Automated moderation, user reporting | Ops |
| R8 | Chain complexity leaves users stranded | High | Medium | Unanimous accept, locks only after consent, no-penalty dissolve | Eng |

## 11. Success metrics and KPIs

| Category | KPI | Definition |
| --- | --- | --- |
| North star | Exchanges per 100 active listings per month | Completed trades divided by active listings times 100 |
| Liquidity | Time to first offer | Median hours from publish to first offer |
| Liquidity | Listings with at least one offer | Share within 7 days |
| Quality | Offer acceptance rate | Accepted divided by sent |
| Trust | Dispute rate | Disputed divided by completed |
| Trust | Average rating | Mean of reviews |
| Growth | Weekly active traders | Users sending or receiving an offer |
| Retention | 30-day repeat trading | Users completing 2 or more trades in 30 days |
| Chain | Chain completion rate | Completed chains divided by proposed chains accepted by all |
| Revenue | Paying conversion | Paying divided by MAU |

## 12. Stage gates and investment logic

| Gate | Condition to proceed | Spend authorised |
| --- | --- | --- |
| G0 | Customer discovery: at least 30 of 50 interviewees would trade; legal pre-check complete | Foundations, v0.1 build |
| G1 | Concierge beta hits 20 completed trades | v0.2 and v0.3 |
| G2 | 8 or more exchanges per 100 listings; disputes under 3% | Public launch marketing, v1.0 chains |
| G3 | 10 completed chains; paying conversion above 1.5% | Second city, v2.0 |

## 13. Assumptions and dependencies

SMS OTP provider with DLT registration for India.

Gemini API availability and pricing as of build time; keep an abstraction layer to switch AI providers.

Google Maps or Mapbox for geocoding and maps.

Apple Developer and Google Play accounts; compliance with store policy.

Legal entity incorporated before launch.

## 14. Stakeholders and RACI

| Activity | Founder | Product | Engineering | Design | Legal | Ops and Moderation |
| --- | --- | --- | --- | --- | --- | --- |
| Strategy and pricing | A | R | C | C | C | I |
| PRD and roadmap | A | R | C | C | I | I |
| Build and release | I | A | R | C | I | I |
| Trust policy | A | R | C | I | R | R |
| Compliance | A | C | I | I | R | I |
| Community and seeding | A | C | I | I | I | R |

R responsible, A accountable, C consulted, I informed.
