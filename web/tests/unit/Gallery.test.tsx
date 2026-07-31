import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryTabs from "@/components/GalleryTabs";
import { galleryTabs } from "@/lib/gallery";

const haircuts = galleryTabs.find((tab) => tab.id === "haircuts")!;
const artwork = galleryTabs.find((tab) => tab.id === "artwork")!;

/* Rows scroll by two card widths. The card is 232px wide. */
const SCROLL_STEP = 232 * 2;

describe("GalleryTabs", () => {

  it("opens on the Haircuts tab", () => {
    render(<GalleryTabs />);
    expect(screen.getByRole("tab", { name: "Haircuts" }))
      .toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Artwork" }))
      .toHaveAttribute("aria-selected", "false");
  });

  it("renders Haircuts as two rows keeping their different aspect ratios", () => {
    render(<GalleryTabs />);
    const panel = screen.getByRole("tabpanel");

    expect(haircuts.rows).toHaveLength(2);
    /* Row one is 4:5 and row two is 1:1, matching the live site. The two rows
       differing is the design, so a change here is a regression, not a restyle. */
    expect(haircuts.rows[0].height / haircuts.rows[0].width).toBeCloseTo(1.25);
    expect(haircuts.rows[1].height / haircuts.rows[1].width).toBeCloseTo(1);

    expect(within(panel).getAllByRole("img")).toHaveLength(
      haircuts.rows[0].photos.length + haircuts.rows[1].photos.length
    );
  });

  it("gives every haircut photo descriptive alt text", () => {
    render(<GalleryTabs />);
    for (const image of within(screen.getByRole("tabpanel")).getAllByRole("img")) {
      expect(image.getAttribute("alt")?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("switches to Artwork and back", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);

    await user.click(screen.getByRole("tab", { name: "Artwork" }));
    expect(screen.getByRole("tab", { name: "Artwork" }))
      .toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: "Haircuts" }));
    expect(screen.getByRole("tab", { name: "Haircuts" }))
      .toHaveAttribute("aria-selected", "true");
    expect(within(screen.getByRole("tabpanel")).getAllByRole("img").length)
      .toBeGreaterThan(0);
  });

  it("keeps the artwork hidden until its tab is chosen", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);

    const artworkSources = artwork.rows[0].photos.map((photo) => photo.src);
    const shown = () => within(screen.getByRole("tabpanel"))
      .getAllByRole("img")
      .map((image) => decodeURIComponent(image.getAttribute("src") ?? ""));

    expect(shown().some((src) => artworkSources.some((a) => src.includes(a)))).toBe(false);

    await user.click(screen.getByRole("tab", { name: "Artwork" }));
    expect(shown().every((src) => artworkSources.some((a) => src.includes(a)))).toBe(true);
  });

  it("shows Artwork as a single row of four at one aspect ratio", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);
    await user.click(screen.getByRole("tab", { name: "Artwork" }));

    expect(artwork.rows).toHaveLength(1);
    expect(artwork.rows[0].photos).toHaveLength(4);
    /* 4:5, matching row one, so the section does not jump height on switch. */
    expect(artwork.rows[0].height / artwork.rows[0].width).toBeCloseTo(1.25);
    expect(within(screen.getByRole("tabpanel")).getAllByRole("img")).toHaveLength(4);
  });

  it("gives each row a labelled pair of scroll buttons", () => {
    render(<GalleryTabs />);
    for (const label of [
      "Scroll Haircuts row 1 left", "Scroll Haircuts row 1 right",
      "Scroll Haircuts row 2 left", "Scroll Haircuts row 2 right"
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("scrolls a row by two cards per arrow click", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);

    const scrollBy = vi.fn();
    document.getElementById(haircuts.rows[0].id)!.scrollBy = scrollBy;

    await user.click(screen.getByRole("button", { name: "Scroll Haircuts row 1 right" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: SCROLL_STEP, behavior: "smooth" });

    await user.click(screen.getByRole("button", { name: "Scroll Haircuts row 1 left" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: -SCROLL_STEP, behavior: "smooth" });
  });

  it("opens a photograph in the lightbox rather than navigating to the file", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);

    /* Every photo is a button, not a link. A bare .jpg href makes browsers
       download the file instead of showing it. */
    const first = within(screen.getByRole("tabpanel")).getAllByRole("button")[0];
    await user.click(first);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(`1 / ${haircuts.rows[0].photos.length}`)).toBeInTheDocument();
  });

  it("steps through the set and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<GalleryTabs />);

    await user.click(within(screen.getByRole("tabpanel")).getAllByRole("button")[0]);
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    expect(within(dialog).getByText(`2 / ${haircuts.rows[0].photos.length}`)).toBeInTheDocument();

    /* Wraps rather than running off the end. */
    await user.click(within(dialog).getByRole("button", { name: "Previous" }));
    await user.click(within(dialog).getByRole("button", { name: "Previous" }));
    expect(
      within(dialog).getByText(
        `${haircuts.rows[0].photos.length} / ${haircuts.rows[0].photos.length}`
      )
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

});
