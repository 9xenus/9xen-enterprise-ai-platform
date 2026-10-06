export interface A11yIssue {
  id: string;
  type: 'contrast' | 'aria-label' | 'image-alt' | 'form-label' | 'heading-hierarchy' | 'interactive-role' | 'touch-target';
  severity: 'critical' | 'warning' | 'info';
  wcagRule: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  elementTag: string;
  elementSelector: string;
  elementText: string;
  message: string;
  suggestion: string;
  rect?: DOMRect;
  domElement?: HTMLElement;
  details?: {
    contrastRatio?: number;
    requiredRatio?: number;
    fgColor?: string;
    bgColor?: string;
    fontSize?: string;
    isLargeText?: boolean;
    missingAttribute?: string;
  };
}

export interface A11yAuditResult {
  timestamp: string;
  url: string;
  overallScore: number;
  grade: 'A' | 'AA' | 'AAA' | 'FAIL';
  totalElementsScanned: number;
  issues: A11yIssue[];
  passedCount: number;
  contrastIssuesCount: number;
  ariaIssuesCount: number;
  otherIssuesCount: number;
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
}

export function parseColor(colorStr: string): [number, number, number, number] | null {
  if (!colorStr || colorStr === 'transparent') return null;
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10),
      rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    ];
  }
  if (colorStr.startsWith('#')) {
    let hex = colorStr.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255, 1];
    }
  }
  return null;
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const l1 = getRelativeLuminance(fg[0], fg[1], fg[2]);
  const l2 = getRelativeLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

export function getEffectiveBackgroundColor(element: HTMLElement): [number, number, number] {
  let curr: HTMLElement | null = element;
  let bgR = 255;
  let bgG = 255;
  let bgB = 255;

  const isDark = document.documentElement.classList.contains('dark') || 
                 document.body.classList.contains('dark') ||
                 window.getComputedStyle(document.body).backgroundColor.includes('15, 23, 42') ||
                 window.getComputedStyle(document.body).backgroundColor.includes('2, 6, 23');
  if (isDark) {
    bgR = 15;
    bgG = 23;
    bgB = 42;
  }

  while (curr && curr !== document.body && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr);
    const parsed = parseColor(style.backgroundColor);
    if (parsed && parsed[3] > 0.1) {
      const alpha = parsed[3];
      bgR = Math.round(parsed[0] * alpha + bgR * (1 - alpha));
      bgG = Math.round(parsed[1] * alpha + bgG * (1 - alpha));
      bgB = Math.round(parsed[2] * alpha + bgB * (1 - alpha));
      if (alpha >= 0.95) {
        break;
      }
    }
    curr = curr.parentElement;
  }
  return [bgR, bgG, bgB];
}

