/**
 * Unit tests for add-topology-icons script
 */

import { describe, it, expect } from 'vitest';
import {
  addIconGradients,
  addAnimatedIcons,
  processTopologyFile,
  ICON_POSITIONS,
  ICON_SCALE
} from './add-topology-icons';

describe('add-topology-icons', () => {
  describe('ICON_POSITIONS', () => {
    it('should have correct positions for all 6 icons', () => {
      expect(ICON_POSITIONS).toEqual({
        nature: { x: 318.44, y: 200 },
        structure: { x: 318.44, y: 320 },
        focus: { x: 318.44, y: 440 },
        topologyFit: { x: 698.44, y: 200 },
        characteristics: { x: 698.44, y: 340 },
        collaboration: { x: 698.44, y: 560 }
      });
    });

    it('should position icons in two columns', () => {
      const leftColumn = [ICON_POSITIONS.nature, ICON_POSITIONS.structure, ICON_POSITIONS.focus];
      const rightColumn = [ICON_POSITIONS.topologyFit, ICON_POSITIONS.characteristics, ICON_POSITIONS.collaboration];

      // All left column icons should have same x
      expect(leftColumn.every(pos => pos.x === 318.44)).toBe(true);
      
      // All right column icons should have same x
      expect(rightColumn.every(pos => pos.x === 698.44)).toBe(true);
    });
  });

  describe('ICON_SCALE', () => {
    it('should have consistent scale factors', () => {
      expect(ICON_SCALE).toEqual({ x: 0.28173085392104, y: 0.3143794929418287 });
    });
  });

  describe('addIconGradients', () => {
    it('should add all 6 gradient definitions', () => {
      const mockSvg = `<svg>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect/>
</svg>`;

      const result = addIconGradients(mockSvg);

      expect(result).toContain('id="blueGrad"');
      expect(result).toContain('id="greenGrad"');
      expect(result).toContain('id="orangeGrad"');
      expect(result).toContain('id="purpleGrad"');
      expect(result).toContain('id="pinkGrad"');
      expect(result).toContain('id="cyanGrad"');
    });

    it('should preserve existing content', () => {
      const mockSvg = `<svg>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  <rect/>
</svg>`;

      const result = addIconGradients(mockSvg);

      expect(result).toContain('id="glow"');
      expect(result).toContain('<rect/>');
    });

    it('should not duplicate gradients if already present', () => {
      const mockSvg = `<svg>
  <defs>
    <linearGradient id="blueGrad">
      <stop offset="0%"/>
    </linearGradient>
  </defs>
</svg>`;

      const result = addIconGradients(mockSvg);
      const matches = result.match(/id="blueGrad"/g);
      
      expect(matches).toHaveLength(1);
    });

    it('should insert gradients before closing defs tag', () => {
      const mockSvg = `<svg>
  <defs>
    <filter id="existing"/>
  </defs>
</svg>`;

      const result = addIconGradients(mockSvg);
      const defsEndIndex = result.indexOf('</defs>');
      const blueGradIndex = result.indexOf('id="blueGrad"');

      expect(blueGradIndex).toBeLessThan(defsEndIndex);
    });
  });

  describe('addAnimatedIcons', () => {
    it('should add all 6 animated icon assets', () => {
      const mockSvg = `<svg>
  <defs/>
  <rect/>
</svg>`;

      const result = addAnimatedIcons(mockSvg);

      expect(result).toContain('data-asset-id="nature-icon"');
      expect(result).toContain('data-asset-id="structure-icon"');
      expect(result).toContain('data-asset-id="focus-icon"');
      expect(result).toContain('data-asset-id="topology-fit-icon"');
      expect(result).toContain('data-asset-id="characteristics-icon"');
      expect(result).toContain('data-asset-id="collaboration-icon"');
    });

    it('should add comment header for icon section', () => {
      const mockSvg = `<svg>
  <rect/>
</svg>`;

      const result = addAnimatedIcons(mockSvg);

      expect(result).toContain('<!-- Animated Section Icons -->');
    });

    it('should not duplicate icons if already present', () => {
      const mockSvg = `<svg>
  <g data-asset-id="nature-icon"/>
</svg>`;

      const result = addAnimatedIcons(mockSvg);
      const matches = result.match(/data-asset-id="nature-icon"/g);
      
      expect(matches).toHaveLength(1);
    });

    it('should insert icons before closing svg tag', () => {
      const mockSvg = `<svg>
  <rect/>
</svg>`;

      const result = addAnimatedIcons(mockSvg);
      const svgEndIndex = result.indexOf('</svg>');
      const natureIconIndex = result.indexOf('data-asset-id="nature-icon"');

      expect(natureIconIndex).toBeLessThan(svgEndIndex);
    });

    it('should use correct icon positions in transform attributes', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      expect(result).toContain(`translate(${ICON_POSITIONS.nature.x}, ${ICON_POSITIONS.nature.y})`);
      expect(result).toContain(`translate(${ICON_POSITIONS.structure.x}, ${ICON_POSITIONS.structure.y})`);
      expect(result).toContain(`translate(${ICON_POSITIONS.focus.x}, ${ICON_POSITIONS.focus.y})`);
      expect(result).toContain(`translate(${ICON_POSITIONS.topologyFit.x}, ${ICON_POSITIONS.topologyFit.y})`);
      expect(result).toContain(`translate(${ICON_POSITIONS.characteristics.x}, ${ICON_POSITIONS.characteristics.y})`);
      expect(result).toContain(`translate(${ICON_POSITIONS.collaboration.x}, ${ICON_POSITIONS.collaboration.y})`);
    });

    it('should use correct scale factors', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      expect(result).toContain(`scale(${ICON_SCALE.x}, ${ICON_SCALE.y})`);
    });

    it('should include animation elements', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      expect(result).toContain('<animate');
      expect(result).toContain('attributeName="opacity"');
      expect(result).toContain('repeatCount="indefinite"');
    });
  });

  describe('Icon content validation', () => {
    it('nature icon should have layered cake structure', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Should have ellipses for cake layers
      expect(result).toContain('<ellipse');
      // Should have vertical slice indicator
      expect(result).toContain('stroke="#FCD34D"');
      expect(result).toContain('stroke-dasharray="4,4"');
    });

    it('structure icon should have 6 people', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Count the number of person groups (each has circle for head + rect for body)
      const personMatches = result.match(/translate\([-\d]+, [-\d]+\)"><circle cx="0" cy="0"/g);
      expect(personMatches).toBeTruthy();
      expect(personMatches!.length).toBeGreaterThanOrEqual(6);
    });

    it('focus icon should have rotating gear', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Should have rotate animation
      expect(result).toContain('animateTransform');
      expect(result).toContain('type="rotate"');
      expect(result).toContain('from="0" to="360"');
      // Should have gear teeth
      expect(result).toContain('fill="#F59E0B"');
    });

    it('topology-fit icon should have flowing arrows', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Should have arrow paths
      expect(result).toContain('stroke="#8B5CF6"');
      expect(result).toContain('<polygon points="140,10');
      // Should have moving particles
      expect(result).toContain('attributeName="cx"');
    });

    it('characteristics icon should have shield with checkmarks', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Should have shield shape (curved bottom)
      expect(result).toContain('Q 35,45 0,60');
      // Should have checkmark paths
      expect(result).toContain('stroke="#FFF"');
      expect(result).toContain('stroke-dasharray="40"');
    });

    it('collaboration icon should have connected nodes', () => {
      const mockSvg = '<svg></svg>';
      const result = addAnimatedIcons(mockSvg);

      // Should have connection lines
      expect(result).toContain('<line');
      expect(result).toContain('stroke="#06B6D4"');
      // Should have multiple node circles
      const nodeMatches = result.match(/<circle cx="[-\d]+" cy="[-\d]+" r="\d+"/g);
      expect(nodeMatches).toBeTruthy();
      // Should have pulse animation on central node
      expect(result).toContain('from="18" to="35"');
    });
  });

  describe('Integration tests', () => {
    it('should handle complete SVG transformation', () => {
      const mockSvg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>
  
  <rect x="0" y="0" width="800" height="600" fill="#0F172A"/>
  
  <g transform="translate(20, 560)">
    <text x="380" y="38">Footer Text</text>
  </g>
</svg>`;

      let result = addIconGradients(mockSvg);
      result = addAnimatedIcons(result);

      // Should have gradients
      expect(result).toContain('id="blueGrad"');
      
      // Should have icons
      expect(result).toContain('data-asset-id="nature-icon"');
      
      // Should preserve original content
      expect(result).toContain('id="glow"');
      expect(result).toContain('Footer Text');
      
      // Should be valid XML structure
      expect(result).toMatch(/<svg[^>]*>[\s\S]*<\/svg>/);
    });
  });
});
