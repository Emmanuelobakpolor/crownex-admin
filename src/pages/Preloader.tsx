interface Props {
  visible: boolean
}

export function Preloader({ visible }: Props) {
  return (
    <div className={`preloader ${visible ? 'is-visible' : 'is-hiding'}`} aria-busy={visible} aria-live="polite">
      <div className="preloader-bg">
        <div className="preloader-orb preloader-orb-1" />
        <div className="preloader-orb preloader-orb-2" />
        <div className="preloader-orb preloader-orb-3" />
      </div>

      <div className="preloader-content">
        <div className="preloader-logo-wrap">
          <div className="preloader-ring" />
          <div className="preloader-ring preloader-ring-delay" />
          <img src="/logo.png" alt="Crownex" className="preloader-logo" width={72} height={72} />
        </div>
        <p className="preloader-brand">Crownex</p>
        <p className="preloader-sub">Admin Console</p>
        
      </div>
    </div>
  )
}
