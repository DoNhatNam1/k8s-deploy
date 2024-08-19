type ImageData = {
  src: string;
  width: number;
  height: number;
};

type JobSubcategory = {
  imgSrc: ImageData;
  title: string;
};

type JobCategoryItemProps = {
  imgSrc: ImageData;
  title: string;
  subcategories: JobSubcategory[];
};

type CategorySectionProps = {
  JobsCategory: JobCategoryItemProps[];
  Pages: string;
  onClose?: () => void;
  setSelectedValue?: (value: string) => void;
};

export type { JobSubcategory, JobCategoryItemProps, CategorySectionProps };
