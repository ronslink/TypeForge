<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import SideNavBar from '$lib/components/SideNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data: _data }: Props = $props();
</script>

<div class="min-h-screen bg-surface-dim text-on-surface font-body selection:bg-primary-container selection:text-on-primary flex flex-col relative dot-grid">
  <TopNavBar />
  <SideNavBar />
  
  <div class="ml-64 flex-1 flex flex-col z-10 relative">
    <main class="pt-32 px-12 pb-24 w-full flex-1">
      {@render children()}
    </main>
    <Footer />
  </div>
</div>
