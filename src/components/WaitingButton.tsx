import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

interface Props {
  href?: string;
  reload?: string;
  time?: number;
  maxtime?: number;
}

export default function WaitingButton({
  time = 5,
  maxtime = 60 * 5,
  href,
  reload,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [_, setInter] = useState<NodeJS.Timeout | undefined>();

  useEffect(() => {
    setInter(
      setInterval(
        () =>
          setCurrent((state) => {
            const newState = state + 1;
            if (newState >= maxtime + 1) {
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

  const state = useMemo(() => {
    if (current <= time) return 'WAITING';
    if (current >= maxtime) return 'INVALID';
    return 'OK';
  }, [current, time, maxtime]);

  const texts: Record<typeof state, string> = useMemo(
    () => ({
      WAITING: `Wait ${time} to download ${current}'s`,
      OK: 'Download',
      INVALID: 'Reload to Revalidate',
    }),
    [current, time],
  );

  return (
    <a
      aria-disabled='true'
      href={state === 'OK' ? href : reload}
      target={state === 'OK' ? '_blank' : undefined}
      class={[
        'waiting-button group relative inline-flex items-center gap-2 rounded-sm bg-rose-500 px-2 py-1 text-rose-950 transition-all hover:scale-105 hover:cursor-pointer hover:bg-rose-400 hover:shadow-md hover:shadow-rose-600/50',
        state === 'WAITING' && 'pointer-events-none animate-pulse saturate-0',
      ].join(' ')}
    >
      <span>{texts[state]}</span>

      {state === 'WAITING' && (
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
      )}
      {state === 'OK' && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='1em'
          height='1em'
          viewBox='0 0 24 24'
          class='size-4'
        >
          <path fill='currentColor' d='M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z' />
        </svg>
      )}
      {state === 'INVALID' && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='1em'
          height='1em'
          viewBox='0 0 24 24'
          class='transition-transform group-[.waiting-button:hover]:rotate-180'
        >
          <path
            fill='currentColor'
            d='M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.7 6.7 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95S18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0'
          />
        </svg>
      )}

      {state === 'OK' && (
        <div class='pointer-events-none absolute bottom-full left-0 z-10 flex origin-bottom-left scale-0 flex-col transition-transform group-[.waiting-button:hover]:scale-100'>
          <div class='rounded-sm bg-rose-800 px-1 text-xs text-rose-100'>
            Available for {Math.max(maxtime - current, 0)}'s
          </div>
          <div>
            <div class='ml-2 size-0 border-x-8 border-b-0 border-t-8 border-solid border-rose-800 border-x-transparent' />
          </div>
        </div>
      )}
    </a>
  );
}
