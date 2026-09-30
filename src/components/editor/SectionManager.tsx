"use client";

import { useState } from "react";
import type { Section } from "@prisma/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Plus, Eye, EyeOff, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { SECTION_TYPE_META } from "@/lib/themes";

const SECTION_TYPES = [
  "ABOUT", "EXPERIENCE", "EDUCATION", "SKILLS", "PROJECTS",
  "CERTIFICATIONS", "LANGUAGES", "AWARDS", "PUBLICATIONS",
  "VOLUNTEER", "OPEN_SOURCE", "CUSTOM",
] as const;

interface SectionManagerProps {
  sections: Section[];
  selectedId: string | null;
  onSelect: (section: Section) => void;
  onCreate: (type: string) => void;
  onDelete: (id: string) => void;
  onReorder: (sections: Section[]) => void;
  onToggleVisible: (id: string) => void;
}

// ─── Sortable item ─────────────────────────────────────────────────────────
function SortableSection({
  section,
  isSelected,
  onSelect,
  onDelete,
  onToggleVisible,
}: {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = SECTION_TYPE_META[section.type as keyof typeof SECTION_TYPE_META];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 px-3 py-2.5 cursor-pointer
        border-b border-border last:border-0 transition-colors
        ${isSelected ? "bg-brand-500/10 border-l-2 border-l-brand-500" : "hover:bg-muted/50"}
      `}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon + label */}
      <span className="text-base shrink-0">{meta?.icon ?? "📄"}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${!section.isVisible ? "text-muted-foreground" : ""}`}>
          {section.title}
        </p>
        <p className="text-xs text-muted-foreground">{meta?.label ?? section.type}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={section.isVisible ? "Hide section" : "Show section"}
        >
          {section.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function SectionManager({
  sections,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onReorder,
  onToggleVisible,
}: SectionManagerProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-col border-b border-border" style={{ maxHeight: "40%" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sections ({sections.length})
        </span>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
            {showAddMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-xl shadow-lg py-1 w-48">
              {SECTION_TYPES.map((type) => {
                const meta = SECTION_TYPE_META[type as keyof typeof SECTION_TYPE_META];
                return (
                  <button
                    key={type}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      onCreate(type);
                      setShowAddMenu(false);
                    }}
                  >
                    <span>{meta?.icon ?? "📄"}</span>
                    {meta?.label ?? type}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section list */}
      <div className="overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                isSelected={section.id === selectedId}
                onSelect={() => onSelect(section)}
                onDelete={() => onDelete(section.id)}
                onToggleVisible={() => onToggleVisible(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {sections.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No sections yet. Add one above.
          </div>
        )}
      </div>
    </div>
  );
}