export function scanDomForAccessibility(container: HTMLElement = document.body): A11yAuditResult {
  const issues: A11yIssue[] = [];
  let totalScanned = 0;
  let passedCount = 0;

  const allElements = container.querySelectorAll<HTMLElement>(
    '*:not(script):not(style):not(svg):not(path):not(meta):not(link):not([data-a11y-inspector-ignore])'
  );

  let prevHeadingLevel = 0;

  allElements.forEach((el, index) => {
    if (el.closest('[data-a11y-inspector-ignore]') || el.getAttribute('aria-hidden') === 'true') {
      return;
    }
    const rect = el.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
    if (!isVisible) return;

    totalScanned++;
    const tag = el.tagName.toLowerCase();
    const computedStyle = window.getComputedStyle(el);
    const textContent = (el.innerText || el.textContent || '').trim();

    const hasDirectText = Array.from(el.childNodes).some(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0
    );
    if (hasDirectText && textContent.length > 0) {
      const fgParsed = parseColor(computedStyle.color);
      if (fgParsed) {
        const bg = getEffectiveBackgroundColor(el);
        const ratio = getContrastRatio([fgParsed[0], fgParsed[1], fgParsed[2]], bg);
        
        const fontSizePx = parseFloat(computedStyle.fontSize) || 16;
        const fontWeight = parseInt(computedStyle.fontWeight, 10) || (computedStyle.fontWeight === 'bold' ? 700 : 400);
        const isLargeText = fontSizePx >= 24 || (fontSizePx >= 18.5 && fontWeight >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        const formattedRatio = Math.round(ratio * 10) / 10;

        if (ratio < requiredRatio) {
          const fgHex = rgbToHex(fgParsed[0], fgParsed[1], fgParsed[2]);
          const bgHex = rgbToHex(bg[0], bg[1], bg[2]);
          issues.push({
            id: `contrast-${index}`,
            type: 'contrast',
            severity: ratio < 3.0 ? 'critical' : 'warning',
            wcagRule: 'WCAG 1.4.3 Contrast (Minimum)',
            wcagLevel: 'AA',
            elementTag: tag,
            elementSelector: getCssSelector(el),
            elementText: textContent.slice(0, 45) + (textContent.length > 45 ? '...' : ''),
            message: `Low contrast ratio ${formattedRatio}:1. Requires minimum ${requiredRatio}:1.`,
            suggestion: `Increase contrast between text (${fgHex}) and background (${bgHex}) to achieve at least ${requiredRatio}:1.`,
            rect,
            domElement: el,
            details: {
              contrastRatio: formattedRatio,
              requiredRatio,
              fgColor: fgHex,
              bgColor: bgHex,
              fontSize: `${fontSizePx}px (${isLargeText ? 'Large' : 'Normal'})`,
              isLargeText,
            },
          });
        } else {
          passedCount++;
        }
      }
    }

    if (tag === 'button' || tag === 'a' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link') {
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledby = el.getAttribute('aria-labelledby');
      const title = el.getAttribute('title');
      const hasImageWithAlt = el.querySelector('img[alt]:not([alt=""])');
      const hasSvgWithTitle = el.querySelector('svg title');
      const accessibleName = (
        (ariaLabel || '') +
        (ariaLabelledby ? document.getElementById(ariaLabelledby)?.innerText || '' : '') +
        (title || '') +
        textContent +
        (hasImageWithAlt ? ' [Image]' : '') +
        (hasSvgWithTitle ? ' [Icon]' : '')
      ).trim();

      if (!accessibleName) {
        issues.push({
          id: `aria-btn-${index}`,
          type: 'aria-label',
          severity: 'critical',
          wcagRule: 'WCAG 4.1.2 Name, Role, Value',
          wcagLevel: 'A',
          elementTag: tag,
          elementSelector: getCssSelector(el),
          elementText: `<${tag}> (No text/icon label)`,
          message: `Interactive <${tag}> has no accessible text name or aria-label.`,
          suggestion: `Add an aria-label="..." attribute or readable text to explain the action to screen readers.`,
          rect,
          domElement: el,
          details: {
            missingAttribute: 'aria-label',
          },
        });
      } else {
        passedCount++;
      }
    }

    if (tag === 'img') {
      const alt = el.getAttribute('alt');
      const ariaHidden = el.getAttribute('aria-hidden') === 'true';
      const role = el.getAttribute('role');
      if (alt === null && !ariaHidden && role !== 'presentation') {
        issues.push({
          id: `img-alt-${index}`,
          type: 'image-alt',
          severity: 'critical',
          wcagRule: 'WCAG 1.1.1 Non-text Content',
          wcagLevel: 'A',
          elementTag: 'img',
          elementSelector: getCssSelector(el),
          elementText: (el.getAttribute('src') || '').slice(-30),
          message: `Image is missing required alt attribute.`,
          suggestion: `Provide descriptive alt="..." text or alt="" if purely decorative.`,
          rect,
          domElement: el,
          details: {
            missingAttribute: 'alt',
          },
        });
      } else {
        passedCount++;
      }
    }

    if (['input', 'select', 'textarea'].includes(tag)) {
      const inputType = el.getAttribute('type');
      if (inputType !== 'hidden' && inputType !== 'submit' && inputType !== 'button') {
        const id = el.getAttribute('id');
        const hasLabelFor = id ? document.querySelector(`label[for="${id}"]`) : null;
        const isWrappedInLabel = el.closest('label');
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledby = el.getAttribute('aria-labelledby');
        if (!hasLabelFor && !isWrappedInLabel && !ariaLabel && !ariaLabelledby) {
          issues.push({
            id: `form-label-${index}`,
            type: 'form-label',
            severity: 'critical',
            wcagRule: 'WCAG 1.3.1 Info and Relationships & 3.3.2 Labels or Instructions',
            wcagLevel: 'A',
            elementTag: tag,
            elementSelector: getCssSelector(el),
            elementText: `${tag}[type="${inputType || 'text'}"]`,
            message: `Form control has no associated <label> or aria-label attribute.`,
            suggestion: `Add a corresponding <label for="${id || 'field-id'}"> or aria-label="..." for assistive tech.`,
            rect,
            domElement: el,
            details: {
              missingAttribute: 'label / aria-label',
            },
          });
        } else {
          passedCount++;
        }
      }
    }

    if (/^h[1-6]$/.test(tag)) {
      const currentLevel = parseInt(tag.charAt(1), 10);
      if (prevHeadingLevel > 0 && currentLevel > prevHeadingLevel + 1) {
        issues.push({
          id: `heading-hierarchy-${index}`,
          type: 'heading-hierarchy',
          severity: 'warning',
          wcagRule: 'WCAG 1.3.1 Info and Relationships',
          wcagLevel: 'AA',
          elementTag: tag,
          elementSelector: getCssSelector(el),
          elementText: textContent.slice(0, 35),
          message: `Skipped heading level: <h${prevHeadingLevel}> directly to <${tag}>.`,
          suggestion: `Maintain sequential hierarchy (<h${prevHeadingLevel + 1}>) for predictable screen reader navigation.`,
          rect,
          domElement: el,
        });
      }
      prevHeadingLevel = currentLevel;
    }
  });

  const criticalPenalty = issues.filter((i) => i.severity === 'critical').length * 6;
  const warningPenalty = issues.filter((i) => i.severity === 'warning').length * 2.5;
  const infoPenalty = issues.filter((i) => i.severity === 'info').length * 0.5;
  const calculatedScore = Math.max(10, Math.min(100, Math.round(100 - (criticalPenalty + warningPenalty + infoPenalty))));

  let grade: 'AAA' | 'AA' | 'A' | 'FAIL' = 'FAIL';
  if (calculatedScore >= 95 && issues.filter((i) => i.severity === 'critical').length === 0) {
    grade = 'AAA';
  } else if (calculatedScore >= 85 && issues.filter((i) => i.severity === 'critical').length === 0) {
    grade = 'AA';
  } else if (calculatedScore >= 70) {
    grade = 'A';
  }

  return {
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
    overallScore: calculatedScore,
    grade,
    totalElementsScanned: totalScanned,
    issues,
    passedCount,
    contrastIssuesCount: issues.filter((i) => i.type === 'contrast').length,
    ariaIssuesCount: issues.filter((i) => i.type === 'aria-label' || i.type === 'image-alt' || i.type === 'form-label').length,
    otherIssuesCount: issues.filter((i) => i.type === 'heading-hierarchy' || i.type === 'touch-target').length,
    summary: {
      critical: issues.filter((i) => i.severity === 'critical').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
  };
}

function getCssSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  let path = el.tagName.toLowerCase();
  if (el.className && typeof el.className === 'string') {
    const classes = el.className
      .trim()
      .split(/\s+/)
      .filter((c) => !c.includes(':') && !c.includes('/') && !c.includes('['))
      .slice(0, 2)
      .join('.');
    if (classes) path += `.${classes}`;
  }
  return path;
}
