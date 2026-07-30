"use client";

/*
 * Gallery section. Renders whichever tab is selected; each tab is just a list
 * of rows, so a tab with one row and a tab with two rows use the same code
 * path and adding a tab is a data change in lib/gallery.ts.
 */

import { useState } from "react";
import GalleryRow from "./GalleryRow";
import { galleryTabs } from "@/lib/gallery";

export default function Gallery() {
  const [activeTabId, setActiveTabId] = useState(galleryTabs[0].id);
  const activeTab = galleryTabs.find((tab) => tab.id === activeTabId) ?? galleryTabs[0];

  return (
    <section id="gallery" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Gallery</h2>

        {/* Tab strip. Only rendered when there is more than one tab, so a
            single-tab gallery looks exactly like the original site. */}
        {galleryTabs.length > 1 && (
          <div role="tablist" aria-label="Gallery categories" className="flex justify-center gap-2 mb-8">
            {galleryTabs.map((tab) => {
              const isActive = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`gallery-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`gallery-panel-${tab.id}`}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`px-5 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        <div
          role="tabpanel"
          id={`gallery-panel-${activeTab.id}`}
          aria-labelledby={`gallery-tab-${activeTab.id}`}
          className="space-y-8"
        >
          {activeTab.rows.map((row, index) => (
            <GalleryRow
              key={row.id}
              row={row}
              label={`${activeTab.label} row ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
