/**
 * Script to add animated section icons to all topology slide SVG files
 * This ensures consistent positioning and structure across all slides
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon gradient definitions to add to SVG defs
const ICON_GRADIENTS = `
    <!-- Icon Gradients -->
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6"/>
      <stop offset="100%" style="stop-color:#2563EB"/>
    </linearGradient>
    
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10B981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
    
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F59E0B"/>
      <stop offset="100%" style="stop-color:#D97706"/>
    </linearGradient>
    
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
    
    <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EC4899"/>
      <stop offset="100%" style="stop-color:#DB2777"/>
    </linearGradient>
    
    <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06B6D4"/>
      <stop offset="100%" style="stop-color:#0891B2"/>
    </linearGradient>`;

// Layout constants for section positioning
const LAYOUT = {
  contentGrid: { x: 40, y: 160 },          // Content grid offset from SVG origin
  leftColumn: { x: 0, width: 340 },        // Left column sections
  rightColumn: { x: 380, width: 340 },     // Right column sections
  rectOffset: 24,                          // Rect starts at section y + 24
  iconPadding: 6,                          // Vertical padding inside rect for icon
  iconRightMargin: 61.56,                  // Horizontal offset from section right edge (for both columns)
  sectionGap: 120,                         // Vertical gap between sections
};

// Section vertical offsets within content grid (relative to content grid y)
const SECTIONS = {
  nature: 0,
  structure: 120,
  focus: 240,
  topologyFit: 0,
  characteristics: 140,
  collaboration: 360,
};

// Helper function to calculate icon position
const calculateIconPosition = (column: 'left' | 'right', sectionOffset: number) => {
  const col = column === 'left' ? LAYOUT.leftColumn : LAYOUT.rightColumn;
  return {
    x: LAYOUT.contentGrid.x + col.x + col.width - LAYOUT.iconRightMargin,
    y: LAYOUT.contentGrid.y + sectionOffset + LAYOUT.rectOffset + LAYOUT.iconPadding
  };
};

// Icon positions calculated from layout constants
const ICON_POSITIONS = {
  nature: calculateIconPosition('left', SECTIONS.nature),
  structure: calculateIconPosition('left', SECTIONS.structure),
  focus: calculateIconPosition('left', SECTIONS.focus),
  topologyFit: calculateIconPosition('right', SECTIONS.topologyFit),
  characteristics: calculateIconPosition('right', SECTIONS.characteristics),
  collaboration: calculateIconPosition('right', SECTIONS.collaboration),
};

const ICON_SCALE = { x: 0.28173085392104, y: 0.3143794929418287 };

// Nature icon - Vertical slice (layered cake)
const NATURE_ICON = `
  <g data-asset-id="nature-icon" data-asset-name="nature-icon.svg" transform="translate(${ICON_POSITIONS.nature.x}, ${ICON_POSITIONS.nature.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#blueGrad)" opacity="0.1" filter="url(#glow)">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(40, 50)">
      <ellipse cx="60" cy="90" rx="50" ry="12" fill="#3B82F6" opacity="0.8"><animate attributeName="opacity" values="0.8;0.95;0.8" dur="3s" repeatCount="indefinite"/></ellipse>
      <rect x="10" y="80" width="100" height="25" fill="#3B82F6"/>
      <ellipse cx="60" cy="80" rx="50" ry="12" fill="#60A5FA"/>
      <ellipse cx="60" cy="65" rx="50" ry="12" fill="#3B82F6" opacity="0.8"><animate attributeName="opacity" values="0.8;0.95;0.8" dur="3s" begin="0.5s" repeatCount="indefinite"/></ellipse>
      <rect x="10" y="55" width="100" height="25" fill="#3B82F6"/>
      <ellipse cx="60" cy="55" rx="50" ry="12" fill="#60A5FA"/>
      <ellipse cx="60" cy="40" rx="50" ry="12" fill="#3B82F6" opacity="0.8"><animate attributeName="opacity" values="0.8;0.95;0.8" dur="3s" begin="1s" repeatCount="indefinite"/></ellipse>
      <rect x="10" y="30" width="100" height="25" fill="#3B82F6"/>
      <ellipse cx="60" cy="30" rx="50" ry="12" fill="#60A5FA"/>
      <line x1="60" y1="25" x2="60" y2="95" stroke="#FCD34D" stroke-width="4" stroke-dasharray="4,4"><animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/></line>
      <polygon points="60,20 55,28 65,28" fill="#FCD34D"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></polygon>
      <polygon points="60,100 55,92 65,92" fill="#FCD34D"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></polygon>
    </g>
  </g>`;

// Structure icon - 6 people in team formation
const STRUCTURE_ICON = `
  <g data-asset-id="structure-icon" data-asset-name="structure-icon.svg" transform="translate(${ICON_POSITIONS.structure.x}, ${ICON_POSITIONS.structure.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#greenGrad)" opacity="0.1" filter="url(#glow)">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(100, 100)">
      <g transform="translate(0, -50)"><circle cx="0" cy="0" r="12" fill="#10B981"><animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#10B981"/></g>
      <g transform="translate(43, -25)"><circle cx="0" cy="0" r="12" fill="#34D399"><animate attributeName="r" values="12;14;12" dur="2s" begin="0.3s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#34D399"/></g>
      <g transform="translate(43, 25)"><circle cx="0" cy="0" r="12" fill="#10B981"><animate attributeName="r" values="12;14;12" dur="2s" begin="0.6s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#10B981"/></g>
      <g transform="translate(0, 50)"><circle cx="0" cy="0" r="12" fill="#34D399"><animate attributeName="r" values="12;14;12" dur="2s" begin="0.9s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#34D399"/></g>
      <g transform="translate(-43, 25)"><circle cx="0" cy="0" r="12" fill="#10B981"><animate attributeName="r" values="12;14;12" dur="2s" begin="1.2s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#10B981"/></g>
      <g transform="translate(-43, -25)"><circle cx="0" cy="0" r="12" fill="#34D399"><animate attributeName="r" values="12;14;12" dur="2s" begin="1.5s" repeatCount="indefinite"/></circle><rect x="-8" y="10" width="16" height="20" rx="8" fill="#34D399"/></g>
      <circle cx="0" cy="0" r="45" fill="none" stroke="#10B981" stroke-width="2" stroke-dasharray="5,5" opacity="0.5"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite"/></circle>
    </g>
  </g>`;

// Focus icon - Gear/cog for orchestration
const FOCUS_ICON = `
  <g data-asset-id="focus-icon" data-asset-name="focus-icon.svg" transform="translate(${ICON_POSITIONS.focus.x}, ${ICON_POSITIONS.focus.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#orangeGrad)" opacity="0.1" filter="url(#glow)">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(100, 100)">
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B" transform="rotate(60)"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B" transform="rotate(120)"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B" transform="rotate(180)"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B" transform="rotate(240)"/>
        <path d="M 0,-55 L 10,-50 L 10,-40 L 0,-35 L -10,-40 L -10,-50 Z" fill="#F59E0B" transform="rotate(300)"/>
        <circle cx="0" cy="0" r="35" fill="#F59E0B"/>
      </g>
      <circle cx="0" cy="0" r="15" fill="#0F172A"><animate attributeName="r" values="15;17;15" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="0" cy="0" r="25" fill="none" stroke="#FCD34D" stroke-width="2" opacity="0.6"><animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="0" cy="0" r="35" fill="none" stroke="#FCD34D" stroke-width="3" opacity="0"><animate attributeName="r" from="35" to="60" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite"/></circle>
    </g>
  </g>`;

// Topology Fit icon - Stream/flow arrows
const TOPOLOGY_FIT_ICON = `
  <g data-asset-id="topology-fit-icon" data-asset-name="topology-fit-icon.svg" transform="translate(${ICON_POSITIONS.topologyFit.x}, ${ICON_POSITIONS.topologyFit.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#purpleGrad)" opacity="0.1" filter="url(#glow)"/>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(40, 70)">
      <g opacity="0.8"><path d="M 10,10 L 130,10" stroke="#8B5CF6" stroke-width="8" stroke-linecap="round"/><polygon points="140,10 130,5 130,15" fill="#8B5CF6"/></g>
      <g opacity="0.6" transform="translate(0, 25)"><path d="M 10,10 L 130,10" stroke="#A78BFA" stroke-width="8" stroke-linecap="round"/><polygon points="140,10 130,5 130,15" fill="#A78BFA"/></g>
      <g opacity="0.9" transform="translate(0, 50)"><path d="M 10,10 L 130,10" stroke="#8B5CF6" stroke-width="8" stroke-linecap="round"/><polygon points="140,10 130,5 130,15" fill="#8B5CF6"/></g>
      <circle cx="40" cy="10" r="4" fill="#C4B5FD"><animate attributeName="cx" from="10" to="140" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="60" cy="35" r="4" fill="#DDD6FE"><animate attributeName="cx" from="10" to="140" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="80" cy="60" r="4" fill="#C4B5FD"><animate attributeName="cx" from="10" to="140" dur="1.8s" repeatCount="indefinite"/></circle>
    </g>
  </g>`;

// Characteristics icon - Shield with checkmarks
const CHARACTERISTICS_ICON = `
  <g data-asset-id="characteristics-icon" data-asset-name="characteristics-icon.svg" transform="translate(${ICON_POSITIONS.characteristics.x}, ${ICON_POSITIONS.characteristics.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#pinkGrad)" opacity="0.1" filter="url(#glow)">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(100, 80)">
      <path d="M 0,-40 L 35,-35 L 35,15 Q 35,45 0,60 Q -35,45 -35,15 L -35,-35 Z" fill="#EC4899" opacity="0.8"><animate attributeName="opacity" values="0.8;0.95;0.8" dur="3s" repeatCount="indefinite"/></path>
      <path d="M 0,-40 L 35,-35 L 35,15 Q 35,45 0,60 Q -35,45 -35,15 L -35,-35 Z" fill="none" stroke="#F9A8D4" stroke-width="2"><animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite"/></path>
      <g stroke="#FFF" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M -20,-10 L -10,0 L 10,-20" stroke-dasharray="40" stroke-dashoffset="40"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" begin="0s" fill="freeze"/></path>
        <path d="M -20,10 L -10,20 L 10,0" stroke-dasharray="40" stroke-dashoffset="40"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" begin="0.3s" fill="freeze"/></path>
        <path d="M -15,30 L -5,40 L 15,20" stroke-dasharray="40" stroke-dashoffset="40"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" begin="0.6s" fill="freeze"/></path>
      </g>
      <circle cx="25" cy="-25" r="3" fill="#FFF" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite"/></circle>
      <circle cx="-25" cy="0" r="2" fill="#FFF" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.3s" repeatCount="indefinite"/></circle>
      <circle cx="30" cy="25" r="2.5" fill="#FFF" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.6s" repeatCount="indefinite"/></circle>
    </g>
  </g>`;

// Collaboration icon - Connected nodes
const COLLABORATION_ICON = `
  <g data-asset-id="collaboration-icon" data-asset-name="collaboration-icon.svg" transform="translate(${ICON_POSITIONS.collaboration.x}, ${ICON_POSITIONS.collaboration.y}) scale(${ICON_SCALE.x}, ${ICON_SCALE.y})" opacity="1">
    <circle xmlns="http://www.w3.org/2000/svg" cx="100" cy="100" r="90" fill="url(#cyanGrad)" opacity="0.1" filter="url(#glow)"/>
    <g xmlns="http://www.w3.org/2000/svg" transform="translate(100, 100)">
      <line x1="-40" y1="-30" x2="40" y2="-30" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="-40" y1="-30" x2="0" y2="30" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="40" y1="-30" x2="0" y2="30" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="-40" y1="-30" x2="-30" y2="40" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="40" y1="-30" x2="30" y2="40" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="0" y1="30" x2="-30" y2="40" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <line x1="0" y1="30" x2="30" y2="40" stroke="#06B6D4" stroke-width="3" opacity="0.5"/>
      <circle cx="-40" cy="-30" r="12" fill="#06B6D4"/>
      <circle cx="40" cy="-30" r="12" fill="#06B6D4"/>
      <circle cx="0" cy="30" r="12" fill="#22D3EE"/>
      <circle cx="-30" cy="40" r="10" fill="#06B6D4"/>
      <circle cx="30" cy="40" r="10" fill="#06B6D4"/>
      <circle cx="0" cy="0" r="18" fill="#22D3EE"/>
      <circle cx="0" cy="0" r="8" fill="#FFF" opacity="0.5"/>
      <circle cx="0" cy="0" r="18" fill="none" stroke="#22D3EE" stroke-width="2" opacity="0.8"><animate attributeName="r" from="18" to="35" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite"/></circle>
    </g>
  </g>`;

const ALL_ICONS = [
  NATURE_ICON,
  STRUCTURE_ICON,
  FOCUS_ICON,
  TOPOLOGY_FIT_ICON,
  CHARACTERISTICS_ICON,
  COLLABORATION_ICON
].join('\n');

interface ProcessResult {
  file: string;
  success: boolean;
  message: string;
}

/**
 * Add icon gradients to the defs section of an SVG file
 */
