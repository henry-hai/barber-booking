/*
 * Gallery contents, split by tab.
 *
 * The Haircuts tab carries over the exact two-row layout the old static site
 * had: row one renders each photo at 224x70 and row two at 224x224. The two
 * rows deliberately differ in aspect ratio -- that is the existing look, not a
 * bug -- so the dimensions live on the row, not on the individual photo.
 *
 * Adding a tab means adding an entry to `galleryTabs`; the tab strip and the
 * panels are both driven off this array, so nothing else needs to change.
 */

/*
 * The four artwork photos have not been added to the repo yet. While this is
 * true the Artwork tab renders labelled placeholder tiles naming the file each
 * one is waiting for. Drop the four files into web/public/img/artwork/ using
 * the names in `artworkPhotos` below, set this to false, and the tab renders
 * them for real -- no other change needed.
 */
export const artworkPending = true;

export interface IGalleryPhoto {
  src: string;
  alt: string;
}

export interface IGalleryRow {
  /* Stable id, used for the scroll container and the arrow button handlers. */
  id: string;
  /* Rendered size of every photo in this row, in CSS pixels. */
  width: number;
  height: number;
  /* Tailwind sizing classes matching width/height above. */
  sizeClasses: string;
  photos: IGalleryPhoto[];
  /* Render labelled placeholders instead of the images. See `artworkPending`. */
  pending?: boolean;
}

export interface IGalleryTab {
  id: string;
  label: string;
  rows: IGalleryRow[];
}

const haircutRowOne: IGalleryPhoto[] = [
  { src: "/img/1_Murthi_1.JPG", alt: "Finished clipper cut, side profile" },
  { src: "/img/2_Murthi_2.JPG", alt: "Finished clipper cut, back of the head" },
  { src: "/img/3_Jason_1.JPG", alt: "Textured crop with a clean line-up" },
  { src: "/img/4_KSG_1.JPG", alt: "Mid fade with a scissor-cut top" },
  { src: "/img/6_Alex_1.JPG", alt: "Tapered cut, front view" },
  { src: "/img/5_KSG_2.JPG", alt: "Mid fade, side profile" },
  { src: "/img/7_Alex_2.JPG", alt: "Tapered cut, side profile" },
  { src: "/img/8_Adrian_1.JPG", alt: "Skin fade with a sharp hairline" },
  { src: "/img/9_Adrian_2.JPG", alt: "Skin fade, side profile" },
  { src: "/img/10_Adrian_3.JPG", alt: "Skin fade, back of the head" },
  { src: "/img/11_Elijah_2.JPG", alt: "Curly top with a faded back and sides" },
  { src: "/img/12_Elijah_2.JPG", alt: "Curly top, side profile" },
  { src: "/img/13_Jason_2.JPG", alt: "Textured crop, side profile" },
  { src: "/img/14_Chester_1.JPG", alt: "Classic scissor cut, front view" },
  { src: "/img/15_Chester_2.JPG", alt: "Classic scissor cut, side profile" }
];

const haircutRowTwo: IGalleryPhoto[] = [
  { src: "/img/19_Cam_1.jpg", alt: "Low fade with a defined part" },
  { src: "/img/20_Cam_2.jpg", alt: "Low fade, side profile" },
  { src: "/img/25_Andrew_1.JPG", alt: "Short back and sides with a scissor top" },
  { src: "/img/26_Hoang_1.jpg", alt: "Mid fade with a textured fringe" },
  { src: "/img/27_JD_1.jpg", alt: "Taper fade with a beard line-up" },
  { src: "/img/28_JD_2.jpg", alt: "Taper fade, side profile" },
  { src: "/img/29_Dev_1.JPG", alt: "Clipper cut with a straight-razor line-up" },
  { src: "/img/30_Dev_2.JPG", alt: "Clipper cut, back of the head" },
  { src: "/img/21_RR_1.JPG", alt: "Burst fade, front view" },
  { src: "/img/22_RR_2.JPG", alt: "Burst fade, side profile" },
  { src: "/img/23_RR_3.JPG", alt: "Burst fade, back of the head" },
  { src: "/img/24_RR_4.JPG", alt: "Burst fade, finished styling" },
  { src: "/img/16_Ben_1.JPG", alt: "Scissor cut with a natural hairline" },
  { src: "/img/17_Ben_2.JPG", alt: "Scissor cut, side profile" },
  { src: "/img/18_Ben_3.JPG", alt: "Scissor cut, back of the head" },
  { src: "/img/31_Hoang_2.jpg", alt: "Mid fade with a hard part" },
  { src: "/img/32_Hoang_3.jpg", alt: "Mid fade, back of the head" },
  { src: "/img/33_Hoang_4.jpg", alt: "Mid fade, styled and finished" },
  { src: "/img/34_Hoang_5.jpg", alt: "Mid fade, final look" }
];

/* Artwork is a single row at one aspect ratio (4:5), unlike the two-row
   Haircuts tab. Replace the alt text alongside the files. */
const artworkPhotos: IGalleryPhoto[] = [
  { src: "/img/artwork/artwork-1.jpg", alt: "Artwork by Henry Hai" },
  { src: "/img/artwork/artwork-2.jpg", alt: "Artwork by Henry Hai" },
  { src: "/img/artwork/artwork-3.jpg", alt: "Artwork by Henry Hai" },
  { src: "/img/artwork/artwork-4.jpg", alt: "Artwork by Henry Hai" }
];

export const galleryTabs: IGalleryTab[] = [
  {
    id: "haircuts",
    label: "Haircuts",
    rows: [
      {
        id: "photo-container",
        width: 224,
        height: 70,
        sizeClasses: "w-56 h-[70px]",
        photos: haircutRowOne
      },
      {
        id: "photo-container-2",
        width: 224,
        height: 224,
        sizeClasses: "w-56 h-56",
        photos: haircutRowTwo
      }
    ]
  },
  {
    id: "artwork",
    label: "Artwork",
    rows: [
      {
        id: "artwork-container",
        width: 224,
        height: 280,
        sizeClasses: "w-56 h-[280px]",
        photos: artworkPhotos,
        pending: artworkPending
      }
    ]
  }
];
