export type Slide = {
  /** Short caption rendered under the visual. */
  caption: string
  /** Optional real asset. Drop a file in /public/media and point here. */
  src?: string
  kind?: 'image' | 'video'
  /** Procedural fallback used when `src` is absent. */
  figure: FigureKind
  /** Numbers pinned to the visual, e.g. a result worth remembering. */
  stat?: { value: string; unit?: string; note: string }
}

export type FigureKind =
  | 'pointcloud'
  | 'graph'
  | 'terminal'
  | 'surface'
  | 'plot'
  | 'lattice'
  | 'funnel'
  | 'helix'

export type Work = {
  id: string
  index: string
  kicker: string
  title: string
  lede: string
  bullets: string[]
  slides: Slide[]
}

export const PROFILE = {
  name: 'Yang Li',
  suffix: 'PhD',
  role: 'Computational Chemist',
  org: 'Pacagen · RE:YOU',
  email: 'yangli2021@u.northwestern.edu',
  phone: '+1 (217) 848-2345',
  intro:
    'I build the computational machinery that turns molecular questions into shipped answers — discovery platforms, simulation at scale, and the infrastructure underneath both.',
  sub: 'Chemical & Biomolecular Engineering PhD, Northwestern. Currently running end-to-end small-molecule and protein discovery: 17M-compound search spaces, physics-based simulation, and the cloud systems that hold it all together.',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yang-li-69377615a/', hint: 'in/yang-li-nu' },
    {
      label: 'Google Scholar',
      href: 'https://scholar.google.com/citations?user=mvo6jCQAAAAJ&hl=en',
      hint: 'citations',
    },
    { label: 'GitHub', href: 'https://github.com/l454025801', hint: 'l454025801' },
    { label: 'Email', href: 'yangli@yang-ai4s.com', hint: 'get in touch' },
  ],
  marquee: [
    'machine learning',
    'molecular dynamics',
    'free-energy methods',
    'high-throughput screening',
    'protein design',
    'cloud infrastructure',
  ],
}

export const STATS = [
  { value: '13', label: 'publications', note: 'Nat. Nanotechnol. · Nat. Commun. · JCIM' },
  { value: '20+', label: 'discovered molecules', note: 'bioactive & safe compounds' },
  { value: '8', label: 'months to launch', note: 'from discovery to commercial product' },
  { value: '~70K', label: 'papers / day', note: 'read by an autonomous agent' },
]

export const WORKS: Work[] = [
  {
    id: 'ai',
    index: '01',
    kicker: 'Machine learning',
    title: 'AI for discovery',
    lede: 'Models that decide what to make next — and agents that read the literature faster than any group of humans can.',
    bullets: [
      'Led ML-driven identification of next-generation bioactive molecules for hair growth, combining learned scoring with docking and molecular dynamics. 10+ hits at a ~3% hit rate.',
      'Created a chemical-space dimension-reduction and sampling method that compresses a 17M-molecule library to a ~200K subset while preserving coverage — ~80% lower screening cost.',
      'Translated in-silico hits into experimental validation plans with downstream wet-lab teams, closing the loop between prediction and assay.',
      'Built and deployed an autonomous agent that analyzes ~70,000 academic papers daily, surfacing candidate biological pathways and novel research drugs.',
    ],
    slides: [
      {
        figure: 'pointcloud',
        caption: 'Chemical space, 17M → 200K. Sampling preserves coverage of the parent library.',
        stat: { value: '80', unit: '%', note: 'screening cost removed' },
      },
      {
        figure: 'funnel',
        caption: 'Virtual screening cascade: learned scoring, docking, then MD on survivors.',
        stat: { value: '3', unit: '%', note: 'hit rate, 10+ confirmed' },
      },
      {
        figure: 'graph',
        caption: 'Literature agent — pathway and target graph rebuilt nightly from new papers.',
        stat: { value: '70K', unit: '/day', note: 'papers parsed' },
      },
    ],
  },
  {
    id: 'science',
    index: '02',
    kicker: 'Computational chemistry & biology',
    title: 'Molecules, in physics',
    lede: 'All-atom and coarse-grained simulation, free-energy calculation, and structure-based design — from peptide inhibitors to self-assembled nanofibers.',
    bullets: [
      'Designed a naturally derived peptide inhibitor of the Keap1/Nrf2 interaction for neurodegenerative disease, using structure-based design, docking, all-atom and MARTINI MD, and ML.',
      'Built a Python program that analyzes protein surface character — charge distribution, hydrophobicity, convexity — directly from simulation trajectories to explain binding affinity.',
      'Engineered poly(propylene sulfone) nanoparticle anchors for drug delivery and protein protection; sampled binding poses with all-atom MD, then quantified with FEP and advanced metadynamics.',
      'Resolved local charge and functional-group segregation on peptide-amphiphile cylindrical nanofiber surfaces through theoretical modeling and MD.',
      'Mapped salt and pH effects on nanofiber surface charge with coarse-grained Monte Carlo and MD.',
      'Ran preliminary studies for an NSF grant application on peptide-protein therapeutics and machine learning, in Python and C++.',
    ],
    slides: [
      {
        figure: 'surface',
        caption: 'Protein surface printer — charge, hydrophobicity and convexity per patch.',
        stat: { value: 'JCIM', note: 'Protein Surface Printer, 2020' },
      },
      {
        figure: 'helix',
        caption: 'Keap1/Nrf2 peptide inhibitor series, derived from a natural binding motif.',
      },
      {
        figure: 'plot',
        caption: 'FEP and metadynamics: binding free energy and chain-folding landscapes.',
        stat: { value: 'ΔG', note: 'FEP + metadynamics' },
      },
      {
        figure: 'lattice',
        caption: 'Coarse-grained nanofiber surface under varying salt and pH.',
      },
    ],
  },
  {
    id: 'systems',
    index: '03',
    kicker: 'Systems & infrastructure',
    title: 'The platform underneath',
    lede: 'Databases, clusters, and pipelines built so that the science above them is reproducible by default.',
    bullets: [
      'Led development of an end-to-end computational high-throughput discovery platform: database infrastructure, standardized protocols, an algorithm library, and custom APIs.',
      'Built and curated a SQL database of 17M+ commercially available compounds with physicochemical properties, organism provenance, and vendor APIs for live pricing and availability.',
      'Owned cloud operations across AWS, Google Cloud, and Azure — cluster deployment, monitoring, maintenance, and performance tuning for large-scale workloads.',
      'Shipped a full-stack experiment management system on AWS EC2 (Flask, TypeScript, Nginx) to centralize experimental data, enable traceability, and manage lab inventory.',
      'Developed reproducible sequence-analysis workflows for cDNA-derived camelid VHH libraries, integrating clone sequencing and flow-cytometry screening to separate binders across five household allergen targets.',
      'Designed a reproducible bulk RNA-seq statistical workflow in R: QC, low-count filtering, DESeq2 GLM modeling, treatment contrasts, multiple-testing correction, and effect-size interpretation.',
    ],
    slides: [
      {
        figure: 'terminal',
        caption: 'Discovery platform — standardized protocols behind one API surface.',
        stat: { value: '17M+', note: 'rows, priced live' },
      },
      {
        figure: 'lattice',
        caption: 'Multi-cloud compute: AWS, GCP, Azure clusters under one operator.',
      },
      {
        figure: 'graph',
        caption: 'VHH library triage across five allergen targets.',
        stat: { value: '5', note: 'allergen targets' },
      },
      {
        figure: 'plot',
        caption: 'DESeq2 differential expression with pathway enrichment overlay.',
      },
    ],
  },
  {
    id: 'other',
    index: '04',
    kicker: 'Adjacent work',
    title: 'Product, growth & words',
    lede: 'The parts of a company that are not the model — web, analytics, and the story a product tells.',
    bullets: [
      'Contributed ~20% of the codebase for company website development, across front-end and back-end feature implementation.',
      'Ran marketing data analysis: page value optimization, customer segmentation, and geographic trend analysis, turned into decisions rather than dashboards.',
      'Supported cross-functional content creation for product messaging and brand communication.',
      'Managed external collaborations with commercial and academic partners, aligning technical requirements and shortening research timelines.',
      'Presented at the Muenster Symposium and the Biomedical Engineering Society Conference on dipole-rich homopolymer superstructures and PPSU interfaces.',
    ],
    slides: [
      {
        figure: 'plot',
        caption: 'Page value, segmentation, and geographic lift across the funnel.',
        stat: { value: '20', unit: '%', note: 'of site codebase' },
      },
      {
        figure: 'terminal',
        caption: 'Front-end and back-end feature work on the commercial site.',
      },
      {
        figure: 'pointcloud',
        caption: 'Customer segments, clustered and mapped.',
      },
    ],
  },
]

