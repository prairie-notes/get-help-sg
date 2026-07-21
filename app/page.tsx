"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import RevisedHome from "./revised-home";

type SupportType = "free" | "public" | "private";
type Step = "feeling" | "support" | "challenges" | "results";
type Role = "assistant" | "user";
type Region = "north" | "south" | "east" | "west" | "central";
type ProviderKind = "psychiatrist" | "therapist";

type Message = {
  role: Role;
  text: string;
};

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

type Helpline = {
  name: string;
  category: "General support" | "Specialist and safety support" | "Social support";
  hours: string;
  phone: string;
  tel: string;
  description: string;
};

type Provider = {
  name: string;
  kind: ProviderKind;
  region: Region;
  role: string;
  practice: string;
  address: string;
  phone?: string;
  fees?: string;
  booking?: string;
  hours?: string;
  description: string;
  href: string;
  source: string;
};

type Clinic = Provider & {
  fees: string;
  booking: string;
  hours: string;
  locationGroup: string;
};

const challenges = [
  ["low-mood", "Low mood or depression"],
  ["anxiety", "Anxiety, worry or panic"],
  ["stress", "Stress or burnout"],
  ["sleep", "Sleep problems"],
  ["grief", "Grief or loss"],
  ["relationships", "Family or relationship problems"],
  ["work-school", "Work or school difficulties"],
  ["trauma", "Trauma or abuse"],
  ["eating", "Eating or body-image concerns"],
  ["substance", "Alcohol or substance use"],
  ["self-harm", "Self-harm or suicidal thoughts"],
  ["unsure", "I’m not sure"],
] as const;

const regionLabels: Record<Region, string> = {
  north: "North Singapore",
  south: "South Singapore",
  east: "East Singapore",
  west: "West Singapore",
  central: "Central Singapore",
};

const regions: Array<[Region, string, string]> = [
  ["north", "North Singapore", "Woodlands · Yishun · Ang Mo Kio"],
  ["south", "South Singapore", "HarbourFront · Tanjong Pagar · Queenstown"],
  ["east", "East Singapore", "Katong · Bedok · Tampines"],
  ["west", "West Singapore", "Jurong · Clementi · Bukit Batok"],
  ["central", "Central Singapore", "Orchard · Bukit Timah · Novena · City"],
];

const regionOptions: Array<[Region, string, string]> = regions.map(([region, title, description]) =>
  region === "south" ? [region, title, "Currently no clinics available"] : [region, title, description],
) as Array<[Region, string, string]>;

