/**
 * Script to remove animated section icons from topology SVG files
 * This is useful for cleaning up before re-applying icons with updated positions
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RemoveResult {
  file: string;
  success: boolean;
  message: string;
}

/**
 * Remove animated section icons from an SVG file
 */
function removeAnimatedIcons(svgContent: string): string {
  // Remove the entire "Animated Section Icons" section
  const iconSectionRegex = /\n\s*<!-- Animated Section Icons -->[\s\S]*?(?=<\/svg>)/;
  return svgContent.replace(iconSectionRegex, '\n');
}

/**
 * Remove icon gradients from the defs section
 */
function removeIconGradients(svgContent: string): string {
  // Remove the entire "Icon Gradients" section
  const gradientSectionRegex = /\n\s*<!-- Icon Gradients -->[\s\S]*?(?=\n\s*<\/defs>)/;
  return svgContent.replace(gradientSectionRegex, '');
}

/**
 * Process a single topology SVG file to remove icons
 */
function removeIconsFromFile(filePath: string): RemoveResult {
  try {
    const svgContent = readFileSync(filePath, 'utf-8');
    
    // Check if file has icons
    if (!svgContent.includes('data-asset-id="nature-icon"')) {
      return {
        file: filePath,
        success: true,
        message: 'No icons found, skipping'
      };
    }
    
    // Remove icons and gradients
    let updatedContent = removeAnimatedIcons(svgContent);
    updatedContent = removeIconGradients(updatedContent);
    
    // Write back
    writeFileSync(filePath, updatedContent, 'utf-8');
    
    return {
      file: filePath,
      success: true,
      message: 'Removed icons and gradients'
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
  
  // Process topology files 02-07
  const topologyFiles = [
    'topology-02-host-sdk-platform.svg',
    'topology-03-thin-host-enabling.svg',
    'topology-04-components-design-system.svg',
    'topology-05-conductor-core.svg',
    'topology-06-valence-governance.svg',
    'topology-07-product-solution.svg'
  ];
  
  console.log('🧹 Removing animated section icons from topology slides...\n');
  
  const results: RemoveResult[] = [];
  
  for (const file of topologyFiles) {
    const filePath = join(svgsDir, file);
    console.log(`Processing: ${file}`);
    const result = removeIconsFromFile(filePath);
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
  
  console.log('\n💡 Now run: npm run topology:add-icons');
}

// Export for testing
export {
  removeAnimatedIcons,
  removeIconGradients,
  removeIconsFromFile
};

// Run main function
main();
