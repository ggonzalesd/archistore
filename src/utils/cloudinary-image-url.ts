export const cloudinaryImageUrl = (slug: string, index: number = 0) => {
  return `https://res.cloudinary.com/dtk4jojr5/image/upload/v1729202479/store/${slug}_${index}.webp`;
};
