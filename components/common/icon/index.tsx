export const ArcaneSearchIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 외곽 눈 모양 */}
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
    {/* 동공 및 동심원 */}
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);
