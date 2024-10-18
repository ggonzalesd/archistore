import { useCallback, useState } from 'preact/hooks';

interface Props {
  slug: string;
  photos: number;
}

export default function PhotoView({ slug, photos }: Props) {
  const [index, setIndex] = useState(0);

  const imageSrcGenerator = useCallback(
    (id: number) => {
      return `https://res.cloudinary.com/dtk4jojr5/image/upload/v1729202479/store/${slug}_${id}.webp`;
    },
    [slug],
  );

  return (
    <>
      <picture class='photo-view group flex aspect-square h-auto w-full max-w-96 items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-sky-500/20 to-rose-700/10 p-4'>
        <img
          class='w-full object-cover object-center transition-transform duration-500 [filter:_drop-shadow(0_0_0.75rem_crimson)] group-[.photo-view:hover]:hover:rotate-2 group-[.photo-view:hover]:hover:scale-110'
          src={imageSrcGenerator(index)}
          alt=''
        />
      </picture>
      <div class='flex w-full max-w-96 gap-2'>
        {[...new Uint8Array(photos)].map((_, id) => (
          <button onClick={() => setIndex(id)}>
            <img
              src={imageSrcGenerator(id)}
              alt={`${slug}_${id}`}
              class={[
                'size-8 rounded-md border-2 bg-sky-500/20 p-1 transition-all hover:scale-105 hover:bg-rose-400/20',
                id === index ? 'border-yellow-400' : 'border-transparent',
              ].join(' ')}
            />
          </button>
        ))}
      </div>
    </>
  );
}
