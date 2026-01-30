'use client'
export default function SendIcon({ size, color,...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-[2] relative"
    >
      <path d="M6 11L12 5M12 5L18 11M12 5V19" stroke={color} strokeLinecap="square"></path>
    </svg>
  )
}
