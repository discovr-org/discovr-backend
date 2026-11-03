/** Port: a listing's carousel photos and menu pages. Rows only; cover rules live in use-cases. */
export interface ExperienceMediaRepository {
  /** Appends after the last photo. */
  addPhoto(experienceId: string, photo: { src: string; alt: string }): Promise<void>;
  /** Rewrites order, alt text and the cover flag. `items` lists every photo of the listing. */
  setPhotos(
    experienceId: string,
    items: Array<{ id: string; alt: string }>,
    coverId: string | null,
  ): Promise<void>;
  deletePhoto(experienceId: string, photoId: string): Promise<void>;

  /** Appends after the last page. */
  addMenuPage(
    experienceId: string,
    page: { src: string; label: string; alt: string },
  ): Promise<void>;
  /** Rewrites order, label and alt text. `items` lists every page of the listing. */
  setMenuPages(
    experienceId: string,
    items: Array<{ id: string; label: string; alt: string }>,
  ): Promise<void>;
  deleteMenuPage(experienceId: string, pageId: string): Promise<void>;
}
