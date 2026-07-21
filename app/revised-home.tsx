"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

type SupportType = "free" | "public" | "private";
type Step = "feeling" | "safety" | "support" | "access" | "challenges" | "results";
type Region = "north" | "south" | "east" | "west" | "central";
type ProviderKind = "psychiatrist" | "therapist";
type SupportGoal = "talk-now" | "therapy" | "medical" | "practical" | "unsure";
type SafetyAnswer = "immediate" | "concern" | "safe" | "prefer-not";
type FundingPreference = "free" | "subsidised" | "private" | "any";
type CareMode = "either" | "in-person" | "online";
type AgeGroup = "adult" | "under-18" | "someone-else";
type LanguagePreference = "any" | "english" | "mandarin" | "malay" | "tamil";
type ModalKind = "urgent" | "privacy" | "methodology" | null;
type ProviderInfoFilter = "any" | "published-fees" | "financial-help" | "weekend" | "evening" | "online" | "appointment-only";
type ProviderSort = "area" | "name" | "published" | "availability";

type Resource = {
  name: string;
  type: SupportType;
  label: string;
  description?: string;
  fit: string;
  details: string;
  action: string;
  href: string;
  accent: string;
  tags: string[];
  providerKind?: ProviderKind;
};

type Provider = {
  name: string;
  kind: ProviderKind;
  region: Region;
  role: string;
  practice: string;
  address: string;
  phone?: string;
  description: string;
  href: string;
  source: string;
  bookingHref?: string;
  sourceHref?: string;
};

type Helpline = {
  name: string;
  category: "General support" | "Specialist and safety support" | "Social support";
  hours: string;
  phone: string;
  tel: string;
};

type ClinicDetails = { fees: string; booking: string; hours: string };

type Clinic = Provider & ClinicDetails & {
  id: string;
  locationGroup: string;
  careSetting: "Private" | "Charity / IPC";
  hasPublishedFees: boolean;
  hasFinancialHelp: boolean;
  hasSaturday: boolean;
  hasSunday: boolean;
  hasEvening: boolean;
  appointmentOnly: boolean;
  hasWhatsapp: boolean;
  hasOnline: boolean;
};

type Props = {
  providers: Provider[];
  resources: Resource[];
  helplines: Helpline[];
  helplineDescriptions: Record<string, string>;
  regions: Array<[Region, string, string]>;
  regionLabels: Record<Region, string>;
  getClinicDetails: (provider: Provider) => ClinicDetails;
  getLocationGroup: (provider: Provider) => string;
};

const stepOrder: Step[] = ["feeling", "safety", "support", "access", "challenges", "results"];
const HELPLINE_REVIEW_DATE = "20 July 2026";

const challengeOptions = [
  ["low-mood", "Low mood or loss of interest"],
  ["anxiety", "Anxiety, worry or panic"],
  ["stress", "Stress or burnout"],
  ["sleep", "Sleep difficulties"],
  ["grief", "Grief or loss"],
  ["relationships", "Relationships or family"],
  ["work-school", "Work or school"],
  ["trauma", "Trauma or abuse"],
  ["eating", "Eating or body image"],
  ["substance", "Alcohol or substance use"],
  ["self-harm", "Self-harm or suicidal thoughts"],
  ["something-else", "Something else"],
  ["unsure", "I’m not sure"],
] as const;

const supportGoals: Array<[SupportGoal, string, string]> = [
  ["talk-now", "Talk to someone today", "Immediate emotional support from a trained person."],
  ["therapy", "Ongoing counselling or therapy", "Regular conversations to work through thoughts, emotions or situations."],
  ["medical", "Assessment or medication advice", "Speak with a doctor or psychiatrist about symptoms and treatment."],
  ["practical", "Practical or social support", "Help with family, finances, housing, school, work or personal safety."],
  ["unsure", "I’m not sure—help me choose", "Start with someone who can listen and guide you."],
];

const fundingOptions: Array<[FundingPreference, string]> = [
  ["free", "Free only"],
  ["subsidised", "Subsidised care"],
  ["private", "Private care is okay"],
  ["any", "Show all suitable options"],
];

const modeOptions: Array<[CareMode, string]> = [
  ["either", "Either"],
  ["in-person", "In person"],
  ["online", "Online"],
];

const ageOptions: Array<[AgeGroup, string]> = [
  ["adult", "Me, 18 or older"],
  ["under-18", "Me, under 18"],
  ["someone-else", "Someone else"],
];

const languageOptions: Array<[LanguagePreference, string]> = [
  ["any", "Any language"],
  ["english", "English"],
  ["mandarin", "中文"],
  ["malay", "Bahasa Melayu"],
  ["tamil", "தமிழ்"],
];

const FAMILY_SERVICE_RESOURCE: Resource = {
  name: "Family Service Centres and ComCare",
  type: "free",
  label: "Practical and social support",
  description: "Community-based help with family, financial, housing and other social concerns, including referrals when more support is needed.",
  fit: "A useful first stop when emotional distress is connected to practical pressures at home, work or school.",
  details: "ComCare: 1800 222 0000 · daily, 7am to midnight",
  action: "Find social support",
  href: "https://www.msf.gov.sg/what-we-do/famatfsc/family-assist/family-service-centres",
  accent: "blue",
  tags: ["stress", "relationships", "work-school", "trauma", "unsure", "something-else"],
};