function addIconGradients(svgContent: string): string {
  // Check if gradients already exist
  if (svgContent.includes('id="blueGrad"')) {
    return svgContent;
  }

  // Find the closing </defs> tag and insert gradients before it
  const defsEndRegex = /(\s*)<\/defs>/;
  return svgContent.replace(defsEndRegex, `${ICON_GRADIENTS}\n$1</defs>`);
}

/**
 * Add animated section icons to an SVG file
 */
function addAnimatedIcons(svgContent: string): string {
  // Check if icons already exist
  if (svgContent.includes('data-asset-id="nature-icon"')) {
    return svgContent;
  }

  // Find the closing </svg> tag and insert icons before it
  const svgEndRegex = /([ \t]*)<\/svg>\s*$/;
  return svgContent.replace(svgEndRegex, `\n  <!-- Animated Section Icons -->${ALL_ICONS}\n$1</svg>`);
}

/**
 * Process a single topology SVG file
 */
function processTopologyFile(filePath: string): ProcessResult {
  try {
    const svgContent = readFileSync(filePath, 'utf-8');
    
    // Add gradients
    let updatedContent = addIconGradients(svgContent);
    
    // Add icons
    updatedContent = addAnimatedIcons(updatedContent);
    
    // Only write if content changed
    if (updatedContent !== svgContent) {
      writeFileSync(filePath, updatedContent, 'utf-8');
      return {
        file: filePath,
        success: true,
        message: 'Added icon gradients and animated icons'
      };
    }
    
    return {
      file: filePath,
      success: true,
      message: 'Icons already present, no changes needed'
    };
  } catch (error) {
    return {
      file: filePath,
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Main execution
 */
function main() {
  const svgsDir = join(__dirname, '..', 'svgs');
  
  // Process topology files 02-07 (01 is already done manually)
  const topologyFiles = [
    'topology-02-host-sdk-platform.svg',
    'topology-03-thin-host-enabling.svg',
    'topology-04-components-design-system.svg',
    'topology-05-conductor-core.svg',
    'topology-06-valence-governance.svg',
    'topology-07-product-solution.svg'
  ];
  
  console.log('🎨 Adding animated section icons to topology slides...\n');
  
  const results: ProcessResult[] = [];
  
  for (const file of topologyFiles) {
    const filePath = join(svgsDir, file);
    console.log(`Processing: ${file}`);
    const result = processTopologyFile(filePath);
    results.push(result);
    console.log(`  ${result.success ? '✓' : '✗'} ${result.message}\n`);
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('━'.repeat(60));
  console.log(`\n✨ Complete! ${successful} files processed successfully`);
  if (failed > 0) {
    console.log(`⚠️  ${failed} files had errors`);
  }
}

// Export for testing
export {
  addIconGradients,
  addAnimatedIcons,
  processTopologyFile,
  ICON_POSITIONS,
  ICON_SCALE,
  LAYOUT,
  SECTIONS,
  calculateIconPosition
};

// Run main function
main();
