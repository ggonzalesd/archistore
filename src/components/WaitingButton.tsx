import { useEffect, useState } from 'preact/hooks';

interface Props {
  href?: string;
  time?: number;
}

export default function WaitingButton({ time = 5, href }: Props) {
  const [current, setCurrent] = useState(0);
  const [_, setInter] = useState<NodeJS.Timeout | undefined>();

  useEffect(() => {
    setInter(
      setInterval(
        () =>
          setCurrent((state) => {
            const newState = state + 1;
            if (newState >= time + 1) {
              setInter((state) => {
                clearInterval(state);
                return undefined;
              });
            }
            return newState;
          }),
        1000,
      ),
    );

    return () =>
      setInter((state) => {
        clearInterval(state);
        return undefined;
      });
  }, [time]);

  const completed = current >= time + 1;

  return (
    <a
      aria-disabled='true'
      href={href}
      target='_blank'
      class={[
        'inline-flex items-center gap-2 rounded-sm bg-rose-500 px-2 py-1 text-rose-950 transition-all hover:scale-105 hover:cursor-pointer hover:bg-rose-400 hover:shadow-md hover:shadow-rose-600/50',
        !completed && 'pointer-events-none animate-pulse saturate-0',
      ].join(' ')}
    >
      <span>{completed ? 'Download' : `Wait ${time} seconds`}</span>

      {completed ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='1em'
          height='1em'
          viewBox='0 0 24 24'
          class='size-4'
        >
          <path fill='currentColor' d='M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z' />
        </svg>
      ) : (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1em'
            height='1em'
            viewBox='0 0 24 24'
            class='size-4 animate-spin'
          >
            <path
              fill='none'
              stroke='currentColor'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M12 3a9 9 0 1 0 9 9'
            />
          </svg>
          <span>{current}'s</span>
        </>
      )}
    </a>
  );
}