const providers: Provider[] = [
  {
    name: "Dr Munidasa Winslow",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "General psychiatry, stress and insomnia care, and specialist assessment.",
    href: "https://promises.com.sg/psychiatrists/",
    source: "Promises Healthcare clinician directory",
  },
  {
    name: "Dr P. Buvanaswari",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "Private psychiatric assessment and treatment in a specialist clinic setting.",
    href: "https://promises.com.sg/psychiatrists/",
    source: "Promises Healthcare clinician directory",
  },
  {
    name: "Dr Terence Leong",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "Private psychiatric assessment and treatment for adults and families.",
    href: "https://promises.com.sg/psychiatrists/",
    source: "Promises Healthcare clinician directory",
  },
  {
    name: "Dr Jacob Rajesh",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "General adult psychiatry, anxiety, depression, trauma and stress-related care.",
    href: "https://promises.com.sg/our-professional/dr-jacob-rajesh/",
    source: "Promises Healthcare clinician profile",
  },
  {
    name: "Dr Joseph Leong Jern-Yi",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "Private psychiatric assessment and ongoing treatment planning.",
    href: "https://promises.com.sg/psychiatrists/",
    source: "Promises Healthcare clinician directory",
  },
  {
    name: "Dr Sharad Haridas",
    kind: "psychiatrist",
    region: "central",
    role: "Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "General psychiatry with a focus on substance misuse and behavioural addictions.",
    href: "https://promises.com.sg/our-professional/dr-sharad-haridas/",
    source: "Promises Healthcare clinician profile",
  },
  {
    name: "Dr Sean David Vanniasingham",
    kind: "psychiatrist",
    region: "central",
    role: "Consultant Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "General psychiatry, addiction medicine and neurostimulation treatment.",
    href: "https://promises.com.sg/our-professional/dr-sean-david-vanniasingham/",
    source: "Promises Healthcare clinician profile",
  },
  {
    name: "Dr Adrian Loh",
    kind: "psychiatrist",
    region: "central",
    role: "Child & Adolescent Psychiatrist",
    practice: "Promises Healthcare",
    address: "10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506",
    phone: "+65 6397 7309",
    description: "Child and adolescent psychiatry and specialist assessment.",
    href: "https://promises.com.sg/our-professional/dr-adrian-loh/",
    source: "Promises Healthcare clinician profile",
  },
  {
    name: "Dr Tay Kai Hong",
    kind: "psychiatrist",
    region: "central",
    role: "Senior Consultant Psychiatrist",
    practice: "Private Space Medical",
    address: "541 Orchard Road, #19-01 Liat Towers, Singapore 238881",
    phone: "+65 8083 9857",
    description: "Private psychiatric care for children, teens and adults.",
    href: "https://privatespace.com.sg/psychiatrist-services-in-singapore/",
    source: "Private Space Medical service page",
  },
  {
    name: "Private Space Medical",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Private Space Medical",
    address: "8 Sinaran Drive, #05-21 Novena Specialist Centre, Singapore 307470",
    phone: "+65 6979 8735 / +65 8875 3108",
    description: "Psychiatric and psychological care for children, teens and adults.",
    href: "https://privatespace.com.sg/contact-us/",
    source: "Private Space Medical contact page",
  },
  {
    name: "Private Space Medical",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Private Space Medical",
    address: "1 Farrer Park Station Road, #11-09 Farrer Park Medical Centre, Singapore 217562",
    phone: "+65 6979 7886 / +65 9738 3595",
    description: "Psychiatric and psychological care beside Farrer Park MRT.",
    href: "https://privatespace.com.sg/contact-us/",
    source: "Private Space Medical contact page",
  },
  {
    name: "Dr BL Lim",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatrist",
    practice: "Dr BL Lim Centre for Psychological Wellness",
    address: "6 Napier Road, Gleneagles Medical Centre, Singapore 258499",
    phone: "+65 6479 6456",
    description: "Private psychiatric assessment and psychological wellness care.",
    href: "https://www.psywellness.com.sg/contact-us/",
    source: "Practice contact page",
  },
  {
    name: "Dr Adrian Wang",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatrist",
    practice: "Dr Adrian Wang Psychiatric and Counselling Care",
    address: "6 Napier Road, #10-05 Gleneagles Medical Centre, Singapore 258499",
    phone: "+65 6474 3836",
    description: "Private psychiatric and counselling care in the Orchard area.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20",
    source: "MSF registered practitioner listing",
  },
  {
    name: "Mind Care Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry practice",
    practice: "Mind Care Clinic",
    address: "1 Farrer Park Station Road, #10-19 Connexion, Singapore 217562",
    phone: "+65 6779 5555",
    description: "Private psychiatric consultations in the Farrer Park area.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20",
    source: "MSF registered practitioner listing",
  },
  {
    name: "Neuropsychiatry Associates",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry practice",
    practice: "Neuropsychiatry Associates",
    address: "3 Mount Elizabeth, #04-16 Mount Elizabeth Medical Centre, Singapore 228510",
    phone: "+65 6970 7930",
    description: "Private neuropsychiatry and specialist mental health consultations.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20",
    source: "MSF registered practitioner listing",
  },
  {
    name: "PsyMed Consultants",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry practice",
    practice: "PsyMed Consultants / Fones Clinic",
    address: "38 Irrawaddy Road, #11-47, Singapore 329563",
    description: "Private psychiatric consultations in the Novena area.",
    href: "https://www.psychiatrist.com.sg/",
    source: "Practice website",
  },
  {
    name: "Better Life Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry practice",
    practice: "Better Life Clinic Pte Ltd",
    address: "10 Sinaran Drive, Singapore 307506",
    phone: "+65 6250 8077",
    description: "Private psychiatric care in the Novena medical cluster.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20",
    source: "MSF registered practitioner listing",
  },
  {
    name: "Nobel Psychological Wellness Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Nobel Psychological Wellness Clinic",
    address: "10 Sinaran Drive, #09-35 Novena Medical Centre, Singapore 307506",
    phone: "+65 6397 2993",
    description: "Private psychiatric consultations in the Novena medical cluster.",
    href: "https://nobelmedicalgroup.com/",
    source: "Singapore private specialist panel listing",
  },
  {
    name: "Psychiatric Care Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Psychiatric Care Clinic",
    address: "3 Mount Elizabeth, #06-05 Mount Elizabeth Medical Centre, Singapore 228510",
    phone: "+65 6733 5565",
    description: "Private psychiatric consultations in the Mount Elizabeth medical cluster.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "The Psychological Medicine Practice",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "The Psychological Medicine Practice",
    address: "304 Orchard Road, #05-39 Lucky Plaza, Singapore 238863",
    phone: "+65 6476 0493",
    description: "Psychiatric assessment and treatment in the Orchard area.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Dr Tan Kuan Hoo Psychiatric Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Dr Tan Kuan Hoo Psychiatric Clinic",
    address: "19 Tanglin Road, #06-06 Tanglin Shopping Centre, Singapore 247909",
    phone: "+65 6738 3520",
    description: "Private psychiatric consultations near Orchard and Tanglin.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Novena Psychiatry Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Novena Psychiatry Clinic",
    address: "10 Sinaran Drive, #10-18 Novena Medical Centre, Singapore 307506",
    phone: "+65 6397 2688",
    description: "Private psychiatric consultations in Novena.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Tan Chue Tin Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Tan Chue Tin Clinic Pte Ltd",
    address: "3 Mount Elizabeth, #14-04 Mount Elizabeth Medical Centre, Singapore 228510",
    phone: "+65 6469 6664",
    description: "Private psychiatric consultations in the Mount Elizabeth medical cluster.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Dr Simon Siew Psychological Medicine Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Dr Simon Siew Psychological Medicine Clinic Pte Ltd",
    address: "3 Mount Elizabeth, #08-07 Mount Elizabeth Medical Centre, Singapore 228510",
    phone: "+65 6735 6870",
    description: "Psychological medicine and psychiatric care in Orchard.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Paul W. NGUI Psychiatric Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Paul W. NGUI Psychiatric Clinic",
    address: "10 Sinaran Drive, #11-23 Novena Medical Centre, Singapore 307506",
    phone: "+65 6734 4426",
    description: "Private psychiatric consultations in the Novena medical cluster.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "The Psychotherapy Clinic for Adults and Children (Ang & Kong)",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry and psychotherapy clinic",
    practice: "The Psychotherapy Clinic for Adults and Children (Ang & Kong)",
    address: "180 Grange Road, #09-03/04 Camden Medical Centre, Singapore 249615",
    description: "Psychiatric and psychotherapy services for adults and children.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg verified clinic directory",
  },
  {
    name: "Adelphi Psych Medicine Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry and psychology clinic",
    practice: "Adelphi Psych Medicine Clinic",
    address: "1 Coleman Street, The Adelphi, #04-32, Singapore 179803",
    phone: "+65 6250 9833",
    description: "Psychiatric, psychology and psychotherapy care near City Hall.",
    href: "https://adelphipsych.sg/contact/",
    source: "Adelphi Psych Medicine Clinic contact page",
  },
  {
    name: "Adelphi Psych Medicine Clinic",
    kind: "therapist",
    region: "central",
    role: "Psychology and psychotherapy clinic",
    practice: "Adelphi Psych Medicine Clinic",
    address: "1 Coleman Street, The Adelphi, #04-32, Singapore 179803",
    phone: "+65 6250 9833",
    description: "Psychotherapy and psychology services, including CBT and EMDR, alongside psychiatric care.",
    href: "https://adelphipsych.sg/services/",
    source: "Adelphi Psych Medicine Clinic services page",
  },
  {
    name: "Famille Psychiatry Associates",
    kind: "psychiatrist",
    region: "central",
    role: "Private psychiatry clinic",
    practice: "Famille Psychiatry Associates",
    address: "38 Irrawaddy Road, #06-51/52 Mount Elizabeth Novena Hospital, Singapore 329563",
    phone: "+65 8668 6638",
    description: "Psychiatric assessment and treatment for children and adults.",
    href: "https://www.famillepsychiatry.sg/the-clinic",
    source: "Famille Psychiatry Associates clinic page",
  },
  {
    name: "The Psychiatric and Behavioural Medicine Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry and behavioural medicine clinic",
    practice: "The Psychiatric and Behavioural Medicine Clinic",
    address: "3 Mount Elizabeth, #15-08 Mount Elizabeth Medical Centre, Singapore 228510",
    phone: "+65 6737 3663",
    description: "Psychiatric, psychological assessment and psychotherapy services.",
    href: "https://ppw.sg/",
    source: "Psychiatric and Behavioural Medicine Clinic website",
  },
  {
    name: "The Psychiatric and Behavioural Medicine Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry and behavioural medicine clinic",
    practice: "The Psychiatric and Behavioural Medicine Clinic",
    address: "1 Farrer Park Station Road, #11-16/17/18 Farrer Park Medical Centre, Singapore 217562",
    phone: "+65 6338 3383",
    description: "Psychiatric, psychological assessment and psychotherapy services.",
    href: "https://ppw.sg/",
    source: "Psychiatric and Behavioural Medicine Clinic website",
  },
  {
    name: "Nobel Psychological Wellness Clinic",
    kind: "psychiatrist",
    region: "north",
    role: "Psychiatry and psychology clinic",
    practice: "Nobel Psychological Wellness Clinic",
    address: "452 Ang Mo Kio Avenue 10, #01-1773, Singapore 560452",
    phone: "+65 6459 2630",
    description: "Psychiatric and psychological care in Ang Mo Kio.",
    href: "https://nobelmedicalgroup.com/",
    source: "MOE mental-health services directory",
  },
  {
    name: "Nobel Psychological Wellness Clinic",
    kind: "psychiatrist",
    region: "central",
    role: "Psychiatry and psychology clinic",
    practice: "Nobel Psychological Wellness Clinic",
    address: "111 Somerset Road, #01-10A TripleOne Somerset, Singapore 238164",
    phone: "+65 6733 9560",
    description: "Psychiatric and psychological care in the Somerset area.",
    href: "https://nobelmedicalgroup.com/",
    source: "MOE mental-health services directory",
  },
  {
    name: "The Cabin Singapore",
    kind: "psychiatrist",
    region: "central",
    role: "Addiction and mental-health clinic",
    practice: "The Cabin Singapore",
    address: "10 Sinaran Drive, #11-02 Novena Medical Centre, Singapore 307506",
    phone: "+65 3158 9949",
    description: "Outpatient addiction treatment and related mental-health support.",
    href: "https://www.thecabinsingapore.com.sg/",
    source: "MOE mental-health services directory",
  },
  {
    name: "Little Cross Family Clinic",
    kind: "psychiatrist",
    region: "east",
    role: "Private psychiatry clinic",
    practice: "Little Cross Family Clinic Pte Ltd",
    address: "929 Tampines Street 91, Singapore 520929",
    phone: "+65 6544 0040",
    description: "Private psychiatric consultations listed in the MSF accredited-practitioner snapshot.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_29",
    source: "MSF accredited practitioner listing",
  },
  {
    name: "Uniq Medical Clinic (Yishun)",
    kind: "psychiatrist",
    region: "north",
    role: "Private psychiatry clinic",
    practice: "Uniq Medical Clinic (Yishun)",
    address: "925 Yishun Central 1, #01-231, Singapore 760925",
    phone: "+65 9022 4505",
    description: "Private psychiatric consultations listed in the MSF accredited-practitioner snapshot.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_29",
    source: "MSF accredited practitioner listing",
  },
  {
    name: "Garden Grove Clinic",
    kind: "psychiatrist",
    region: "east",
    role: "Psychiatry practice",
    practice: "Garden Grove Clinic",
    address: "430 Joo Chiat Road, Singapore 427646",
    phone: "+65 6513 5233",
    description: "Private psychiatric consultations in the Joo Chiat area.",
    href: "https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20",
    source: "MSF registered practitioner listing",
  },
  {
    name: "Singapore Counselling Centre",
    kind: "therapist",
    region: "central",
    role: "Counselling centre",
    practice: "Singapore Counselling Centre",
    address: "51 Cuppage Road, #03-03, Singapore 229469",
    phone: "+65 6339 5411",
    description: "Individual, couple, family, child and youth counselling, including subsidised sessions for eligible applicants.",
    href: "https://scc.sg/e/counselling-fees/",
    source: "Singapore Counselling Centre fees and contact pages",
  },
  {
    name: "Care Alliance Counselling",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychotherapy practice",
    practice: "Care Alliance Counselling Pte Ltd",
    address: "20 Kramat Lane, #04-11 United House, Singapore 228773",
    phone: "+65 8670 3302",
    description: "Counselling using approaches including EMDR, DBT, CBT, IFS, Brainspotting and mindfulness.",
    href: "https://www.carealliancecounselling.com/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Holistic Psychotherapy Centre",
    kind: "therapist",
    region: "east",
    role: "Psychotherapy and counselling centre",
    practice: "Holistic Psychotherapy Centre",
    address: "511 Guillemard Road, #03-08 Grandlink Square, Singapore 399849",
    phone: "+65 6631 8446",
    description: "Psychotherapy, psychology, counselling and wellbeing support for individuals, families, schools and organisations.",
    href: "https://www.holisticpsychotherapy.sg/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Hope and Heart Counselling",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychotherapy practice",
    practice: "Hope and Heart Counselling",
    address: "111 North Bridge Road, Peninsula Plaza, #06-23, Singapore 179098",
    description: "Counselling and psychotherapy for anxiety, depression, trauma, self-harm and relationship concerns.",
    href: "https://www.hnhcounselling.com/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Inside Out Counselling Wellness Practice",
    kind: "therapist",
    region: "central",
    role: "Family counselling practice",
    practice: "Inside Out Counselling Wellness Practice",
    address: "Blk 116 Bishan Street 12, #02-34, Singapore 570116",
    phone: "+65 9892 8337",
    description: "Therapy support for children, adults and families, including anxiety, depression, trauma and relationship concerns.",
    href: "https://www.insideout-counsellingwellness.com/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Listening Ear Counselling & Consultancy",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychotherapy practice",
    practice: "Listening Ear Counselling & Consultancy Pte Ltd",
    address: "70 Shenton Way, #21-05 EON, Singapore 079118",
    phone: "+65 8950 2162",
    description: "Individual, family, couples and group therapy, including teletherapy and LGBT-affirming support.",
    href: "https://listeningearclinic.com/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Therapy-Help",
    kind: "therapist",
    region: "central",
    role: "Psychotherapy and counselling practice",
    practice: "Therapy-Help",
    address: "10 Anson Road, #28-14 International Plaza, Singapore 079903",
    phone: "+65 9621 3061",
    description: "Psychotherapy and counselling for trauma, mood disorders, anxiety, stress, grief and addiction recovery.",
    href: "https://therapy-help.com/",
    source: "Singapore Association for Counselling directory",
  },
  {
    name: "Incontact Counselling & Training",
    kind: "therapist",
    region: "central",
    role: "Counselling practice",
    practice: "Incontact Counselling & Training Pte Ltd",
    address: "7 Maxwell Road, MND Building Annexe B, #04-04, Singapore 069111",
    phone: "+65 9134 8147",
    description: "Counselling and therapy for individuals, couples and families.",
    href: "https://incontact.com.sg/",
    source: "NCSS counselling services listing",
  },
  {
    name: "Centre for Psychotherapy",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychotherapy practice",
    practice: "Centre for Psychotherapy Ltd",
    address: "7 Race Course Lane, Tai Guan Ong See Association Building, #02-01, Singapore 218734",
    phone: "+65 8856 2408",
    description: "Counselling and psychotherapy support in the central region.",
    href: "https://centreforpsychotherapy.com/contact",
    source: "NCSS counselling services listing",
  },
  {
    name: "Care Community Services Society",
    kind: "therapist",
    region: "central",
    role: "Counselling service",
    practice: "CarePoint",
    address: "103 Lavender Street, CarePoint #01-02, Singapore 338725",
    phone: "+65 6950 7500",
    description: "Community counselling and support services.",
    href: "https://www.ccsscares.sg/",
    source: "NCSS counselling services listing",
  },
  {
    name: "Raffles Counselling Centre",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychology practice",
    practice: "Raffles Medical Group",
    address: "585 North Bridge Road, Level 8 Raffles Specialist Centre, Singapore 188770",
    description: "Counselling and psychology support, with appointments available through Raffles.",
    href: "https://www.rafflesmedicalgroup.com/services/specialist-centres/counselling/contact-us/",
    source: "Raffles Medical Group contact page",
  },
  {
    name: "Redwood Psychology",
    kind: "therapist",
    region: "central",
    role: "Psychology and counselling practice",
    practice: "Redwood Psychology Clinic",
    address: "1 North Bridge Road, Singapore",
    description: "Psychological therapy and counselling for adults and families.",
    href: "https://www.redwoodpsy.com/",
    source: "Practice website",
  },
  {
    name: "AppleTree Counselling",
    kind: "therapist",
    region: "east",
    role: "Counselling practice",
    practice: "AppleTree Counselling Pte Ltd",
    address: "865 Mountbatten Road, Katong Shopping Centre #06-01, Singapore 437844",
    phone: "+65 8809 0920",
    description: "Professional counselling in the Katong area, with phone and WhatsApp contact.",
    href: "https://www.appletreecounselling.sg/",
    source: "NCSS counselling services listing",
  },
  {
    name: "LightingWay Counselling & Therapy",
    kind: "therapist",
    region: "east",
    role: "Counselling and therapy practice",
    practice: "LightingWay",
    address: "Centropod@Changi, 80 Changi Road, #02-07, Singapore 419715",
    description: "Professional counselling and therapy based in the East.",
    href: "https://www.lightingwaytherapy.com.sg/location",
    source: "Practice location page",
  },
  {
    name: "Hope For Tomorrow Psychology Centre",
    kind: "therapist",
    region: "central",
    role: "Psychology and counselling practice",
    practice: "Hope For Tomorrow Psychology Centre Pte Ltd",
    address: "19 Lorong Kilat, #01-04, Singapore 598120",
    phone: "+65 8812 4673",
    description: "Psychology and counselling support in the Bukit Timah area.",
    href: "https://hope4tmr.com/",
    source: "NCSS counselling services listing",
  },
  {
    name: "Dr Wong Mei Yin",
    kind: "therapist",
    region: "north",
    role: "Senior Principal Psychologist",
    practice: "Frontier Healthcare",
    address: "Blk 654, Yishun Avenue 4, #01-437, Singapore 760654",
    phone: "+65 6991 5511",
    description: "Counselling and psychotherapy for individuals, couples and families.",
    href: "https://frontierhealthcare.com.sg/our-services/mental-wellness/counselling-and-psychotherapy-services/",
    source: "Frontier Healthcare clinician directory",
  },
  {
    name: "Dr Lim Kok Kwang",
    kind: "therapist",
    region: "north",
    role: "Senior Consultant Clinical Psychologist",
    practice: "Frontier Healthcare",
    address: "Blk 654, Yishun Avenue 4, #01-437, Singapore 760654",
    phone: "+65 6991 5511",
    description: "Counselling and psychotherapy using evidence-based psychological approaches.",
    href: "https://frontierhealthcare.com.sg/our-services/mental-wellness/counselling-and-psychotherapy-services/",
    source: "Frontier Healthcare clinician directory",
  },
  {
    name: "Dr Wong Mei Yin",
    kind: "therapist",
    region: "west",
    role: "Senior Principal Psychologist",
    practice: "Frontier Healthcare",
    address: "3151 Commonwealth Avenue West, #04-01 Grantral Mall, Singapore 129581",
    phone: "+65 6991 5511",
    description: "Counselling and psychotherapy for individuals, couples and families.",
    href: "https://frontierhealthcare.com.sg/our-services/mental-wellness/counselling-and-psychotherapy-services/",
    source: "Frontier Healthcare clinician directory",
  },
  {
    name: "Dr Lim Kok Kwang",
    kind: "therapist",
    region: "west",
    role: "Senior Consultant Clinical Psychologist",
    practice: "Frontier Healthcare",
    address: "3151 Commonwealth Avenue West, #04-01 Grantral Mall, Singapore 129581",
    phone: "+65 6991 5511",
    description: "Counselling and psychotherapy using evidence-based psychological approaches.",
    href: "https://frontierhealthcare.com.sg/our-services/mental-wellness/counselling-and-psychotherapy-services/",
    source: "Frontier Healthcare clinician directory",
  },
  {
    name: "Karin Goh",
    kind: "therapist",
    region: "central",
    role: "Child & Adolescent Clinical Psychologist",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Psychological therapy, counselling and assessment for children and adolescents.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Dr Jessie Koh",
    kind: "therapist",
    region: "central",
    role: "Registered Clinical Psychologist",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Clinical psychology and evidence-based therapy for a range of concerns.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Dr Janice Lee",
    kind: "therapist",
    region: "central",
    role: "Registered Clinical Psychologist",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Clinical psychology and evidence-based therapy in the Bukit Timah area.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Thivya Lakshmi",
    kind: "therapist",
    region: "central",
    role: "Clinical Psychologist",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Clinical psychology support for adults and young people.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Leanne Wong",
    kind: "therapist",
    region: "central",
    role: "Child & Adolescent Counsellor",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Counselling support for children and adolescents.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Soak Mun Lee",
    kind: "therapist",
    region: "central",
    role: "Registered Clinical Psychologist",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Clinical psychology and therapy support.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Angeline Kin",
    kind: "therapist",
    region: "central",
    role: "Registered Art Psychotherapist & Counsellor",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Art psychotherapy and counselling support.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Sylvia Sivanesan",
    kind: "therapist",
    region: "central",
    role: "Relationship & Family Counsellor",
    practice: "The Center for Psychology",
    address: "1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802",
    phone: "+65 9125 7559",
    description: "Relationship and family counselling support.",
    href: "https://www.center4psy.com/",
    source: "The Center for Psychology team page",
  },
  {
    name: "Shakti Sahai",
    kind: "therapist",
    region: "central",
    role: "Senior Clinical Psychologist & Clinical Director",
    practice: "Psywellness Testing & Therapy Centre",
    address: "1 North Bridge Road, #01-48 & #03-40, Singapore 179094",
    phone: "+65 8628 4685",
    description: "Clinical psychology, counselling and psychological testing.",
    href: "https://www.psywellness.org/",
    source: "Psywellness team page",
  },
  {
    name: "Michael Thong",
    kind: "therapist",
    region: "central",
    role: "Senior Clinical Psychologist & Clinical Supervisor",
    practice: "Psywellness Testing & Therapy Centre",
    address: "1 North Bridge Road, #01-48 & #03-40, Singapore 179094",
    phone: "+65 8628 4685",
    description: "Clinical psychology, counselling and psychological testing.",
    href: "https://www.psywellness.org/",
    source: "Psywellness team page",
  },
  {
    name: "Elsie Tan",
    kind: "therapist",
    region: "central",
    role: "Psychologist",
    practice: "Psywellness Testing & Therapy Centre",
    address: "1 North Bridge Road, #01-48 & #03-40, Singapore 179094",
    phone: "+65 8628 4685",
    description: "Psychology and therapy support for a range of mental health concerns.",
    href: "https://www.psywellness.org/",
    source: "Psywellness team page",
  },
  {
    name: "Doris Yu",
    kind: "therapist",
    region: "central",
    role: "Counsellor",
    practice: "Psywellness Testing & Therapy Centre",
    address: "1 North Bridge Road, #01-48 & #03-40, Singapore 179094",
    phone: "+65 8628 4685",
    description: "Counselling and therapy for individuals, couples and families.",
    href: "https://www.psywellness.org/",
    source: "Psywellness team page",
  },
  {
    name: "Rebecca Chee",
    kind: "therapist",
    region: "central",
    role: "Counsellor",
    practice: "Psywellness Testing & Therapy Centre",
    address: "1 North Bridge Road, #01-48 & #03-40, Singapore 179094",
    phone: "+65 8628 4685",
    description: "Counselling and therapy for individuals, couples and families.",
    href: "https://www.psywellness.org/",
    source: "Psywellness team page",
  },
  {
    name: "INEZ Psychological Well Being Clinic",
    kind: "therapist",
    region: "central",
    role: "Psychology and counselling clinic",
    practice: "INEZ Psychological Well Being Clinic",
    address: "733 Bukit Timah Road, #01-03 Second Avenue Junction, Singapore 269748",
    phone: "+65 6474 7552",
    description: "Psychological wellbeing support and counselling in the Bukit Timah area.",
    href: "https://doc.sg/directory_type/clinic/page/43/",
    source: "doc.sg clinic directory listing",
  },
  {
    name: "Annabelle Psychology",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology practice",
    practice: "Annabelle Psychology",
    address: "101 Irrawaddy Road, #17-12 Royal Square Medical Centre, Singapore 329565",
    phone: "+65 8202 3385",
    description: "Clinical and counselling psychology, psychotherapy, and psychological assessments for adults, children, couples and families.",
    href: "https://www.annabellepsychology.com/",
    source: "Annabelle Psychology official practice page",
  },
  {
    name: "Annabelle Psychology",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology practice",
    practice: "Annabelle Psychology",
    address: "510 Thomson Road, #15-03 SLF Building, Singapore 298135",
    phone: "+65 8202 3385",
    description: "Child and family psychology, psychotherapy, and psychological assessments at the Thomson location.",
    href: "https://www.annabellepsychology.com/appointments",
    source: "Annabelle Psychology appointment page",
  },
  {
    name: "Soma Psychology Clinic",
    kind: "therapist",
    region: "central",
    role: "Registered clinical psychology practice",
    practice: "Soma Psychology Clinic",
    address: "76 South Bridge Road, #06-00 Merchants’ Building, Singapore 058706",
    phone: "+65 8959 4008",
    description: "Evidence-based therapy for adults, including anxiety, self-doubt, disordered eating and longstanding relational patterns.",
    href: "https://www.somapsychologyclinic.com/contact",
    source: "Soma Psychology Clinic official contact page",
  },
  {
    name: "Breathe & Be Psychology",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology and psychotherapy practice",
    practice: "Breathe & Be Psychology",
    address: "111 Somerset Road, #13-17 111 Somerset, Singapore 238164",
    description: "Clinical psychology, psychotherapy and health coaching for stress, chronic conditions and life transitions.",
    href: "https://www.breatheandbe.sg/contact-us",
    source: "Breathe & Be Psychology official site",
  },
  {
    name: "The Therapy Room",
    kind: "therapist",
    region: "central",
    role: "Multidisciplinary psychology practice",
    practice: "The Therapy Room",
    address: "321 Orchard Road, #08-01 Orchard Shopping Centre, Singapore 238866",
    phone: "+65 6467 8903",
    description: "Clinical, educational and counselling psychology, psychological assessments, and therapy for children, teenagers and adults.",
    href: "https://www.thetherapyroom.com.sg/",
    source: "The Therapy Room practice site and Singapore business listing",
  },
  {
    name: "Us Therapy",
    kind: "therapist",
    region: "central",
    role: "Psychology and counselling practice",
    practice: "Us Therapy",
    address: "10 Winstedt Road, #02-10/11, Singapore 227977",
    phone: "+65 8118 5590 / +65 6980 8580",
    description: "Therapy, counselling and psychological assessments, including ADHD, autism and learning assessments.",
    href: "https://us-therapy.sg/",
    source: "Us Therapy official site",
  },
  {
    name: "Lightfull Psychology",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology practice",
    practice: "Lightfull Psychology",
    address: "101 Telok Ayer Street, #03-03, Singapore 068574",
    description: "Clinical psychology, psychotherapy and assessments, including ADHD, anxiety, OCD and late-diagnosis support.",
    href: "https://lightfull-psychology.com/book/",
    source: "Lightfull Psychology official booking page",
  },
  {
    name: "The Psychology Practice",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology practice",
    practice: "The Psychology Practice",
    address: "178 Clemenceau Avenue, Level 3 Haw Par Glass Tower, Singapore 239926",
    phone: "+65 9880 1154",
    description: "Psychotherapy, psychological assessments, and support for children, adolescents, adults, couples and families.",
    href: "https://thepsychpractice.com/contact-us",
    source: "The Psychology Practice official contact page",
  },
  {
    name: "Thrive Psychology Clinic",
    kind: "therapist",
    region: "central",
    role: "Child and adolescent psychology clinic",
    practice: "Thrive Psychology Clinic",
    address: "519 Balestier Road, Le Shantier, #02-03, Singapore 329825",
    phone: "+65 6962 9753",
    description: "Child and adolescent psychology, therapy, counselling and assessments, with subsidised counselling options for eligible members.",
    href: "https://www.thrivepsychology.com.sg/contact-us",
    source: "Thrive Psychology official contact page",
  },
  {
    name: "Mindwise Counselling & Training",
    kind: "therapist",
    region: "central",
    role: "Counselling and psychotherapy practice",
    practice: "Mindwise Counselling & Training Pte Ltd",
    address: "10 Anson Road, #24-09 International Plaza, Singapore 079903",
    phone: "+65 6527 0526",
    description: "Counselling and therapy for mental health, sex therapy, subfertility, relationships and life transitions.",
    href: "https://mindwise.sg/frequently-asked-questions-faq/",
    source: "Mindwise official FAQ and contact details",
  },
  {
    name: "Olive Branch Psychology",
    kind: "therapist",
    region: "central",
    role: "Counselling and therapy practice",
    practice: "Olive Branch Psychology",
    address: "2 Kallang Avenue, CT Hub, #04-04, Singapore 339407",
    phone: "+65 8435 9724",
    description: "Counselling and therapy for individuals, couples, families, children, teenagers, older adults and caregivers.",
    href: "https://web.olivebranch.com.sg/home/counselling-fees",
    source: "Olive Branch official fees and contact page",
  },
  {
    name: "ImPossible Psychological Services",
    kind: "therapist",
    region: "east",
    role: "Psychotherapy and counselling clinic",
    practice: "ImPossible Psychological Services",
    address: "360A Joo Chiat Road, Singapore 427605",
    phone: "+65 9099 9081 / +65 9688 2790",
    description: "Psychotherapy, counselling, couples therapy, child and adolescent services, art therapy and psychological assessments.",
    href: "https://www.impossiblepsychservices.com.sg/",
    source: "ImPossible Psychological Services official site",
  },
  {
    name: "Alliance Counselling",
    kind: "therapist",
    region: "central",
    role: "Multilingual counselling and psychology practice",
    practice: "Alliance Counselling",
    address: "501 Bukit Timah Road, #04-03 & #03-02 Cluny Court, Singapore 259760",
    phone: "+65 6466 8120",
    description: "Counselling, psychotherapy, psychological assessments and family support for adults, couples, children and teenagers.",
    href: "https://www.alliancecounselling.com.sg/",
    source: "Alliance Counselling practice listing",
  },
  {
    name: "KALL Psychology",
    kind: "therapist",
    region: "central",
    role: "Psychology and therapy practice",
    practice: "KALL Psychology",
    address: "101 Irrawaddy Road, #15-07 Royal Square at Novena, Singapore 329565",
    description: "Private psychology and therapy practice in the Novena medical cluster.",
    href: "https://kall-psych.com/",
    source: "KALL Psychology official location page",
  },
  {
    name: "The Psychology Clinic",
    kind: "therapist",
    region: "north",
    role: "Psychology and counselling clinic",
    practice: "The Psychology Clinic (Singapore)",
    address: "11 Sin Ming Road, Thomson V Two, #B1-14, Singapore 575629",
    phone: "+65 6970 5611",
    description: "Counselling, psychotherapy, psychological assessments, couples and family interventions, and tele-counselling.",
    href: "https://www.psychologyclinic.com.sg/",
    source: "The Psychology Clinic official site",
  },
  {
    name: "Link & Relate",
    kind: "therapist",
    region: "central",
    role: "Psychological practice for adolescents and adults",
    practice: "Link & Relate Pte Ltd",
    address: "733 Bukit Timah Road, #01-06 Second Avenue Junction, Singapore 269748",
    phone: "+65 9753 2691",
    description: "Psychotherapy for adolescents and adults, including disability support and online sessions.",
    href: "https://www.linknrelate.com.sg/contact.html",
    source: "Link & Relate official contact page",
  },
  {
    name: "the simple practice",
    kind: "therapist",
    region: "central",
    role: "Clinical psychology practice",
    practice: "the simple practice",
    address: "Petain Road, Singapore (exact address disclosed to clients on booking)",
    phone: "+65 9181 9133",
    description: "Clinical psychology, individual therapy and life coaching for clients aged 12 and above.",
    href: "https://thesimplepractice.co/",
    source: "the simple practice official site",
  },
  {
    name: "Mind What Matters",
    kind: "therapist",
    region: "central",
    role: "Psychology and counselling practice",
    practice: "Mind What Matters",
    address: "121 Devonshire Road, Singapore 239882",
    phone: "+65 8907 9590",
    description: "Psychological support for anxiety, depression, stress, relationships, trauma, grief and work-related concerns.",
    href: "https://mindwhatmatters.com.sg/contact/",
    source: "Mind What Matters official contact page",
  },
  {
    name: "Psychology Blossom",
    kind: "therapist",
    region: "central",
    role: "Psychology, counselling and psychotherapy clinic",
    practice: "Psychology Blossom",
    address: "150 Cecil Street, #07-02 Wing On Life Building, Singapore 069543",
    phone: "+65 8800 0554",
    description: "Private psychology clinic offering therapy, counselling and psychological assessments for adults, couples, children and teens.",
    href: "https://psychologyblossom.com/blossom-contact/",
    source: "Psychology Blossom official contact page",
  },
  {
    name: "Room Inside",
    kind: "therapist",
    region: "central",
    role: "Psychology and relationship therapy practice",
    practice: "Room Inside",
    address: "420 North Bridge Road, #06-29 North Bridge Centre, Singapore 188727",
    phone: "+65 8829 7307",
    description: "Psychological services for children, adolescents and adults, including psycho-educational assessment, counselling psychology and relationship therapy.",
    href: "https://www.roominside.sg/",
    source: "Room Inside official practice page",
  },
  {
    name: "The Private Practice",
    kind: "therapist",
    region: "central",
    role: "Integrative psychology and counselling clinic",
    practice: "The Private Practice",
    address: "3A Thomson Ridge, Singapore 574634",
    phone: "+65 9743 5083",
    description: "Clinical psychology, counselling, psychological assessments, maternal mental health support and multidisciplinary family services.",
    href: "https://theprivatepractice.org/",
    source: "The Private Practice official site",
  },
  {
    name: "The Happy Hour Therapy Centre",
    kind: "therapist",
    region: "central",
    role: "Psychotherapy and counselling practice",
    practice: "The Happy Hour Therapy Centre",
    address: "22 Eng Hoon Street, Singapore 169772",
    phone: "+65 9812 7600",
    description: "Individual and family psychotherapy and counselling in the Tiong Bahru area.",
    href: "https://www.thehappyhourtherapy.com.sg/",
    source: "The Happy Hour Therapy Centre official site",
  },
  {
    name: "Psych Connect",
    kind: "therapist",
    region: "central",
    role: "Specialist psychology and multidisciplinary clinic",
    practice: "Psych Connect Pte Ltd",
    address: "51 Cuppage Road, #04-02, Singapore 229469",
    phone: "+65 6493 0244 / +65 9109 2024",
    description: "Psychotherapy, psychological assessments, child development services, couple and family therapy, and multidisciplinary support.",
    href: "https://www.psychconnect.sg/contact-us",
    source: "Psych Connect official contact page",
  },
  {
    name: "Little Window",
    kind: "therapist",
    region: "east",
    role: "Counselling and creative support practice",
    practice: "Little Window",
    address: "96 Joo Chiat Road, #03-02, Singapore 427390",
    phone: "+65 8274 2699",
    description: "Private counselling and creative support for children, teens and adults, including stress, relationships, trauma, identity and life transitions.",
    href: "https://littlewindowsg.com/about/",
    source: "Little Window official About page",
  },
  {
    name: "EMCC",
    kind: "therapist",
    region: "central",
    role: "Affordable counselling centre",
    practice: "Eagles Mediation & Counselling Centre (EMCC)",
    address: "180 Kitchener Road, City Square Mall, B2-29A, Singapore 208539",
    phone: "+65 6788 8220",
    description: "Professional counselling for individuals, couples, families and children or youth, with sliding-scale support available.",
    href: "https://emcc.org.sg/",
    source: "EMCC official counselling centre website",
  },
];