export const PERSONAL = {
  heading: 'Off the clock',
  body: [
    'I grew up between Illinois and Evanston lab benches, and I still like problems that sit awkwardly between two fields — the ones where the chemistry person and the software person each assume the other has it handled.',
    'Most of what I enjoy about this work is the handoff: a model that produces a number, a simulation that explains it, and a wet-lab team that gets to test it next week. Everything I build is pointed at making that loop shorter.',
    'Currently based in the US and open to conversations about computational discovery, ML for molecules, and the infrastructure that makes both boring in the best way.',
  ],
  education: [
    {
      degree: 'PhD, Chemical & Biomolecular Engineering',
      school: 'Northwestern University',
      years: '2019 — 2024',
      note: 'Advised by Prof. Monica Olvera de la Cruz and Prof. Evan Scott',
    },
    {
      degree: 'BS, Chemical & Biomolecular Engineering',
      school: 'University of Illinois Urbana-Champaign',
      years: '2015 — 2019',
    },
  ],
  toolbox: [
    'Python',
    'C++',
    'TypeScript',
    'R',
    'SQL',
    'PyTorch',
    'GROMACS',
    'MARTINI',
    'Flask',
    'AWS',
    'GCP',
    'Azure',
    'Nginx',
  ],
  selected: [
    {
      cite: 'Controlled adsorption of multiple bioactive proteins enables targeted mast cell nanotherapy',
      venue: 'Nature Nanotechnology',
      year: '2024',
      href: 'https://doi.org/10.1038/s41565-023-01584-z',
      note: 'co-first author',
    },
    {
      cite: 'A biomimetic multi-component subunit vaccine via ratiometric loading of hierarchical hydrogels',
      venue: 'Nature Communications',
      year: '2025',
      href: 'https://doi.org/10.1038/s41467-025-60416-x',
    },
    {
      cite: 'Aggregation-Induced Asymmetric Charge States of Amino Acids in Supramolecular Nanofibers',
      venue: 'J. Phys. Chem. B',
      year: '2023',
      href: 'https://doi.org/10.1021/acs.jpcb.3c05598',
      note: 'first author',
    },
    {
      cite: 'Protein Surface Printer for Exploring Protein Domains',
      venue: 'J. Chem. Inf. Model.',
      year: '2020',
      href: 'https://doi.org/10.1021/acs.jcim.0c00582',
      note: 'first author',
    },
    {
      cite: 'Inhibiting the Keap1/Nrf2 Protein-Protein Interaction with Protein-Like Polymers',
      venue: 'Advanced Materials',
      year: '2024',
      href: 'https://doi.org/10.1002/adma.202311467',
    },
  ],
}