const inferredPatterns: Array<[string, RegExp]> = [
  ["low-mood", /\b(depress(?:ed|ion)?|low|sad|hopeless|empty|no motivation|can(?:not|'t) enjoy)\b/i],
  ["anxiety", /\b(anxious|anxiety|panic|worried|worry|on edge|racing thoughts)\b/i],
  ["stress", /\b(stress(?:ed)?|burnt? out|overwhelm(?:ed)?|exhausted|cannot cope|can't cope)\b/i],
  ["sleep", /\b(insomnia|can(?:not|'t) sleep|not sleeping|sleep problems?|nightmares?)\b/i],
  ["grief", /\b(grief|grieving|bereav(?:ed|ement)|died|death|loss|passed away)\b/i],
  ["relationships", /\b(breakup|relationship|marriage|partner|family|divorce|lonely|friendship)\b/i],
  ["work-school", /\b(work|job|boss|school|exam|study|studies|university|polytechnic)\b/i],
  ["trauma", /\b(trauma|abuse|assault|violence|unsafe|flashback)\b/i],
  ["eating", /\b(eating|food|body image|weight|binge|purge)\b/i],
  ["substance", /\b(alcohol|drugs?|substance|addiction|gambling)\b/i],
];

const urgentPattern = /suicid|self[- ]?harm|hurt myself|kill myself|end my life|take my life|ending it all|better off dead|don(?:'|’)t want to (?:live|wake up)|do not want to (?:live|wake up)|can(?:'|’)t go on|cannot go on|want to disappear|overdose|jump off|not worth living/i;
const clearlyNegatedPattern = /\b(?:i am|i'm|im) not suicidal\b|\bnot going to hurt myself\b/i;

function hasUrgentLanguage(value: string) {
  return urgentPattern.test(value) && !clearlyNegatedPattern.test(value);
}

function inferChallenges(value: string) {
  const matches = inferredPatterns.filter(([, pattern]) => pattern.test(value)).map(([id]) => id);
  if (hasUrgentLanguage(value)) matches.push("self-harm");
  return Array.from(new Set(matches));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export default function RevisedHome({
  providers,
  resources,
  helplines,
  helplineDescriptions,
  regions,
  regionLabels,
  getClinicDetails,
  getLocationGroup,
}: Props) {
  const [step, setStep] = useState<Step>("feeling");
  const [feeling, setFeeling] = useState("");
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [safetyAnswer, setSafetyAnswer] = useState<SafetyAnswer | null>(null);
  const [supportGoal, setSupportGoal] = useState<SupportGoal | null>(null);
  const [funding, setFunding] = useState<FundingPreference>("any");
  const [careMode, setCareMode] = useState<CareMode>("either");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");
  const [language, setLanguage] = useState<LanguagePreference>("any");
  const [providerKind, setProviderKind] = useState<ProviderKind | null>(null);
  const [providerRegion, setProviderRegion] = useState<Region | null>(null);
  const [providerQuery, setProviderQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [infoFilter, setInfoFilter] = useState<ProviderInfoFilter>("any");
  const [providerSort, setProviderSort] = useState<ProviderSort>("area");
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [urgentContext, setUrgentContext] = useState<"immediate" | "support">("support");
  const [safetyFlagged, setSafetyFlagged] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentStep = stepOrder.indexOf(step);
  const inferred = useMemo(() => inferChallenges(feeling), [feeling]);
  const allResources = useMemo(() => [...resources, FAMILY_SERVICE_RESOURCE], [resources]);

  useEffect(() => {
    if (!activeModal) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [activeModal]);

  useEffect(() => {
    if (step === "results") resultsHeadingRef.current?.focus();
  }, [step, providerKind, providerRegion]);

  const clinics = useMemo(() => {
    const unique = new Map<string, Provider>();
    providers.forEach((provider) => {
      const key = `${provider.kind}|${provider.practice}|${provider.address}`;
      if (!unique.has(key)) unique.set(key, provider);
    });

    return Array.from(unique.values()).map((provider): Clinic => {
      const details = getClinicDetails(provider);
      const searchable = `${details.fees} ${details.booking} ${details.hours}`;
      return {
        ...provider,
        ...details,
        id: slugify(`${provider.kind}-${provider.practice}-${provider.address}`),
        name: provider.practice,
        role: provider.kind === "psychiatrist" ? "Psychiatry clinic" : "Psychology, therapy and counselling clinic",
        description:
          provider.practice.includes("EMCC")
            ? provider.description
            : provider.kind === "psychiatrist"
              ? "Private psychiatric assessment, treatment planning and follow-up care."
              : provider.description,
        locationGroup: getLocationGroup(provider),
        careSetting: provider.practice.includes("EMCC") ? "Charity / IPC" : "Private",
        hasPublishedFees: !/not published/i.test(details.fees),
        hasFinancialHelp: /subsid|sliding scale|financial assistance|income tier/i.test(details.fees),
        hasSaturday: /\bSat(?:urday)?\b/i.test(details.hours),
        hasSunday: /\bSun(?:day)?\b|7 days/i.test(details.hours),
        hasEvening: /(?:7|8|9|10)(?::\d{2})?pm/i.test(details.hours),
        appointmentOnly: /appointment only|by appointment/i.test(searchable),
        hasWhatsapp: /whatsapp/i.test(details.booking),
        hasOnline: /online|tele[- ]?(?:health|therapy|counselling)|video/i.test(searchable),
      };
    });
  }, [getClinicDetails, getLocationGroup, providers]);

  const regionClinics = useMemo(
    () => clinics.filter((clinic) => clinic.kind === providerKind && clinic.region === providerRegion),
    [clinics, providerKind, providerRegion],
  );

  const availableLocations = useMemo(
    () => Array.from(new Set(regionClinics.map((clinic) => clinic.locationGroup))).sort((a, b) => a.localeCompare(b)),
    [regionClinics],
  );

  const visibleProviders = useMemo(() => {
    const query = providerQuery.trim().toLowerCase();
    const filtered = regionClinics.filter((clinic) => {
      const haystack = `${clinic.name} ${clinic.address} ${clinic.locationGroup} ${clinic.description}`.toLowerCase();
      if (query && !haystack.includes(query)) return false;
      if (locationFilter !== "all" && clinic.locationGroup !== locationFilter) return false;
      if (infoFilter === "published-fees" && !clinic.hasPublishedFees) return false;
      if (infoFilter === "financial-help" && !clinic.hasFinancialHelp) return false;
      if (infoFilter === "weekend" && !clinic.hasSaturday && !clinic.hasSunday) return false;
      if (infoFilter === "evening" && !clinic.hasEvening) return false;
      if (infoFilter === "online" && !clinic.hasOnline) return false;
      if (infoFilter === "appointment-only" && !clinic.appointmentOnly) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (providerSort === "name") return a.name.localeCompare(b.name);
      if (providerSort === "published") return Number(b.hasPublishedFees) - Number(a.hasPublishedFees) || a.name.localeCompare(b.name);
      if (providerSort === "availability") {
        const aScore = Number(a.hasEvening) + Number(a.hasSaturday) + Number(a.hasSunday) + Number(a.hasOnline);
        const bScore = Number(b.hasEvening) + Number(b.hasSaturday) + Number(b.hasSunday) + Number(b.hasOnline);
        return bScore - aScore || a.name.localeCompare(b.name);
      }
      return a.locationGroup.localeCompare(b.locationGroup) || a.name.localeCompare(b.name);
    });
  }, [infoFilter, locationFilter, providerQuery, providerSort, regionClinics]);

  const shortlistedClinics = useMemo(
    () => shortlistedIds.map((id) => clinics.find((clinic) => clinic.id === id)).filter((clinic): clinic is Clinic => Boolean(clinic)),
    [clinics, shortlistedIds],
  );

  const recommendations = useMemo(() => {
    const fundingMatches = allResources.filter((resource) => {
      if (funding === "free") return resource.type === "free";
      if (funding === "subsidised") return resource.type === "free" || resource.type === "public";
      return true;
    });

    const scored = fundingMatches.map((resource) => {
      const name = resource.name.toLowerCase();
      const content = `${resource.name} ${resource.label} ${resource.description ?? ""} ${resource.details}`.toLowerCase();
      let score = selectedChallenges.filter((challenge) => resource.tags.includes(challenge)).length * 4;

      if (funding === resource.type) score += 12;
      if (
        funding === "subsidised" &&
        /subsid|sliding|means-tested|income-based|affordable|charity|ncss/.test(content)
      ) {
        score += 30;
      }
      if (funding === "private" && resource.type === "private") score += 12;
      if (supportGoal === "talk-now") {
        if (name.includes("national mindline")) score += 40;
        if (name.includes("samaritans")) score += 34;
        if (/24\/7|emotional support/.test(content)) score += 8;
      }
      if (supportGoal === "therapy") {
        if (resource.providerKind === "therapist") score += 38;
        if (/counselling|therapy|psycholog/.test(content)) score += 12;
        if (name.includes("emcc")) score += 16;
      }
      if (supportGoal === "medical") {
        if (resource.providerKind === "psychiatrist") score += 40;
        if (/polyclinic|institute of mental health|hospital/.test(name)) score += 20;
      }
      if (supportGoal === "practical") {
        if (name.includes("family service centres")) score += 50;
        if (/social|family|financial|housing/.test(content)) score += 15;
      }
      if (supportGoal === "unsure" && name.includes("national mindline")) score += 40;
      if (ageGroup === "under-18" && /youth|children|kk women/.test(content)) score += 18;
      if (careMode === "online" && /online|app|whatsapp|webchat/.test(content)) score += 10;
      if (selectedChallenges.includes("self-harm") && name.includes("samaritans")) score += 45;

      return { resource, score };
    });

    const resultLimit = funding === "subsidised" ? 8 : 3;
    return scored.sort((a, b) => b.score - a.score).slice(0, resultLimit).map(({ resource }) => resource);
  }, [ageGroup, allResources, careMode, funding, selectedChallenges, supportGoal]);

  function submitFeeling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = feeling.trim() || "I’m not sure yet";
    setFeeling(trimmed);
    const detected = inferChallenges(trimmed);
    setSelectedChallenges(detected);
    if (hasUrgentLanguage(trimmed)) {
      setSafetyFlagged(true);
      setUrgentContext("support");
      setActiveModal("urgent");
    }
    setStep("safety");
  }

  function chooseSafety(answer: SafetyAnswer) {
    setSafetyAnswer(answer);
    if (answer === "immediate" || answer === "concern") {
      setSafetyFlagged(true);
      setUrgentContext(answer === "immediate" ? "immediate" : "support");
      setActiveModal("urgent");
    }
    setStep("support");
  }

  function chooseSupportGoal(goal: SupportGoal) {
    setSupportGoal(goal);
    setStep("access");
  }

  function toggleChallenge(id: string) {
    const selecting = !selectedChallenges.includes(id);
    if (id === "self-harm" && selecting) {
      setSafetyFlagged(true);
      setUrgentContext("support");
      setActiveModal("urgent");
    }
    setSelectedChallenges((current) => {
      if (id === "unsure") return selecting ? ["unsure"] : [];
      const withoutUnsure = current.filter((item) => item !== "unsure");
      return selecting ? [...withoutUnsure, id] : withoutUnsure.filter((item) => item !== id);
    });
  }

  function showResults() {
    setProviderKind(null);
    setProviderRegion(null);
    setStep("results");
  }

  function openProviderFinder(kind: ProviderKind) {
    setProviderKind(kind);
    setProviderRegion(null);
    setProviderQuery("");
    setLocationFilter("all");
    setInfoFilter("any");
    setProviderSort("area");
  }

  function chooseProviderRegion(region: Region) {
    setProviderRegion(region);
    setProviderQuery("");
    setLocationFilter("all");
    setInfoFilter("any");
  }

  function resetProviderFilters() {
    setProviderQuery("");
    setLocationFilter("all");
    setInfoFilter("any");
    setProviderSort("area");
  }

  function toggleShortlist(clinic: Clinic) {
    setShortlistedIds((current) => {
      if (current.includes(clinic.id)) return current.filter((id) => id !== clinic.id);
      if (current.length >= 3) {
        setStatusMessage("You can compare up to three clinics at a time.");
        return current;
      }
      setStatusMessage(`${clinic.name} added to your shortlist.`);
      return [...current, clinic.id];
    });
  }

  async function copyCorrectionDraft(clinic: Clinic) {
    const draft = `Get Help SG correction\nClinic: ${clinic.name}\nListing ID: ${clinic.id}\nIncorrect field:\nSuggested correction:\nSupporting source URL:\n\nPlease do not include personal or medical information.`;
    try {
      await navigator.clipboard.writeText(draft);
      setStatusMessage("Correction note copied. You can paste it into your preferred feedback channel.");
    } catch {
      setStatusMessage("We couldn’t copy the note. Please use the clinic’s official source to verify the information.");
    }
  }

  function goBack() {
    const index = stepOrder.indexOf(step);
    if (index <= 0) return;
    setProviderKind(null);
    setProviderRegion(null);
    setStep(stepOrder[index - 1]);
  }

  function restart() {
    setStep("feeling");
    setFeeling("");
    setSelectedChallenges([]);
    setSafetyAnswer(null);
    setSupportGoal(null);
    setFunding("any");
    setCareMode("either");
    setAgeGroup("adult");
    setLanguage("any");
    setProviderKind(null);
    setProviderRegion(null);
    setShortlistedIds([]);
    setCompareOpen(false);
    setSafetyFlagged(false);
    setStatusMessage("");
  }

  const challengeLabels = selectedChallenges
    .map((id) => challengeOptions.find(([optionId]) => optionId === id)?.[1])
    .filter(Boolean) as string[];
  const goalLabel = supportGoals.find(([id]) => id === supportGoal)?.[1];
  const fundingLabel = fundingOptions.find(([id]) => id === funding)?.[1];
  const languageLabel = languageOptions.find(([id]) => id === language)?.[1];

  function renderResourceCard(resource: Resource, index: number) {
    const isPrimary = index === 0;
    return (
      <article className={`resource-card improved-resource ${resource.accent} ${isPrimary ? "primary-resource" : ""}`} key={resource.name}>
        <div className="resource-card-top">
          <span className="resource-label">{isPrimary ? "Recommended starting point" : resource.label}</span>
          <span className="resource-dot" />
        </div>
        <h3>{resource.name}</h3>
        <p>{resource.description}</p>
        <div className="fit-line"><span>WHY IT MAY FIT</span>{isPrimary ? personalizedReason(resource) : resource.fit}</div>
        <div className="resource-bottom">
          <span className="resource-details">{resource.details}</span>
          {resource.providerKind ? (
            <button className="resource-provider-button" type="button" onClick={() => openProviderFinder(resource.providerKind!)}>
              Find clinics <span>↗</span>
            </button>
          ) : (
            <a href={resource.href} target="_blank" rel="noreferrer" aria-label={`${resource.action}—opens in a new tab`}>
              {resource.action} <span>↗</span>
            </a>
          )}
        </div>
      </article>
    );
  }

  function personalizedReason(resource: Resource) {
    if (supportGoal === "talk-now") return "You said that talking to someone today would help. This offers a direct, low-barrier way to reach support.";
    if (supportGoal === "therapy") return `You want ongoing counselling or therapy, with ${fundingLabel?.toLowerCase() ?? "flexible access"}.`;
    if (supportGoal === "medical") return `You want assessment or medication advice, with ${fundingLabel?.toLowerCase() ?? "flexible access"}.`;
    if (supportGoal === "practical") return "You asked for practical or social support alongside emotional support.";
    return resource.fit;
  }

  function renderClinicCard(clinic: Clinic) {
    const shortlisted = shortlistedIds.includes(clinic.id);
    const phoneHref = clinic.phone ? `tel:${clinic.phone.split("/")[0].replace(/[^\d+]/g, "")}` : null;
    const chips = [
      clinic.hasPublishedFees ? "Fee published" : "Fee not published",
      clinic.hasFinancialHelp ? "Financial help mentioned" : null,
      clinic.hasSaturday ? "Saturday hours" : null,
      clinic.hasSunday ? "Sunday hours" : null,
      clinic.hasEvening ? "Evening hours" : null,
      clinic.hasWhatsapp ? "WhatsApp" : null,
      clinic.hasOnline ? "Online option mentioned" : null,
    ].filter(Boolean).slice(0, 3) as string[];

    return (
      <article className="provider-card compact-provider" key={clinic.id}>
        <div className="provider-card-top">
          <span className="resource-label">{clinic.careSetting} · {clinic.locationGroup}</span>
          <button
            className="shortlist-button"
            type="button"
            aria-pressed={shortlisted}
            onClick={() => toggleShortlist(clinic)}
          >
            {shortlisted ? "Shortlisted ✓" : "+ Shortlist"}
          </button>
        </div>
        <h3>{clinic.name}</h3>
        <p className="provider-short-address">{clinic.address}</p>
        <div className="fact-chips" aria-label="Published clinic information">
          {chips.map((chip) => <span key={chip}>{chip}</span>)}
        </div>
        <div className="provider-quick-actions">
          {phoneHref && <a href={phoneHref}>Call clinic</a>}
          <a href={clinic.href} target="_blank" rel="noreferrer" aria-label={`Book or enquire with ${clinic.name}—opens in a new tab`}>
            Book or enquire ↗
          </a>
        </div>
        <details className="provider-disclosure">
          <summary>View clinic details</summary>
          <p>{clinic.description}</p>
          <dl className="provider-detail-list">
            <div><dt>Location</dt><dd>{clinic.address}</dd></div>
            <div><dt>Session fees</dt><dd>{clinic.fees}</dd></div>
            <div>
              <dt>How to book</dt>
              <dd>
                {clinic.bookingHref && clinic.booking.includes("website form") ? (
                  <>
                    {clinic.booking.split("website form")[0]}
                    <a href={clinic.bookingHref} target="_blank" rel="noreferrer">website form</a>
                    {clinic.booking.split("website form")[1]}
                  </>
                ) : clinic.booking}
              </dd>
            </div>
            <div><dt>Opening hours</dt><dd>{clinic.hours}</dd></div>
            <div><dt>Verification</dt><dd>Verification date not recorded—confirm details before booking.</dd></div>
          </dl>
          <div className="provider-source-actions">
            <a href={clinic.sourceHref ?? clinic.href} target="_blank" rel="noreferrer" aria-label={`View source for ${clinic.name}—opens in a new tab`}>Source: {clinic.source} ↗</a>
            <button type="button" onClick={() => copyCorrectionDraft(clinic)}>Copy correction note</button>
          </div>
        </details>
      </article>
    );
  }

  return (
    <main className="site-shell revised-shell">
      <header className="topbar revised-topbar">
        <Link className="brand" href="/" aria-label="Get Help SG home">
          <span className="brand-mark">+</span>
          <span>get help <em>/ sg</em></span>
        </Link>
        <div className="topbar-actions">
          <button className="privacy-link" type="button" onClick={() => setActiveModal("privacy")}>How privacy works</button>
          <button className="urgent-link" type="button" onClick={() => { setUrgentContext("support"); setActiveModal("urgent"); }}>
            Urgent help
          </button>
        </div>
      </header>

      <section className="hero-grid revised-hero">
        <div className="hero-copy">
          <p className="kicker"><span /> Singapore mental-health wayfinding</p>
          <h1>Small steps.<br /><span>Right support.</span></h1>
          <p className="hero-description">
            Tell us what is going on. We will help you choose a practical next step, then find Singapore services that fit.
          </p>
          <ul className="hero-promises">
            <li>No account</li>
            <li>No diagnosis</li>
            <li>Answers stay on this page</li>
          </ul>
        </div>

        <div className="conversation-panel revised-panel">
          <div className="panel-topline">
            <span>{providerKind ? "PROVIDER DIRECTORY" : "GET HELP / SG"}</span>
            <span className="panel-status"><span /> Singapore only</span>
          </div>

          {!providerKind && (
            <div className="progress-row" aria-label={`Step ${currentStep + 1} of ${stepOrder.length}`}>
              <span className="progress-count">0{currentStep + 1}</span>
              <div className="progress-track" aria-hidden="true"><span style={{ width: `${((currentStep + 1) / stepOrder.length) * 100}%` }} /></div>
              <span className="progress-total">0{stepOrder.length}</span>
            </div>
          )}

          {step !== "feeling" && !providerKind && (
            <div className="step-navigation">
              <button type="button" onClick={goBack}><span aria-hidden="true">←</span> Back</button>
            </div>
          )}

          {safetyFlagged && (
            <div className="persistent-safety-banner" role="status">
              <span>You can reach 24/7 support at any time.</span>
              <button type="button" onClick={() => { setUrgentContext("support"); setActiveModal("urgent"); }}>View urgent support</button>
            </div>
          )}

          <div className="conversation-body revised-body" aria-live="polite">
            {step !== "feeling" && !providerKind && (
              <details className="answer-summary">
                <summary>Your answers</summary>
                <div>
                  <span>{feeling}</span>
                  {goalLabel && <span>{goalLabel}</span>}
                  {challengeLabels.slice(0, 4).map((label) => <span key={label}>{label}</span>)}
                </div>
              </details>
            )}

            {step === "feeling" && (
              <section className="step-content first-step" aria-labelledby="feeling-title">
                <h2 className="question-label" id="feeling-title">How are things feeling today?</h2>
                <p className="question-help">Write as much or as little as you like. You can also choose “I’m not sure”.</p>
                <form className="feeling-form" onSubmit={submitFeeling}>
                  <label className="sr-only" htmlFor="feeling">How are things feeling today?</label>
                  <textarea
                    id="feeling"
                    value={feeling}
                    onChange={(event) => setFeeling(event.target.value)}
                    placeholder="For example: I’ve been feeling low and can’t sleep…"
                    rows={3}
                    autoFocus
                  />
                  <div className="form-footer">
                    <span className="privacy-caption">We use this only to suggest a starting point. It is not a diagnosis.</span>
                    <button className="send-button" type="submit" aria-label="Continue">→</button>
                  </div>
                </form>
                <div className="starter-chips" aria-label="Example responses">
                  {["I’m feeling low", "I’m very anxious", "I’m overwhelmed", "I’m not sure"].map((chip) => (
                    <button type="button" key={chip} onClick={() => setFeeling(chip)}>{chip}</button>
                  ))}
                </div>
              </section>
            )}

            {step === "safety" && (
              <section className="step-content option-step" aria-labelledby="safety-title">
                {inferred.length > 0 && (
                  <div className="inference-note">
                    <strong>What we noticed</strong>
                    <p>These are themes from your words—not a diagnosis. You can add or remove them later.</p>
                    <div className="fact-chips">{inferred.map((id) => <span key={id}>{challengeOptions.find(([optionId]) => optionId === id)?.[1]}</span>)}</div>
                  </div>
                )}
                <h2 className="question-label" id="safety-title">Before we continue, are you in immediate danger or worried you might hurt yourself or someone else?</h2>
                <p className="question-help">Your answer helps us put urgent support first. You can prefer not to say.</p>
                <div className="support-options">
                  {(
                    [
                      ["immediate", "Yes, right now", "Show emergency actions immediately."],
                      ["concern", "I’m having these thoughts, but I can stay safe for now", "Show people you can contact today."],
                      ["safe", "No", "Continue to support options."],
                      ["prefer-not", "Prefer not to say", "Continue without answering."],
                    ] as Array<[SafetyAnswer, string, string]>
                  ).map(([id, title, description], index) => (
                    <button className="support-card" type="button" key={id} onClick={() => chooseSafety(id)}>
                      <span className="option-number">0{index + 1}</span>
                      <span className="option-copy"><strong>{title}</strong><small>{description}</small></span>
                      <span className="option-arrow">→</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === "support" && (
              <section className="step-content option-step" aria-labelledby="support-title">
                <h2 className="question-label" id="support-title">What would feel most helpful right now?</h2>
                <p className="question-help">Choose the outcome you want. We will ask about cost and access next.</p>
                <div className="support-options">
                  {supportGoals.map(([id, title, description], index) => (
                    <button className="support-card" type="button" key={id} onClick={() => chooseSupportGoal(id)}>
                      <span className="option-number">0{index + 1}</span>
                      <span className="option-copy"><strong>{title}</strong><small>{description}</small></span>
                      <span className="option-arrow">→</span>
                    </button>
                  ))}
                </div>
                <aside className="professional-guide" aria-labelledby="professional-guide-title">
                  <div className="professional-guide-heading">
                    <div>
                      <p className="eyebrow">A quick guide</p>
                      <h3 id="professional-guide-title">Therapist or psychiatrist?</h3>
                    </div>
                    <span className="guide-mark" aria-hidden="true">?</span>
                  </div>
                  <p className="professional-guide-intro">Both can support your mental health. The main difference is whether you are looking for talk-based care, medical assessment, or both.</p>
                  <div className="professional-guide-grid">
                    <article className="professional-guide-card">
                      <p className="professional-guide-label">Therapist</p>
                      <h4>Counsellor, psychologist or psychotherapist</h4>
                      <p>Provides talk-based support to help you understand what you are going through, build coping skills and work through concerns.</p>
                      <p><strong>Consider this when:</strong> you want regular conversations about stress, anxiety, relationships, grief, trauma or difficult life situations.</p>
                    </article>
                    <article className="professional-guide-card">
                      <p className="professional-guide-label">Psychiatrist</p>
                      <h4>Medical doctor specialising in mental health</h4>
                      <p>Can assess mental health conditions, consider medication, monitor treatment and coordinate therapy or other care.</p>
                      <p><strong>Consider this when:</strong> symptoms are severe, persistent, disrupting daily life, or you want medical assessment or medication advice.</p>
                    </article>
                  </div>
                  <p className="professional-guide-note"><strong>Not sure where to start?</strong> That is okay. A GP, therapist or national mindline 1771 can help you work out the next step. If you may be in immediate danger, call 995 or 999.</p>
                  <a className="professional-guide-link" href="https://www.healthhub.sg/programmes/mindsg/seeking-support" target="_blank" rel="noreferrer">Learn more about mental health professionals <span>→</span></a>
                </aside>
              </section>
            )}

            {step === "access" && (
              <section className="step-content access-step" aria-labelledby="access-title">
                <h2 className="question-label" id="access-title">What kind of access works for you?</h2>
                <p className="question-help">These preferences help us narrow the pathway. You can adjust them later.</p>
                <fieldset className="choice-fieldset">
                  <legend>Cost and pathway</legend>
                  <div className="choice-pills">{fundingOptions.map(([id, label]) => <button className={funding === id ? "selected" : ""} type="button" aria-pressed={funding === id} key={id} onClick={() => setFunding(id)}>{label}</button>)}</div>
                </fieldset>
                <fieldset className="choice-fieldset">
                  <legend>Format</legend>
                  <div className="choice-pills">{modeOptions.map(([id, label]) => <button className={careMode === id ? "selected" : ""} type="button" aria-pressed={careMode === id} key={id} onClick={() => setCareMode(id)}>{label}</button>)}</div>
                </fieldset>
                <fieldset className="choice-fieldset">
                  <legend>Who is the support for?</legend>
                  <div className="choice-pills">{ageOptions.map(([id, label]) => <button className={ageGroup === id ? "selected" : ""} type="button" aria-pressed={ageGroup === id} key={id} onClick={() => setAgeGroup(id)}>{label}</button>)}</div>
                </fieldset>
                <fieldset className="choice-fieldset">
                  <legend>Preferred language</legend>
                  <div className="choice-pills">{languageOptions.map(([id, label]) => <button className={language === id ? "selected" : ""} type="button" aria-pressed={language === id} key={id} onClick={() => setLanguage(id)}>{label}</button>)}</div>
                  {language !== "any" && <small>Provider language availability is not yet verified. We will remind you to confirm it when booking.</small>}
                </fieldset>
                <div className="step-actions">
                  <button className="back-button" type="button" onClick={goBack}>← Back</button>
                  <button className="primary-button" type="button" onClick={() => setStep("challenges")}>Continue <span>→</span></button>
                </div>
              </section>
            )}

            {step === "challenges" && (
              <section className="step-content challenge-step" aria-labelledby="challenges-title">
                <h2 className="question-label" id="challenges-title">Does this match what you are experiencing?</h2>
                <p className="question-help">We preselected themes from your words. Add or remove anything that feels relevant.</p>
                <div className="challenge-grid">
                  {challengeOptions.map(([id, label]) => (
                    <label className={`check-card ${selectedChallenges.includes(id) ? "selected" : ""}`} key={id}>
                      <input type="checkbox" checked={selectedChallenges.includes(id)} onChange={() => toggleChallenge(id)} />
                      <span className="fake-checkbox">{selectedChallenges.includes(id) ? "✓" : ""}</span>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="step-actions">
                  <button className="back-button" type="button" onClick={goBack}>← Back</button>
                  <button className="primary-button" type="button" onClick={showResults}>Show my next step <span>→</span></button>
                </div>
              </section>
            )}

            {step === "results" && providerKind ? (
              <section id="provider-finder" className="step-content results-step provider-finder revised-provider-finder" aria-labelledby="provider-title">
                <div className="results-heading">
                  <div>
                    <p className="eyebrow">Verified directory snapshot</p>
                    <h2 className="question-label" id="provider-title" ref={resultsHeadingRef} tabIndex={-1}>Find a {providerKind === "psychiatrist" ? "psychiatry" : "counselling or therapy"} clinic</h2>
                  </div>
                  <span className="result-badge">SG</span>
                </div>
                <p className="question-help">Choose a region, then search and filter using only information recorded in the directory. Always confirm details with the clinic.</p>

                {!providerRegion ? (
                  <div className="region-options">
                    {regions.map(([region, title, description], index) => (
                      <button className="region-card" type="button" key={region} onClick={() => chooseProviderRegion(region)}>
                        <span className="option-number">0{index + 1}</span>
                        <span className="option-copy"><strong>{title}</strong><small>{description}</small></span>
                        <span className="option-arrow">→</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="provider-results-heading">
                      <div><p className="eyebrow">{regionLabels[providerRegion]}</p><h3>{providerKind === "psychiatrist" ? "Psychiatry clinics" : "Psychology, therapy and counselling clinics"}</h3></div>
                      <span className="provider-count" aria-live="polite">{visibleProviders.length} {visibleProviders.length === 1 ? "clinic" : "clinics"}</span>
                    </div>

                    <div className="provider-filter-panel">
                      <div className="filter-search">
                        <label htmlFor="provider-search">Search clinic or neighbourhood</label>
                        <input id="provider-search" type="search" value={providerQuery} onChange={(event) => setProviderQuery(event.target.value)} placeholder="Clinic, address, postal code or area" />
                      </div>
                      <div className="filter-grid">
                        <label>Neighbourhood<select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option value="all">All neighbourhoods</option>{availableLocations.map((location) => <option value={location} key={location}>{location}</option>)}</select></label>
                        <label>Published information<select value={infoFilter} onChange={(event) => setInfoFilter(event.target.value as ProviderInfoFilter)}><option value="any">Any</option><option value="published-fees">Published fees</option><option value="financial-help">Financial help mentioned</option><option value="weekend">Weekend hours</option><option value="evening">Evening hours</option><option value="online">Online option mentioned</option><option value="appointment-only">Appointment only</option></select></label>
                        <label>Sort by<select value={providerSort} onChange={(event) => setProviderSort(event.target.value as ProviderSort)}><option value="area">Neighbourhood</option><option value="name">Clinic name A–Z</option><option value="published">Published fees first</option><option value="availability">Flexible availability first</option></select></label>
                      </div>
                      {(providerQuery || locationFilter !== "all" || infoFilter !== "any" || providerSort !== "area") && <button className="clear-filters" type="button" onClick={resetProviderFilters}>Clear all filters</button>}
                    </div>

                    {shortlistedClinics.length > 0 && (
                      <div className="shortlist-tray" aria-live="polite">
                        <span><strong>{shortlistedClinics.length}</strong> {shortlistedClinics.length === 1 ? "clinic" : "clinics"} shortlisted</span>
                        <button type="button" onClick={() => setCompareOpen((open) => !open)}>{compareOpen ? "Hide comparison" : "Compare"}</button>
                      </div>
                    )}

                    {compareOpen && shortlistedClinics.length > 0 && (
                      <section className="compare-panel" aria-labelledby="compare-title">
                        <h3 id="compare-title">Compare shortlisted clinics</h3>
                        <p>Shortlists stay only in this browser session.</p>
                        <div className="compare-grid">
                          {shortlistedClinics.map((clinic) => (
                            <article key={clinic.id}>
                              <h4>{clinic.name}</h4>
                              <dl>
                                <div><dt>Area</dt><dd>{clinic.locationGroup}</dd></div>
                                <div><dt>Fees</dt><dd>{clinic.fees}</dd></div>
                                <div><dt>Hours</dt><dd>{clinic.hours}</dd></div>
                                <div><dt>Booking</dt><dd>{clinic.booking}</dd></div>
                                <div><dt>Verification</dt><dd>Not recorded</dd></div>
                              </dl>
                              <button type="button" onClick={() => toggleShortlist(clinic)}>Remove</button>
                            </article>
                          ))}
                        </div>
                      </section>
                    )}

                    {visibleProviders.length > 0 ? (
                      <div className="provider-list">{visibleProviders.map(renderClinicCard)}</div>
                    ) : (
                      <div className="provider-empty"><strong>No clinic matches these filters.</strong><p>Clear a filter, choose another region, or consider online support.</p><button type="button" className="clear-filters" onClick={resetProviderFilters}>Clear filters</button></div>
                    )}
                  </>
                )}
                <div className="results-footer">
                  <button className="back-button" type="button" onClick={() => { setProviderKind(null); setProviderRegion(null); }}>← Back to recommendations</button>
                  {providerRegion && <button className="text-button" type="button" onClick={() => setProviderRegion(null)}>Change region</button>}
                </div>
              </section>
            ) : step === "results" && (
              <section className="step-content results-step" aria-labelledby="results-title">
                <div className="results-heading">
                  <div><p className="eyebrow">Your suggested next step</p><h2 className="question-label" id="results-title" ref={resultsHeadingRef} tabIndex={-1}>A practical place to start</h2></div>
                  <span className="result-badge">SG</span>
                </div>
                <p className="question-help">These suggestions are based on the outcome and access preferences you selected. They are not a diagnosis.</p>

                {(safetyFlagged || safetyAnswer === "concern" || selectedChallenges.includes("self-harm")) && (
                  <div className="results-alert"><strong>Support is available right now.</strong><span>Talk with SOS at 1767 or national mindline at 1771 before exploring other options.</span><button type="button" onClick={() => { setUrgentContext("support"); setActiveModal("urgent"); }}>View 24/7 support →</button></div>
                )}

                <div className="result-preferences">
                  <span>{goalLabel}</span><span>{fundingLabel}</span><span>{careMode === "either" ? "Online or in person" : careMode}</span><span>{languageLabel}</span>
                </div>

                <div className="resource-list improved-resource-list">{recommendations.map(renderResourceCard)}</div>

                {recommendations.length > 1 && <p className="alternatives-note">The first option is the strongest match. The others may also fit if they feel more manageable.</p>}
                {language !== "any" && <div className="resource-note"><strong>Language preference</strong><span>Ask the service to confirm that {languageLabel} support is available before booking.</span></div>}

                <div className="help-now-strip">
                  <div><strong>Want to talk to someone first?</strong><span>national mindline and SOS are available 24/7.</span></div>
                  <a href="tel:1771">Call 1771</a><a href="tel:1767">Call 1767</a>
                </div>

                <details className="helpline-directory">
                  <summary>Browse phone, text and social support</summary>
                  <div className="helpline-directory-list">
                    {helplines.map((helpline) => {
                      const isWebLink = helpline.tel.startsWith("http");
                      return (
                        <article className="helpline-directory-item" key={helpline.name}>
                          <div>
                            <span>{helpline.category}</span>
                            <strong>{helpline.name}</strong>
                            <p>{helplineDescriptions[helpline.name] ?? "Contact the service directly to confirm what support is available."}</p>
                            <small>{helpline.hours}</small>
                          </div>
                          <a href={helpline.tel} target={isWebLink ? "_blank" : undefined} rel={isWebLink ? "noreferrer" : undefined}>{helpline.phone}</a>
                        </article>
                      );
                    })}
                  </div>
                </details>

                <div className="results-footer"><button className="back-button" type="button" onClick={goBack}>← Edit answers</button><button className="text-button" type="button" onClick={restart}>Start again</button></div>
              </section>
            )}
          </div>

        </div>
      </section>

      <section className="trust-strip" aria-label="About this guide">
        <article><strong>Your answers stay here</strong><p>No account is created. This version does not save your form answers or send them to analytics.</p><button type="button" onClick={() => setActiveModal("privacy")}>Privacy details</button></article>
        <article><strong>A verified directory snapshot</strong><p>Listings come from clinic websites, registries and professional directories. Details can still change.</p><button type="button" onClick={() => setActiveModal("methodology")}>How listings are checked</button></article>
        <article><strong>Guidance, not diagnosis</strong><p>The site helps you compare starting points. It does not assess or diagnose a mental-health condition.</p><a href="https://www.moh.gov.sg/seeking-healthcare/find-a-facility-or-service/mental-health-services/" target="_blank" rel="noreferrer">MOH mental-health services ↗</a></article>
      </section>

      <footer className="site-footer revised-footer">
        <span>For Singapore, with care.</span>
        <span>Helplines reviewed {HELPLINE_REVIEW_DATE} · Clinic details should be confirmed before booking</span>
      </footer>

      <span className="sr-only" aria-live="polite">{statusMessage}</span>

      {activeModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setActiveModal(null)}>
          <section className={`urgent-modal revised-modal ${activeModal !== "urgent" ? "information-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()} ref={dialogRef}>
            <button className="modal-close" type="button" aria-label="Close dialog" onClick={() => setActiveModal(null)} ref={closeButtonRef}>×</button>
            {activeModal === "urgent" && (
              <>
                <p className="eyebrow">Immediate support in Singapore</p>
                <h2 id="modal-title">{urgentContext === "immediate" ? "Get urgent help now." : "You can talk to someone now."}</h2>
                {urgentContext === "immediate" ? (
                  <p>Call 995 for an emergency ambulance or go to the nearest hospital emergency department. If there is an immediate threat or crime, call Police 999.</p>
                ) : (
                  <p>SOS and national mindline provide confidential support 24 hours a day.</p>
                )}
                <div className="urgent-options">
                  <a href="tel:995"><span>Emergency ambulance</span><strong>995 ↗</strong></a>
                  <a href="tel:999"><span>Police emergency</span><strong>999 ↗</strong></a>
                  <a href="tel:1767"><span>SOS 24/7 hotline</span><strong>1767 ↗</strong></a>
                  <a href="https://wa.me/6591511767" target="_blank" rel="noreferrer"><span>SOS CareText on WhatsApp</span><strong>9151 1767 ↗</strong></a>
                  <a href="tel:1771"><span>national mindline 24/7</span><strong>1771 ↗</strong></a>
                  <a href="https://wa.me/6566691771" target="_blank" rel="noreferrer"><span>national mindline on WhatsApp</span><strong>6669 1771 ↗</strong></a>
                </div>
                {urgentContext === "immediate" && <p className="safety-action-note">If you can, stay with someone you trust and move away from anything you could use to hurt yourself while help is on the way.</p>}
                <p className="modal-note"><strong>This website is not monitored.</strong> It cannot contact emergency services or send help for you. Police Emergency SMS 70999 is for situations where it is unsafe to call 999 or you cannot speak.</p>
              </>
            )}
            {activeModal === "privacy" && (
              <>
                <p className="eyebrow">Privacy in plain language</p>
                <h2 id="modal-title">Your answers stay on this page.</h2>
                <p>This version does not create an account, save your form answers, or send the words you type to analytics. Refreshing the page clears them.</p>
                <div className="information-list"><p><strong>Session-only shortlist.</strong> Clinics you shortlist remain only until you refresh or close the page.</p><p><strong>External actions.</strong> Calling, using WhatsApp or opening a clinic website takes you to a third party with its own privacy practices.</p><p><strong>No personal details needed.</strong> You do not need to enter your name, NRIC, phone number or diagnosis.</p></div>
              </>
            )}
            {activeModal === "methodology" && (
              <>
                <p className="eyebrow">Directory methodology</p>
                <h2 id="modal-title">A current snapshot, not a promise of completeness.</h2>
                <p>Clinic locations were assembled from official clinic websites, medical and professional directories, and association listings. Each location is deduplicated at clinic level.</p>
                <div className="information-list"><p><strong>Published facts only.</strong> Unknown fees, hours or language availability are labelled for confirmation rather than estimated.</p><p><strong>Region and neighbourhood.</strong> Locations use one shared classification across psychiatry and therapy results.</p><p><strong>Verification.</strong> Helplines were reviewed on {HELPLINE_REVIEW_DATE}. A clinic without a recorded review date is labelled accordingly.</p><p><strong>Corrections.</strong> “Copy correction note” creates a draft containing only the clinic name and listing ID—never your triage answers.</p></div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