const clinicDetails = (provider: Provider): Pick<Clinic, "fees" | "booking" | "hours"> => {
  const key = `${provider.practice}|${provider.address}`;
  const details: Record<string, Pick<Clinic, "fees" | "booking" | "hours">> = {
    "Promises Healthcare|10 Sinaran Drive, #09-22/23 Novena Medical Center, Singapore 307506": {
      fees: "Standard consultation fee not published online; forensic screening is listed at $500/hour. Confirm current fees.",
      booking: "Book through the website enquiry form or call +65 6397 7309.",
      hours: "Mon–Fri 9am–6pm; Sat 9am–3pm (clinical services only).",
    },
    "Private Space Medical|541 Orchard Road, #19-01 Liat Towers, Singapore 238881": {
      fees: "First consultation $288–$432; follow-up $108 (panel listing; verify before booking).",
      booking: "Call +65 8083 9857 or email appointment@privatespace.com.sg.",
      hours: "Mon–Fri 9am–5pm; Sat 9am–2pm.",
    },
    "Private Space Medical|8 Sinaran Drive, #05-21 Novena Specialist Centre, Singapore 307470": {
      fees: "First consultation $288–$432; follow-up $108 (panel listing; verify before booking).",
      booking: "Call +65 6979 8735 / +65 8875 3108 or email appointment@privatespace.com.sg.",
      hours: "Mon–Sat 9am–5pm; Sun 9am–4pm.",
    },
    "Private Space Medical|1 Farrer Park Station Road, #11-09 Farrer Park Medical Centre, Singapore 217562": {
      fees: "First consultation $288–$432; follow-up $108 (panel listing; verify before booking).",
      booking: "Call +65 6979 7886 / +65 9738 3595 or email appointment@privatespace.com.sg.",
      hours: "Mon–Sat 9am–5pm.",
    },
    "Dr BL Lim Centre for Psychological Wellness|6 Napier Road, Gleneagles Medical Centre, Singapore 258499": {
      fees: "Not published online — confirm the current consultation and follow-up fees.",
      booking: "Call +65 6479 6456 or use the clinic contact page.",
      hours: "Not published online — ask the clinic for current appointment hours.",
    },
    "Dr Adrian Wang Psychiatric and Counselling Care|6 Napier Road, #10-05 Gleneagles Medical Centre, Singapore 258499": {
      fees: "$500 listed in the MSF fee snapshot; confirm the current fee and duration.",
      booking: "Call +65 6474 3836 to arrange an appointment.",
      hours: "Not published online — confirm when booking.",
    },
    "Mind Care Clinic|1 Farrer Park Station Road, #10-19 Connexion, Singapore 217562": {
      fees: "$500 listed in the MSF fee snapshot; confirm the current fee and duration.",
      booking: "Call +65 6779 5555 or use the clinic website.",
      hours: "Not published online — confirm when booking.",
    },
    "Neuropsychiatry Associates|3 Mount Elizabeth, #04-16 Mount Elizabeth Medical Centre, Singapore 228510": {
      fees: "$600–$1,000 listed in the MSF fee snapshot; confirm the current fee.",
      booking: "Call +65 6970 7930 to arrange an appointment.",
      hours: "Not published online — confirm when booking.",
    },
    "PsyMed Consultants / Fones Clinic|38 Irrawaddy Road, #11-47, Singapore 329563": {
      fees: "Not published online — confirm the current consultation and follow-up fees.",
      booking: "Use the clinic website or call the clinic directly.",
      hours: "Not published online — confirm when booking.",
    },
    "Better Life Clinic Pte Ltd|10 Sinaran Drive, Singapore 307506": {
      fees: "$570–$1,000 listed in the MSF fee snapshot; confirm the current fee and duration.",
      booking: "Call +65 6250 8077 or email clinic@better-life.sg.",
      hours: "Not published online — confirm when booking.",
    },
    "Nobel Psychological Wellness Clinic|10 Sinaran Drive, #09-35 Novena Medical Centre, Singapore 307506": {
      fees: "First 15 minutes $108; subsequent 15 minutes $72 (panel listing; verify before booking).",
      booking: "Call +65 6397 2993 to arrange an appointment.",
      hours: "Not published online — confirm when booking.",
    },
    "Garden Grove Clinic|430 Joo Chiat Road, Singapore 427646": {
      fees: "$300 and above listed in the MSF fee snapshot; confirm the current fee.",
      booking: "Call +65 6513 5233 to arrange an appointment.",
      hours: "Not published online — confirm when booking.",
    },
    "LER Clinic & Surgery|835 Tampines Street 83, Singapore 520835": {
      fees: "$100 listed in the MSF fee snapshot; confirm the current fee and duration.",
      booking: "Call +65 6788 6279 to arrange an appointment.",
      hours: "Not published online — confirm when booking.",
    },
    "Incontact Counselling & Training Pte Ltd|7 Maxwell Road, MND Building Annexe B, #04-04, Singapore 069111": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Call or WhatsApp +65 9134 8147.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Centre for Psychotherapy Ltd|7 Race Course Lane, Tai Guan Ong See Association Building, #02-01, Singapore 218734": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Call +65 8856 2408 or use the practice contact page.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "CarePoint|103 Lavender Street, CarePoint #01-02, Singapore 338725": {
      fees: "Not published online — ask about eligibility and current fees.",
      booking: "Call Care Community Services Society at +65 6950 7500.",
      hours: "Not published online — confirm when booking.",
    },
    "Raffles Medical Group|585 North Bridge Road, Level 8 Raffles Specialist Centre, Singapore 188770": {
      fees: "Varies by clinician; check Raffles Counselling Centre consultation fees before booking.",
      booking: "Call +65 6311 2330 or book through Raffles Medical Group.",
      hours: "Mon–Fri 8:30am–6pm; Sat 8:30am–1pm.",
    },
    "Psywellness|1 North Bridge Road, #01-48 & #03-40, Singapore 179094": {
      fees: "Not published online — confirm the current therapist or counsellor fee.",
      booking: "Call +65 8628 4685 or use the Psywellness website.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Redwood Psychology Clinic|1 North Bridge Road, Singapore": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Use the Redwood Psychology website to enquire or book.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "AppleTree Counselling Pte Ltd|865 Mountbatten Road, Katong Shopping Centre #06-01, Singapore 437844": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Call or WhatsApp +65 8809 0920.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "LightingWay|Centropod@Changi, 80 Changi Road, #02-07, Singapore 419715": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Use the LightingWay location page to enquire or book.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Hope For Tomorrow Psychology Centre Pte Ltd|19 Lorong Kilat, #01-04, Singapore 598120": {
      fees: "Not published online — confirm the current session fee.",
      booking: "Call or WhatsApp +65 8812 4673.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Frontier Healthcare|Blk 654, Yishun Avenue 4, #01-437, Singapore 760654": {
      fees: "Initial/follow-up adult consult $125.35; student follow-up $70.85; screening $70.85 (inclusive of GST).",
      booking: "WhatsApp +65 8683 8467, call +65 6991 5511, or email contact@frontierhealthcare.com.sg.",
      hours: "Counselling slots: Thu 9am–1pm; other times by arrangement.",
    },
    "Frontier Healthcare|3151 Commonwealth Avenue West, #04-01 Grantral Mall, Singapore 129581": {
      fees: "Initial/follow-up adult consult $125.35; student follow-up $70.85; screening $70.85 (inclusive of GST).",
      booking: "WhatsApp +65 8683 8467, call +65 6991 5511, or email contact@frontierhealthcare.com.sg.",
      hours: "Counselling slots: Wed 8:30am–12:30pm; other times by arrangement.",
    },
    "The Center for Psychology|1 Fifth Avenue, #02-03 Guthrie House, Singapore 268802": {
      fees: "Counsellor $200; senior consultant $240; couples counselling $280 per 50–55 minute session.",
      booking: "Call or WhatsApp +65 9125 7559, or email contact@center4psy.com.",
      hours: "By appointment: Mon–Thu 10am–6pm; Fri 10am–5pm; Sat 9am–2pm.",
    },
    "Singapore Counselling Centre|51 Cuppage Road, #03-03, Singapore 229469": {
      fees: "Individual counselling from $196.20 with GST; eligible subsidised sessions are $29.43 each.",
      booking: "Call or WhatsApp +65 6339 5411, or book through the SCC website.",
      hours: "Front desk: Mon-Fri 9am-6:30pm; Sat 9am-5pm. Counselling sessions are available beyond front-desk hours.",
    },
    "Adelphi Psych Medicine Clinic|1 Coleman Street, The Adelphi, #04-32, Singapore 179803": {
      fees: "Not published online - confirm the current consultation and follow-up fees.",
      booking: "Call +65 6250 9833 Monday-Saturday 10am-7pm or use the appointment form.",
      hours: "Mon-Sat 10am-7pm; Sun and public holidays by appointment.",
    },
    "Famille Psychiatry Associates|38 Irrawaddy Road, #06-51/52 Mount Elizabeth Novena Hospital, Singapore 329563": {
      fees: "Not published online - confirm the current consultation fee.",
      booking: "Email clinic@famillepsychiatry.sg or call +65 8668 6638.",
      hours: "Mon-Fri 8:30am-5:30pm; Sat 8:30am-1pm.",
    },
    "The Psychiatric and Behavioural Medicine Clinic|3 Mount Elizabeth, #15-08 Mount Elizabeth Medical Centre, Singapore 228510": {
      fees: "Not published online - confirm the current consultation fee.",
      booking: "Call +65 6737 3663 or use the clinic website.",
      hours: "Mon-Fri 9am-5pm; Sat 9am-1pm.",
    },
    "The Psychiatric and Behavioural Medicine Clinic|1 Farrer Park Station Road, #11-16/17/18 Farrer Park Medical Centre, Singapore 217562": {
      fees: "Not published online - confirm the current consultation fee.",
      booking: "Call +65 6338 3383 or use the clinic website.",
      hours: "Clinic hours not published online - confirm when booking.",
    },
    "Holistic Psychotherapy Centre|511 Guillemard Road, #03-08 Grandlink Square, Singapore 399849": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Call +65 6631 8446 or use the practice website.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Care Alliance Counselling Pte Ltd|20 Kramat Lane, #04-11 United House, Singapore 228773": {
      fees: "60-minute individual sessions: clinical director $220, psychotherapist $200, counsellor $180; couples sessions from $220 (practice rates; verify before booking).",
      booking: "Call +65 8670 3302, email info@carealliancecounselling.com, or use the practice booking page.",
      hours: "Mon-Fri 9am-8pm; Sat 9am-6pm.",
    },
    "INEZ Psychological Well Being Clinic|733 Bukit Timah Road, #01-03 Second Avenue Junction, Singapore 269748": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Call +65 6474 7552 or use the directory listing to contact the clinic.",
      hours: "Not published online - confirm available hours when booking.",
    },
    "Annabelle Psychology|101 Irrawaddy Road, #17-12 Royal Square Medical Centre, Singapore 329565": {
      fees: "60-minute clinical/counselling psychology sessions $239-$392.40 inclusive of GST; associate psychologist sessions from $141.70 (practice rates; assessments priced separately).",
      booking: "Call +65 8202 3385, email appointments@apsy.sg, or use the appointment form.",
      hours: "Mon-Sat 8am-6pm; strictly by appointment. After-hours rates may apply.",
    },
    "Annabelle Psychology|510 Thomson Road, #15-03 SLF Building, Singapore 298135": {
      fees: "60-minute clinical/counselling psychology sessions $239-$392.40 inclusive of GST; associate psychologist sessions from $141.70 (practice rates; assessments priced separately).",
      booking: "Call +65 8202 3385, email appointments@apsy.sg, or use the appointment form.",
      hours: "Mon-Sat 8am-6pm; strictly by appointment. After-hours rates may apply.",
    },
    "Soma Psychology Clinic|76 South Bridge Road, #06-00 Merchants’ Building, Singapore 058706": {
      fees: "Not published online - enquire about current therapy fees and availability.",
      booking: "WhatsApp +65 8959 4008 or email hello@somapsychology.sg.",
      hours: "Appointment and enquiry only; confirm available hours when booking.",
    },
    "Breathe & Be Psychology|111 Somerset Road, #13-17 111 Somerset, Singapore 238164": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Use the practice contact form to enquire or book.",
      hours: "By appointment; in-person sessions are held at the Somerset clinic.",
    },
    "The Therapy Room|321 Orchard Road, #08-01 Orchard Shopping Centre, Singapore 238866": {
      fees: "Not published online - enquire about the current clinician and session fee.",
      booking: "Call +65 6467 8903 or use the practice website contact form.",
      hours: "Mon-Fri 9am-5pm; Sat 9am-1pm; confirm before booking.",
    },
    "Us Therapy|10 Winstedt Road, #02-10/11, Singapore 227977": {
      fees: "50-minute counselling fees vary by clinician; psychological assessments range from $1,460 to $3,860 before GST (practice fee page; verify current rates).",
      booking: "Call +65 8118 5590 / +65 6980 8580, email hello@us-therapy.sg, or book online.",
      hours: "Mon-Fri 9am-7pm; Sat 9am-6pm.",
    },
    "Lightfull Psychology|101 Telok Ayer Street, #03-03, Singapore 068574": {
      fees: "Assessment and therapy fees vary by service; see the practice fee page before booking.",
      booking: "Book a free meet-and-greet or email clinic@lightfull-psychology.com.",
      hours: "Standard hours Mon-Fri 9am-5pm; evenings, weekends and public holidays may be available at after-hours rates.",
    },
    "The Psychology Practice|178 Clemenceau Avenue, Level 3 Haw Par Glass Tower, Singapore 239926": {
      fees: "Individual sessions $260; couple sessions $390 (practice listing; verify current rates).",
      booking: "Call or WhatsApp +65 9880 1154, email enquiries@thepsychpractice.com, or use the contact page.",
      hours: "Mon-Sat 9am-7pm.",
    },
    "Thrive Psychology Clinic|519 Balestier Road, Le Shantier, #02-03, Singapore 329825": {
      fees: "Initial child consultation listed at $160-$180; ask about ongoing therapy and membership/subsidised rates.",
      booking: "Call +65 6962 9753, email info@thrivepsychology.com.sg, or use the appointment form.",
      hours: "Tue-Sat 9:30am-9:30pm; Sun 9:30am-5:30pm; closed Mon and public holidays.",
    },
    "Mindwise Counselling & Training Pte Ltd|10 Anson Road, #24-09 International Plaza, Singapore 079903": {
      fees: "Fees are not published; enquire about the current 50-minute session fee.",
      booking: "Call +65 6527 0526 or email enquiry@mindwise.sg.",
      hours: "Mon-Fri 10am-8pm (last session 7pm); Sat 10am-2pm (last session 1pm).",
    },
    "Olive Branch Psychology|2 Kallang Avenue, CT Hub, #04-04, Singapore 339407": {
      fees: "$180 for 60 minutes; $70 for an additional 30 minutes (practice rates; financial assistance may be considered case by case).",
      booking: "Book online through the practice website or call +65 8435 9724.",
      hours: "Appointments available 7 days, 9am-10pm; no walk-ins.",
    },
    "ImPossible Psychological Services|360A Joo Chiat Road, Singapore 427605": {
      fees: "Not published online - confirm the current session and assessment fees.",
      booking: "Call +65 9099 9081 / +65 9688 2790, email info@impossiblepsychservices.com.sg, or use the contact form.",
      hours: "By appointment; confirm current availability when booking.",
    },
    "Alliance Counselling|501 Bukit Timah Road, #04-03 & #03-02 Cluny Court, Singapore 259760": {
      fees: "Not published online - confirm the current clinician and session fee.",
      booking: "Use the practice website contact or appointment form.",
      hours: "By appointment; confirm current opening hours when booking.",
    },
    "KALL Psychology|101 Irrawaddy Road, #15-07 Royal Square at Novena, Singapore 329565": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Email contact@kall-psych.com or use the practice enquiry form.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "The Psychology Clinic (Singapore)|11 Sin Ming Road, Thomson V Two, #B1-14, Singapore 575629": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Call +65 6970 5611, email help@psychologyclinic.sg, or use the WhatsApp booking link.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "Link & Relate Pte Ltd|733 Bukit Timah Road, #01-06 Second Avenue Junction, Singapore 269748": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Call +65 6592 4624 / WhatsApp +65 9745 8355 at FY Psychology Practice, or use Link & Relate’s contact page.",
      hours: "In-person sessions Tue 1:30-4pm, Wed 1:30-6pm, Thu 10am-6pm; all sessions by appointment.",
    },
    "the simple practice|Petain Road, Singapore (exact address disclosed to clients on booking)": {
      fees: "$270 inclusive for a 50-minute in-person session; discounted package from $240 per session (practice rates; verify current rates).",
      booking: "WhatsApp +65 9181 9133 or use the practice contact form.",
      hours: "In-person sessions Sat 10am-3pm; online sessions by arrangement.",
    },
    "Mind What Matters|121 Devonshire Road, Singapore 239882": {
      fees: "Current session fees are not published on the official contact page - confirm the current rate before booking.",
      booking: "Call or WhatsApp +65 8907 9590, email info@mindwhatmatters.com.sg, or use the contact form.",
      hours: "Mon-Sun 9am-8pm.",
    },
    "Psychology Blossom|150 Cecil Street, #07-02 Wing On Life Building, Singapore 069543": {
      fees: "The practice publishes session rates from $50 on its current service information; confirm the clinician-specific fee before booking.",
      booking: "Call or WhatsApp +65 8800 0554, email hello@psychologyblossom.com, or book through the website.",
      hours: "Mon-Fri 8am-6pm; Sat 8am-4pm; Sun and public holidays closed.",
    },
    "Room Inside|420 North Bridge Road, #06-29 North Bridge Centre, Singapore 188727": {
      fees: "Not published online - confirm the current assessment or therapy fee.",
      booking: "WhatsApp +65 8829 7307, email hello@roominside.sg, or use the contact form.",
      hours: "By appointment; confirm available hours when booking.",
    },
    "The Private Practice|3A Thomson Ridge, Singapore 574634": {
      fees: "Not published online - confirm the current consultation or assessment fee.",
      booking: "Call +65 9743 5083 or email admin@theprivatepractice.org.",
      hours: "By appointment only.",
    },
    "The Happy Hour Therapy Centre|22 Eng Hoon Street, Singapore 169772": {
      fees: "Not published online - confirm the current session fee.",
      booking: "Call +65 9812 7600 or use the practice website contact form.",
      hours: "Not published online - confirm available hours when booking.",
    },
    "Psych Connect Pte Ltd|51 Cuppage Road, #04-02, Singapore 229469": {
      fees: "Not published online - confirm the current clinician, therapy or assessment fee.",
      booking: "Call +65 6493 0244 / WhatsApp +65 9109 2024, email admin@psychconnect.sg, or use the contact form.",
      hours: "Mon-Sat 9am-6pm; closed for lunch 1pm-2pm. After-hours sessions may be available by request.",
    },
    "Little Window|96 Joo Chiat Road, #03-02, Singapore 427390": {
      fees: "$160 for a 60-minute individual, adolescent or child session; subsidised fees may be available on request.",
      booking: "Call or WhatsApp +65 8274 2699, email vivien@littlewindowsg.com, or use the Book a Session page.",
      hours: "Not published online - sessions are by appointment.",
    },
    "Eagles Mediation & Counselling Centre (EMCC)|180 Kitchener Road, City Square Mall, B2-29A, Singapore 208539": {
      fees: "For Singaporeans/PR: individual counselling $160-$180/hour; couple/family counselling $180-$200/hour; play therapy $140-$160. Sliding-scale fees may be available based on income.",
      booking: "Call +65 6788 8220, email reachus@emcc.org.sg, WhatsApp, or use the appointment form on the EMCC website.",
      hours: "Mon/Fri 9am-6pm; Tue/Wed/Thu 9am-9pm; Sat 9am-1pm (closed on 5th Saturday); public holidays closed.",
    },
  };

  return details[key] ?? {
    fees: "Not published online — confirm the current session fee.",
    booking: provider.phone ? `Call ${provider.phone} to arrange an appointment.` : "Use the clinic website to enquire or book.",
    hours: "Not published online — confirm available hours when booking.",
  };
};

