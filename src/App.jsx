import { useEffect, useMemo, useState } from 'react';
import { BathIcon, BellIcon, BuildingIcon, LogoMark, NairaIcon, PinIcon, SearchIcon, StarIcon } from './icons.jsx';

const NAV_LINKS = ['Rent', 'Buy', 'Lease', 'Commercial', 'Snagging', 'Shortlet', 'Find Professionals'];
const MODES = ['Buy', 'Rent', 'Lease', 'Commercial', 'Joint Venture'];
const PROPERTY_TYPES = ['Any', 'Apartment', 'Duplex', 'Bungalow', 'Terrace', 'Land'];
const BEDS = ['Beds / Baths', '1+ bed', '2+ beds', '3+ beds', '4+ beds'];
const PRICES = ['Price Range', 'Under ₦5m', '₦5m – ₦20m', '₦20m – ₦100m', 'Above ₦100m'];

function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
}

function Select({ label, icon, options, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-control">
        {icon}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </span>
    </label>
  );
}

export default function App() {
  const [experts, setExperts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [mode, setMode] = useState('Lease');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [beds, setBeds] = useState(BEDS[0]);
  const [price, setPrice] = useState(PRICES[0]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/experts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((body) => {
        setExperts(body.data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter((e) => e.city.toLowerCase().includes(q) || e.specialty.toLowerCase().includes(q));
  }, [experts, query]);

  const onSearch = (event) => {
    event.preventDefault();
    setQuery(location);
    document.getElementById('professionals')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header className="nav">
        <a className="brand" href="/" aria-label="Expert Listing home">
          <LogoMark />
          <span>Expert Listing</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link} href={link === 'Find Professionals' ? '#professionals' : '#'}>{link}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="list-property" href="#">List your Property</a>
          <button className="icon-button" type="button" aria-label="Notifications">
            <BellIcon />
            <span className="dot" />
          </button>
          <span className="avatar" aria-hidden="true">EL</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <h1>
            Find your preferred property
            <br />
            in 3 clicks <s>not months</s>
          </h1>
          <p className="hero-sub">Exact Locations. Real Developers. Verified Agents.</p>

          <div className="modes" role="tablist" aria-label="Listing type">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={mode === m ? 'mode active' : 'mode'}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <form className="search" onSubmit={onSearch} aria-label={`Search ${mode.toLowerCase()} properties`}>
          <label className="field">
            <span className="field-label">Location</span>
            <span className="field-control">
              <PinIcon />
              <input
                type="text"
                placeholder="City, area or specialty"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </span>
          </label>
          <Select label="Property Type" icon={<BuildingIcon />} options={PROPERTY_TYPES} value={propertyType} onChange={setPropertyType} />
          <Select label="Beds & Baths" icon={<BathIcon />} options={BEDS} value={beds} onChange={setBeds} />
          <Select label="Price" icon={<NairaIcon />} options={PRICES} value={price} onChange={setPrice} />
          <button className="search-button" type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
      </section>

      <main className="content" id="professionals">
        <div className="section-head">
          <div>
            <p className="eyebrow">Find Professionals</p>
            <h2>Verified experts near you</h2>
          </div>
          {query && (
            <button type="button" className="clear" onClick={() => { setQuery(''); setLocation(''); }}>
              Clear “{query}”
            </button>
          )}
        </div>

        {status === 'loading' && <p className="state">Loading experts…</p>}
        {status === 'error' && <p className="state error" role="alert">Could not load experts. Please try again later.</p>}
        {status === 'ready' && visible.length === 0 && <p className="state">No experts match “{query}” yet.</p>}
        {status === 'ready' && visible.length > 0 && (
          <ul className="grid">
            {visible.map((expert) => (
              <li key={expert.id} className="card">
                <span className="card-avatar" aria-hidden="true">{initials(expert.name)}</span>
                <div className="card-body">
                  <strong>{expert.name}</strong>
                  <span className="card-meta"><PinIcon /> {expert.city}</span>
                </div>
                <div className="card-foot">
                  <span className="tag">{expert.specialty}</span>
                  <span className="verified"><StarIcon /> Verified</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="footer">© {new Date().getFullYear()} Expert Listing</footer>
    </>
  );
}
