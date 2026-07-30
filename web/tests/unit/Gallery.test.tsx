import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Gallery from "@/components/Gallery";
import { galleryTabs } from "@/lib/gallery";

const haircuts = galleryTabs.find((tab) => tab.id === "haircuts")!;
const artwork = galleryTabs.find((tab) => tab.id === "artwork")!;

describe("Gallery", () => {

  it("opens on the Haircuts tab", () => {
    render(<Gallery />);
    expect(screen.getByRole("tab", { name: "Haircuts" }))
      .toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Artwork" }))
      .toHaveAttribute("aria-selected", "false");
  });

  it("renders Haircuts as two rows keeping their different aspect ratios", () => {
    render(<Gallery />);
    const panel = screen.getByRole("tabpanel");

    expect(haircuts.rows).toHaveLength(2);
    /* Row one is 4:5 and row two is 1:1, matching the live site. The two rows
       differing is the design, so a change here is a regression, not a restyle. */
    expect(haircuts.rows[0].sizeClasses).toBe("w-56 h-[280px]");
    expect(haircuts.rows[1].sizeClasses).toBe("w-56 h-56");

    const images = within(panel).getAllByRole("img");
    expect(images).toHaveLength(
      haircuts.rows[0].photos.length + haircuts.rows[1].photos.length
    );
  });

  it("gives every haircut photo descriptive alt text", () => {
    render(<Gallery />);
    for (const image of within(screen.getByRole("tabpanel")).getAllByRole("img")) {
      expect(image.getAttribute("alt")?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("switches to Artwork and back", async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    await user.click(screen.getByRole("tab", { name: "Artwork" }));
    expect(screen.getByRole("tab", { name: "Artwork" }))
      .toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: "Haircuts" }));
    expect(screen.getByRole("tab", { name: "Haircuts" }))
      .toHaveAttribute("aria-selected", "true");
    expect(within(screen.getByRole("tabpanel")).getAllByRole("img").length)
      .toBeGreaterThan(0);
  });

  it("shows Artwork as a single row of four", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(screen.getByRole("tab", { name: "Artwork" }));

    expect(artwork.rows).toHaveLength(1);
    expect(artwork.rows[0].photos).toHaveLength(4);
    /* One aspect ratio across the row, unlike the two-row Haircuts tab. */
    expect(artwork.rows[0].sizeClasses).toBe("w-56 h-[280px]");
  });

  it("renders the four artwork images with descriptive alt text", async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(screen.getByRole("tab", { name: "Artwork" }));

    const images = within(screen.getByRole("tabpanel")).getAllByRole("img");
    expect(images).toHaveLength(4);
    for (const image of images) {
      expect(image.getAttribute("alt")?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("gives each row a labelled pair of scroll buttons", () => {
    render(<Gallery />);
    expect(screen.getByRole("button", { name: "Scroll Haircuts row 1 left" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Haircuts row 1 right" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Haircuts row 2 left" }))
      .toBeInTheDocument();
  });

  it("scrolls a row by 200px per arrow click", async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    const scrollBy = vi.fn();
    const container = document.getElementById("photo-container")!;
    container.scrollBy = scrollBy;

    await user.click(screen.getByRole("button", { name: "Scroll Haircuts row 1 right" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 200, behavior: "smooth" });

    await user.click(screen.getByRole("button", { name: "Scroll Haircuts row 1 left" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: -200, behavior: "smooth" });
  });

});