const providerLocationGroup = (provider: Provider): string => {
  const location = `${provider.address} ${provider.practice}`.toLowerCase();

  if (/novena|sinaran|irrawaddy|329563|307506|307470/.test(location)) return "Novena";
  if (/farrer park|race course|217562/.test(location)) return "Farrer Park";
  if (/mount elizabeth|228510/.test(location)) return "Mount Elizabeth";
  if (/napier|gleneagles|tanglin|258499|247909/.test(location)) return "Tanglin / Gleneagles";
  if (/orchard|grange|camden|somerset|lucky plaza|238881|238863|249615|238164/.test(location)) return "Orchard / Somerset";
  if (/coleman|adelphi|north bridge|cuppage|kramat|bishan|179803|179098|229469|228773|570116/.test(location)) return "City Hall / Central";
  if (/shenton|anson|marina one|079118|079903|018935/.test(location)) return "Tanjong Pagar / Marina Bay";
  if (/guillemard|geylang|tampines|joo chiat|katong|bedok|tembeling|399849|389381|520929|427646|423731|460411|437844/.test(location)) return "East Singapore";
  if (/yishun|woodlands|ang mo kio|bidadari|woodleigh|760925|560452|367803/.test(location)) return "North Singapore";
  if (/bukit timah|lorong kilat|fifth avenue|cluny court|598120|268802|269748|259760/.test(location)) return "Bukit Timah";
  if (/clementi|bukit batok|jurong|650168/.test(location)) return "West Singapore";

  return regionLabels[provider.region];
};

