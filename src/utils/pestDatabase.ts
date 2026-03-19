export interface Pesticide {
  name: string;
  dosage: string;
  frequency: string;
  type: string;
  price: string;
}

export interface SprayInstruction {
  step: number;
  title: string;
  description: string;
}

export interface PestDetails {
  pestName: string;
  symptoms: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendedPesticides: Pesticide[];
  sprayInstructions: SprayInstruction[];
  description: string;
}

export const KAGGE_PEST_DATABASE: Record<string, PestDetails> = {
  "Aphids": {
    pestName: "Aphids (Greenfly/Blackfly)",
    description: "Small, soft-bodied insects that suck sap from leaves.",
    symptoms: [
      "Curled or yellowed leaves",
      "Sticky honeydew residue on surfaces",
      "Stunted growth of new shoots"
    ],
    riskLevel: "High",
    recommendedPesticides: [
      { name: "Neem Oil", dosage: "5ml per liter of water", frequency: "Spray every 7 days", type: "Organic", price: "₹450/bottle" },
      { name: "Insecticidal Soap", dosage: "10ml per liter", frequency: "Weekly", type: "Natural", price: "₹300/bottle" }
    ],
    sprayInstructions: [
      { step: 1, title: "Prepare Solution", description: "Mix neem oil with warm water and a drop of dish soap." },
      { step: 2, title: "Target Undersides", description: "Spray the undersides of leaves where aphids congregate." }
    ]
  },
  "Armyworm": {
    pestName: "Armyworm",
    description: "Caterpillars that travel in large groups, skeletonizing leaves.",
    symptoms: [
      "Ragged edges on leaves",
      "Large holes in the foliage",
      "Complete skeletonization of plants"
    ],
    riskLevel: "High",
    recommendedPesticides: [
      { name: "Bacillus thuringiensis (Bt)", dosage: "2g per liter", frequency: "Every 5 days", type: "Biological", price: "₹600/pack" },
      { name: "Spinosad", dosage: "1ml per liter", frequency: "Every 10 days", type: "Organic", price: "₹800/bottle" }
    ],
    sprayInstructions: [
      { step: 1, title: "Evening Application", description: "Apply during late evening as larvae are most active at night." },
      { step: 2, title: "Full Coverage", description: "Ensure thorough coverage of all leaf surfaces." }
    ]
  },
  "Beetle": {
    pestName: "Beetle (Agricultural)",
    description: "Various beetles that chew on leaves, flowers, and stems.",
    symptoms: [
      "Small circular holes in leaves",
      "Wilting of stems",
      "Visible scarring on fruits"
    ],
    riskLevel: "Medium",
    recommendedPesticides: [
      { name: "Pyrethrin Spray", dosage: "3ml per liter", frequency: "Twice a week", type: "Organic", price: "₹550/bottle" },
      { name: "Diatomaceous Earth", dosage: "Dust directly on leaves", frequency: "After rain", type: "Natural", price: "₹200/kg" }
    ],
    sprayInstructions: [
      { step: 1, title: "Manual Removal", description: "Hand-pick large beetles and drop them in soapy water." },
      { step: 2, title: "Protective Dusting", description: "Apply Diatomaceous Earth to create a physical barrier." }
    ]
  },
  "Bollworm": {
    pestName: "Bollworm",
    description: "A major pest for cotton and corn, boring into fruits and buds.",
    symptoms: [
      "Bored holes in fruits/bolls",
      "Yellowing of flower buds",
      "Premature dropping of produce"
    ],
    riskLevel: "High",
    recommendedPesticides: [
      { name: "NPV (Nuclear Polyhedrosis Virus)", dosage: "250 LE/ha", frequency: "Twice during flowering", type: "Biological", price: "₹1200/ha" },
      { name: "Pheromone Traps", dosage: "5 traps per acre", frequency: "Replace lures monthly", type: "Preventative", price: "₹150/trap" }
    ],
    sprayInstructions: [
      { step: 1, title: "Early Monitoring", description: "Use pheromone traps to detect initial infestation." },
      { step: 2, title: "Target Buds", description: "Focus spray on developing buds and fruits." }
    ]
  },
  "Grasshopper": {
    pestName: "Grasshopper",
    description: "Fast-moving insects that consume large amounts of foliage.",
    symptoms: [
      "Large sections of leaves missing",
      "Ragged, irregular edges on leaves",
      "Fast-spreading damage across the field"
    ],
    riskLevel: "Medium",
    recommendedPesticides: [
      { name: "Nosema locustae", dosage: "1 tsp per sq meter", frequency: "Spread as bait", type: "Biological", price: "₹900/pack" },
      { name: "Garlic Spray", dosage: "Concentrate mixed 1:10", frequency: "Weekly", type: "Organic", price: "₹150/L" }
    ],
    sprayInstructions: [
      { step: 1, title: "Barrier Spray", description: "Spray borders of the field to prevent migration." },
      { step: 2, title: "Baiting", description: "Spread biological bait in areas with high activity." }
    ]
  },
  "Mites": {
    pestName: "Mites (Spider Mites)",
    description: "Tiny arachnids that cause stippling and webbing on leaves.",
    symptoms: [
      "Fine webbing on leaf undersides",
      "Yellow/white stippling on surfaces",
      "Dusty appearance on leaves"
    ],
    riskLevel: "High",
    recommendedPesticides: [
      { name: "Horticultural Oil", dosage: "20ml per liter", frequency: "Every 10 days", type: "Natural", price: "₹400/bottle" },
      { name: "Predatory Mites", dosage: "Release as per area", frequency: "Once or twice", type: "Biological", price: "₹1500/kit" }
    ],
    sprayInstructions: [
      { step: 1, title: "Water Blast", description: "Use high-pressure water to knock mites off plants." },
      { step: 2, title: "Oil Application", description: "Suffocate remaining mites with horticultural oil." }
    ]
  },
  "Mosquito": {
    pestName: "Mosquito",
    description: "Primarily a health risk for workers; can breed in stagnant irrigation.",
    symptoms: [
      "High population near stagnant water",
      "Increased bites for farm workers",
      "Presence of larvae in water tanks"
    ],
    riskLevel: "Low",
    recommendedPesticides: [
      { name: "BTI Dunks", dosage: "1 dunk per 100 sq ft water", frequency: "Every 30 days", type: "Biological", price: "₹350/pack" },
      { name: "Citronella Oil", dosage: "Topical application", frequency: "As needed", type: "Repellent", price: "₹250/bottle" }
    ],
    sprayInstructions: [
      { step: 1, title: "Water Management", description: "Eliminate or treat all stagnant water sources." },
      { step: 2, title: "Larval Control", description: "Use BTI to kill larvae without harming beneficial insects." }
    ]
  },
  "Sawfly": {
    pestName: "Sawfly",
    description: "Larvae that scrap leaf surfaces, skeletonizing them.",
    symptoms: [
      "Skeletonized leaf appearance",
      "Scraped leaf surfaces",
      "Visible small 'slug-like' larvae"
    ],
    riskLevel: "Medium",
    recommendedPesticides: [
      { name: "Spinosad", dosage: "2ml per liter", frequency: "Weekly", type: "Biological", price: "₹850/bottle" },
      { name: "Neem Spray", dosage: "5ml per liter", frequency: "Weekly", type: "Organic", price: "₹450/bottle" }
    ],
    sprayInstructions: [
      { step: 1, title: "Early Detection", description: "Check for clusters of eggs on the underside of leaves." },
      { step: 2, title: "Spray Larvae", description: "Directly spray visible larvae for maximum effect." }
    ]
  },
  "Stem Borer": {
    pestName: "Stem Borer",
    description: "Larvae that bore into the stems of crops like rice and sugarcane.",
    symptoms: [
      "Wilting central shoots ('Dead Hearts')",
      "Visible entry holes in stems",
      "Chaffy or empty grains at harvest"
    ],
    riskLevel: "High",
    recommendedPesticides: [
      { name: "Pheromone Traps", dosage: "8-10 per acre", frequency: "Check weekly", type: "Preventative", price: "₹180/trap" },
      { name: "Systemic Insecticide", dosage: "As per mfg spec", frequency: "Once at detection", type: "Chemical", price: "₹1100/L" }
    ],
    sprayInstructions: [
      { step: 1, title: "Plant Removal", description: "Uproot and burn 'Dead Hearts' immediately." },
      { step: 2, title: "Base Application", description: "Apply treatment to the base of the plant where larvae enter." }
    ]
  }
};
