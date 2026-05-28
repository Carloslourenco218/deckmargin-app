'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import dynamic from 'next/dynamic';
import { useDesignReducer } from '@/hooks/useDesignReducer';
import ComponentPalette from '@/components/design/ComponentPalette';
import PropertiesPanel from '@/components/design/PropertiesPanel';
import TakeoffSidebar from '@/components/design/TakeoffSidebar';
import { calculateMaterials } from '@/lib/design/calculateMaterials';
import type { DesignComponent, DeckSection, StairModule } from '@/lib/design/types';

// Rough material cost per sq ft by material type (for estimate only)
const MATERIAL_COST_PER_SQFT: Record<string, number> = {
  pt: 8,
  trex: 15,
  cedar: 12,
};

// react-konva must be dynamically imported (no SSR — it requires window/canvas)
const DesignCanvas = dynamic(() => import('@/components/design/DesignCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F1EFE8',
        color: '#9B9890',
        fontSize: 13,
      }}
    >
      Loading canvas…
    </div>
  ),
});

export default function DesignPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [state, dispatch] = useDesignReducer();
  const [applyStatus, setApplyStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  // ─── Load existing design from Supabase ──────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    async function loadDesign() {
      const { data, error } = await supabase
        .from('deck_designs')
        .select('canvas_data')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found — that's fine for a new design
        console.error('Failed to load design:', error);
        return;
      }

      if (data?.canvas_data?.components?.length) {
        dispatch({
          type: 'LOAD_DESIGN',
          components: data.canvas_data.components as DesignComponent[],
        });
      }
    }

    loadDesign();
  }, [projectId, supabase, dispatch]);

  // ─── Save design to Supabase ──────────────────────────────────────────────────
  const saveDesign = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      const canvasData = {
        components: state.components,
        version: 1,
      };

      const { error } = await supabase.from('deck_designs').upsert(
        {
          project_id: projectId,
          canvas_data: canvasData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id' }
      );

      if (error) {
        console.error('Save failed:', error);
      } else {
        dispatch({ type: 'MARK_SAVED' });
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [state.components, projectId, supabase, dispatch]);

  // Auto-save debounce: 3 seconds after last change
  useEffect(() => {
    if (!state.is_dirty) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveDesign, 3000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state.is_dirty, state.components, saveDesign]);

  // ─── Apply to Estimate ────────────────────────────────────────────────────────
  const applyToEstimate = useCallback(async () => {
    if (state.components.length === 0) return;
    setApplyStatus('applying');

    try {
      const deckSections = state.components.filter((c): c is DeckSection => c.type === 'deck_section');
      const stairs = state.components.filter((c): c is StairModule => c.type === 'stair');
      const takeoff = calculateMaterials(state.components);

      // Find the largest deck section as the "primary"
      const primaryDeck = deckSections.reduce<DeckSection | null>((largest, d) => {
        if (!largest) return d;
        return d.width_ft * d.length_ft > largest.width_ft * largest.length_ft ? d : largest;
      }, null);

      const deck_sqft = deckSections.reduce((sum, d) => sum + d.width_ft * d.length_ft, 0);
      const stair_count = stairs.reduce((sum, s) => sum + s.stair_count, 0);
      const material_type = primaryDeck?.material ?? null;
      const deck_length = primaryDeck?.length_ft ?? null;
      const deck_width = primaryDeck?.width_ft ?? null;

      // Estimate material cost: sqft × per-sqft rate for primary material
      const rate = material_type ? (MATERIAL_COST_PER_SQFT[material_type] ?? 10) : 10;
      const material_cost = Math.round(deck_sqft * rate);

      const updates: Record<string, number | string | null> = {
        deck_sqft,
        stair_count,
        updated_at: new Date().toISOString(),
      };
      if (deck_length !== null) updates.deck_length = deck_length;
      if (deck_width !== null) updates.deck_width = deck_width;
      if (material_type !== null) updates.material_type = material_type;
      if (material_cost > 0) updates.material_cost = material_cost;

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      setApplyStatus('success');
      setTimeout(() => setApplyStatus('idle'), 3000);
    } catch (err) {
      console.error('Apply to estimate failed:', err);
      setApplyStatus('error');
      setTimeout(() => setApplyStatus('idle'), 3000);
    }
  }, [state.components, projectId, supabase]);

  // ─── Export takeoff as CSV ────────────────────────────────────────────────────
  const exportTakeoff = useCallback(() => {
    const takeoff = calculateMaterials(state.components);
    const rows = [
      ['Category', 'Item', 'Quantity', 'Unit'],
      ...takeoff.lines.map((l) => [l.category, l.item, String(l.quantity), l.unit]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deck-takeoff-${projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.components, projectId]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't intercept when typing in an input / select
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDesign();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && state.selected_id) {
        dispatch({ type: 'DELETE_COMPONENT', id: state.selected_id });
      } else if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, saveDesign, state.selected_id]);

  // Derived state
  const selectedComponent = state.components.find((c) => c.id === state.selected_id) ?? null;
  const canUndo = state.history_index >= 0;
  const canRedo = state.history_index < state.history.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#F1EFE8' }}>
      {/* Top nav bar */}
      <header
        style={{
          height: 48,
          background: '#1A1915',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
          flexShrink: 0,
          borderBottom: '1px solid #333',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#9B9890',
            cursor: 'pointer',
            fontSize: 13,
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          ← Back
        </button>

        <div style={{ height: 20, width: 1, background: '#333' }} />

        <span style={{ color: '#F1EFE8', fontWeight: 600, fontSize: 14 }}>Deck Designer</span>

        {state.is_dirty && (
          <span style={{ fontSize: 11, color: '#9B9890' }}>● Unsaved changes</span>
        )}

        <div style={{ flex: 1 }} />

        {/* Component count badge */}
        <span
          style={{
            fontSize: 11,
            color: '#9B9890',
            background: '#333',
            padding: '3px 8px',
            borderRadius: 10,
          }}
        >
          {state.components.length} component{state.components.length !== 1 ? 's' : ''}
        </span>

        {/* Apply to Estimate button */}
        {state.components.length > 0 && (
          <button
            onClick={applyToEstimate}
            disabled={applyStatus === 'applying'}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              cursor: applyStatus === 'applying' ? 'wait' : 'pointer',
              background:
                applyStatus === 'success' ? '#1A7A3C' :
                applyStatus === 'error' ? '#8B1A1A' :
                '#2D6A4F',
              color: '#FFFFFF',
              transition: 'background 0.2s',
            }}
          >
            {applyStatus === 'applying' ? 'Applying…' :
             applyStatus === 'success' ? '✓ Applied!' :
             applyStatus === 'error' ? '✕ Failed' :
             '⬆ Apply to Estimate'}
          </button>
        )}

        {/* Keyboard hint */}
        <span style={{ fontSize: 10, color: '#6B6860' }}>
          ⌘Z undo · Delete removes selected
        </span>
      </header>

      {/* Three-panel body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Component Palette */}
        <ComponentPalette
          dispatch={dispatch}
          canUndo={canUndo}
          canRedo={canRedo}
          snapFt={state.snap_ft}
          isDirty={state.is_dirty}
          onSave={saveDesign}
          onExport={exportTakeoff}
        />

        {/* Center: Canvas */}
        <DesignCanvas state={state} dispatch={dispatch} />

        {/* Right: Properties + Takeoff stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 260, borderLeft: '1px solid #E0DDD5', overflow: 'hidden' }}>
          {/* Properties panel — takes whatever height it needs, up to 50% */}
          <div style={{ maxHeight: '50%', overflow: 'hidden', borderBottom: '1px solid #E0DDD5' }}>
            <PropertiesPanel component={selectedComponent} dispatch={dispatch} />
          </div>

          {/* Takeoff sidebar — fills remaining space */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <TakeoffSidebar components={state.components} />
          </div>
        </div>
      </div>
    </div>
  );
}