const singaporeHelplines: Helpline[] = [
  { name: "national mindline 1771", category: "General support", hours: "24 hours", phone: "1771 · WhatsApp 6669 1771", tel: "tel:1771" },
  { name: "Samaritans of Singapore (SOS)", category: "General support", hours: "24 hours", phone: "1767", tel: "tel:1767" },
  { name: "Singapore Association for Mental Health (SAMH)", category: "General support", hours: "Mon - Fri, 9am - 6pm", phone: "1800 283 7019", tel: "tel:18002837019" },
  { name: "Touchline", category: "General support", hours: "Mon - Fri, 9am - 6pm", phone: "1800 377 2252", tel: "tel:18003772252" },
  { name: "Youthline", category: "General support", hours: "Mon - Sat, 12pm - 9pm", phone: "6436 6612 · Text 8533 9460", tel: "tel:64366612" },
  { name: "Community Health Assessment Team (CHAT)", category: "General support", hours: "Tue - Sat, 12pm - 9pm", phone: "6493 6500 / 6493 6501", tel: "tel:64936500" },
  { name: "Silver Ribbon Singapore", category: "General support", hours: "Mon - Fri, 9am - 5pm", phone: "6385 3714", tel: "tel:63853714" },
  { name: "CARE Singapore", category: "General support", hours: "Mon - Fri, 10am - 5pm", phone: "WhatsApp 6978 2728", tel: "https://wa.me/6569782728" },
  { name: "AWARE Women’s Helpline", category: "Specialist and safety support", hours: "Mon - Fri, 10am - 6pm", phone: "1800 777 5555", tel: "tel:18007775555" },
  { name: "We Care Addiction Hotline", category: "Specialist and safety support", hours: "Mon - Fri, 10am - 7pm", phone: "3165 8017", tel: "tel:31658017" },
  { name: "Safe Space Child Protection", category: "Specialist and safety support", hours: "Mon - Fri, 9am - 1pm / 2pm - 6pm", phone: "6266 0171", tel: "tel:62660171" },
  { name: "Tinkle Friend Children’s Helpline", category: "Specialist and safety support", hours: "Mon - Fri, 2.30pm - 5pm", phone: "1800 2744 788", tel: "tel:18002744788" },
  { name: "PAVE Family Violence", category: "Specialist and safety support", hours: "Mon - Fri, 9am - 1pm / 2pm - 6pm", phone: "6555 0390", tel: "tel:65550390" },
  { name: "National Anti-Violence and Sexual Harassment Helpline (NAVH)", category: "Specialist and safety support", hours: "24 hours", phone: "1800 777 0000", tel: "tel:18007770000" },
  { name: "ComCare Hotline", category: "Social support", hours: "Daily, 7am - midnight", phone: "1800 222 0000", tel: "tel:18002220000" },
];

