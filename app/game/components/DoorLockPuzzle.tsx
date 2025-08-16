"use client";

import { useState, useEffect, Fragment } from "react";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAudio } from "@/lib/useAudio";

interface DoorLockPuzzleProps {
  isVisible: boolean;
  words: string[];
  onSolved: () => void;
  onClose: () => void;
}

const solution = ["BOTTLENECK", "QUEEF", "ROBUST", "REPENNY"];
const sentence = "The _ quickens with a sudden _, revealing a _ passage to _";

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none cursor-grab rounded bg-amber-200 px-3 py-1 text-lg font-semibold text-amber-900 shadow"
    >
      {id}
    </div>
  );
}

export default function DoorLockPuzzle({
  isVisible,
  words,
  onSolved,
  onClose,
}: DoorLockPuzzleProps) {
  const [items, setItems] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const {
    playSound,
    isInitialized: audioInitialized,
    isEnabled: audioEnabled,
  } = useAudio();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Shuffle words when the component becomes visible
    if (isVisible) {
      setItems(words.sort(() => Math.random() - 0.5));
    }
  }, [isVisible, words]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Play button click sound when moving items
      if (audioInitialized && audioEnabled) {
        playSound("button-click", { volume: 0.5 });
      }

      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Check for solution
        if (JSON.stringify(newOrder) === JSON.stringify(solution)) {
          setIsCorrect(true);
          setTimeout(() => onSolved(), 1500);
        }

        return newOrder;
      });
    }
  }

  const sentenceParts = sentence.split("_");

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative w-full max-w-2xl rounded-lg border-4 border-amber-800 bg-amber-100 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl font-bold text-amber-800 hover:text-amber-600"
        >
          ×
        </button>

        <h2 className="mb-6 text-center text-3xl font-bold text-amber-900">
          The Final Riddle
        </h2>

        <p className="mb-8 text-center text-xl italic text-amber-800">
          Arrange the words you've collected to reveal the final secret.
        </p>

        <div
          className={`mb-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-4 rounded-lg border-2 p-6 text-2xl ${
            isCorrect
              ? "border-green-500 bg-green-100"
              : "border-amber-600 bg-amber-50"
          }`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items}>
              <span className="leading-relaxed">{sentenceParts[0]}</span>
              {items.map((id, index) => (
                <Fragment key={id}>
                  <SortableItem id={id} />
                  <span className="leading-relaxed">
                    {sentenceParts[index + 1]}
                  </span>
                </Fragment>
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {isCorrect && (
          <div className="animate-pulse text-center text-2xl font-bold text-green-700">
            🎉 The great door opens! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
