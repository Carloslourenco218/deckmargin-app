'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import dynamic from 'next/dynamic';
import { useDesignReducer } from '@/hooks/useDesignReducer';
import ComponentPalette from '@/components/design/ComponentPalette';
import PropertiesPanel from '@/components/design/PropertiesPanel';
import TakeoffSidebar from '@/components/design/TakeoffSidebar';
import { calculateMaterials } from '@/lib/design/calculateMaterials';
import type { DesignComponent } from '@/lib/design/types';

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
