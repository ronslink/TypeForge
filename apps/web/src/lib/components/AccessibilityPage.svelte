<script lang="ts">
  import { Button } from '@typeforge/ui';
</script>

<!-- 
  Accessibility Statement Page Component
  
  This page documents TypeForge's commitment to accessibility and provides
  information for users who may encounter accessibility barriers.
  
  WCAG 2.1 AA Compliance Checklist:
  ✓ Perceivable - Text alternatives, adaptable content, distinguishable
  ✓ Operable - Keyboard accessible, enough time, navigable
  ✓ Understandable - Readable, predictable, input assistance
  ✓ Robust - Compatible with assistive technologies
-->

<div class="max-w-4xl mx-auto px-6 py-12">
  <!-- Header -->
  <header class="mb-12">
    <h1 class="font-headline text-4xl mb-4">Accessibility Statement</h1>
    <p class="text-on-surface-variant text-lg">
      TypeForge is committed to digital accessibility and ensuring our platform is usable by everyone, 
      regardless of ability or technology.
    </p>
  </header>

  <!-- Commitment Section -->
  <section class="mb-12" aria-labelledby="commitment-heading">
    <h2 id="commitment-heading" class="font-headline text-2xl mb-4 text-primary">Our Commitment</h2>
    <div class="bg-surface-container-low p-6 space-y-4">
      <p>
        TypeForge is committed to ensuring digital accessibility for people with disabilities. 
        We are continually improving the user experience for everyone and applying the relevant 
        accessibility standards to ensure we provide equal access to all users.
      </p>
      <p>
        We believe that typing education should be accessible to everyone, including users who 
        rely on screen readers, keyboard navigation, voice control, or other assistive technologies.
      </p>
    </div>
  </section>

  <!-- Standards Section -->
  <section class="mb-12" aria-labelledby="standards-heading">
    <h2 id="standards-heading" class="font-headline text-2xl mb-4 text-primary">Accessibility Standards</h2>
    <div class="bg-surface-container-low p-6">
      <p class="mb-4">
        TypeForge aims to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> 
        standard. These guidelines explain how to make web content more accessible for people with disabilities 
        and more user-friendly for everyone.
      </p>
      
      <h3 class="font-label text-lg mb-3 mt-6">What WCAG 2.1 AA Means</h3>
      <ul class="space-y-2 text-on-surface-variant">
        <li class="flex items-start gap-3">
          <span class="text-primary" aria-hidden="true">✓</span>
          <span><strong>Perceivable:</strong> Information and UI components are presentable to users in ways they can perceive</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary" aria-hidden="true">✓</span>
          <span><strong>Operable:</strong> UI components and navigation are operable by all users</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary" aria-hidden="true">✓</span>
          <span><strong>Understandable:</strong> Information and UI operation are understandable</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-primary" aria-hidden="true">✓</span>
          <span><strong>Robust:</strong> Content works with current and future assistive technologies</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- Features Section -->
  <section class="mb-12" aria-labelledby="features-heading">
    <h2 id="features-heading" class="font-headline text-2xl mb-4 text-primary">Accessibility Features</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Keyboard Navigation -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">⌨️</span>
          Keyboard Navigation
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>Full keyboard accessibility throughout the application</li>
          <li>Visible focus indicators (amber outline) on all interactive elements</li>
          <li>Skip to content link for quick navigation</li>
          <li>Escape key to exit typing mode</li>
          <li>Arrow keys for word navigation when not typing</li>
        </ul>
      </div>

      <!-- Screen Reader Support -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">🔊</span>
          Screen Reader Support
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>ARIA labels and descriptions for all interactive elements</li>
          <li>Live regions for announcing WPM and accuracy updates</li>
          <li>Word-by-word progress announcements</li>
          <li>Proper heading hierarchy for navigation</li>
          <li>Landmark regions (main, navigation, complementary)</li>
        </ul>
      </div>

      <!-- Visual Accessibility -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">👁️</span>
          Visual Accessibility
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>Color contrast ratios meeting WCAG 2.1 AA standards (4.5:1 for text)</li>
          <li>Clear visual feedback for errors and successes</li>
          <li>Large, readable text with adjustable sizing</li>
          <li>Focus indicators that are always visible</li>
          <li>No reliance on color alone to convey information</li>
        </ul>
      </div>

      <!-- Motion & Animation -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">🎬</span>
          Motion & Animation
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>Respects <code>prefers-reduced-motion</code> system setting</li>
          <li>All animations can be disabled via CSS class</li>
          <li>No auto-playing content that cannot be paused</li>
          <li>Static alternatives for animated celebrations</li>
          <li>No flashing or strobing content</li>
        </ul>
      </div>

      <!-- RTL Language Support -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">🌍</span>
          RTL Language Support
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>Full support for right-to-left languages (Arabic, Hebrew)</li>
          <li>Proper <code>lang</code> attributes for screen reader pronunciation</li>
          <li>Logical CSS properties for flexible layouts</li>
          <li>RTL-aware keyboard finger placement guides</li>
          <li>Arrow key navigation adapts to text direction</li>
        </ul>
      </div>

      <!-- Input Assistance -->
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-lg mb-3 flex items-center gap-2">
          <span aria-hidden="true">📝</span>
          Input Assistance
        </h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li>Error prevention and recovery in typing lessons</li>
          <li>Clear labels and instructions for all form elements</li>
          <li>No time limits that cannot be extended</li>
          <li>Progress saving for signed-in users</li>
          <li>Consistent navigation and predictable behavior</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Assistive Technologies Section -->
  <section class="mb-12" aria-labelledby="compatibility-heading">
    <h2 id="compatibility-heading" class="font-headline text-2xl mb-4 text-primary">Assistive Technology Compatibility</h2>
    <div class="bg-surface-container-low p-6">
      <p class="mb-4">
        TypeForge is designed to work with a wide range of assistive technologies, including:
      </p>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-3 text-on-surface-variant">
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          NVDA (Windows)
        </li>
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          JAWS (Windows)
        </li>
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          VoiceOver (macOS/iOS)
        </li>
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          TalkBack (Android)
        </li>
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          ChromeVox (Chrome OS)
        </li>
        <li class="flex items-center gap-2">
          <span class="text-secondary" aria-hidden="true">•</span>
          Dragon NaturallySpeaking
        </li>
      </ul>
      
      <div class="mt-6 p-4 bg-surface-container border border-outline-variant">
        <h4 class="font-label text-sm uppercase tracking-wider mb-2">RTL Testing Note</h4>
        <p class="text-sm text-on-surface-variant">
          <strong>Manual testing required:</strong> For RTL languages (Arabic, Hebrew), we recommend testing 
          with NVDA on Windows to ensure proper right-to-left text reading and navigation. 
          Screen reader behavior may vary across different assistive technologies.
        </p>
      </div>
    </div>
  </section>

  <!-- Known Limitations Section -->
  <section class="mb-12" aria-labelledby="limitations-heading">
    <h2 id="limitations-heading" class="font-headline text-2xl mb-4 text-primary">Known Limitations</h2>
    <div class="bg-surface-container-low p-6">
      <p class="mb-4">
        While we strive for full accessibility, we are aware of the following limitations:
      </p>
      <ul class="space-y-3 text-on-surface-variant">
        <li class="flex items-start gap-3">
          <span class="text-error" aria-hidden="true">!</span>
          <span>
            <strong>Complex keyboard visualizations:</strong> The on-screen keyboard showing finger placement 
            is primarily visual. Screen reader users receive finger assignment information through ARIA labels 
            on individual keys.
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-error" aria-hidden="true">!</span>
          <span>
            <strong>Real-time WPM announcements:</strong> To avoid overwhelming screen reader users, 
            WPM updates are announced every 10 seconds rather than continuously.
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-error" aria-hidden="true">!</span>
          <span>
            <strong>Third-party integrations:</strong> Some third-party services (payment processors, 
            analytics) may have their own accessibility limitations outside our control.
          </span>
        </li>
      </ul>
    </div>
  </section>

  <!-- Feedback Section -->
  <section class="mb-12" aria-labelledby="feedback-heading">
    <h2 id="feedback-heading" class="font-headline text-2xl mb-4 text-primary">Feedback & Reporting Issues</h2>
    <div class="bg-surface-container-low p-6">
      <p class="mb-4">
        We welcome your feedback on the accessibility of TypeForge. If you encounter any accessibility 
        barriers or have suggestions for improvement, please let us know:
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 class="font-label text-sm uppercase tracking-wider mb-2">Email</h3>
          <a 
            href="mailto:accessibility@typeforge.app" 
            class="text-primary hover:text-primary-container transition-colors focus-indicator"
          >
            accessibility@typeforge.app
          </a>
        </div>
        <div>
          <h3 class="font-label text-sm uppercase tracking-wider mb-2">GitHub Issues</h3>
          <a 
            href="https://github.com/typeforge/typeforge/issues" 
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:text-primary-container transition-colors focus-indicator"
          >
            Report on GitHub →
          </a>
        </div>
      </div>

      <div class="mt-6 p-4 bg-surface-container border border-outline-variant">
        <h4 class="font-label text-sm uppercase tracking-wider mb-2">What to Include</h4>
        <p class="text-sm text-on-surface-variant">
          When reporting accessibility issues, please include: the assistive technology you're using 
          (e.g., NVDA, VoiceOver), your browser and operating system, a description of the issue, 
          and steps to reproduce it.
        </p>
      </div>
    </div>
  </section>

  <!-- Conformance Date -->
  <section class="mb-12" aria-labelledby="conformance-heading">
    <h2 id="conformance-heading" class="font-headline text-2xl mb-4 text-primary">Conformance Date</h2>
    <div class="bg-surface-container-low p-6">
      <p>
        This accessibility statement was last updated on <strong>March 22, 2026</strong>. 
        We regularly review and update our accessibility features to ensure ongoing compliance 
        with WCAG 2.1 AA standards.
      </p>
    </div>
  </section>

  <!-- Back to Home -->
  <div class="flex justify-center">
    <Button variant="primary" onclick={() => window.location.href = '/'}>← Back to Home</Button>
  </div>
</div>

<style>
  /* Focus indicator utility */
  .focus-indicator {
    outline: none;
    border-radius: 2px;
  }

  .focus-indicator:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 2px;
  }

  /* Code styling */
  code {
    background: var(--surface-container, #1d2025);
    padding: 0.125rem 0.375rem;
    border-radius: 2px;
    font-family: var(--font-label, 'Space Grotesk', monospace);
    font-size: 0.875em;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .transition-colors {
      transition: none;
    }
  }
</style>