const helplineDescriptions: Record<string, string> = {
  "national mindline 1771": "Confidential 24/7 mental-health support by phone, WhatsApp and webchat.",
  "Samaritans of Singapore (SOS)": "Confidential emotional support for people feeling distressed, overwhelmed or suicidal.",
  "IMH Mental Health Hotline": "Mental-health crisis support and guidance from Singapore’s national mental health institute.",
  "National Care Hotline": "Emotional support and guidance for people facing difficult personal or family situations.",
  "Singapore Association for Mental Health (SAMH)": "Emotional support and counselling for people living with mental-health concerns.",
  Touchline: "A listening and support line for people who need someone to talk to.",
  Youthline: "Support for young people dealing with emotional, relationship or life challenges.",
  "Community Health Assessment Team (CHAT)": "Mental-health assessment and support for young people, including help finding next steps.",
  "Silver Ribbon Singapore": "Mental-health information, emotional support and connections to relevant services.",
  "CARE Singapore": "Support and guidance for people experiencing emotional or mental-health difficulties.",
  "AWARE Womenâ€™s Helpline": "Support for women seeking help with gender-based violence, sexual assault or related concerns.",
  "We Care Addiction Hotline": "Support and guidance for people affected by alcohol or other substance use.",
  "MSF Child Protective Service": "Help if a child may be experiencing abuse, neglect or an unsafe home situation.",
  "Safe Space Child Protection": "Child-protection support and consultation for children and families.",
  "Tinkle Friend Childrenâ€™s Helpline": "A listening ear and support service for children who are worried or upset.",
  "PAVE Family Violence": "Support for people affected by family violence, including safety planning and referrals.",
  "National Anti-Violence and Sexual Harassment Helpline (NAVH)": "A national helpline for violence, abuse, sexual violence and sexual-harassment concerns.",
  "ComCare Hotline": "Social-assistance guidance for people facing financial hardship or related family needs.",
  "1800 777 5555": "Support for women seeking help with gender-based violence, sexual assault or related concerns.",
  "1800 2744 788": "A listening ear and support service for children who are worried or upset.",
};

