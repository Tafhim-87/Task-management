import * as React from "react"
import { SVGProps } from "react"
const AiLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={100}
    height={100}
    viewBox="0 0 48 48"
    {...props}
  >
    <radialGradient
      id="a"
      cx={-670.437}
      cy={617.13}
      r={0.041}
      gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset={0} stopColor="#1ba1e3" />
      <stop offset={0} stopColor="#1ba1e3" />
      <stop offset={0.3} stopColor="#5489d6" />
      <stop offset={0.545} stopColor="#9b72cb" />
      <stop offset={0.825} stopColor="#d96570" />
      <stop offset={1} stopColor="#f49c46" />
    </radialGradient>
    <path
      fill="url(#a)"
      d="m22.882 31.557-1.757 4.024a1.893 1.893 0 0 1-3.491 0l-1.757-4.024c-1.564-3.581-4.378-6.432-7.888-7.99L3.153 21.42c-1.538-.682-1.538-2.919 0-3.602l4.685-2.08c3.601-1.598 6.465-4.554 8.002-8.258l1.78-4.288a1.895 1.895 0 0 1 3.52 0l1.78 4.288c1.537 3.703 4.402 6.659 8.002 8.258l4.685 2.08c1.538.682 1.538 2.919 0 3.602l-4.836 2.147c-3.511 1.559-6.325 4.409-7.889 7.99z"
    />
    <radialGradient
      id="b"
      cx={-670.437}
      cy={617.13}
      r={0.041}
      gradientTransform="matrix(128.602 652.9562 653.274 -128.6646 -316906.281 517189.719)"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset={0} stopColor="#1ba1e3" />
      <stop offset={0} stopColor="#1ba1e3" />
      <stop offset={0.3} stopColor="#5489d6" />
      <stop offset={0.545} stopColor="#9b72cb" />
      <stop offset={0.825} stopColor="#d96570" />
      <stop offset={1} stopColor="#f49c46" />
    </radialGradient>
    <path
      fill="url(#b)"
      d="m39.21 44.246-.494 1.132a1.015 1.015 0 0 1-1.871 0l-.494-1.132a8.736 8.736 0 0 0-4.447-4.506l-1.522-.676c-.823-.366-.823-1.562 0-1.928l1.437-.639a8.746 8.746 0 0 0 4.511-4.657l.507-1.224a1.015 1.015 0 0 1 1.886 0l.507 1.224a8.746 8.746 0 0 0 4.511 4.657l1.437.639c.823.366.823 1.562 0 1.928l-1.522.676a8.738 8.738 0 0 0-4.446 4.506z"
    />
  </svg>
)
export default AiLogo
