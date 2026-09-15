export default function GrimoirePlate() {
  return (
    <svg className="grimoire-plate" viewBox="0 0 620 760" role="img" aria-label="Архивная иллюстрация сущности Шумящий без лика">
      <defs>
        <filter id="ink-wobble" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="17" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
        <filter id="smudge" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <radialGradient id="entity-shadow" cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#111" stopOpacity=".92" />
          <stop offset=".6" stopColor="#1d1a17" stopOpacity=".72" />
          <stop offset="1" stopColor="#2a241d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="grimoire-plate__paper-lines" opacity=".25" stroke="#5e513c" fill="none">
        <path d="M14 86 C96 76 150 92 242 82 S398 74 604 92" />
        <path d="M20 688 C116 678 184 694 294 684 S474 675 604 690" />
        <path d="M52 32 C45 176 48 352 42 722" />
        <path d="M572 24 C578 187 574 352 584 728" />
      </g>

      <g className="grimoire-plate__room" stroke="#2c2924" fill="none" strokeWidth="4" filter="url(#ink-wobble)">
        <path d="M118 570 L112 236 L270 162 L448 224 L462 572" />
        <path d="M112 236 L462 224" />
        <path d="M182 555 V325 H301 V555" />
        <path d="M204 349 H279 M204 393 H279 M204 437 H279" strokeWidth="2.4" />
        <path d="M324 306 H417 V455 H324 Z" />
        <path d="M370 306 V455 M324 382 H417" strokeWidth="2.4" />
        <path d="M86 579 C176 564 274 570 490 574" />
        <path d="M146 614 H448" strokeWidth="2.2" />
      </g>

      <g className="grimoire-plate__objects" stroke="#24211d" fill="#42392e" strokeWidth="3" filter="url(#ink-wobble)">
        <g className="float-object float-object--chair" transform="translate(116 482) rotate(-12)">
          <path d="M0 0 H67 V18 H0 Z M8 18 V88 M57 18 V88 M4 49 H62" fill="none" />
        </g>
        <g className="float-object float-object--frame" transform="translate(356 166) rotate(18)">
          <rect width="72" height="94" fill="none" />
          <path d="M9 74 L29 46 L42 59 L59 34 L66 74 Z" fill="none" strokeWidth="2" />
        </g>
        <g className="float-object float-object--book" transform="translate(265 258) rotate(-26)">
          <path d="M0 9 Q30 -2 58 7 V66 Q28 58 0 68 Z" />
          <path d="M58 7 Q85 -2 108 10 V69 Q84 58 58 66 Z" />
          <path d="M58 7 V66" fill="none" />
        </g>
        <g className="float-object float-object--lamp" transform="translate(96 180) rotate(-11)">
          <path d="M24 0 H52 L64 28 L56 90 H19 L12 28 Z" fill="none" />
          <path d="M18 31 H59" />
          <circle cx="38" cy="46" r="8" fill="#2d2922" />
        </g>
        <g className="float-object float-object--radio" transform="translate(430 352) rotate(15)">
          <rect width="80" height="54" rx="3" fill="none" />
          <circle cx="20" cy="28" r="10" fill="none" />
          <path d="M43 16 H69 M43 27 H69 M43 38 H69 M14 0 L2 -34" fill="none" />
        </g>
      </g>

      <g className="grimoire-plate__entity">
        <ellipse className="grimoire-plate__entity-smoke" cx="310" cy="382" rx="182" ry="235" fill="url(#entity-shadow)" filter="url(#smudge)" />
        <path className="entity-stroke entity-stroke--a" d="M258 626 C244 560 198 524 206 449 C214 371 274 355 260 284 C248 222 285 175 338 186 C390 196 410 254 390 306 C365 371 423 419 401 493 C381 561 337 575 333 639" />
        <path className="entity-stroke entity-stroke--b" d="M301 655 C316 598 286 574 299 536 C320 474 277 446 285 397 C293 348 337 333 330 288 C324 250 341 224 369 229 C399 234 415 267 405 304 C390 356 434 389 422 449 C411 504 374 531 377 585" />
        <path className="entity-stroke entity-stroke--c" d="M245 577 C211 544 177 521 165 479 M374 564 C417 536 448 506 467 459 M257 335 C214 305 186 271 170 232 M382 342 C429 304 452 266 466 226" />
        <path className="entity-stroke entity-stroke--d" d="M244 420 C194 400 165 375 134 336 M412 397 C459 378 490 351 518 316" />
        <ellipse cx="335" cy="333" rx="43" ry="56" fill="#171513" />
        <circle className="grimoire-plate__eye" cx="335" cy="337" r="11" fill="#e9dfc1" />
        <circle cx="335" cy="337" r="4" fill="#151310" />
      </g>

      <g className="grimoire-plate__glyphs" fill="none" stroke="#40372a" strokeWidth="2.8" strokeLinecap="round">
        <path d="M24 190 L39 178 L52 190 L39 202 Z M39 178 V160 M39 202 V222" />
        <path d="M22 272 C38 254 49 257 56 278 C41 286 30 287 22 272 Z M39 255 V239" />
        <path d="M24 349 L50 349 M37 332 V368 M28 337 L47 361 M47 337 L28 361" />
        <path d="M22 435 C26 414 50 410 55 433 C50 456 28 456 22 435 Z M39 414 V397" />
        <path d="M25 518 L42 496 L57 519 L42 540 Z M42 496 V476" />
        <path d="M554 146 L578 176 L532 176 Z M555 151 V188" />
        <circle cx="555" cy="164" r="6" />
        <path d="M541 642 L555 618 L571 642 L555 663 Z M555 620 V598" />
      </g>

      <g className="grimoire-plate__notes" fill="#453b2e">
        <text x="76" y="101" fontSize="15" transform="rotate(-2 76 101)">не смотреть в глаза?</text>
        <text x="374" y="111" fontSize="13" transform="rotate(3 374 111)">шум приходит раньше движения</text>
        <text x="396" y="662" fontSize="14" transform="rotate(-3 396 662)">якорь → место / предмет / память</text>
        <text x="70" y="708" fontSize="17" transform="rotate(2 70 708)">СТЕНЫ ПОМНЯТ.</text>
      </g>

      <g className="grimoire-plate__seal" transform="translate(470 580) rotate(-8)">
        <circle cx="55" cy="55" r="49" fill="none" stroke="#554735" strokeWidth="3" />
        <path d="M55 18 L86 78 H24 Z" fill="none" stroke="#554735" strokeWidth="4" />
        <circle cx="55" cy="57" r="10" fill="none" stroke="#554735" strokeWidth="3" />
        <path d="M55 28 V87" stroke="#554735" strokeWidth="3" />
      </g>
    </svg>
  )
}