const resources: Resource[] = [
  {
    name: "national mindline",
    type: "free",
    label: "24/7 support",
    description:
      "Talk to someone about what you’re going through and get guided to the right mental health support.",
    fit: "A good first step when you’re unsure what kind of help you need.",
    details: "Call 1771 or WhatsApp 6669 1771",
    action: "Visit HealthHub",
    href: "https://www.healthhub.sg/programmes/mindsg/seeking-support",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "sleep", "grief", "relationships", "work-school", "unsure"],
  },
  {
    name: "Samaritans of Singapore",
    type: "free",
    label: "24/7 emotional support",
    description:
      "A confidential listening service for anyone feeling overwhelmed, distressed or suicidal.",
    fit: "Especially relevant if things feel urgent or you need someone to listen now.",
    details: "Call 1767 · CareText 9151 1767",
    action: "View SOS services",
    href: "https://www.sos.org.sg/our-services/",
    accent: "coral",
    tags: ["low-mood", "anxiety", "stress", "grief", "self-harm"],
  },
  {
    name: "MindSG self-help tools",
    type: "free",
    label: "Self-guided support",
    description:
      "Practical information and self-care tools from Singapore’s HealthHub for different mental health needs.",
    fit: "Useful if you want to explore options privately at your own pace.",
    details: "Guides for adults, youths and caregivers",
    action: "Explore MindSG",
    href: "https://www.healthhub.sg/programmes/mindsg/discover",
    accent: "lavender",
    tags: ["low-mood", "anxiety", "stress", "sleep", "grief", "relationships", "work-school", "eating", "unsure"],
  },
  {
    name: "MindShift CBT",
    type: "free",
    label: "International app · free",
    description:
      "A free app from Anxiety Canada with practical CBT-based tools for worry, stress and panic.",
    fit: "Useful if anxiety is getting in the way and you want structured exercises to try privately.",
    details: "Free app · iOS and Android",
    action: "Explore MindShift CBT",
    href: "https://apps.apple.com/ca/app/mindshift-cbt-anxiety-relief/id634684825",
    accent: "blue",
    tags: ["anxiety", "stress", "sleep", "unsure"],
  },
  {
    name: "Calm Harm",
    type: "free",
    label: "International app · self-harm support",
    description:
      "A private app with short activities designed to help manage or resist urges to self-harm.",
    fit: "A possible in-the-moment tool while you also reach out to trusted people or professional support.",
    details: "Free app · iOS and Android",
    action: "Visit Calm Harm",
    href: "https://calmharm.stem4.org.uk/",
    accent: "coral",
    tags: ["self-harm", "anxiety", "stress", "low-mood"],
  },
  {
    name: "Insight Timer",
    type: "free",
    label: "International app · meditation and sleep",
    description:
      "A large library of guided meditation, breathwork, mindfulness and sleep practices with a free plan.",
    fit: "A gentle option for stress, racing thoughts or sleep problems when you want to start at your own pace.",
    details: "Free plan · web, iOS and Android",
    action: "Explore Insight Timer",
    href: "https://insighttimer.com/",
    accent: "lavender",
    tags: ["anxiety", "stress", "sleep", "low-mood"],
  },
  {
    name: "MindDoc",
    type: "free",
    label: "International app · mood support",
    description:
      "A mood-tracking and self-care app that helps you notice patterns and try guided exercises.",
    fit: "Helpful if you want to reflect on how you have been feeling over time before deciding on your next step.",
    details: "Free plan with optional premium features · iOS and Android",
    action: "Explore MindDoc",
    href: "https://minddoc.com/us/en",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "sleep", "unsure"],
  },
  {
    name: "Intellect",
    type: "free",
    label: "International app · mental health companion",
    description:
      "A self-guided mental health companion with journaling, reflection and practical wellbeing tools.",
    fit: "A starting point if you would rather explore support through short, guided activities on your phone.",
    details: "Free plan · iOS and Android",
    action: "Explore Intellect",
    href: "https://intellect.co/",
    accent: "gold",
    tags: ["low-mood", "anxiety", "stress", "sleep", "relationships", "work-school", "unsure"],
  },
  {
    name: "Institute of Mental Health",
    type: "public",
    label: "Specialist public care",
    description:
      "Singapore’s national mental health institute, with specialist assessment, treatment and community services.",
    fit: "Relevant when symptoms are persistent, severe or need specialist attention.",
    details: "General enquiries: 6389 2000",
    action: "Visit IMH",
    href: "https://www.nhghealth.com.sg/imh/clinical-services",
    accent: "indigo",
    tags: ["low-mood", "anxiety", "sleep", "trauma", "substance", "self-harm"],
  },
  {
    name: "Chronic Disease Management Programme (CDMP)",
    type: "public",
    label: "Subsidised public pathway",
    description:
      "A national subsidy pathway that can help eligible patients use MediSave for treatment of selected mental-health conditions.",
    fit: "Useful to ask about if you are receiving care for depression, anxiety, bipolar disorder or schizophrenia.",
    details: "Ask a public hospital, specialist clinic or polyclinic about eligibility",
    action: "See MOH CDMP details",
    href: "https://www.moh.gov.sg/others/resources-and-statistics/chronic-disease-management-programme-cdmp/",
    accent: "blue",
    tags: ["low-mood", "anxiety", "stress", "unsure"],
  },
  {
    name: "National Healthcare Group Polyclinics",
    type: "public",
    label: "Public polyclinic psychology",
    description:
      "Public polyclinics offering primary-care assessment and access to psychological services within the NHG network.",
    fit: "A practical first stop if you want an assessment, referral or subsidised care pathway.",
    details: "Services and locations vary by polyclinic",
    action: "View NHG psychology services",
    href: "https://www.nhghealth.com.sg/find-care/Service/nhg-polyclinics-psychology-services",
    accent: "indigo",
    tags: ["low-mood", "anxiety", "stress", "sleep", "work-school", "unsure"],
  },
  {
    name: "National University Polyclinics",
    type: "public",
    label: "Public polyclinic care",
    description:
      "Public polyclinic services within the National University Health System, including routes into medical and mental-health care.",
    fit: "Suitable if you want to begin with a GP or polyclinic consultation and discuss next steps.",
    details: "Check the current service list and locations before visiting",
    action: "View NUP services",
    href: "https://www.nup.com.sg/our-services/medical-services",
    accent: "blue",
    tags: ["low-mood", "anxiety", "stress", "sleep", "work-school", "unsure"],
  },
  {
    name: "Changi General Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychology services within a public hospital setting, with assessment and support pathways for different needs.",
    fit: "Consider this if you may need hospital-based assessment or specialist care in the East.",
    details: "Psychology clinic hours and appointments vary",
    action: "View CGH psychology services",
    href: "https://www.cgh.com.sg/our-specialties/psychological-medicine",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "unsure"],
  },
  {
    name: "Khoo Teck Puat Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychological medicine services at a public hospital serving the North of Singapore.",
    fit: "Relevant if you want specialist assessment or treatment through a public hospital in the North.",
    details: "Opening hours and appointment routes vary",
    action: "View KTPH psychological medicine",
    href: "https://www.nhghealth.com.sg/ktph",
    accent: "lavender",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "unsure"],
  },
  {
    name: "KK Women’s & Children’s Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychology services for women, children and families through Singapore’s specialist public hospital.",
    fit: "A relevant public option for children, adolescents, women or family-related concerns.",
    details: "Services and referral requirements vary",
    action: "View KKH psychology services",
    href: "https://www.kkh.com.sg/our-specialties/psychological-medicine",
    accent: "coral",
    tags: ["low-mood", "anxiety", "stress", "trauma", "eating", "relationships", "unsure"],
  },
  {
    name: "National University Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychological Medicine services at a public teaching hospital in the West of Singapore.",
    fit: "Useful if you may need specialist assessment or treatment through a public hospital.",
    details: "Opening hours and appointment routes vary",
    action: "View NUH Psychological Medicine",
    href: "https://www.nuh.com.sg/care-at-nuh/services/psychological-medicine/our-services/programmes---specialised-services",
    accent: "indigo",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "substance", "unsure"],
  },
  {
    name: "Ng Teng Fong General Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychology services through a public general hospital serving the West of Singapore.",
    fit: "A public hospital option if you live in the West or need specialist assessment.",
    details: "Opening hours and appointment routes vary",
    action: "View NTFGH psychology services",
    href: "https://www.ntfgh.com.sg/our-services/clinical-services/psychiatry",
    accent: "blue",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "unsure"],
  },
  {
    name: "Singapore General Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychology services at Singapore’s largest public hospital campus.",
    fit: "Consider this if you may need hospital-based psychological assessment or care.",
    details: "Directions and appointment routes are on the hospital page",
    action: "View SGH psychology services",
    href: "https://www.sgh.com.sg/our-specialties/psychology",
    accent: "indigo",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "substance", "unsure"],
  },
  {
    name: "Tan Tock Seng Hospital",
    type: "public",
    label: "Public hospital psychology",
    description:
      "Psychology services through a public hospital in central Singapore.",
    fit: "A possible route to specialist assessment or treatment in a public hospital setting.",
    details: "Opening hours and appointment routes vary",
    action: "View TTSH psychology services",
    href: "https://www.nhghealth.com.sg/ttsh",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "sleep", "trauma", "unsure"],
  },
  {
    name: "Nanyang Technological University",
    type: "public",
    label: "University counselling service",
    description:
      "Student wellbeing and counselling support for the NTU community.",
    fit: "Relevant if you are an NTU student and want campus-based support.",
    details: "For current NTU students",
    action: "View NTU student wellbeing",
    href: "https://www.ntu.edu.sg/life-at-ntu/student-life/campus-life-and-wellbeing/ntu-wellbeing/contact-us",
    accent: "gold",
    tags: ["low-mood", "anxiety", "stress", "sleep", "relationships", "work-school", "unsure"],
  },
  {
    name: "National University of Singapore",
    type: "public",
    label: "University counselling service",
    description:
      "Counselling and psychological services for the NUS community.",
    fit: "Relevant if you are an NUS student and want campus-based support.",
    details: "For current NUS students",
    action: "View NUS counselling services",
    href: "https://www.nus.edu.sg/uhc/articles/details/counselling-psychological-services",
    accent: "lavender",
    tags: ["low-mood", "anxiety", "stress", "sleep", "relationships", "work-school", "unsure"],
  },
  {
    name: "CHAT Mental Health Check",
    type: "public",
    label: "Free mental-health check",
    description:
      "An online mental-health check from CHAT to help you understand what support might be useful.",
    fit: "A low-barrier starting point if you are unsure whether to seek professional help.",
    details: "Online self-assessment",
    action: "Take the CHAT mental-health check",
    href: "https://www.nhghealth.com.sg/imh/CHAT/get-help/book-an-appointment",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "unsure"],
  },
  {
    name: "Silver Ribbon counselling support",
    type: "public",
    label: "Free support service",
    description:
      "Free or low-cost counselling support available through Silver Ribbon branches or online.",
    fit: "Useful if cost is a concern and you want to ask about accessible counselling options.",
    details: "Different branches and online options available",
    action: "View Silver Ribbon support",
    href: "https://www.silverribbonsingapore.com/services/complimentary-emotional-support/",
    accent: "coral",
    tags: ["low-mood", "anxiety", "stress", "sleep", "relationships", "unsure"],
  },
  {
    name: "It All Starts Hear",
    type: "public",
    label: "Affordable online support",
    description:
      "A Singapore social enterprise offering free peer support and affordable, subsidised counselling.",
    fit: "A lower-barrier option if you want a listening conversation or affordable counselling.",
    details: "Free peer support · subsidised counselling",
    action: "Visit It All Starts Hear",
    href: "https://www.iash.sg/",
    accent: "lavender",
    tags: ["low-mood", "anxiety", "stress", "relationships", "unsure"],
  },
  {
    name: "Eagles Mediation & Counselling Centre (EMCC)",
    type: "public",
    label: "Affordable counselling",
    description:
      "A registered charity and IPC offering confidential counselling for individuals, couples, families, children and youths in Singapore.",
    fit: "A useful option if you want professional counselling with sliding-scale support based on income.",
    details: "Singaporeans/PR: individual sessions $160-$180/hour; sliding-scale fees may be available",
    action: "Visit EMCC",
    href: "https://emcc.org.sg/",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "AWARE counselling",
    type: "public",
    label: "Sliding-scale counselling",
    description:
      "Confidential counselling for women aged 18 and above who live in Singapore, including support through AWARE's Women's Care Centre and Sexual Assault Care Centre.",
    fit: "A strong fit if gender-based violence, sexual assault, harassment, relationships or other distress are part of what you are facing.",
    details: "Sliding scale: $40-$150/session based on monthly income",
    action: "View AWARE counselling",
    href: "https://www.aware.org.sg/womens-care-centre/counselling/",
    accent: "coral",
    tags: ["low-mood", "anxiety", "stress", "relationships", "trauma", "work-school", "unsure"],
  },
  {
    name: "Singapore Counselling Centre (SCC)",
    type: "public",
    label: "NCSS-subsidised counselling",
    description:
      "Professional counselling through an NCSS-supported scheme for eligible applicants, with a limited number of subsidised sessions.",
    fit: "Useful if you are a student, CHAS cardholder, Pioneer or Merdeka Generation cardholder, or receiving financial assistance.",
    details: "Up to 6 sessions at $29.43 each; confirm current intake and eligibility",
    action: "View SCC subsidy details",
    href: "https://scc.sg/e/subsidised-counselling/",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Counselling and Care Centre (CCC)",
    type: "public",
    label: "Means-tested counselling",
    description:
      "Counselling for individuals, couples and families from a Singapore centre that offers a means-tested Counselling Fee Subsidy Scheme.",
    fit: "A practical option if you want counselling and can provide income documents for a reduced fee.",
    details: "Singaporeans/PR with income up to $9,500: $40-$170/hour after subsidy",
    action: "View CCC fee guidance",
    href: "https://counsel.org.sg/fees-chargeable/",
    accent: "lavender",
    tags: ["low-mood", "anxiety", "stress", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Shan You Counselling Centre",
    type: "public",
    label: "Subsidised counselling",
    description:
      "Counselling from a Singapore social service agency, with standard counselling fees subsidised and additional help available after financial assessment.",
    fit: "Useful if you want ongoing counselling and need a lower-cost community option.",
    details: "Individual counselling from $80; extra subsidy may be available for up to 6 sessions",
    action: "View Shan You counselling",
    href: "https://www.shanyou.org.sg/our-services/shan-you-counselling-centre/",
    accent: "plum",
    tags: ["low-mood", "anxiety", "stress", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Viriya Community Services counselling",
    type: "public",
    label: "Income-based therapy subsidy",
    description:
      "Counselling and psychological therapy from a community service agency, with subsidies considered case by case based on income.",
    fit: "A potential fit if you want individual, family or marital therapy at a reduced fee and can complete a referral assessment.",
    details: "Subsidised individual therapy: $75-$120/hour, subject to approval",
    action: "View Viriya therapy fees",
    href: "https://viriya.org.sg/service/family/",
    accent: "gold",
    tags: ["low-mood", "anxiety", "stress", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Our Journey counselling",
    type: "public",
    label: "Means-tested counselling subsidy",
    description:
      "A Counselling Fee Subsidy Scheme for Singaporeans and PRs with a gross monthly income of $9,500 or below.",
    fit: "A possible option if you can provide income documents and want individual counselling at a reduced fee.",
    details: "Subsidised individual sessions: $90-$150/hour after means testing",
    action: "View Our Journey fees",
    href: "https://www.journey.sg/our-fees/",
    accent: "mint",
    tags: ["low-mood", "anxiety", "stress", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Concise Therapy & Counselling",
    type: "public",
    label: "Private sliding-scale care",
    description:
      "A private counselling practice that uses CHAS as a framework for lower rates and independently funds a sliding-scale discount.",
    fit: "Worth enquiring about if you want private counselling with a possible lower rate and flexible online options.",
    details: "Ask about CHAS-structured sliding-scale rates; no government subsidy",
    action: "View Concise fee guidance",
    href: "https://www.concise.com.sg/enquiries",
    accent: "coral",
    tags: ["low-mood", "anxiety", "stress", "sleep", "grief", "relationships", "work-school", "trauma", "unsure"],
  },
  {
    name: "Private counselling or therapy",
    type: "private",
    label: "Flexible private care",
    description:
      "Private psychologists and counsellors can offer therapy with more flexibility around timing and preferences.",
    fit: "Suitable if you want to choose a provider directly and can pay privately.",
    details: "Ask about fees, cancellation policies and qualifications",
    action: "Find a provider",
    href: "https://www.healthhub.sg/programmes/mindsg/seeking-support",
    accent: "gold",
    tags: ["low-mood", "anxiety", "stress", "sleep", "grief", "relationships", "work-school", "trauma", "eating"],
    providerKind: "therapist",
  },
  {
    name: "Private psychiatric care",
    type: "private",
    label: "Specialist private care",
    description:
      "A private psychiatrist can assess mental health conditions and discuss treatment options, including medication where appropriate.",
    fit: "Consider this if you want a specialist assessment or have already tried other support.",
    details: "Ask about consultation and follow-up fees before booking",
    action: "Find a provider",
    href: "#provider-finder",
    accent: "plum",
    tags: ["low-mood", "anxiety", "sleep", "trauma", "substance", "self-harm"],
    providerKind: "psychiatrist",
  },
];

const supportLabels: Record<SupportType, string> = {
  free: "Free resources",
  public: "Public mental healthcare",
  private: "Private mental healthcare",
};

export function LegacyHome() {
  const [step, setStep] = useState<Step>("feeling");
  const [feeling, setFeeling] = useState("");
  const [supportType, setSupportType] = useState<SupportType | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [providerKind, setProviderKind] = useState<ProviderKind | null>(null);
  const [providerRegion, setProviderRegion] = useState<Region | null>(null);

  const currentStep = ["feeling", "support", "challenges", "results"].indexOf(step);

  const recommendations = useMemo(() => {
    if (!supportType) return [];
    const matching = resources.filter((resource) => resource.type === supportType);
    return [...matching].sort((a, b) => {
      const aScore = selectedChallenges.filter((challenge) => a.tags.includes(challenge)).length;
      const bScore = selectedChallenges.filter((challenge) => b.tags.includes(challenge)).length;
      return bScore - aScore;
    });
  }, [selectedChallenges, supportType]);

  const visibleProviders = useMemo(() => {
    if (!providerKind || !providerRegion) return [];
    const clinics = new Map<string, Provider>();
    providers
      .filter((provider) => provider.kind === providerKind && provider.region === providerRegion)
      .forEach((provider) => {
        const key = `${provider.kind}|${provider.practice}|${provider.address}`;
        if (!clinics.has(key)) clinics.set(key, provider);
      });

    return Array.from(clinics.values()).map((provider): Clinic => ({
      ...provider,
      name: provider.practice,
      role: provider.kind === "psychiatrist" ? "Private psychiatry clinic" : "Psychology, therapy & counselling clinic",
      ...clinicDetails(provider),
      locationGroup: providerLocationGroup(provider),
    }));
  }, [providerKind, providerRegion]);

  function addMessage(role: Role, text: string) {
    setMessages((current) => [...current, { role, text }]);
  }

  function submitFeeling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = feeling.trim();
    if (!trimmed) return;
    addMessage("user", trimmed);
    addMessage("assistant", "Thanks for sharing that. What kind of support do you want?");
    if (/suicid|kill myself|end my life|self[- ]?harm|hurt myself/i.test(trimmed)) {
      setUrgentOpen(true);
    }
    setStep("support");
  }

  function chooseSupport(type: SupportType) {
    setSupportType(type);
    addMessage("user", supportLabels[type]);
    addMessage("assistant", "What’s been affecting you lately? Select anything that feels relevant.");
    setStep("challenges");
  }

  function toggleChallenge(id: string) {
    setSelectedChallenges((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function showResults() {
    addMessage(
      "user",
      selectedChallenges.length
        ? selectedChallenges
            .map((id) => challenges.find(([challengeId]) => challengeId === id)?.[1])
            .filter(Boolean)
            .join(" · ")
        : "I’m not sure yet",
    );
    addMessage("assistant", "Here are a few Singapore-based options that may be a good fit.");
    setStep("results");
  }

  function openProviderFinder(kind: ProviderKind) {
    setProviderKind(kind);
    setProviderRegion(null);
    addMessage("user", kind === "psychiatrist" ? "Private psychiatric care" : "Private counselling or therapy");
    addMessage("assistant", "Where do you want your provider to be based?");
    document.getElementById("provider-finder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseProviderRegion(region: Region) {
    setProviderRegion(region);
    addMessage("user", regionLabels[region]);
    addMessage(
      "assistant",
      `Here are the private clinics in our current ${regionLabels[region]} directory snapshot.`,
    );
  }

  function closeProviderFinder() {
    setProviderKind(null);
    setProviderRegion(null);
  }

  function goBack() {
    if (step === "support") {
      setStep("feeling");
      setFeeling("");
      setSupportType(null);
      setSelectedChallenges([]);
      setMessages([]);
      return;
    }

    if (step === "challenges") {
      setStep("support");
      setSupportType(null);
      setSelectedChallenges([]);
      setMessages((current) => current.slice(0, 2));
      return;
    }

    if (step === "results") {
      setStep("challenges");
      setMessages((current) => current.slice(0, 6));
      setProviderKind(null);
      setProviderRegion(null);
    }
  }

  const backLabel =
    step === "support"
      ? "Back to your feeling"
      : step === "challenges"
        ? "Back to support type"
        : "Edit my answers";

  function restart() {
    setStep("feeling");
    setFeeling("");
    setSupportType(null);
    setSelectedChallenges([]);
    setMessages([]);
    setProviderKind(null);
    setProviderRegion(null);
  }

  const providerLocationGroups = Array.from(new Set(visibleProviders.map((provider) => provider.locationGroup)));

  function renderProviderCard(provider: Clinic) {
    return (
      <article className="provider-card" key={`${provider.name}-${provider.practice}-${provider.address}`}>
        <div className="provider-card-top">
          <span className="resource-label">{provider.role}</span>
          <span className="resource-dot" />
        </div>
        <h3>{provider.name}</h3>
        <p>{provider.description}</p>
        <div className="provider-details">
          <div className="provider-address"><span>LOCATION</span>{provider.address}</div>
          <div className="provider-address"><span>SESSION FEES</span>{provider.fees}</div>
          <div className="provider-address"><span>HOW TO BOOK</span>{provider.booking}</div>
          <div className="provider-address"><span>OPENING HOURS</span>{provider.hours}</div>
        </div>
        <div className="provider-bottom">
          <span className="provider-source">Source: {provider.source}</span>
          <div className="provider-actions">
            {provider.phone && <a href={`tel:${provider.phone.split("/")[0].replace(/[^\d+]/g, "")}`}>Call</a>}
            <a href={provider.href} target="_blank" rel="noreferrer">View listing ↗</a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Get Help SG home">
          <span className="brand-mark">+</span>
          <span>get help <em>/ sg</em></span>
        </Link>
        <div className="topbar-actions">
          <span className="location-label"><span className="location-dot" /> Singapore resource guide</span>
          <button className="urgent-link" type="button" onClick={() => setUrgentOpen(true)}>
            Need urgent help?
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="kicker"><span /> a gentler way to find support</p>
          <h1>Small steps.<br /><span>Right support.</span></h1>
          <p className="hero-description">
            Tell us what’s been going on, and we’ll help you find mental health resources in Singapore that fit your needs.
          </p>
          <div className="trust-note">
            <span className="trust-icon">✦</span>
            <div>
              <strong>Private by design</strong>
              <p>No account or diagnosis needed to explore your options.</p>
            </div>
          </div>
        </div>

        <div className="conversation-panel">
          <div className="panel-topline">
            <span>GET HELP / SG</span>
            <span className="panel-status"><span /> here with you</span>
          </div>

          <div className="progress-row" aria-label={`Step ${currentStep + 1} of 4`}>
            <span className="progress-count">0{currentStep + 1}</span>
            <div className="progress-track"><span style={{ width: `${((currentStep + 1) / 4) * 100}%` }} /></div>
            <span className="progress-total">04</span>
          </div>

          {step !== "feeling" && (
            <div className="step-navigation">
              <button type="button" onClick={goBack}>
                <span aria-hidden="true">←</span> {backLabel}
              </button>
            </div>
          )}

          <div className="conversation-body">
            {messages.length > 0 && (
              <div className="message-stack" aria-live="polite">
                {messages.map((message, index) => (
                  <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                    {message.role === "assistant" && <span className="assistant-avatar">+</span>}
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
            )}

            {step === "feeling" && (
              <div className="step-content first-step">
                <p className="question-label">how are you feeling today?</p>
                <p className="question-help">There’s no right way to answer. Start wherever feels easiest.</p>
                <form className="feeling-form" onSubmit={submitFeeling}>
                  <label className="sr-only" htmlFor="feeling">How are you feeling today?</label>
                  <textarea
                    id="feeling"
                    value={feeling}
                    onChange={(event) => setFeeling(event.target.value)}
                    placeholder="I’m feeling…"
                    rows={3}
                    autoFocus
                  />
                  <div className="form-footer">
                    <span className="privacy-caption">Your words help us find a starting point.</span>
                    <button className="send-button" type="submit" aria-label="Continue">→</button>
                  </div>
                </form>
                <div className="starter-chips" aria-label="Example responses">
                  {["I’m feeling low", "I’m very anxious", "I’m overwhelmed"].map((chip) => (
                    <button type="button" key={chip} onClick={() => setFeeling(chip)}>{chip}</button>
                  ))}
                </div>
              </div>
            )}

            {step === "support" && (
              <div className="step-content option-step">
                <p className="question-label">what kind of support do you want?</p>
                <p className="question-help">You can always change your mind later.</p>
                <div className="support-options">
                  {(
                    [
                      ["free", "Free resources", "No-cost ways to start getting support", "01"],
                      ["public", "Public mental healthcare", "Subsidised pathways and specialist care", "02"],
                      ["private", "Private mental healthcare", "More flexibility around providers and timing", "03"],
                    ] as const
                  ).map(([type, title, description, number]) => (
                    <button className="support-card" type="button" key={type} onClick={() => chooseSupport(type)}>
                      <span className="option-number">{number}</span>
                      <span className="option-copy"><strong>{title}</strong><small>{description}</small></span>
                      <span className="option-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "challenges" && (
              <div className="step-content challenge-step">
                <p className="question-label">what’s been affecting you?</p>
                <p className="question-help">Select anything that feels relevant. You can choose more than one.</p>
                <div className="challenge-grid">
                  {challenges.map(([id, label]) => (
                    <label className={`check-card ${selectedChallenges.includes(id) ? "selected" : ""}`} key={id}>
                      <input type="checkbox" checked={selectedChallenges.includes(id)} onChange={() => toggleChallenge(id)} />
                      <span className="fake-checkbox">{selectedChallenges.includes(id) ? "✓" : ""}</span>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <div className="step-actions">
                  <button className="back-button" type="button" onClick={goBack}>← Back</button>
                  <button className="primary-button" type="button" onClick={showResults}>Show my options <span>→</span></button>
                </div>
              </div>
            )}

            {step === "results" && providerKind ? (
              <div id="provider-finder" className="step-content results-step provider-finder">
                <div className="results-heading">
                  <div>
                    <p className="eyebrow">Private provider finder</p>
                    <p className="question-label">where do you want your provider to be based?</p>
                  </div>
                  <span className="result-badge">SG</span>
                </div>
                <p className="question-help">
                  Choose a region and we’ll show the clinics in our current directory snapshot, assembled from registries, association directories and clinic websites. No single Singapore registry includes every private practice, so check fees, availability and credentials directly before booking.
                </p>
                {!providerRegion ? (
                  <div className="region-options">
                    {regionOptions.map(([region, title, description], index) => (
                      <button className="region-card" type="button" key={region} onClick={() => chooseProviderRegion(region)}>
                        <span className="option-number">0{index + 1}</span>
                        <span className="option-copy"><strong>{title}</strong><small>{description}</small></span>
                        <span className="option-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="provider-results-heading">
                      <div>
                        <p className="eyebrow">{regionLabels[providerRegion]}</p>
                        <p className="question-label">{providerKind === "psychiatrist" ? "psychiatry clinics" : "psychology, therapy & counselling clinics"}</p>
                      </div>
                      <span className="provider-count">{visibleProviders.length} {visibleProviders.length === 1 ? "clinic" : "clinics"}</span>
                    </div>
                    {visibleProviders.length > 0 ? (
                      providerKind === "psychiatrist" ? (
                        <div className="provider-location-groups">
                          {providerLocationGroups.map((locationGroup) => {
                            const locationProviders = visibleProviders.filter((provider) => provider.locationGroup === locationGroup);
                            return (
                              <section className="provider-location-group" key={locationGroup}>
                                <div className="provider-location-heading">
                                  <p className="eyebrow">{locationGroup}</p>
                                  <span>{locationProviders.length} {locationProviders.length === 1 ? "clinic" : "clinics"}</span>
                                </div>
                                <div className="provider-list">{locationProviders.map(renderProviderCard)}</div>
                              </section>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="provider-list">{visibleProviders.map(renderProviderCard)}</div>
                      )
                    ) : (
                      <div className="provider-empty">
                        <strong>No curated listings yet for this region.</strong>
                        <p>Browse the professional directories below for more providers and confirm their practice location before booking.</p>
                        <div className="directory-links">
                          {providerKind === "psychiatrist" ? (
                            <a href="https://www.msf.gov.sg/docs/default-source/opg/most_visited_cis.pdf?sfvrsn=ab15e515_20" target="_blank" rel="noreferrer">Browse psychiatrist listings ↗</a>
                          ) : (
                            <><a href="https://singaporepsychologicalsociety.org/members-directory/" target="_blank" rel="noreferrer">SPS psychologist directory ↗</a><a href="https://sacsingapore.org/registry/" target="_blank" rel="noreferrer">SAC counsellor registry ↗</a></>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="results-footer">
                  <button className="back-button" type="button" onClick={closeProviderFinder}>← Back to options</button>
                  {providerRegion && <button className="text-button" type="button" onClick={() => setProviderRegion(null)}>Change region</button>}
                </div>
              </div>
            ) : step === "results" && (
              <div className="step-content results-step">
                <div className="results-heading">
                  <div>
                    <p className="eyebrow">A place to start</p>
                    <p className="question-label">options for you</p>
                  </div>
                  <span className="result-badge">SG</span>
                </div>
                <p className="question-help">These are starting points, not a diagnosis. Choose whichever feels most manageable.</p>
                {selectedChallenges.includes("self-harm") && (
                  <div className="results-alert">
                    <strong>Need help right now?</strong>
                    <span>If you may be in immediate danger, use urgent support before exploring the options below.</span>
                    <button type="button" onClick={() => setUrgentOpen(true)}>View urgent support →</button>
                  </div>
                )}
                {supportType === "free" && (
                  <div className="resource-note">
                    <strong>International options included</strong>
                    <span>Digital tools can be a useful starting point, but they are not a replacement for professional or urgent support.</span>
                  </div>
                )}
                {supportType === "free" && (
                  <section className="helpline-panel" aria-labelledby="helpline-title">
                    <div className="helpline-panel-heading">
                      <div>
                        <p className="eyebrow">Singapore support</p>
                        <p id="helpline-title" className="question-label">helplines</p>
                      </div>
                      <span className="result-badge">CALL</span>
                    </div>
                    <p className="question-help">Free phone support for emotional distress, mental health concerns and specific safety needs. If you are in immediate danger, call 995 or 999.</p>
                    <div className="helpline-groups">
                      {(["General support", "Specialist and safety support", "Social support"] as const).map((category) => (
                        <div className="helpline-group" key={category}>
                          <p className="helpline-group-title">{category}</p>
                          <div className="helpline-list">
                            {singaporeHelplines.filter((helpline) => helpline.category === category).map((helpline) => (
                              <a className="helpline-item" href={helpline.tel} key={helpline.name}>
                                <span>
                                  <strong>{helpline.name}</strong>
                                  <small className="helpline-description">{helplineDescriptions[helpline.name] ?? helplineDescriptions[helpline.phone] ?? "Support and guidance by phone."}</small>
                                  <small className="helpline-hours">{helpline.hours}</small>
                                </span>
                                <b>{helpline.phone}</b>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <a className="helpline-source" href="https://docs.superhuman.com/@vanessa-koh/mental-health-resources-in-singapore/helplines-11" target="_blank" rel="noreferrer">View the full helpline reference <span>↗</span></a>
                  </section>
                )}
                <div className="resource-list">
                  {recommendations.map((resource) => (
                    <article className={`resource-card ${resource.accent}`} key={resource.name}>
                      <div className="resource-card-top">
                        <span className="resource-label">{resource.label}</span>
                        <span className="resource-dot" />
                      </div>
                      <h3>{resource.name}</h3>
                      <p>{resource.description}</p>
                      <div className="fit-line"><span>WHY IT MAY FIT</span>{resource.fit}</div>
                      <div className="resource-bottom">
                        <span className="resource-details">{resource.details}</span>
                        {resource.providerKind ? (
                          <button className="resource-provider-button" type="button" onClick={() => openProviderFinder(resource.providerKind!)}>{resource.action} <span>↗</span></button>
                        ) : (
                          <a href={resource.href} target="_blank" rel="noreferrer">{resource.action} <span>↗</span></a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="results-footer">
                  <button className="back-button" type="button" onClick={goBack}>← Edit answers</button>
                  <button className="text-button" type="button" onClick={restart}>Start again</button>
                </div>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <span>Not sure what you need? That’s okay.</span>
            <button type="button" onClick={() => setUrgentOpen(true)}>View urgent support →</button>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>For Singapore, with care.</span>
        <span>Information is reviewed regularly · This is not medical advice</span>
      </footer>

      {urgentOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setUrgentOpen(false)}>
          <section className="urgent-modal" role="dialog" aria-modal="true" aria-labelledby="urgent-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close urgent support" onClick={() => setUrgentOpen(false)}>×</button>
            <p className="eyebrow">Immediate support in Singapore</p>
            <h2 id="urgent-title">You don’t have to handle this alone.</h2>
            <p>If you or someone else may be in immediate danger, call emergency services now.</p>
            <div className="urgent-options">
              <a href="tel:995"><span>Emergency ambulance</span><strong>995 <small>↗</small></strong></a>
              <a href="tel:999"><span>Police emergency</span><strong>999 <small>↗</small></strong></a>
              <a href="tel:1767"><span>SOS 24/7 hotline</span><strong>1767 <small>↗</small></strong></a>
              <a href="tel:1771"><span>National mindline</span><strong>1771 <small>↗</small></strong></a>
            </div>
            <p className="modal-note">If speaking on the phone is unsafe, Singapore Police emergency SMS is 70999.</p>
          </section>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <RevisedHome
      providers={providers}
      resources={resources}
      helplines={singaporeHelplines}
      helplineDescriptions={helplineDescriptions}
      regions={regionOptions}
      regionLabels={regionLabels}
      getClinicDetails={clinicDetails}
      getLocationGroup={providerLocationGroup}
    />
  );
}
