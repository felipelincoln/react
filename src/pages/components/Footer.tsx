export function Footer() {
  const collectoorDiscord = 'https://discord.gg/m96N28apgQ';
  const collectoorLinkedin = 'https://www.linkedin.com/company/collectoor/';
  const collectoorTwitter = 'https://x.com/collectoor_eth/';

  return (
    <div className="w-full bg-zinc-900">
      <div className="flex flex-wrap gap-4 p-8 justify-between text-zinc-400">
        <div className="flex gap-2 items-center group">
          <a href="/">
            <div className="w-6 h-6 bg-zinc-400 group-hover:bg-zinc-200 rounded content-center">
              <CollectoorIcon className="p-1 text-zinc-900 m-auto" />
            </div>
          </a>
          <div className="font-bold group-hover:text-zinc-200 cursor-pointer">Collectoor</div>
        </div>

        <div className="flex gap-4">
          <a target="_blank" href={collectoorDiscord}>
            <div className="w-8 h-8 bg-zinc-400 hover:bg-zinc-200 rounded content-center">
              <DiscordIcon className="p-1 text-zinc-900 m-auto" />
            </div>
          </a>
          <a target="_blank" href={collectoorTwitter}>
            <div className="w-8 h-8 bg-zinc-400 hover:bg-zinc-200 rounded content-center">
              <TwitterIcon className="p-1 text-zinc-900 m-auto" />
            </div>
          </a>
          <a target="_blank" href={collectoorLinkedin}>
            <div className="w-8 h-8 bg-zinc-400 hover:bg-zinc-200 rounded">
              <LinkedinIcon className="p-1 text-zinc-900" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function CollectoorIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      color="currentColor"
    >
      <path
        d="M5.78223 4.18192C6.43007 3.68319 6.754 3.43383 7.12788 3.27323C7.29741 3.20041 7.47367 3.14158 7.65459 3.09741C8.0536 3 8.4767 3 9.32289 3H14.6771C15.5233 3 15.9464 3 16.3454 3.09741C16.5263 3.14158 16.7026 3.20041 16.8721 3.27323C17.246 3.43383 17.5699 3.68319 18.2178 4.18192C20.3644 5.83448 21.4378 6.66077 21.8057 7.73078C21.9694 8.20673 22.0305 8.70728 21.9858 9.20461C21.8852 10.3227 21.0379 11.346 19.3433 13.3925L15.3498 18.2153C13.8126 20.0718 13.044 21 12 21C10.956 21 10.1874 20.0718 8.65018 18.2153L4.65671 13.3925C2.96208 11.346 2.11476 10.3227 2.0142 9.20461C1.96947 8.70728 2.03064 8.20673 2.1943 7.73078C2.56224 6.66077 3.63557 5.83448 5.78223 4.18192Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10 8.5H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiscordIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 512"
    >
      <path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />{' '}
    </svg>
  );
}
